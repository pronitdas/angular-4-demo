const express = require('express');
const cors = require('cors')
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const restify = require('express-restify-mongoose');
const router = express.Router();
app.use(cors());
app.use(bodyParser.json());

app.listen(3000, function() {
  console.log('listening on 3000');
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/dist/index.html');
});

app.use('/', express.static('dist'));



//Set up default mongoose connection
const mongoDB = 'mongodb://127.0.0.1/arkenea';
mongoose.connect(mongoDB, {
  useMongoClient: true
});

const Schema = mongoose.Schema;

const ToDoSchema = new Schema({
  id: Number,
  userId: Number,
  title: String,
  completed: Boolean
});
//Get the default connection
const db = mongoose.connection;
const Todo = mongoose.model('todo', ToDoSchema);

restify.serve(router, Todo);
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
app.use(router);
