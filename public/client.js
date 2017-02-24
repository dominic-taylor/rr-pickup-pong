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
  let li = document.createElement('LI')
  li.appendChild(document.createTextNode(message))
  document.getElementById('gameMessages').appendChild(li)
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
  socket.game = data
  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  
  document.getElementById('game').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  // console.log('socket.game: '+JSON.stringify(socket.game))
  let shapes = []
  let ctx = board.getContext('2d')
  let boardLeft = board.offsetLeft
  let boardTop = board.offsetTop


  board.addEventListener('click', function(e){
    var x = e.pageX - boardLeft
    var y = e.pageY - boardTop
    console.log(x, y)
    // shapes.forEach(function (shape) {
    if (y > 50 && y < 150  && x > 50 && x < 150) {
      console.log('in the left shapre? ')
      // if (y > shape.top && y < shape.top + shape.height && x > shape.left && x < shape.left + shape.width) {
        // console.log('clicked a shape: '+ shape.name)  
        // console.log('shape.top', shape.top)  
        // console.log('shape.left', shape.left)  
        

      }
    })
  //}, false)

  shapes.push({colour:'#05EFFF',width: 50,height: 50, top: 25, left: 25, name: 'Rock'})
  shapes.push({colour: '#FFC300',width: 50,height: 50, top: 25, left: 175, name: 'Paper'})
  shapes.push({colour: '#CEFF33',width: 50,height: 50, top: 75, left: 125, name: 'Scissors'});
  

  // ctx.font = "15px Arial";
  // ctx.fillText("Paper",board.width/4, board.height/3);
  // ctx.fillText("Rock",board.width - board.width/4, board.height/3);
  // ctx.fillText("Scissors",board.width/2-30,125);

// Render elements.
shapes.forEach(function(element) {
    ctx.fillStyle = element.colour;
    ctx.fillRect(element.left, element.top, element.width, element.height);
});
  //retain coords of game options. 
  // if e.target.mouse coords are within a certain x/y of the options
  // then that option ios chosen and that event is emmited. 
 

}

