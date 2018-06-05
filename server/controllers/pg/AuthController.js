const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const UserService = require('../../services/UserService');
const Group = require('../../db/models').Group;

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
/**
 * Function to create a default group for the newly registered 
 * user. The name, type of the group will be personal.
 *
 * @param {*} newUser
 */
function createDefaultGroup (newUser) {
    return new Promise(function(resolve, reject) {
        Group.create({})
    });
};

module.exports = {
    async register(req, res, next) {
        const {name, email, password} = req.body;
        try {
            const result = await UserService.registerUser({name, email, password});
            return res.status(200).json({
                "message": "User registration success.",
                "data": result.toJSON()
            });
        } catch (err) {
            console.log(err);
            return next(createError(400, err.message));
        }
    },
    async login(req, res, next) {
        res.send('User logged in.');
    }
}