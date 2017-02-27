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
  
  document.getElementById('lobby').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  // console.log('socket.game: '+JSON.stringify(socket.game))
  let shapes = []
  let ctx = board.getContext('2d')
  let boardLeft = board.offsetLeft
  let boardTop = board.offsetTop

  document.addEventListener('keydown', function(e){
      shapes.forEach(function (shape) {
        if (gameData.playerOneId == socket.id) {
             moveHandler(e, shapes[0])
        }
        if (gameData.playerTwoId == socket.id) {
            moveHandler(e, shapes[1])
        }
      });
  }, false)
  //Top: distance from top of canvas
  // Left: distance from left of canvas
  // Height: Height in distcnce from Top
  // Width: Width in distance from Left

  shapes.push({colour:'#05EFFF',width: 50,height: 50, top: 25, left: 25, name: 'P1 Rock'})
  shapes.push({colour: '#FFC300',width: 50,height: 50, top: 25, left: 175, name: 'P2 Paper'})
  shapes.push({colour: '#CEFF33',width: 5,height: 5, top: 75, left: 125, name: 'Ball'});
  draw(shapes)

// Render elements.
  function draw(gameObjects) {
    //redraw canvas first 
    ctx.clearRect(0, 0, 800, 400)

    gameObjects.forEach(function(element) {
      ctx.fillStyle = element.colour;
      ctx.fillRect(element.left, element.top, element.width, element.height);
    });
  }

  function moveHandler(press, player) {
     

     if(press.key=='x' || press.code == 'keyX'){// && player is not at top of canvas
        player.top+= 5
         // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed x')
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.top-= 5
        // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed s')
   
     }
     if(player.top<=-5){
        player.top = -5
     } 
     if(player.top>=100){
        player.top = 100
     }
     draw(shapes)
     sendMove({id:gameData.id, movement: player.top})
     // get press.key and player
     // check what key was pressed
     // if w or s
     //    change code of that player shape
     //    redraw
     //    send to server

  }

  function sendMove(data) { 
    socket.emit('sendMove', data)
  }

  socket.on('getMove', function (opponent) {
    console.log(opponent)
    if (gameData.playerOneId == socket.id) {
      shapes[1].top = opponent.movement
    }else{
      shapes[0].top = opponent.movement
    }
    draw(shapes)
  })

}
