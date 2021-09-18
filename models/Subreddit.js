const mongoose = require('mongoose');

const { Schema } = mongoose;

const SubredditSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  descriptin: {
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
    type: Schema.Types.ObjectId, ref: 'User',
  }],
});

SubredditSchema.virtual('url')
  .get(function () {
    return `/r/${this.name}`;
  });

const Subreddit = mongoose.model('Subreddit', SubredditSchema);
module.exports = Subreddit;
