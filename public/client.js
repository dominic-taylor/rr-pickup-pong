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
  console.log('server says '+data);
  // socket.emit('readyForChallenge', data)
})

socket.on('resUsers', function (users) {
  let gameList = document.getElementById('gameList')
  gameList.innerHTML = ''
  for (var i = 0; i < users.length; i++) {
    var liNode = document.createElement("LI")
    var game = document.createTextNode(users[i].name)
    liNode.appendChild(game)
    liNode.addEventListener('click', reqGame, false)
    gameList.appendChild(liNode)
  }
})

function reqGame(e) {
  let player = e.target.innerHTML
  console.log(e);
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
  accept.innerHTML = "I'm Ready!"
  socket.challenge = challenge
  accept.addEventListener('click', function () {
    socket.emit('readyGame', socket.challenge)
  })
  lobby.insertBefore(accept,lobby.childNodes[1])

  log('Challenge from '+ challenge.challenger+'. Ready?')
})

socket.on('startGame', function (data) {
  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );
  paintGame()
  console.log(data);

})

function paintGame() {
  console.log('painting');
  var canvas = document.createElement('canvas');
  canvas.id = canvas
  document.getElementById('game').appendChild(canvas);
  var game = new Game()
}

function Game() {
    var canvas = document.getElementById("canvas");
    this.width = canvas.width;
    this.height = canvas.height;
    this.context = canvas.getContext("2d");
    this.context.fillStyle = "white";
}
