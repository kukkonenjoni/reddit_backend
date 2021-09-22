/* eslint-disable func-names */
const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubredditSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  private: {
    type: Boolean,
  },
  createdBy: {
    type: Schema.Types.ObjectId, ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  subscribers: [
    { type: Schema.Types.ObjectId, ref: 'User' },
  ],
  posts: [{
    type: Schema.Types.ObjectId, ref: 'Post',
  }],
  admins: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: this.createdBy,
  }],
});

SubredditSchema.virtual('url')
  .get(function () {
    return `/r/${this.name}`;
  });

SubredditSchema.set('toJSON', { getters: true, virtuals: true });

const Subreddit = mongoose.model('Subreddit', SubredditSchema);
module.exports = Subreddit;
