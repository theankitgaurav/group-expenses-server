const express = require("express");
const router = express.Router();
const debug = require('debug')('router');
const AuthController = require('../controllers/AuthController');
const GroupController = require('../controllers/GroupController');
const ExpenseController = require('../controllers/ExpenseController');

// Log each request body for debugging
router.all('*', function (req, res, next) {
    debug("REQUEST QUERY: ", req.query);
    debug("REQUEST PARAMS: ", req.params);
    debug("REQUEST BODY: ", req.body);
    next();
})

// General apis
router.get('/', (req, res, next)=>{ res.status(200).json({"msg": 'Hello from group expenses.'}); });
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.delete("/logout", AuthController.logout);

router.get("/group", AuthController.isAuthenticated, GroupController.getGroups);
router.get("/group/:groupId", AuthController.isAuthenticated, GroupController.getGroupById);
router.post("/group/", AuthController.isAuthenticated, GroupController.createGroup);
router.delete("/group/:groupId", AuthController.isAuthenticated, GroupController.deleteGroupById);
router.get("/group/:groupId/expense", AuthController.isAuthenticated, ExpenseController.getExpensesByGroupId);

router.get("/expense", AuthController.isAuthenticated, ExpenseController.getExpensesForUser);
router.get("/expense/:expenseId", AuthController.isAuthenticated, ExpenseController.getExpenseById);
router.post("/expense", AuthController.isAuthenticated, ExpenseController.createExpense);
router.delete("/expense/:expenseId", AuthController.isAuthenticated, ExpenseController.deleteExpenseById);
router.get("/expense/category", ExpenseController.getCategories);

module.exports = router;