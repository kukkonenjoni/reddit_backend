const mongoose = require('mongoose');
const autoPopulateComments = require('../middleware/AutoPopulateComments');

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
  post: [{
    type: Schema.Types.ObjectId, ref: 'Post',
  }],
  comments: [{
    type: Schema.Types.ObjectId, ref: 'Comment',
  }],
});

CommentSchema.pre('findOne', autoPopulateComments).pre('find', autoPopulateComments);

const Comment = mongoose.model('Comment', CommentSchema);
module.exports = Comment;
