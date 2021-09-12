/* eslint-disable prefer-destructuring */
function isLogged(req, res, next) {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const token = bearerHeader.split(' ');
    req.token = token[1];
    next();
  } else {
    res.json({ msg: 'Not authorized' });
  }
}

module.exports = isLogged;
