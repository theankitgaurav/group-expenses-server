const createError = require('http-errors');
const utils = require('../utils/utils');
const GroupService = require('../services/GroupService');
const ExpenseService = require('../services/ExpenseService');

module.exports = {
  async isViewable (req, res, next) {
    // FIXME: Add correct implementation below
    // should only go to next route if expense belongs 
    // to a group the user is a member of 
    return next();
  },
  async isModifiable (req, res, next) {
    // FIXME: Add correct implementation below
    // should only go to next route if expense is entered by user
    return next();
  },
  async deleteExpenseById (req, res, next) {
    // TODO: Add implementation below
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
      if(!expenses) return next(createError(404, "No expenses related to user"));
      return res.status(200).json({
        "msg": `${expenses.length} expenses fetched`,
        "data": expenses
      })
    })
    .catch(err=> next(err));
  },
  async getExpensesByGroupId (req, res, next) {
    const groupId = req.params.groupId;
    ExpenseService.getExpensesByGroupId(groupId)
    .then((expenses)=>{
      if(!expenses) return next(createError(404, "No matching expenses"))
      return res.status(200).json({
        "message": `${expenses.length} expenses fetched`,
        "data": expenses
      })
    })
    .catch((err)=>{
      return next(err);
    })
  },
  async createExpense (req, res, next) {
    ExpenseService.addExpense(req)
    .then((expense)=>{
      if(!expense) return next(createError(404, "No matching expenses"))
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
      if(!categories) return next(createError(404, "No categories exists"));
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