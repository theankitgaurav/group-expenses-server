const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const User = require('../../db/models').User;
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
        User.create({name, email, password})
        .then((user)=>{
            // createDefaultGroup(user);
            return res.status(200).send({
                error: null,
                msg: "User created successfully",
                data: user.toJSON()
            });
        })
        .catch((err)=>{
            console.error(err);
            return res.status(400).send({
                error: 'This email is already in use.',
                msg: null,
                data: null
            });
        });
    },
    async login(req, res, next) {
        res.send('User logged in.');
    }
}