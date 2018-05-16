const User = require('../models/user');
const jwt = require('jsonwebtoken');

function jwtSign(user) {
    const ONE_WEEK = 60 * 60 * 24 * 7;
    return jwt.sign(user, "my_jwt_secret", {
        expiresIn: ONE_WEEK
    });
}

module.exports = {
    async register(req, res, next) {
        const {username, password} = req.body;
        try{
            const user = await User.create({username, password});
            return res.status(200).send(user.toJSON());
        } catch (err) {
            console.log(err);
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
            return res.status(200).send({
                user: userJson,
                token: jwtSign(userJson)
            });
        } catch (err) {
            console.log(err);
            return res.status(400).send({error: 'Oops'});
        }
    }
}