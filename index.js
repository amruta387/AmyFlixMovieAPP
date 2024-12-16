const express = require("express");
const mongoose = require("mongoose");
const { Movie, User } = require('./models');
const bodyParser = require("body-parser");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const { check, validationResult } = require("express-validator");

const app = express();
const port = process.env.PORT || 8080;

// MongoDB connection
mongoose
    .connect(process.env.MONGO_URI || "mongodb://localhost:27017/amyFlixDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Middleware
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(cors());

// Passport strategy (ensure a file defines this strategy)
require("./passport");

// Utility: Authenticate middleware
const authenticate = passport.authenticate("jwt", { session: false });

// ---------------------------------------------------------------------------------
// API ENDPOINTS

// Welcome message
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});

// List all movies
app.get("/movies", (req, res) => {
    Movie.find()
        .then((movies) => res.status(200).json(movies))
        .catch((error) => res.status(500).json({ error: error.message }));
});
// Return a single movie by title
app.get("/movies/:title", (req, res) => {
    Movie.findOne({ title: req.params.title })
        .then(movie => {
            if (movie) {
                res.status(200).json(movie);
            } else {
                res.status(404).send("Movie not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Return a genre by name
app.get("/movies/genre/:genreName", (req, res) => {
    Movie.findOne({ "genre.name": req.params.genreName })
        .then(movie => {
            if (movie) {
                res.status(200).json(movie.genre);
            } else {
                res.status(404).send("Genre not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Return a director by name
app.get("/movies/director/:directorName", (req, res) => {
    Movie.findOne({ "director.name": req.params.directorName })
        .then(movie => {
            if (movie) {
                res.status(200).json(movie.director);
            } else {
                res.status(404).send("Director not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Fetch all users
app.get('/users', authenticate, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Register a new user
app.post(
    "/users",
    [
        check("username")
            .isLength({ min: 3 })
            .withMessage("Username must be at least 3 characters long."),
        check("password")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long."),
        check("email").isEmail().withMessage("Email must be valid."),
        check("name").notEmpty().withMessage("Name is required."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password, name, email, birthday } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new User({
                username,
                password: hashedPassword,
                name,
                email,
                birthday,
            });

            const user = await newUser.save();
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// User login

app.post(
    "/auth/login",
    [
        check("username").notEmpty().withMessage("Username is required."),
        check("password").notEmpty().withMessage("Password is required."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, password } = req.body;

        try {
            // Check if the user exists using the username
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Compare the provided password with the hashed password in the database
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid password" });
            }

            // Generate JWT token if login is successful
            const payload = { _id: user._id, username: user.username };
            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET || "your_jwt_secret",
                { expiresIn: "1h" }
            );

            return res.status(200).json({ message: "Login successful", token });
        } catch (error) {
            // Catch and return any unexpected errors
            console.error("Login error:", error);
            return res.status(500).json({ error: error.message });
        }
    }
);




// Update user info
app.put(
    "/users/:username",
    authenticate,
    [
        check("email").optional().isEmail().withMessage("Email must be valid."),
        check("password")
            .optional()
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long."),
        check("name").optional().notEmpty().withMessage("Name cannot be empty."),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedData = req.body;

            if (updatedData.password) {
                updatedData.password = await bcrypt.hash(updatedData.password, 10);
            }

            const updatedUser = await User.findOneAndUpdate(
                { username: req.params.username },
                { $set: updatedData },
                { new: true }
            );
            if (!updatedUser) return res.status(404).send("User not found.");

            res.status(200).json(updatedUser);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Add a movie to favorites
app.post("/users/:username/movies/:movieId", authenticate, async (req, res) => {
    const { username, movieId } = req.params;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send("User not found.");

        if (user.favorite_movies.includes(movieId)) {
            return res.status(400).send("Movie already in favorites.");
        }

        user.favorite_movies.push(movieId);
        await user.save();
        res.status(200).send("Movie added to favorites.");
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove a movie from favorites
app.delete(
    "/users/:username/movies/:movieId",
    authenticate,
    async (req, res) => {
        const { username, movieId } = req.params;

        try {
            const user = await User.findOne({ username });
            if (!user) return res.status(404).send("User not found.");

            user.favorite_movies = user.favorite_movies.filter(
                (id) => id.toString() !== movieId
            );
            await user.save();
            res.status(200).send("Movie removed from favorites.");
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
);

// Delete user
app.delete("/users/:username", authenticate, async (req, res) => {
    try {
        const deletedUser = await User.findOneAndDelete({
            username: req.params.username,
        });
        if (!deletedUser) return res.status(404).send("User not found.");

        res.status(200).send(`User '${deletedUser.username}' deregistered.`);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ---------------------------------------------------------------------------------
// Error handling
app.use((req, res) => {
    res.status(404).send("Resource not found!");
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
