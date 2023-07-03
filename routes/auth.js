const express = require('express');
const router = express.Router();
const User = require('../modules/User');
const { body, validationResult } = require('express-validator');

router.post('/', [
 body('name',"The name should be atleast 3 characters").isLength({min : 3}),
body('email',"Email is invalid").isEmail(),
body('password',"Password should be atleast 5 characters").isLength({min:5}),   
]

,(req , res )=>{
    console.log(req.body)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    
    User.create({
        name : req.body.name,
        password : req.body.password,
        email : req.body.email
    }).then(user => res.json(user))
    .catch(
        err=>{
        console.log(err)
        res.json({error : "Account with this email already exist" , message : err.message})
        }
    );
    // const user = User(req.body);
    // user.save();
    // res.json(req.body);

})

module.exports = router;