// The below code creates a simple HTTP server with the NodeJS `http` module,
// and makes it able to handle websockets. However, currently it does not
// actually have any websocket functionality - that part is your job!

var http = require('http');
var io = require('socket.io');
var ticker = 0;

var requestListener = function (request, response) {
  response.writeHead(200);
  response.end('Hello, World!\n');
};

var server = http.createServer(requestListener);

server.listen(8080, function () {
  // console.log('Server is running...');
});

var socketServer = io(server);

// This is the object that will keep track of all the current questions in the server.
// It can be considered to be the (in-memory) database of the application.
var questions = {};

// Your code goes here:
socketServer.on('connection', function (socket) {
  socket.emit('here_are_the_current_questions', questions);

  socket.on('add_new_question', function (question) {
    var newQuestion = {
      text: question.text,
      answer: '',
      author: socket.id,
      id: ticker
    };
    questions[ticker] = newQuestion;
    socketServer.emit('new_question_added', newQuestion);
    ticker++;
  });

  socket.on('get_question_info', function (id) {
    var toSend = null;
    if (questions[id]) {
      toSend = questions[id];
    }
    socket.emit('question_info', toSend);
  });

  socket.on('add_answer', function (obj) {
    var id = obj.id;
    var ans = obj.answer;
    questions[id].answer = ans;
    socket.broadcast.emit('answer_added', questions[id]);
  });

});
