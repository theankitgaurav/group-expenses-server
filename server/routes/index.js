const express = require("express");
const router = express.Router();
const debug = require('debug')('router');
const AuthController = require('../controllers/AuthController');
const isAuth = AuthController.isAuthenticated;
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

// Secure Apis
router.get("/group", isAuth, GroupController.getGroups);
router.get("/group/:groupId", isAuth, GroupController.getGroupById);
router.post("/group", isAuth, GroupController.createGroup);
router.delete("/group/:groupId", isAuth, GroupController.deleteGroupById);
router.get("/group/:groupId/expense", isAuth, ExpenseController.getExpensesByGroupId);
router.get("/group/:groupId/category", isAuth, GroupController.getExpenseCategoriesOfGroup);
router.get("/group/:groupId/member", isAuth, GroupController.getGroupMembers);

router.get("/expense", isAuth, ExpenseController.getExpensesForUser);
router.get("/expense/:expenseId", isAuth, ExpenseController.getExpenseById);
router.post("/expense", isAuth, ExpenseController.createExpense);
router.delete("/expense/:expenseId", isAuth, ExpenseController.deleteExpenseById);


module.exports = router;