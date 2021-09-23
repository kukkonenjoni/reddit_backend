function autoPopulateComments(next) {
  this.populate('comments');
  this.populate({
    path: 'createdBy',
    model: 'User',
    select: {
      name: 1,
    },
  });
  next();
}

module.exports = autoPopulateComments;
