const createError = require('http-errors');
const errors = require('../utils/errors');
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
const Sequelize = require('sequelize');

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

function enteredBeforeOneDay (expense) {
  const durationAfterEntryInDays = utils.getTimeDifference(new Date, expense.createdAt, true);
  return durationAfterEntryInDays >= 1;
}


/**
 *
 * @param {*} expenseForm
 * @returns
 */
function validateExpenseForm (expenseForm) {
  return new Promise((resolve, reject)=>{
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
  })
};

async function validateFieldsWithSchema(expenseForm) {
  const schema = Joi.object().keys({
    category: Joi.string().min(2).max(20),
    amount: Joi.number().integer().min(1).max(10000),
    details: Joi.string().min(1).max(200),
    group: Joi.number().integer().min(1),
    paidBy: Joi.number().integer().min(1),
    paidOn: Joi.data(),
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
      // await validateExpenseForm(expenseForm);
      const createdExpense = await saveExpense(expenseForm);
      return createdExpense;
    } catch (err) {
      return err;
    }
  },

  async getExpenseByIdAndUser(expenseId, user) {
    const userGroups = await user.getGroups();
    const userGroupIdsArr = userGroups.map(el=>el.id) 
    const expense = await Expense.findOne({
      where: {id: expenseId, status: 'NORMAL'},
      include: [{
        model: Group,
        attributes: ["name", "id"]
      }]
    });

    if (!expense) throw new errors.NotFoundError();

    if (!userGroupIdsArr.includes(expense.Group.id)) throw new errors.AuthorizationError();

    return adaptExpenseModel(expense);
  },

  async deleteExpenseByIdAndUser(expenseId, user) {
    const expenseInDb = await Expense.findOne({
      where: {id: expenseId}
    });

    if (!expenseInDb) throw new errors.NotFoundError();

    // Disallow deletion of expense entered by other users
    if (expenseInDb.enteredBy !== user.id) throw new errors.AuthorizationError("You can't delete entries by other users");

    // Disallow deletion of expenses entered one day before now
    if (enteredBeforeOneDay(expenseInDb)) throw new errors.AuthorizationError("Expenses entered before one day can not be deleted");

    expenseInDb.update({ status: 'CANCEL' })
    .then(()=>{
      return true;
    })
    .catch((err)=>{
      throw new errors.InternalServerError(`Could not delete expense with id: ${expenseId}`, err);
    });
  },

  /**
   * This method fetches list of all expenses related to a user
   * based on the condition that either the expense should be made 
   * by them or in a group they are an active user of
   *
   * @param {User} user User model
   * @returns
   */
  async getExpensesForUser(user) {
    try{
      const userGroups = await user.getGroups();
      const userGroupIdsArr = userGroups.map(el=>el.id) 
      const expensesForUser = await Expense.findAll({
        where: {status: 'NORMAL', group: {[Op.in]: userGroupIdsArr}},
        include: [{
          model: Group,
          attributes: ["name", "id"]
        }]
      });
      return expensesForUser.map(adaptExpenseModel);
    } catch(err) {
      throw new Error("CAN'T FETCH EXPENSES FOR USER", err);
    }
  }
}

function adaptExpenseModel(expenseModel) {
  const expense = {};
  expense.id = expenseModel.id;
  expense.category = expenseModel.category;
  expense.amount = expenseModel.amount;
  expense.group = expenseModel.Group.id;
  expense.paidBy = expenseModel.paidBy;
  expense.enteredBy = expenseModel.enteredBy;
  expense.paidOn = expenseModel.paidOn;
  expense.groupName = expenseModel.Group.name;
  return expense;
}