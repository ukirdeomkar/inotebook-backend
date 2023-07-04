const express = require("express");
const router = express.Router();
const User = require("../modules/User");
const { body, validationResult } = require("express-validator");

// create a post request to /api/auth/createuser
router.post(
  // this is route :
  "/createuser",

  // this are validation parameters

  [
    body("name", "The name should be atleast 3 characters").isLength({
      min: 3,
    }),
    body("email", "Email is invalid").isEmail(),
    body("password", "Password should be atleast 5 characters").isLength({
      min: 5,
    }),
  ],
  // request-responses
  async (req, res) => {
    console.log(req.body);

    // Check for errors and return error if occurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // checks if user exist currently in db
    let user = await User.findOne({ email: req.body.email });
    // console.log(user);
    if (user) {
      return res
        .status(400)
        .json({ error: "Sorry a user with this email already exists" });
    }
    // added try catch to avoid app from crashing
    try {
      // A new user gets created and added to db
      user = await User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
      });
      res.json(user);
    } catch (error) {
      console.error("Some error occured");
      // Catches Error and prevents app from crashing
      res.status(500).send("Some error occured");
    }
  }
);

module.exports = router;
