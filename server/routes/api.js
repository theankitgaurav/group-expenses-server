const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const GroupController = require('../controllers/GroupController');
const ExpenseController = require('../controllers/ExpenseController');


// General apis
router.get('/', (req, res, next)=>{ res.json({"msg": 'Hello world.'}); });
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Apis for groups crud
router.get("/group", AuthController.isAuthenticated, GroupController.getGroups);
router.get("/group/:groupId", AuthController.isAuthenticated, GroupController.getGroupById);
router.post("/group/", AuthController.isAuthenticated, GroupController.createGroup);
router.delete("/group/:groupId", AuthController.isAuthenticated, GroupController.isOwner, GroupController.createGroup);

// Apis for expense crud
router.get("/expense", AuthController.isAuthenticated, ExpenseController.getExpenses);
router.post("/expense", AuthController.isAuthenticated, ExpenseController.createExpense);
// router.delete("/expense/:expenseId", AuthController.isAuthenticated, ExpenseController.deleteExpense);
router.get("/expense/category", ExpenseController.getCategories);

module.exports = router;