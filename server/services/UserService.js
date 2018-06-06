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
  }
};