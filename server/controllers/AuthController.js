const createError = require('http-errors');
const utils = require('../utils/utils');
const errors = require('../utils/errors');
const UserService = require('../services/UserService');

/**
 * Helper function to return stripped down version of User object
 * so as to only send the attributes the client may need and hide
 * any sensitive info
 *
 * @param {*} userObj
 * @returns
 */
function getUserDto (userObj) {
    const userDto = {};
    userDto.id = userObj.id;
    userDto.name = userObj.name;
    userDto.email = userObj.email;
    return userDto;
}

module.exports = {
    async register(req, res, next) {
        const {name, email, password} = req.body;
        try {
            const {user, token} = await UserService.registerUser({name, email, password});
            const userDto = getUserDto(user);
            return res.status(200).json({
                "message": "User registration success.",
                "data": {userDto, token}
            });
        } catch (err) {
            return next(err);
        }
    },
    async login(req, res, next) {
        const {email, password} = req.body;
        try {
            const {user, token} = await UserService.loginUser({email, password});
            const userDto = getUserDto(user);
            return res.status(200).json({
                "message": "User login success",
                "data": {user: userDto, token: token}
            });
        } catch (err) {
            return next(err);
        }
    },
    async logout (req, res, next) {
        const tokenFromUser = req.headers['x-access-token'];
        if (tokenFromUser) {
            await utils.jwtInvalidate(tokenFromUser);
        }
        return res.status(200).json({
            "message": "Logout success"
        });
    },
    async isAuthenticated (req, res, next) {
        const tokenFromUser = req.headers['x-access-token'];
        if (tokenFromUser == null || tokenFromUser == undefined){
            return next(new errors.MissingTokenError());
        }

        utils.jwtVerify(tokenFromUser)
        .then((decoded)=>{
            return decoded;
        })
        .catch((err)=>{
            return next(new errors.BadTokenError());
        })
        .then((decoded)=>{
            return UserService.getUser(decoded.id)
        })
        .then((user)=>{
            req.user = user;
            req.userId = user.id;
            next();
        })
        .catch((err)=>{
            next(new errors.InvalidTokenError());
        })
    }
}