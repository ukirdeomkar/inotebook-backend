const express = require("express");
const router = express.Router();
const User = require("../modules/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fetchUser = require('../middleware/fetchuser');

// adding secret key for JavaWebToken generation for user authentication token to check when user login they dont tamper with user data and try to login as another user
const JWT_Secret = process.env.JWT_SECRET;


// ROUTE 1 : create a post request to /api/auth/createuser for creating new user . No Login Required for this.
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
    let success = false ;
    // Check for errors and return error if occurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, errors: errors.array() });
    }
    // checks if user exist currently in db
    let user = await User.findOne({ email: req.body.email });

    // console.log(user);
    if (user) {
      return res
        .status(400)
        .json({ success, error: "Sorry a user with this email already exists" });
    }
    // added try catch to avoid app from crashing
    try {
      const salt = bcrypt.genSaltSync(10);
      const secPass = bcrypt.hashSync(req.body.password, salt);
      // A new user gets created and added to db
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_Secret);
      if(authToken){
        success = true;
      }
      res.json({ success ,authToken });
    } catch (error) {
      // Catches Error and prevents app from crashing
      res.status(500).send("Internal Server Error");
    }
  }
);


// ROUTE 2 : create a post request to /api/auth/login to make a Login Request . No Login required for this .
router.post(
  // this is route :
  "/login",

  // this are validation parameters
  [
    body("email", "Email is invalid").isEmail(),
    body("password", "Password should not be blank").exists(),
  ],
  // request-responses
  async (req, res) => {
    try {
      success = false ;
      // find user details for credentials entered by the user
      let user = await User.findOne({ email: req.body.email });
      // check if user email exist in db
      if (!user) {
        return res.status(400).json({sucess , error : "Invalid Credentials"});
      }
      // compare hash values of entered password and db password
      let passwordCompare = await bcrypt.compare(
        req.body.password,
        user.password
      );
      // check if password is correct
      if (!passwordCompare) {
        return res.status(400).json({success , error : "Invalid Credentials"});
      }
      // create a payload to return to the user
      const data = {
        user: {
          id: user.id,
          email: user.email,
        },
      };
      //   sign the payload using jwt secret key
      const authToken = jwt.sign(data, JWT_Secret);
      //   return authToken to verify a user
      if(authToken){
        success = true;
      }
      res.json({ success ,authToken, data });
    } catch (error) {
      // Catches Error and prevents app from crashing
      res.status(500).send("Internal Server Error");
    }
  }
);

// ROUTE 3 : create a post request to /api/auth/getuser for fetching user data . Login Required for this.

router.post(

  // this is route :
  "/getuser",

  // this are validation parameters
  fetchUser,
  // request-responses
  async (req, res) => {
    try {
      success = false ; 
        userID = req.user.id;
        // get all user data in {user} except password
        user = await User.findById(userID).select("-password")
        res.json(user);


    } catch (error) {
        // Catches Error and prevents app from crashing
        res.status(500).send("Internal Server Error");
      }
  }
);

module.exports = router;
