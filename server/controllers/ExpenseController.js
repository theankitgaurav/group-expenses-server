const ExpenseService = require('../services/ExpenseService');
const errors = require('../utils/errors');

module.exports = {
  deleteExpenseById,
  getExpenseById,
  getExpensesForUser,
  getExpensesByGroupId,
  createExpense
}

async function deleteExpenseById (req, res, next) {
  try {
    const expenseId = req.params.expenseId;
    await ExpenseService.deleteExpenseByIdAndUser(expenseId, req.user);
    res.status(200).json({
      "message": `Expense deleted successfully`
    });
  } catch (err) {
    next(err);
  }
};

async function getExpenseById (req, res, next) {
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
};

async function getExpensesForUser (req, res, next) {
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
};

async function getExpensesByGroupId(req, res, next) {
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
};

async function createExpense (req, res, next) {
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
};