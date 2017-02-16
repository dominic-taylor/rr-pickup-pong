const socket = io()

document.getElementById('joinServer').addEventListener('click', function() {
  let name = document.getElementById('nameInput')
  if(!name.value){
    return log('Please enter a name')
  };
  socket.emit('joinLobby', name.value)
  //disable further events from this button
})

socket.on('resJoinLobby', function (data) {
  let nameNode = document.createTextNode(data)
  document.getElementById('userName').appendChild(nameNode)
})

socket.on('resUsers', function (users) {
  let gameList = document.getElementById('gameList')
  gameList.innerHTML = ''
  let thisUser = document.getElementById('userName').innerHTML
  for (var i = 0; i < users.length; i++) {
    if(users[i].name != thisUser){
      var liNode = document.createElement("LI")
      var game = document.createTextNode(users[i].name)
      liNode.appendChild(game)
      liNode.addEventListener('click', reqGame, false)
      gameList.appendChild(liNode)
    }
  }
})

function reqGame(e) {
  let player = e.target.innerHTML
  socket.emit('requestGame', player)
}

socket.on('message', function (message) {
  log(message)
})

function log(message) {
  document.getElementById('gameMessages').innerHTML = message
}

socket.on('challenge', function (challenge) {
  let lobby = document.getElementById('lobby')
  let accept = document.createElement('button')
  accept.id = 'accept'
  accept.innerHTML = "I'm Ready!"
  socket.challenge = challenge
  accept.addEventListener('click', function () {
    socket.emit('readyGame', socket.challenge)
  })
  lobby.insertBefore(accept,lobby.childNodes[1])

  log('Challenge from '+ challenge.challenger+'. Ready?')
})

socket.on('startGame', function (data) {
  let readyButton = document.getElementById('accept');
  if (readyButton) {
    readyButton.parentNode.removeChild(readyButton);
  }

  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );

  console.log(data);
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.addEventListener('keypress', function(){
    //if you press w or s send a socket.emit('move', signal)
    //where signal is the gameId and opponents id and the w/s

    //server
    //on 'move'(signal)
    //  take the signal data and
    //  send it to the opponent/both players(room)
    //

    //in the room
    // have gotMove(signal)
    //   moveHandler(signal)
    //   pass the signal to the Game() and update
    //
    //

  })
  document.getElementById('game').appendChild(canvas);
  gameRoutine()

}


function gameRoutine() {
  var game = new Game() // creating instance of Game obj
  console.log(game);
   //calls loop()



  function MainLoop() {
      game.update();  //calls the instances update and draw()
      game.draw();
      // Call the main loop again at a frame rate of 30fps
      setTimeout(MainLoop, 33.3333);
  }

  function Game() {
      var canvas = document.getElementById("canvas");
      this.width = canvas.width;
      this.height = canvas.height;
      this.context = canvas.getContext("2d");
      this.context.fillStyle = "white";

      this.p1 = new Paddle(5, 0);
      this.p1.y = this.height/2 - this.p1.height/2;
      this.p2 = new Paddle(this.width - 5 - 2, 0);
      this.p2.y = this.height/2 - this.p2.height/2;
  }

  Game.prototype.draw = function()
  {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.fillRect(this.width/2, 0, 2, this.height);

      this.p1.draw(this.context);
      this.p2.draw(this.context);
  };

  Game.prototype.update = function()
  {
      if (this.paused)
          return;
  };
  function Paddle(x,y) {
    this.x = x;
    this.y = y;
    this.width = 2;
    this.height = 28;
    this.score = 0;
  }

  Paddle.prototype.draw = function(p)
  {
      p.fillRect(this.x, this.y, this.width, this.height);
  };

  MainLoop()
}
