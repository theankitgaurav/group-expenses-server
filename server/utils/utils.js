const bcrypt = require('bcrypt');

module.exports = {
  hashPassword: function (plainTextPassword) {
    return new Promise(function (resolve, reject) {
      const saltRounds = 10;
      bcrypt.hash(plainTextPassword, saltRounds)
        .then(function (hash) { resolve(hash); })
        .catch((err)=>{ reject(err); });
    })
  }
}