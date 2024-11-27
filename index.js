const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const path = require("path");

const app = express();
app.use(morgan("dev"));
app.use(bodyParser.json());

const port = 8080;

const topMovies = [
    {
        title: "Jab We Met",
        year: 2007,
        genre: {
            name: "Romance",
            description:
                "A story of love and self-discovery, often involving emotional journeys and relationships.",
        },
        director: {
            name: "Imtiaz Ali",
            bio: "Indian film director and writer known for his work in romantic dramas.",
            birthYear: 1971,
            deathYear: null,
        },
        description:
            "A spirited woman meets a disheartened man and changes his perspective on life and love.",
    },
    {
        title: "Barfi!",
        year: 2012,
        genre: {
            name: "Romantic Comedy",
            description:
                "A lighthearted take on romance with humorous situations and quirky characters.",
        },
        director: {
            name: "Anurag Basu",
            bio: "Indian filmmaker known for his versatile storytelling and emotional depth.",
            birthYear: 1974,
            deathYear: null,
        },
        description:
            "A charming and mute man finds himself entangled in a tale of love and friendship.",
    },
    {
        title: "Drishyam",
        year: 2015,
        genre: {
            name: "Thriller",
            description:
                "A genre characterized by suspense, tension, and high-stakes situations.",
        },
        director: {
            name: "Nishikant Kamat",
            bio: "Indian filmmaker known for crafting gripping narratives.",
            birthYear: 1970,
            deathYear: 2020,
        },
        description:
            "A family man goes to great lengths to protect his loved ones after a crime is committed.",
    },
    {
        title: "Kabir Singh",
        year: 2019,
        genre: {
            name: "Romance, Drama",
            description:
                "A blend of love and intense emotions, often with a focus on personal struggles.",
        },
        director: {
            name: "Sandeep Reddy Vanga",
            bio: "Indian director known for his raw portrayal of human emotions.",
            birthYear: 1981,
            deathYear: null,
        },
        description:
            "A brilliant yet troubled surgeon spirals into self-destruction after a failed romance.",
    },
    {
        title: "Queen",
        year: 2013,
        genre: {
            name: "Comedy-Drama",
            description:
                "A mix of humor and serious themes, often reflecting on life’s challenges.",
        },
        director: {
            name: "Vikas Bahl",
            bio: "Indian filmmaker known for creating empowering stories with heart.",
            birthYear: 1971,
            deathYear: null,
        },
        description:
            "A young woman embarks on a solo honeymoon trip and discovers her independence.",
    },
    {
        title: "Taare Zameen Par",
        year: 2007,
        genre: {
            name: "Drama",
            description:
                "A narrative-driven genre focused on emotional and character development.",
        },
        director: {
            name: "Aamir Khan",
            bio: "Indian actor and director celebrated for his socially relevant films.",
            birthYear: 1965,
            deathYear: null,
        },
        description:
            "A dyslexic child struggles until a compassionate teacher helps him unlock his potential.",
    },
    {
        title: "Gully Boy",
        year: 2019,
        genre: {
            name: "Musical, Drama",
            description:
                "A fusion of storytelling and music, often highlighting struggles and triumphs.",
        },
        director: {
            name: "Zoya Akhtar",
            bio: "Acclaimed Indian director known for her nuanced and compelling narratives.",
            birthYear: 1972,
            deathYear: null,
        },
        description:
            "A young man rises from the slums of Mumbai to become a prominent rapper.",
    },
    {
        title: "Raazi",
        year: 2018,
        genre: {
            name: "War, Drama",
            description:
                "Explores the psychological and emotional dimensions of war and human resilience.",
        },
        director: {
            name: "Meghna Gulzar",
            bio: "Indian filmmaker known for her focus on realism and emotional depth.",
            birthYear: 1973,
            deathYear: null,
        },
        description:
            "A young Indian woman marries into a Pakistani family to work as an undercover spy.",
    },
    {
        title: "Chhichhore",
        year: 2019,
        genre: {
            name: "Comedy-Drama",
            description:
                "A blend of humor and heartfelt moments, focusing on relationships and life lessons.",
        },
        director: {
            name: "Nitesh Tiwari",
            bio: "Indian filmmaker known for creating inspiring and emotional narratives.",
            birthYear: 1973,
            deathYear: null,
        },
        description:
            "A group of friends reunite to support one of their own during a family crisis.",
    },
    {
        title: "Chak De! India",
        year: 2007,
        genre: {
            name: "Sports, Drama",
            description:
                "Combines the thrill of sports with emotionally driven storytelling.",
        },
        director: {
            name: "Shimit Amin",
            bio: "Indian director celebrated for his focus on realistic and impactful narratives.",
            birthYear: 1971,
            deathYear: null,
        },
        description:
            "A disgraced hockey player redeems himself by coaching a women’s national team to victory.",
    },
];

const users = [
    {
        id: 1,
        name: "Amruta",
        favMovies: ["Jab We Met", "Barfi!", "Queen"],
    },
    {
        id: 2,
        name: "Viraj",
        favMovies: ["Drishyam", "Kabir Singh", "Raazi"],
    },
    {
        id: 3,
        name: "Snehal",
        favMovies: ["Taare Zameen Par", "Gully Boy", "Chhichhore"],
    },
    {
        id: 4,
        name: "Amit",
        favMovies: ["Chak De! India", "Raazi", "Queen"],
    },
    {
        id: 5,
        name: "Sushma",
        favMovies: ["Barfi!", "Kabir Singh", "Drishyam"],
    },
];


//------------------------------------------------------------------------------------------------
// READ : Returns all the Movies to the user
app.get("/movies", (req, res) => {
    res.json(topMovies);
});

//------------------------------------------------------------------------------------------------
//READ : Returns all the users
app.get("/users", (req, res) => {
    res.json(users);
});

//------------------------------------------------------------------------------------------------
// READ : Returns single movie by title
app.get("/movies/:title", (req, res) => {
    const movieTitle = req.params.title;
    const movie = topMovies.find((movie) => movie.title === movieTitle);
    
    if (movie) {
        res.json(movie);
    } else {
        res.status(400).send("Movie not found.");
    }
});

//------------------------------------------------------------------------------------------------
// READ : Returns genre data by name
app.get("/movies/genre/:genreName", (req, res) => {
    const { genreName }= req.params;
    const genre = topMovies.find((movie) => movie.genre.name === genreName).genre;

    if (genre) {
        res.json(genre);
    } else {
        res.status(400).send("Genre not found.");
    }
});

//------------------------------------------------------------------------------------------------
// READ : Returns director data by name
app.get("/movies/director/:directorName", (req, res) => {
    const { directorName } = req.params;
    const director = topMovies.find((movie) => movie.director.name === directorName).director;

    if (director) {
        res.json(director);
    } else {
        res.status(400).send("Director not found.");
    }
});

//------------------------------------------------------------------------------------------------
// CREATE : Register new user
app.post("/users", (req, res) => {
    const newUser = req.body;
    if(newUser.name) {
        newUser.id = uuid.v4(),
        users.push(newUser);
        res.status(201).json(newUser);
    } else {
        res.send("user needs to be added")
    }
});

//------------------------------------------------------------------------------------------------
// UPDATE : update user info
app.put("/users/:id", (req, res) => {
    const { id } = req.params;
    const upUser = req.body;
    let user = users.find(user => (user.id == id));
    if(user){
        user.name = upUser.name;
        res.status(200).json(user);
    } else {
        res.status(400).send("user not found");
    }
});

//------------------------------------------------------------------------------------------------
// CREATE : add favorite movies in user info
app.post("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => (user.id == id));
    if(user){
        user.favMovies.push(movieTitle);
        res.status(200).send(`Movie '${movieTitle}' added to favorites!`);
    } else {
        res.status(400).send("user not found");
    }
});

//------------------------------------------------------------------------------------------------
// DELETE : Deletes favorite movie from user info
app.delete("/users/:id/:movieTitle", (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => (user.id == id));
    if(user){
        user.favMovies = user.favMovies.filter(title => title !== movieTitle );
        res.status(200).send(`Movie '${movieTitle}' removed to favorites!`);
    } else {
        res.status(400).send("user not found");
    }
});

//------------------------------------------------------------------------------------------------
// DELETE : Deletes user info
app.delete("/users/:id", (req, res) => {
    const { id } = req.params;
    let user = users.find(user => (user.id == id));
    if(user){
        users = users.filter(user => user.id != id);
        res.status(200).send(`User '${id}'is removed`);
    } else {
        res.status(400).send("user not found");
    }
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
