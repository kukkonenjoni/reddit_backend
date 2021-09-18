const mongoose = require('mongoose');

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
  comments: [{
    type: Schema.Types.ObjectId, ref: 'Comment',
  }],
});

PostSchema.virtual('url')
  .get(function () {
    return `/posts/${this.title}`;
  });

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
