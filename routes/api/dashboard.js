/* eslint-disable no-param-reassign */
/* eslint-disable eqeqeq */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
const express = require('express');
const Subreddit = require('../../models/Subreddit');
const Post = require('../../models/Post');
const ParseToken = require('../../middleware/ParseToken');
const Comment = require('../../models/Comment');
const VerifyToken = require('../../middleware/VerifyToken');
require('dotenv').config();

const router = express.Router();
// <<<<<<<<<<<<<<<<<<<<<<< GET ROUTES Start >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
router.get('/r/:subreddit/comments/:post', async (req, res) => {
  const { post } = req.params;
  const query = await Post.findOne({ title: post })
    .populate({
      path: 'createdBy',
      model: 'User',
      select: { name: 1 },
    });
  query.populate('createdBy');
  console.log(query);
  res.send(query);
});

router.get('/r/:subreddit', (req, res) => {
  const { subreddit } = req.params;
  Subreddit.findOne({ name: subreddit })
    .populate({ path: 'createdBy', model: 'User', select: { name: 1 } })
    .populate({
      path: 'posts',
      model: 'Post',
      options: { limit: 10, sort: { createdAt: -1 } },
      select: {
        title: 1,
        content: 1,
        createdBy: 1,
        createdAt: 1,
        comments: 1,
        subreddit: 1,
        upvotes: 1,
        downvotes: 1,
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

// Upvote a comment
router.post('/r/:subreddit/upvote/:post/:comment', ParseToken, VerifyToken, (req, res) => {
  const { createdBy } = req.body;
  const { comment } = req.params;
  Comment.findById(comment, (err, obj) => {
    if (err) throw err;
    if (obj && !obj.upvotes.includes(createdBy) && !obj.downvotes.includes(createdBy)) {
      obj.upvotes.push(createdBy);
      obj.save();
      res.send({ msg: 'Post upvoted!' });
    } else if (obj && !obj.upvotes.includes(createdBy) && obj.downvotes.includes(createdBy)) {
      const filtered = obj.downvotes.filter((downvote) => downvote != createdBy);
      obj.downvotes = filtered;
      obj.upvotes.push(createdBy);
      obj.save();
      res.send({ msg: 'Post upvoted!' });
    } else {
      res.send({ msg: 'already upvoted' });
    }
  });
});
// Downvote a comment
router.post('/r/:subreddit/downvote/:post/:comment', ParseToken, VerifyToken, (req, res) => {
  console.log('hola');
  const { createdBy } = req.body;
  const { comment } = req.params;
  Comment.findById(comment, (err, obj) => {
    if (err) throw err;
    if (obj && !obj.upvotes.includes(createdBy) && !obj.downvotes.includes(createdBy)) {
      obj.downvotes.push(createdBy);
      obj.save();
      console.log(obj);
      res.send({ msg: 'Post downvoted!' });
    } else if (obj && obj.upvotes.includes(createdBy) && !obj.downvotes.includes(createdBy)) {
      const filtered = obj.upvotes.filter((upvote) => upvote != createdBy);
      obj.upvotes = filtered;
      obj.downvotes.push(createdBy);
      obj.save();
      res.send({ msg: 'Post downvoted!' });
    } else {
      res.send({ msg: 'already downvoted' });
    }
  });
});

// Comment to a specific comment
router.post('/r/:subreddit/comments/:post/:comment', async (req, res) => {
  const { content, createdBy } = req.body;
  const post = await Post.findOne({ title: req.params.post });
  const comment = await Comment.findById(req.params.comment);
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

// Add comment to specific subreddit and post
router.post('/r/:subreddit/comments/:post', ParseToken, VerifyToken, (req, res) => {
  const { post } = req.params;
  console.log(req.params);
  Post.findOne({ title: post }, (err, obj) => {
    if (err) console.log('ASD');
    const newComment = new Comment({
      content: req.body.content,
      createdBy: req.body.createdBy,
      post: obj._id,
    });
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
// Upvote a post
router.post('/r/:subreddit/upvote/:post', ParseToken, VerifyToken, (req, res) => {
  const { post } = req.params;
  const { createdBy } = req.body;
  Post.findOne({ title: post }, (err, obj) => {
    if (!obj.upvotes.includes(req.body.createdBy) && !obj.downvotes.includes(req.body.createdBy)) {
      obj.upvotes.push(req.body.createdBy);
      obj.save();
      res.json({ msg: 1 });
    } else if (obj.downvotes.includes(createdBy) && !obj.upvotes.includes(createdBy)) {
      const filtered = obj.downvotes.filter((id) => id != createdBy);
      // eslint-disable-next-line no-param-reassign
      obj.downvotes = filtered;
      obj.upvotes.push(createdBy);
      obj.save();
      res.json({ msg: 1 });
    } else {
      res.status(400).json({ msg: 'Already upvoted!' });
    }
  });
});
router.post('/r/:subreddit/downvote/:post', ParseToken, VerifyToken, (req, res) => {
  const { post } = req.params;
  const { createdBy } = req.body;
  Post.findOne({ title: post }, (err, obj) => {
    if (!obj.downvotes.includes(createdBy) && !obj.upvotes.includes(createdBy)) {
      obj.downvotes.push(req.body.createdBy);
      obj.save();
      res.json({ msg: -1 });
    } else if (obj.upvotes.includes(createdBy) && !obj.downvotes.includes(createdBy)) {
      const filtered = obj.upvotes.filter((id) => id != createdBy);
      // eslint-disable-next-line no-param-reassign
      obj.upvotes = filtered;
      console.log(filtered);
      obj.downvotes.push(createdBy);
      obj.save();
      res.json({ msg: -1 });
    } else {
      res.status(400).json({ msg: 'viddu' });
    }
  });
});

// Add Post to specific subreddit
router.post('/r/:subreddit/post', ParseToken, VerifyToken, (req, res) => {
  const { subreddit } = req.params;
  Subreddit.findOne({ name: subreddit }, (err, obj) => {
    if (err) throw err;
    const {
      title, content,
    } = req.body;
    const newTitle = title.replace(/\s/g, '_');
    const newPost = new Post({
      title: newTitle,
      content,
      createdBy: req.authData.id,
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
// Create new subreddit
router.post('/r/createcommunity', ParseToken, VerifyToken, (req, res) => {
  console.log(req.authData.id);
  const newSubreddit = new Subreddit({
    name: req.body.name,
    description: req.body.description,
    createdBy: req.authData.id,
  });
  newSubreddit.save((err) => {
    if (err) throw err;
  });
  res.json({ msg: 'Community succesfully created!' });
});

// Check if token is valid and then send auth data for frontend global state to use
router.post('/verifytoken', ParseToken, VerifyToken, (req, res) => {
  res.json(req.authData);
  console.log(req.authData.id);
});
router.get('/just/a/test', (req, res) => {
  res.send('working');
});

module.exports = router;
