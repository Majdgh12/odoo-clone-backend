const express = require("express");
const { getUsers, createUser } = require("../controllers/userController");

const router = express.Router();

router.route("/")
  .get(getUsers)   // GET /api/users
  .post(createUser); // POST /api/users

module.exports = router;
