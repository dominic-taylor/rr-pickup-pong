'use strict'
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);


app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

let users = []
let gameCollection = []

function validate(name){
  for (var i = 0; i < users.length; i++) {
    console.log(name);
    console.log(users[i].name);
    if(name == users[i].name){
      var randString = Math.floor(Math.random() * (1000 - 2 + 1)) + 2
      name = name+' '+ randString
    }
  }
  return name
}

io.sockets.on('connection', function(socket) {
  console.log('user connected ');

  socket.on('joinLobby', function(name) {
    const userName = validate(name)
    users.push({id: socket.id, name: userName, inGame: false})
    socket.userName = userName
    socket.emit('resJoinLobby', userName);
    io.emit('resUsers', users);
  });

  socket.on('requestGame', function (otherPlayer) {
    console.log('req fight with '+otherPlayer);

    let opponentId
    for (var i = 0; i < users.length; i++) {
      if(users[i].name == otherPlayer && !users[i].inGame){
        opponentId = users[i].id
        users[i].inGame = true  
      }else{
        // sorry they are in a game!
      }
      if(users[i].name == socket.userName && !users[i].inGame){
        users[i].inGame = true
      }else{
        // already in a game
      }
    }
    let gameId = (Math.random() + 1).toString(36).slice(2, 18)
    socket.emit('message', 'Challenge sent to '+ otherPlayer)
    socket.join(gameId)
    let gamePacket = { host: otherPlayer,
                      challenger: socket.userName,
                      gameId: gameId}
    socket.broadcast.to(opponentId).emit('challenge',gamePacket)
  })

  socket.on('readyGame', function (data) {
    let game = {}
    game.id = data.gameId
    game.playerOne = data.host
    game.playerOneId = socket.id
    game.playerTwo = data.challenger

    for (var i = 0; i < users.length; i++) {
      if(users[i].name == data.challenger){
        game.playerTwoId = users[i].id
      }
    }

    gameCollection.push(game)
    console.log(gameCollection);

    socket.join(game.id)
    io.in(game.id).emit('startGame', game)
  })

  socket.on('sendMove', function (gameData) {
    console.log(gameData);
    socket.broadcast.to(gameData.id).emit('getMove', gameData);

  })

   socket.on('sendGameState', function (data) {
    console.log(data);
    io.in(data.game.id).emit('getGameState',data);

  })
   socket.on('endGame', function (data) {
    io.in(data.game).emit('winner', data)   
  })

  socket.on('disconnect', function() {
			users = users.filter(function (el) {
        return el.id != socket.id
      })
			console.log('socket disconnected');
			io.emit('resUsers', users)
	})

})//io.connected

http.listen(process.env.PORT || 3000, function() {
  console.log('listening on port ' + (process.env.PORT || 3000));
});
