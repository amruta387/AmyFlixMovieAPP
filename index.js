const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bodyParser = require('body-parser');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Movie, User } = require('./models'); // Adjust as per your file structure
const bcrypt = require('bcrypt');

const app = express();
const port = process.env.PORT || 8080;

mongoose.connect('mongodb://localhost:27017/amyFlixDB')
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('Failed to connect to MongoDB:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Passport strategies
require('./passport'); // Ensure this file defines your passport strategies

// Auth Middleware
const authenticate = passport.authenticate('jwt', { session: false });

// ---------------------------------------------------------------------------------
// API ENDPOINTS

// Open main page
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});

// Return a list of ALL movies
app.get("/movies", (req, res) => {
    Movie.find()
        .then(movies => res.status(200).json(movies))
        .catch(error => res.status(500).json({ error: error.message }));
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

// New user registration

app.post("/users", async (req, res) => {
    const { username, password, name, email, birthday } = req.body;

    try {
        // Hash the password
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
});


// User login
app.post('/auth/login', (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: 'Authentication failed', user });
        }

        // Generate JWT token for the authenticated user
        const payload = {
            _id: user._id, // Include the user's unique ID or any other identifier you want in the payload
            username: user.username,
        };
        const token = jwt.sign(payload, 'your_jwt_secret', { expiresIn: '1h' }); // Secret and expiration time

        return res.json({ message: 'Login successful', token });
    })(req, res, next);
});


// Update user info by username
app.put("/users/:username", authenticate, (req, res) => {
    User.findOneAndUpdate({ username: req.params.username }, { $set: req.body }, { new: true })
        .then(updatedUser => {
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Add a movie to favorites
app.post("/users/:username/movies/:movieId", authenticate, (req, res) => {
    const movieId = req.params.movieId; // Get movie ID from the URL
    User.findOne({ username: req.params.username })
        .then(user => {
            if (user) {
                // Check if the movie is already in the favorites
                if (user.favorite_movies.includes(movieId)) {
                    return res.status(400).send(`Movie with ID '${movieId}' is already in favorites.`);
                }
                user.favorite_movies.push(movieId);
                user.save()
                    .then(() => res.status(200).send(`Movie with ID '${movieId}' added to favorites.`))
                    .catch(error => res.status(500).json({ error: error.message }));
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Remove a movie from favorites
app.delete("/users/:username/movies/:movieId", authenticate, (req, res) => {
    const movieId = req.params.movieId; // Get movie ID from the URL
    User.findOne({ username: req.params.username })
        .then(user => {
            if (user) {
                // Check if the movie exists in the favorites
                if (!user.favorite_movies.includes(movieId)) {
                    return res.status(400).send(`Movie with ID '${movieId}' is not in favorites.`);
                }
                user.favorite_movies = user.favorite_movies.filter(id => id.toString() !== movieId);
                user.save()
                    .then(() => res.status(200).send(`Movie with ID '${movieId}' removed from favorites.`))
                    .catch(error => res.status(500).json({ error: error.message }));
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});


// User deregistration
app.delete("/users/:username", authenticate, (req, res) => {
    User.findOneAndDelete({ username: req.params.username })
        .then(deletedUser => {
            if (deletedUser) {
                res.status(200).send(`User '${deletedUser.username}' deregistered.`);
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Documentation.html 
app.use(express.static(path.join(__dirname, "public")));

// Error handling
app.use((req, res) => {
    res.status(404).send("Resource not found!");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

// ---------------------------------------------------------------------------------
// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
