const createError = require('http-errors');
const utils = require('../utils/utils');
const _ = require('lodash');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;
const Expense = require('../db/models').Expense;
const Op = db.Sequelize.Op;

function getExpenseForm (requestObject) {
  const expenseForm = {};
  expenseForm.category = requestObject.body.expenseCategory;
  expenseForm.amount  = requestObject.body.expenseAmount;
  expenseForm.details = requestObject.body.expenseDetails;
  expenseForm.GroupId = requestObject.body.expenseGroup;
  expenseForm.paidBy = requestObject.body.expenseBy;
  expenseForm.paidOn = requestObject.body.expenseOn;
  expenseForm.enteredBy = requestObject.user.id;
  return expenseForm;
}

/**
 * TODO: Complete the validation using JOI
 *
 * @param {*} expenseForm
 * @returns
 */
function validateExpenseForm (expenseForm) {
  return new Promise((resolve, reject)=>{
    resolve(true);
  });
}

async function saveExpense (expenseForm) {
  return new Promise((resolve, reject)=>{
    Expense.create(expenseForm)
    .then((expense)=>{resolve(expense)})
    .catch((err)=>{reject(err)});
  })
}

module.exports = {
  async getExpenses (req, userId, groupId) {
    return new Promise((resolve, reject)=>{
      req.user.getGroups({where: {id: groupId}})
      .then((userGroupMap)=>{
        if(userGroupMap.length <=0) {
          return reject(createError("403", "User not member of group with id: "+groupId));
        }
        return userGroupMap;
      })
      .then((userGroupMap)=>{
        console.log('userVsGropup', userGroupMap);
        return Expense.findAll({
          attributes: ['category', 'amount', 'details', 'paidBy', 'paidOn'],
          where: {GroupId: groupId}})
      })
      .catch((err)=>{
        console.log("Error fetching map of userId and group Id", err);
        return reject(500, "Error fetching map of userId and group Id")
      })
      .then((expenses)=>{
        console.log('expenses', expenses);
        return resolve(expenses);
      })
      .catch((err)=>{
        console.error("Error while fetching expenses based on groupId", err);
        return reject(createError(500, "Error while fetching expenses based on groupId and userId"));
      })

    })
  },

  async addExpense (req) {
    const expenseForm = getExpenseForm(req);
    return new Promise((resolve, reject)=>{
      validateExpenseForm(expenseForm)
      .then((status)=>{
        return saveExpense(expenseForm);
       })
      .catch((err)=>{
        console.log(`Error while validating expense form: `, err);
        return reject(err);
      })
      .then( (createdExpense)=>{
        return resolve(createdExpense);
      })
      .catch((err)=>{
        console.error(`Error saving new expense to db: `, err);
        return reject(err);
      })
    })
  },

  async getCategories() {
    try{
      const categories = await Expense.findAll({attributes: ['category']});
      return _.uniq(categories);
    } catch (err) {
      console.error(`Error in processing getCategories service`, err);
      return createError(500, "Error fetching categories");
    }

  }
}