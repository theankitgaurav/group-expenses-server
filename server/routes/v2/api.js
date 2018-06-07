const express = require("express");
const router = express.Router();
const AuthController = require('../../controllers/pg/AuthController');
const GroupController = require('../../controllers/pg/GroupController');


// General apis
router.get('/', (req, res, next)=>{
    res.send('Hello world.');
})
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Apis for groups crud
// Should have request query params => userId {mandatory}
router.get("/groups", AuthController.isAuthenticated, GroupController.getGroups);
router.get("/groups/:groupId", AuthController.isAuthenticated, GroupController.getGroupById);

module.exports = router;