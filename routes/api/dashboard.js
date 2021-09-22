/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const express = require('express');
const jwt = require('jsonwebtoken');
const Subreddit = require('../../models/Subreddit');
const User = require('../../models/User');
const Post = require('../../models/Post');
const ParseToken = require('../../middleware/ParseToken');
const Comment = require('../../models/Comment');
require('dotenv').config();

const router = express.Router();
// <<<<<<<<<<<<<<<<<<<<<<< GET ROUTES Start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/r/:subreddit/comments/:post', async (req, res) => {
  const { post } = req.params;
  const query = await Post.findOne({ title: post });
  res.send(query);
});

router.get('/r/:subreddit', (req, res) => {
  const { subreddit } = req.params;
  console.log(subreddit);
  Subreddit.findOne({ name: subreddit })
    .populate({ path: 'createdBy', model: 'User', select: { name: 1 } })
    .populate({
      path: 'posts',
      model: 'Post',
      options: { limit: 10 },
      select: {
        title: 1, content: 1, createdBy: 1, createdAt: 1, comments: 1, subreddit: 1, upvotes: 1,
      },
      populate: [{
        path: 'createdBy',
        model: 'User',
        select: {
          name: 1,
        },
      }, {
        path: 'subreddit',
        model: 'Subreddit',
        select: {
          name: 1,
        },
      }],
    })
    .exec((err, obj) => {
      if (obj) {
        console.log(obj);
        res.json({ obj });
      } else {
        res.json();
      }
    });
});
router.get('/', (req, res) => {
  Post.find({})
    .limit(20)
    .populate('subreddit', { name: 1 })
    .populate('createdBy', { name: 1 })
    .exec((err, data) => {
      if (err) throw err;
      if (data) {
        res.json(data);
      }
    });
});

// <<<<<<<<<<<<<<<<<<<<<<< POST ROUTES Start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
// Check if token is valid and then send auth data for frontend global state to use
router.post('/r/:subreddit/comments/:post/:comment', async (req, res) => {
  const { content, createdBy } = req.body;
  const post = await Post.findOne({ title: req.params.post });
  const comment = await Comment.findById(req.params.comment);
  console.log(comment);
  const newComment = new Comment({
    content,
    createdBy,
    post: post._id,
  });
  newComment.save((err) => {
    if (err) throw err;
    console.log('New comment saved');
  });
  comment.comments.push(newComment._id);
  comment.save();
  res.send(comment);
});

router.post('/verifytoken', ParseToken, (req, res) => {
  jwt.verify(req.token, process.env.JWT, (err, authData) => {
    if (err) {
      console.log(err);
      res.status(403).json({ msg: 'Access Forbidden' });
    } else {
      res.json(authData);
      console.log(authData);
    }
  });
});

// Add comment to specific subreddit and post
router.post('/r/:subreddit/comments/:post', (req, res) => {
  const { post } = req.params;
  console.log(req.params);
  Post.findOne({ title: post }, (err, obj) => {
    if (err) console.log('ASD');
    console.log(req.body.content);
    const newComment = new Comment({
      content: req.body.content,
      createdBy: req.body.createdBy,
      post: obj._id,
    });
    console.log(newComment);
    newComment.save((err) => {
      if (err) throw err;
      console.log('Comment saved');
    });
    obj.comments.push(newComment._id);
    obj.save((err) => {
      if (err) throw err;
      console.log('Object updated');
    });
    res.send(obj);
  });
});
// Add Post to specific subreddit
router.post('/r/:subreddit/post', (req, res) => {
  const { subreddit } = req.params;
  Subreddit.findOne({ name: subreddit }, (err, obj) => {
    if (err) throw err;
    const {
      title, content, createdBy,
    } = req.body;
    const newTitle = title.replace(/\s/g, '_');
    const newPost = new Post({
      title: newTitle,
      content,
      createdBy,
      subreddit: obj._id,
    });
    console.log(obj._id);
    console.log(newPost);
    obj.posts.push(newPost);
    obj.save((err1) => {
      if (err1) throw err1;
    });
    newPost.save((err2) => {
      if (err2) throw err2;
      res.send('hola');
    });
  });
});

module.exports = router;
