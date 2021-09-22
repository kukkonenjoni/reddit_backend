/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Subreddit = require('../../models/Subreddit');
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
          User.findOne({ email }, (err2, obj2) => {
            if (err2) throw err;
            if (obj2) {
              res.json({ msg: 'Email already in use' });
            } if (!obj2) {
              const newUser = new User({
                name,
                email,
                password,
              });
              bcrypt.hash(newUser.password, 10, (err1, result) => {
                if (err1) {
                  throw err1;
                }
                newUser.password = result;
                newUser.save((err3) => {
                  if (err3) throw err;
                  console.log(newUser);
                  res.json({ msg: 'New account created!' });
                });
              });
            }
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
            const token = jwt.sign({ name: user.name, email: user.email, id: user._id }, process.env.JWT, { expiresIn: '1800s' });
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
router.post('/createcommunity', (req, res) => {
  console.log(req.body);
  User.findOne({ _id: req.body.createdBy }, (err, obj) => {
    if (err) throw err;
    if (obj) {
      console.log(obj);
      const newSubreddit = new Subreddit({
        name: req.body.name,
        description: req.body.description,
        createdBy: req.body.createdBy,
      });
      newSubreddit.save((err2) => {
        if (err2) throw err;
        res.json({ msg: 'New subreddit created!' });
      });
    } else {
      res.json({ msg: 'test' });
    }
  });
});

module.exports = router;
