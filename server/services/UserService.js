const utils = require('../utils/utils');
const db = require('../db/models/index');
const errors = require('../utils/errors');

const User = require('../db/models').User;
const Group = require('../db/models').Group;

/**
 * Helper function to validate user form for registration
 * TODO: Use JOI to validate registration data properly
 * @param {*} userObj
 * @returns boolean stating valid or not
 */
function isRegisterDataValid (userObj) {
  if (userObj.name == "" || userObj.email == "" || userObj.password == "") return false;
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

/**
 * Helper function to return stripped down version of User object
 * so as to only send the attributes the client may need and hide
 * any sensitive info
 *
 * @param {*} userObj
 * @returns
 */
function getUserDto (userObj) {
  if (userObj instanceof User) {
    const userDto = {};
    userDto.id = userObj.id;
    userDto.name = userObj.name;
    userDto.email = userObj.email;
    return userDto;
  } else {
    console.log(userObj + ' not instance of User model');
  }
}


module.exports = {
  getUser: async (userId)=>{
    try {
      return await User.findOne({where: {id: userId}})
    } catch (err) {
      console.error("Error fetching user", err);
      throw err;
    }
  },
  registerUser: async (userObj)=>{
    if (!isRegisterDataValid(userObj)) {
      throw new errors.BadRequestError("Incorrect form data for user registration.");
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
            const userDto = getUserDto(user)
            return userDto;
          });
        });
      
      }).then(function (user) { 
        console.log('Transaction has been committed for user registration flow.');
        utils.jwtSign(user.id)
        .then((token)=> {
          resolve({user, token});
        });        
      }).catch(function (err) {
        console.log("Transaction has been rolled back for user registration flow.", err);
        reject(new errors.InternalServerError("User could not be saved into db", err));
      });

    });
  },

  loginUser: async (userObj) => {
    const {email, password} = userObj;
    validateUserLoginData(userObj);

    const userInDb = await User.findOne({ where: {email: email} });
    if(!userInDb) throw new errors.NotFoundError('User does not exist');
    
    const isPasswordValid = await utils.isValidPassword(password, userInDb.password);
    if(!isPasswordValid) throw new errors.AuthorizationError("Invalid Password");

    const token = await utils.jwtSign(userInDb.id);
    const userDto = getUserDto(userInDb)
    return {user: userDto, token: token};
  }
};