
const express = require('express');
const morgan = require('morgan');
const path = require('path');
const app = express();

const port = 8080;

app.use(morgan('dev'));

app.get('/movies', (req, res) => {
    const topMovies = [
        { title: "Jab We Met", year: 2007, genre: "Romance" },
        { title: "Barfi!", year: 2012, genre: "Romantic Comedy" },
        { title: "Drishyam", year: 2015, genre: "Thriller" },
        { title: "Kabir Singh", year: 2019, genre: "Romance, Drama" },
        { title: "Queen", year: 2013, genre: "Comedy-Drama" },
        { title: "Taare Zameen Par", year: 2007, genre: "Drama" },
        { title: "Gully Boy", year: 2019, genre: "Musical, Drama" },
        { title: "Raazi", year: 2018, genre: "War, Drama" },
        { title: "Chhichhore", year: 2019, genre: "Comedy-Drama" },
        { title: "Chak De! India", year: 2007, genre: "Sports, Drama" }
    ];
    res.json(topMovies);
});

app.get('/', (req, res) => {
    res.send('Welcome to the Movie API!');
});


app.use(express.static(path.join(__dirname, 'public')));

// Error-handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log error stack to the terminal
    res.status(500).send('Something went wrong!'); // Send a 500 response to the client
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
