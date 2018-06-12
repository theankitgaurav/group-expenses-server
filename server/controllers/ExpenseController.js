const createError = require('http-errors');
const utils = require('../utils/utils');
const GroupService = require('../services/GroupService');
const ExpenseService = require('../services/ExpenseService');

module.exports = {
  async getExpenses (req, res, next) {
    const groupId = req.query.groupId;
    ExpenseService.getExpenses(req, req.user.userId, groupId)
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