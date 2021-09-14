/* eslint-disable no-console */
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ msg: 'TEST' });
});

// Register Route
router.post('/token', (req, res) => {
  jwt.verify(req.token, process.env.JWT, (err, authData) => {
    if (err) {
      console.log(err);
      res.status(403).json({ msg: 'Access Forbidden' });
    } else {
      res.send(authData);
      console.log(authData);
    }
  });
});

module.exports = router;
