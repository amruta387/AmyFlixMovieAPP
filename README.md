## AmyFlixMovie API
    The AmyFlix API is a RESTful server-side application that provides users 
    with access to movie information, user profile management, and favorite movie lists.

## Features
    * Retrieve all movies or details about a specific movie, genre, or director.
    * User registration, profile updates, and account deregistration.
    * Add or remove movies from a user's favorite list.

## Tech Stack
    * Backend: Node.js, Express.
    * Database: MongoDB (Mongoose).
    * Authentication: HTTP & JWT tokens.
    * Middleware: body-parser, morgan, and more.

## API Endpoints
    * Movies
    GET /movies - All movies.
    GET /movies/:title - Movie details.
    GET /genres/:name - Genre details.
    GET /directors/:name - Director details.
    * Users
    POST /users - Register a user.
    PUT /users/:username - Update user info.
    POST /users/:username/movies/:movieId - Add favorite movie.
    DELETE /users/:username/movies/:movieId - Remove favorite movie.
    DELETE /users/:username - Delete user.

## Deployment
    GitHub Repository: GitHub
    Live API on Heroku: AmyFlix API

## Setup
    * Clone the repo: git clone https://github.com/your-username/myFlix-API.git.
    * Install dependencies: npm install.
    * Configure MongoDB URI in .env.
    * Start the server: npm start.
