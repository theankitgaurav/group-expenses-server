const createError = require('http-errors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;


/**
 * Asynchronous method to generate a jwt based on the default algorithm HS256
 * The secret key is fetched from environment variable
 * @param {any} payload 
 * @returns {Prommise} Generated jwt or Error (eg: TokenExpiredError, JsonWebTokenError)
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
 * Asynchronous method to verify is a plainText string 
 * has the same hash as the store hash
 *
 * @param {*} plainTextPassword
 * @param {*} hashToMatchWith
 * @returns {Prommise} Valid or not boolean
 */
async function isValidPassword(plainTextPassword, hashToMatchWith) {
  return await bcrypt.compare(plainTextPassword, hashToMatchWith);
}

/**
 * Helper function to validate user form for registration
 * TODO: Use JOI to validate registration data properly
 * @param {*} userObj
 * @returns boolean stating valid or not
 */
function isRegisterDataValid (userObj) {
  if(userObj.name == "" || userObj.email == "" || userObj.password == "") return false;
  return true;
}

/**
 * Helper function to validate user form for login
 * TODO: Use JOI to validate registration data properly
 * @param {*} userObj
 * @throws Error if not valid else simply return
 */
function validateUserLoginData(userObj) {
  if(userObj.email == "" || userObj.password == ""){
    throw new Error ("Incorrect form data for user login.")
  }
}


module.exports = {
  registerUser: (userObj)=>{
    if (!isRegisterDataValid(userObj)) {
      throw new Error ("Incorrect form data for user registration.");
    }

    return new Promise((resolve, reject)=>{

      return db.sequelize.transaction(function (t) {

        return User.create(userObj, {transaction: t})
        .then(function (user) {
          console.log('User created with id: ' + user.id);
          return Group.create({ name: 'Personal', ownerId: user.id}, {transaction: t})
          .then((group)=>{
            console.log('Deafult group created with id: ' + group.id);
            user.addGroup(group).then(res=>console.log('User-vs-Group relation added to map.'));
            return user.id;
          });
        });
      
      }).then(function (result) { 
        console.log('Transaction has been committed for user registration flow.');
        resolve(result);
      }).catch(function (err) {
        console.log("Transaction has been rolled back for user registration flow.");
        console.error(err);
        reject(new Error("User could not be saved into db", err));
      });

    });
  },

  loginUser: (userObj) => {
    const {email, password} = userObj;
    validateUserLoginData(userObj);

    let matchedUser = null;

    return new Promise((resolve, reject)=>{
      User.findOne({ where: {email: email} })
      .then((user)=>{
        if(!user) throw new Error ("User does not exist.");
        console.log("User matched: " + user.email);
        return matchedUser = user;
      })
      .catch((err)=>{
        console.log(err);
        return createError(403, err.message);
      })
      .then((user)=>{
        return isValidPassword(password, user.password);
      })
      .then((isValidPassword)=>{
        if(!isValidPassword) throw new Error ('Invalid password given');
        console.log("Password matched");
        return matchedUser;
      })
      .catch ((err)=>{
        console.log(err);
        return createError(403, err.message);
      })
      .then ((matchedUser)=> {
        return jwtSign(matchedUser.id);
      })
      .then ((token) => {
        console.log("Token: " + token);
        resolve({user: matchedUser, token: token});
      })
      .catch ((err) => {
        console.log(err);
        reject(createError(500, "Token generation failed"));
      });
    })
  }
};