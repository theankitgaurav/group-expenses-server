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
  async getExpensesByGroupId (groupId) {
    return new Promise((resolve, reject)=>{

      Expense.findAll({
        attributes: ['category', 'amount', 'details', 'paidBy', 'paidOn'],
        where: {GroupId: groupId}})
      .then(expenses=>{
        console.log('expenses', expenses);
        return resolve(expenses);
      })
      .catch((err)=>{
        console.error("Error while fetching expenses based on groupId", err);
        return reject(err);
      });

    });
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
      return _.uniq(categories).map(el=>el.category);
    } catch (err) {
      console.error(`Error in processing getCategories service`, err);
      return createError(500, "Error fetching categories");
    }
  },

  /**
   * This method fetches list of all expenses related to a user
   * based on the condition that either the expense should be made 
   * by them or in a group they are an active user of
   *
   * @param {*} user
   * @returns
   */
  async getExpensesForUser(user) {
    return new Promise((resolve, reject)=>{
      Promise.all([
        user.getGroups(),
        Expense.findAll({attributes: ['id','category', 'amount', 'details', 'GroupId', 'paidBy', 'enteredBy', 'paidOn']})
      ])
      .then(results=>{
        const groups = results[0];
        console.log('Groups: ', groups.map(group=>group.id))
        const expenses = results[1];
        const expensesForUser = expenses.filter(expense=>{
          return groups.map(group=>group.id).includes(expense.GroupId);
        })
        return resolve(expensesForUser);
      })
      .catch(err=>{
        console.log('Error fetching list of expenses for user: ', err);
        return reject(createError(500, 'Error fetching list of expenses for user'));
      });
    });
  }
}