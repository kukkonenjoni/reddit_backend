// Imports
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
const isLogged = require('./middleware/isLogged');

// Init express
const app = express();

app.use(cors());
app.options('*', cors()); // enable pre-flight

// Connect to mongoDB
mongoose.connect(process.env.DB, (err) => {
  if (err) { console.log(err); }
  console.log('Succesfully connected to mongoDB');
});
// Parsing middlware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/authentication/', require('./routes/api/authentication'));

app.use('/api/', isLogged, require('./routes/api/dashboard'));

// Server Listen
app.listen(process.env.PORT);
