const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;
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
module.exports = {
  registerUser: (userObj)=>{
    if (!isRegisterDataValid(userObj)) {
      throw new Error ("Incorrect form data for user registration.");
    }

    return new Promise((resolve, reject)=>{

      return db.sequelize.transaction(function (t) {

        return User.create(userObj, {transaction: t})
        .then(function (user) {
          return Group.create({ name: 'Personal' }, {transaction: t})
          .then((group)=>{
            console.log('user: ', user);
            console.log('group: ', group);
            user.addGroup(group, { through: { owner: user.id }})
            return user;
          });
        });
      
      }).then(function (result) { // Transaction has been committed
        resolve(result);
      }).catch(function (err) { // Transaction has been rolled back
        console.error(err);
        reject(new Error("User could not be saved into db", err));
      });

    });
  }
};