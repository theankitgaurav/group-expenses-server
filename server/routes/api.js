const express = require("express");
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const GroupController = require('../controllers/GroupController');


// General apis
router.get('/', (req, res, next)=>{ res.json({"msg": 'Hello world.'}); });
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Apis for groups crud
// Should have request query params => userId {mandatory}
router.get("/group", AuthController.isAuthenticated, GroupController.getGroups);
router.get("/group/:groupId", AuthController.isAuthenticated, GroupController.getGroupById);
router.post("/group/", AuthController.isAuthenticated, GroupController.createGroup);

module.exports = router;