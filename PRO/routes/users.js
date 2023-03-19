require("dotenv").config({path: "../.env"});

const express = require('express');
const router = express();
const jwt = require('jsonwebtoken');
const DB = require('../config/mysql');
const verifyJWT = require('../middleware/verifyJWT');
const decodeJWT = require('../middleware/decodeJWT');

const hashPWD = require('../services/auth/hashPWD');
const check = require('../services/auth/check');
const exists = require('../services/auth/exists');
const login= require('../services/auth/login');
const resetPWD = require('../services/auth/resetPWD');
const limitResetPWD = require('../services/auth/limitResetPWD');



router.get('/', verifyJWT, decodeJWT, (req, res) => {

  DB.query('SELECT * FROM users', (err, result) => {
    if (err) throw err.message;
    
    return res.send(JSON.parse(JSON.stringify(result)));
  })
});



// Route to sign up [ REGISTER or CREATE ACCOUNT ]
router.post('/signup',check, exists, hashPWD, (req, res) => {

  let sqlStr = `INSERT INTO users(name, email, pwd) VALUES ('${req.body.name}','${req.body.email}','${req.body.pwd}');`;

  DB.query(sqlStr, (err, result) => {
    if (err) throw err.message;

    return res.send(JSON.parse(JSON.stringify(result)));
  })
});


// Route to sign in | LOG IN
router.post('/signin', login, (req, res) => {
  
  let sql = `SELECT email FROM users WHERE email LIKE '${req.body.email}';`;

  DB.query(sql, (err, result) => {
    if (err) throw err.message;

    const accessToken = jwt.sign({account: JSON.parse(JSON.stringify(result[0]))}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'});
    
    return res.status(200).json({accessToken: accessToken});
  });

});


// Route to get the RESET PASSWORD LINK
router.post('/reset-password', limitResetPWD,  (req, res) => {

  const TOKEN = jwt.sign({email: req.body.email}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '10s'} )

  return res.status(202).json({token: TOKEN});
  
});


// Route to handle the reset password LINK
router.post('/reset-password/verify/', (req, res, next) => {
  if (!req.body.token) return res.status(403).json("token is required");
  const TOKEN = req.body.token;
  
  jwt.verify(TOKEN, process.env.ACCESS_TOKEN_SECRET, (err, result) => {

    if (err) return res.status(404).json({error:'RESET LINK EXPIRED'});
  });

  if (!req.body.pwd) return res.status(403).json("Password is required");
  if (!req.body.pwd_confirm) return res.status(403).json("Password confirmation is required");
  if (req.body.pwd_confirm !== req.body.pwd) return res.status(403).json("Password don't match");

  next();

}, hashPWD, resetPWD);


module.exports = router;