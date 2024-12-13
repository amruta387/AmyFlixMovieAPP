const mongoose = require('mongoose');

//  Genre schema
const genreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
});

// Director schema
const directorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    birth_year: { type: Number, required: true },
});

// Movies schema
const movieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    release_year: { type: Number, required: true },
    genre: { type: genreSchema, required: true }, // Embedded document
    director: { type: directorSchema, required: true }, // Embedded document
    imageURL: { type: String },
    featured: { type: Boolean, default: false },
    director_bio: { type: String, required: true },
});

// Users schema
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    birthday: { type: Date, required: true },
    favorite_movies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }], // References to movies
});

//  Mongoose models
const Movie = mongoose.model('Movie', movieSchema);
const User = mongoose.model('User', userSchema);

// Export models
module.exports = { Movie, User };
