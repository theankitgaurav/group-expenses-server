const createError = require('http-errors');
const utils = require('../utils/utils');
const _ = require('lodash');
const Joi = require('joi');
const db = require('../db/models/index');
const User = require('../db/models').User;
const Group = require('../db/models').Group;
const Expense = require('../db/models').Expense;
const GroupService = require('./GroupService');
const UserService = require('./UserService');
const Op = db.Sequelize.Op;

async function getExpenseForm (requestObject) {
  try {
    const expenseForm = {};
    expenseForm.category = requestObject.body.expenseCategory;
    expenseForm.amount  = requestObject.body.expenseAmount;
    expenseForm.details = requestObject.body.expenseDetails;
    expenseForm.group = requestObject.body.expenseGroup;
    expenseForm.paidBy = requestObject.body.expenseBy;
    expenseForm.paidOn = requestObject.body.expenseOn;
    expenseForm.enteredBy = requestObject.user.id;
    return expenseForm;
  } catch (err) {
    throw new Error("INSUFFICIENT_FORM_DATA_ERROR: ", err);
  }
}


/**
 *
 * @param {*} expenseForm
 * @returns
 */
function validateExpenseForm (expenseForm) {
  Promise.all([
    validateFieldsWithSchema(expenseForm),
    validateGroup(expenseForm),
    validatePaidBy(expenseForm)
  ]).then((results)=>{
    console.log("New Expense Input Validations Passed");
    return resolve(results);
  }).catch((err)=>{
    return reject(new Error("INVALID_FORM_DATA_ERROR", err));
  })
};

async function validateFieldsWithSchema(expenseForm) {
  const schema = Joi.object().keys({
    category: Joi.string().min(2).max(20),
    amount: Joi.number().integer().min(1).max(10000),
    details: Joi.string().min(1).max(200),
    group: Joi.number().integer().min(1),
    paidBy: Joi.number().integer().min(1),
    paidOn: joi.data(),
    enteredBy: Joi.number().integer().min(1)
  });
  Joi.validate(expenseForm, schema, (err, value) => {
    if (err) {
      throw err;
    } else {
      return value;
    }
  });
};

async function validatePaidBy(expenseForm) {
  const groupId = expenseForm.group;
  const paidBy = expenseForm.paidBy;
  try {
    const paidByUserObj = await UserService.getUser(paidBy)
    return await GroupService.isUserMemberOfGroup(paidByUserObj, groupId);
  } catch (err) {
    throw new Error("Invalid paidBy user Provided", err);
  }
}

async function validateGroup (expenseForm) {
  const groupId = expenseForm.group;
  const userId = expenseForm.enteredBy;
  try {
    return await !!GroupService.getGroupByUserIdAndGroupId(userId, groupId);
  } catch (err) {
    throw new Error("Invalid Group Provided", err);
  }
}


async function saveExpense (expenseForm) {
  return new Promise((resolve, reject)=>{
    Expense.create(expenseForm)
    .then((expense)=>{
      console.log("New expense: ", expense);
      resolve(expense)})
    .catch((err)=>{reject(err)});
  })
}

module.exports = {
  async getExpensesByGroupId (groupId) {
    return new Promise((resolve, reject)=>{

      Expense.findAll({
        attributes: ['category', 'amount', 'details', 'paidBy', 'paidOn'],
        where: {group: groupId}})
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
    try {
      const expenseForm = await getExpenseForm(req);
      await validateExpenseForm(expenseForm);
      const createdExpense = await saveExpense(expenseForm);
      return createdExpense;
    } catch (err) {
      return err;
    }
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
        Expense.findAll()
      ])
      .then(results=>{
        const groups = results[0];
        console.log('Groups: ', groups.map(group=>group.id))
        const expenses = results[1];
        console.log('Expenses: ', expenses)
        const expensesForUser = expenses.filter(expense=>{
          return groups.map(group=>group.id).includes(expense.group);
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