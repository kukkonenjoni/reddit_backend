const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  upvotes: [{
    type: Schema.Types.ObjectId, ref: 'User',
  }],
});

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
