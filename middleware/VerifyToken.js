const jwt = require('jsonwebtoken');
require('dotenv').config();

/* eslint-disable no-undef */
function VerifyToken(req, res, next) {
  jwt.verify(req.token, process.env.JWT, (err, authData) => {
    if (err) {
      console.log(err);
      res.status(403).json({ msg: 'Access Forbidden' });
    } else {
      req.authData = authData;
      next();
    }
  });
}

module.exports = VerifyToken;
