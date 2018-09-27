const utils = require('../utils/utils');
const db = require('../db/models/index');
const errors = require('../utils/errors');
const User = require('../db/models').User;
const Group = require('../db/models').Group;

module.exports = {
  getUser,
  getUsers,
  loginUser,
  registerUser,
};

async function getUser(userId) {
  try {
    return await User.findOne({where: {id: userId}})
  } catch (err) {
    console.error("Error fetching user", err);
    throw err;
  }
};

async function getUsers(userIdsArr) {
  try {
    return await User.findAll({where: {id: userIdsArr}});
  } catch (err) {
    console.error("Error fetching users: ", err);
    throw err;
  }
};

async function registerUser(userObj) {
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
          return user;
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
};

async function loginUser(userObj) {
  const {email, password} = userObj;
  validateUserLoginData(userObj);

  const userInDb = await User.findOne({ where: {email: email} });
  if(!userInDb) throw new errors.NotFoundError('User does not exist');
  
  const isPasswordValid = await utils.isValidPassword(password, userInDb.password);
  if(!isPasswordValid) throw new errors.AuthorizationError("Invalid Password");

  const token = await utils.jwtSign(userInDb.id);
  return {user: userInDb, token: token};
};


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