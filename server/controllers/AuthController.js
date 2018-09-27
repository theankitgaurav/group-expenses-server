const utils = require('../utils/utils');
const errors = require('../utils/errors');
const UserService = require('../services/UserService');

module.exports = {
    isAuthenticated,
    login,
    logout,
    register,
}

async function register(req, res, next) {
    const {name, email, password} = req.body;
    try {
        const {user, token} = await UserService.registerUser({name, email, password});
        const userDto = utils.mapUser(user);
        return res.status(200).json({
            "message": "User registration success.",
            "data": {userDto, token}
        });
    } catch (err) {
        return next(err);
    }
};

async function login(req, res, next) {
    const {email, password} = req.body;
    try {
        const {user, token} = await UserService.loginUser({email, password});
        const userDto = utils.mapUser(user);
        return res.status(200).json({
            "message": "User login success",
            "data": {user: userDto, token: token}
        });
    } catch (err) {
        return next(err);
    }
};

async function logout (req, res, next) {
    const tokenFromUser = req.headers['x-access-token'];
    if (tokenFromUser) {
        await utils.jwtInvalidate(tokenFromUser);
    }
    return res.status(200).json({
        "message": "Logout success"
    });
};

async function isAuthenticated (req, res, next) {
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
};