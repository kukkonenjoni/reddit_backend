/* eslint-disable func-names */
const mongoose = require('mongoose');
const autoPopulateComments = require('../middleware/AutoPopulateComments');

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    required: true,
  },
  upvotes: [
    { type: Schema.Types.ObjectId, ref: 'User' },
  ],
  downvotes: [
    { type: Schema.Types.ObjectId, ref: 'User' },
  ],
  subreddit: {
    type: Schema.Types.ObjectId, ref: 'Subreddit',
  },
  comments: [{
    type: Schema.Types.ObjectId, ref: 'Comment',
  }],
});

PostSchema.virtual('formatted_title')
  .get(function () {
    const title = this.title.replace(/_/g, ' ');
    return title;
  });

PostSchema.pre('findOne', autoPopulateComments).pre('find', autoPopulateComments);

PostSchema.set('toJSON', { getters: true, virtuals: true });

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
