function autoPopulateComments(next) {
  this.populate('comments');
  next();
}

module.exports = autoPopulateComments;
