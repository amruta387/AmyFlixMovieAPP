const express = require("express");
const uuid = require("uuid");
const path = require("path");
const mongoose = require("mongoose");
const { Movie, User } = require('./models');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const port = 8080;

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/amyFlixDB')
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

//---------------------------------------------------------------------------------
//  API ENDPOINTS
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

// Return director by name
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
app.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//New user registration
app.post("/users", (req, res) => {
    const newUser = new User({
        username: req.body.username,
        name:req.body.name,
        email: req.body.email,
        birthday: req.body.birthday
    });
    newUser.save()
        .then(user => res.status(201).json(user))
        .catch(error => res.status(500).json({ error: error.message }));
});

// Update their user info by username
app.put("/users/:username", (req, res) => {
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

// Add a movie to their list of favorites by username
app.post("/users/:username/movies/:title", (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            if (user) {
                user.favorite_movies.push(req.params.thenitle);
                user.save()
                    .then(() => res.status(200).send(`Movie '${req.params.title}' added to favorites.`))
                    .catch(error => res.status(500).json({ error: error.message }));
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// Remove a movie from their list of favorites by username
app.delete("/users/:username/movies/:title", (req, res) => {
    User.findOne({ username: req.params.username })
        .then(user => {
            if (user) {
                user.favorite_movies = user.favorite_movies.filter(movie => movie !== req.params.title);
                user.save()
                    .then(() => res.status(200).send(`Movie '${req.params.title}' removed from favorites.`))
                    .catch(error => res.status(500).json({ error: error.message }));
            } else {
                res.status(404).send("User not found.");
            }
        })
        .catch(error => res.status(500).json({ error: error.message }));
});

// User deregistaration
app.delete("/users/:username", (req, res) => {
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



//------------------------------------------------------------------------------------------------
// Opens main page
app.get("/", (req, res) => {
    res.send("Welcome to the Movie API!");
});

// Documentation.html 
app.use(express.static(path.join(__dirname, "public")));

//Error handling
app.use((req, res) => {
    res.status(400).send("Something went wrong!");
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send("Something went wrong!");
});

//------------------------------------------------------------------------------------------------
// Listens to Port 8080
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
