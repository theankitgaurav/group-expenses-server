const createError = require('http-errors');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

/**
 * Asynchronous method to generate a jwt based on the default algorithm HS256
 * The secret key is fetched from environment variable
 * TODO: Change the secret key in production before release
 * @param {any} payload 
 * @returns the generated jwt or Error (eg: TokenExpiredError, JsonWebTokenError)
 */
async function jwtSign(payload) {
    try {
        const token = await jwt.sign({data: payload}, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log(`Token generated sucessfully.`);
        return token;
    } catch (err) {
        console.error(`Error during token generation.`);
        throw err;
    } 
}

module.exports = {
    async register(req, res, next) {
        const {username, password} = req.body;
        try{
            const user = await User.create({username, password});
            return res.status(200).send(user.toJSON());
        } catch (err) {
            console.error(err);
            return res.status(400).send({
                error: 'This username is already in use.'
            });
        }
    },
    async login(req, res, next) {
        try {
            const {username, password} = req.body;
            const user = await User.findOne({username});
            if (!user) {
                return res.status(403).send({error: `User does not exist.`});
            }
            const isValidLogin = await user.isValidPasswordAsync(password);
            if(!isValidLogin) {
                return res.status(403).send({error: `Invalid password.`});
            }
            const userJson = user.toJSON();
            try {
                const token = await jwtSign(user._id.toJSON());
                return res.status(200).send({ user: userJson, token: token });
            } catch (err) {
                return next(createError(500, `Token generation failed.`));
            }
        } catch (err) {
            console.log(err);
            return next(createError(500, `Something went wrong in the server.`));
        }
    },
    async isAuthenticated (req, res, next) {
        const tokenFromUser = req.headers['x-access-token'];
        if (tokenFromUser == null || tokenFromUser == undefined){
            return next(createError(401, `Token missing.`));
        }
        try{
            const isAuth = await jwt.verify(tokenFromUser , process.env.JWT_SECRET);
            console.log(`JWT verified.`);
            return next();
        } catch (err) {
            console.error(`Error while verify jwt`, err);
            return next(createError(401, `Invalid credentials.`));
        }
    }
}