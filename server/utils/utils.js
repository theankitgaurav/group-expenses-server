const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


module.exports = {
  /**
   * Asynchronous function to hash a password string
   * using BCrypt algorithm 
   *
   * @param {String} plainTextPassword which needs to be hashed
   * @returns hashed password string or an error object
   */
  hashPassword: function (plainTextPassword) {
    return new Promise(function (resolve, reject) {
      const saltRounds = 10;
      bcrypt.hash(plainTextPassword, saltRounds)
        .then(function (hash) {
          resolve(hash);
        })
        .catch((err) => {
          reject(err);
        });
    })
  },
  /**
   * Asynchronous method to generate a jwt based on the default algorithm HS256
   * The secret key is fetched from environment variable
   * @param {any} payload 
   * @returns {Promise} Generated jwt or Error (eg: TokenExpiredError, JsonWebTokenError)
   */
  jwtSign: async function (payload) {
    try {
      const token = await jwt.sign({
        id: payload
      }, process.env.JWT_SECRET, {
        expiresIn: '1d'
      });
      console.log(`Token generated sucessfully.`);
      return token;
    } catch (err) {
      console.error(`Error during token generation.`);
      throw err;
    }
  },

  /**
   * Asynchronous method to verify is a plainText string 
   * has the same hash as the store hash
   *
   * @param {String} plainTextPassword
   * @param {String} hashToMatchWith
   * @returns {Promise} Valid or not boolean
   */
  isValidPassword: async function (plainTextPassword, hashToMatchWith) {
    return await bcrypt.compare(plainTextPassword, hashToMatchWith);
  },
  jwtVerify: async function (tokenFromUser) {
    return await jwt.verify(tokenFromUser , process.env.JWT_SECRET);
  } 
}