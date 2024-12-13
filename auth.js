const jwtSecret = 'your_jwt_secret'; // This has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
    passport = require('passport');

require('./passport'); // Your local passport file


let generateJWTToken = (user) => {
    return jwt.sign(
        {
            _id: user._id,
            username: user.username,
        },
        jwtSecret,
        {
            subject: user.username, // Must match the username field in the database
            expiresIn: '7d',
            algorithm: 'HS256',
        }
    );
};



/* POST login. */
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', { session: false }, (error, user, info) => {
            if (error) {
                console.error('Authentication error:', error);
                return res.status(500).json({ message: 'An error occurred during login' });
            }
            if (!user) {
                console.log('Authentication failed:', info);
                return res.status(400).json({ message: 'Authentication failed', info });
            }
            req.login(user, { session: false }, (error) => {
                if (error) {
                    console.error('Login error:', error);
                    return res.status(500).json({ message: 'Login failed' });
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token });
            });
        })(req, res);
    });
};
