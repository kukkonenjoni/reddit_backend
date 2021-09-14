/* eslint-disable no-console */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
require('dotenv').config();

const router = express.Router();

router.get('/register', (req, res) => {
  res.send('Register Route');
});

// Register Route
router.post('/register', (req, res) => {
  console.log(req.body);
  if (!req.is('application/json')) {
    res.json({ msg: 'Wrong content-type' });
  } else {
    const { name, password, email } = req.body;
    if (name && password && email) {
      User.findOne({ name }, (err, obj) => {
        if (err) throw err;
        if (obj) {
          res.json({ msg: 'User already exists' });
        }
        if (!obj) {
          const newUser = new User({
            name,
            email,
            password,
          });
          // Hash Password
          bcrypt.hash(newUser.password, 10, (err1, result) => {
            if (err1) {
              throw err1;
            }
            newUser.password = result;
            newUser.save((err2) => {
              if (err2) throw err;
              res.json({ msg: 'New account created!' });
            });
          });
        }
      });
    } else {
      res.json({ msg: 'Please fill all fields' });
    }
  }
});

// Login Route
router.post('/login', (req, res) => {
  if (!req.is('application/json')) {
    res.status(400).json({ msg: 'Wrong content-type' });
  } else {
    const { name, password } = req.body;
    // Find existing user to log in
    User.findOne({ name }, (err, user) => {
      if (err) throw err;
      // User found
      if (user) {
        bcrypt.compare(password, user.password, (err2, result) => {
          if (err2) throw err;
          // Correct password
          if (result) {
            const token = jwt.sign({ name: user.name, email: user.email }, process.env.JWT, { expiresIn: '1800s' });
            res.status(200).json({ token, name });
          }
          // Wrong password
          if (!result) {
            res.status(401).json({ msg: 'Wrong Password!' });
          }
        });
        // User not found
      } else {
        res.status(404).json({ msg: 'User not found!' });
      }
    });
  }
});

module.exports = router;
