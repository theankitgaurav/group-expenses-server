const createError = require('http-errors');
const utils = require('../../utils/utils');
const UserService = require('../../services/UserService');

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
            console.log(err);
            return next(createError(400, err.message));
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
            console.log(err);
            return next(err);
        }
    },
    async isAuthenticated (req, res, next) {
        const tokenFromUser = req.headers['x-access-token'];
        if (tokenFromUser == null || tokenFromUser == undefined){
            return next(createError(401, `Missing token.`));
        }

        utils.jwtVerify(tokenFromUser , process.env.JWT_SECRET)
        .then((decoded)=>{
            req.userId = decoded.id;
            return next();
        })
        .catch((err)=>{
            console.error(`Error while verifying jwt`, err);
            return next(createError(401, `Bad token.`));
        })
    }
}