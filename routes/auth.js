const express = require("express");
const router = express.Router();
const User = require("../modules/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// adding secret key for JavaWebToken generation for user authentication token to check when user login they dont tamper with user data and try to login as another user  
const JWT_Secret =  process.env.JWT_SECRET;


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
        const salt =  bcrypt.genSaltSync(10);
        const secPass = bcrypt.hashSync(req.body.password, salt);
      // A new user gets created and added to db
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user : {
            id : user.id,
        }
       
      }
      const authToken = jwt.sign(data, 'shhhhh');
      res.json({authToken});
    } catch (error) {
      console.error("Some error occured");
      // Catches Error and prevents app from crashing
      res.status(500).send("Some error occured");
    }
  }
);

module.exports = router;
