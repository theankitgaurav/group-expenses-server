const createError = require('http-errors');
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
    }
}