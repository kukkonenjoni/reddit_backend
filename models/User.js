const mongoose = require('mongoose');

const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

UserSchema.virtual('url')
  .get(function () {
    return `/u/${this.name}`;
  });

UserSchema.set('toJSON', { getters: true, virtuals: true });

const User = mongoose.model('User', UserSchema);
module.exports = User;
