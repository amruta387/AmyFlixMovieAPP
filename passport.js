const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const bcrypt = require('bcrypt');
const Models = require('./models');
const Users = Models.User;
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Local strategy to authenticate user with username and password
passport.use(
    new LocalStrategy(
        {
            usernameField: 'username',
            passwordField: 'password',
        },
        async (username, password, callback) => {
            try {
                const user = await Users.findOne({ username: username });
                if (!user) {
                    console.log('User not found');
                    return callback(null, false, { message: 'Incorrect username or password' });
                }

                // Compare the password with the hashed password
                const isMatch = await bcrypt.compare(password, user.password);
                if (!isMatch) {
                    console.log('Password mismatch');
                    return callback(null, false, { message: 'Incorrect username or password' });
                }

                console.log('User authenticated successfully');
                return callback(null, user);
            } catch (error) {
                console.error('Error during authentication:', error);
                return callback(error);
            }
        }
    )
);


// JWT strategy to validate the token and extract user info from the token
passport.use(new JWTStrategy({
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET || 'your_jwt_secret', // Make sure this matches your secret key used during JWT creation
}, async (jwtPayload, callback) => {
    try {
        const user = await Users.findById(jwtPayload._id); // Find the user based on JWT payload
        return callback(null, user); // Pass user to the callback
    } catch (error) {
        return callback(error); // Handle error
    }
}));
