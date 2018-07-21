const createError = require('http-errors');
const utils = require('../utils/utils');
const errors = require('../utils/errors');
const UserService = require('../services/UserService');

module.exports = {
    async register(req, res, next) {
        const {name, email, password} = req.body;
        try {
            const result = await UserService.registerUser({name, email, password});
            return res.status(200).json({
                "message": "User registration success.",
                "data": { userId: result }
            });
        } catch (err) {
            return next(err);
        }
    },
    async login(req, res, next) {
        const {email, password} = req.body;
        try {
            const result = await UserService.loginUser({email, password});
            return res.status(200).json({
                "message": "User login success",
                "data": {user: result.user, token: result.token}
            });
        } catch (err) {
            return next(err);
        }
    },
    async isAuthenticated (req, res, next) {
        const tokenFromUser = req.headers['x-access-token'];
        if (tokenFromUser == null || tokenFromUser == undefined){
            return next(new errors.MissingTokenError());
        }

        utils.jwtVerify(tokenFromUser , process.env.JWT_SECRET)
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