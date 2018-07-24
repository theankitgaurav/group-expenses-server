const createError = require('http-errors');
const utils = require('../utils/utils');
const GroupService = require('../services/GroupService');
const ExpenseService = require('../services/ExpenseService');
const errors = require('../utils/errors');

module.exports = {
  /**
   *
   *
   * @param {*} req ExpenseId as parameter
   * @param {*} res success message or http error with code and message
   * @param {*} next
   */
  async deleteExpenseById (req, res, next) {
    try {
      const expenseId = req.params.expenseId;
      await ExpenseService.deleteExpenseByIdAndUser(expenseId, req.user);
      res.status(200).json({
        "message": `Expense deleted successfully`
      });
    } catch (err) {
      next(err);
    }
  },
  async getExpenseById (req, res, next) {
    try {
      const expenseId = req.params.expenseId;
      const expenseInDb = await ExpenseService.getExpenseByIdAndUser(expenseId, req.user);
      res.status(200).json({
        "message": `Expense fetched`,
        "data": expenseInDb 
      });
    } catch (err) {
      next(err);
    }
  },

  async getExpensesForUser (req, res, next) {
    const user = req.user;
    ExpenseService.getExpensesForUser(user)
    .then(expenses=>{
      if(!expenses) return next(new errors.NotFoundError("No expenses related to user"));
      return res.status(200).json({
        "msg": `${expenses.length} expenses fetched`,
        "data": expenses
      })
    })
    .catch(err=> next(err));
  },
  async getExpensesByGroupId(req, res, next) {
    const groupId = req.params.groupId;
    ExpenseService.getExpensesByGroupId(groupId)
      .then((expenses) => {
        if (!expenses) return next(new errors.NotFoundError(`No matching expenses in group ${groupId}`));
      return res.status(200).json({
        "message": `${expenses.length} expenses fetched`,
        "data": expenses
      })
    })
      .catch((err) => {
      return next(err);
    })
  },
  async createExpense (req, res, next) {
    ExpenseService.addExpense(req)
    .then((expense)=>{
      return res.status(200).json({
        "message": `Expense added`,
        "data": expense
      })
    })
    .catch((err)=>{
      return next(err);
    })
  },
  async getCategories(req, res, next) {
    ExpenseService.getCategories()
    .then ((categories)=>{
      if(!categories) return next(new errors.NotFoundError("No categories exists"));
      return res.status(200).json({
        "message": `${categories.length} categories fetched`,
        "data": categories
      })
    })
    .catch((err)=>{
      return next(err);
    })
  }
}