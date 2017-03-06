const socket = io()
let inLobby = false

document.getElementById('joinServer').addEventListener('click', function() {
  let name = document.getElementById('nameInput')
  if(!name.value){
    return log('Please enter a name')
  };
  socket.emit('joinLobby', name.value)
  inLobby = true
})

socket.on('resJoinLobby', function (data) {
  let nameNode = document.createTextNode(data)
  document.getElementsByClassName('title')[0].classList.add('hide')
  document.getElementById('userName').appendChild(nameNode)
})

socket.on('resUsers', function (users) {
  let gameList = document.getElementById('gameList')
  gameList.innerHTML = ''
  let thisUser = document.getElementById('userName').innerHTML
  for (var i = 0; i < users.length; i++) {

    if(users[i].name != thisUser && !users[i].inGame){
      var liNode = document.createElement("LI")
      var game = document.createTextNode(users[i].name)
      liNode.appendChild(game)
      liNode.addEventListener('click', reqGame, false)
      gameList.appendChild(liNode)
    }
  }
  let otherPlayers = gameList.hasChildNodes()
  if(!otherPlayers){
    gameList.innerHTML = 'Just you in the lobby right now'
  }
})

function reqGame(e) {
  if(!inLobby){
    log('Please join the lobby to challenge players')
    return 
  }
  let player = e.target.innerHTML
  socket.emit('requestGame', player)
}

socket.on('message', function (message) {
  log(message)
})

function log(message) {
  let li = document.createElement('LI')
  li.appendChild(document.createTextNode(message))
  let gameMessages = document.getElementById('gameMessages')
  gameMessages.appendChild(li)
  gameMessages.scrollTop = gameMessages.scrollHeight
}

socket.on('challenge', function (challenge) {
  console.log('got the challenge', challenge)
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
  log(data.playerOne+' VS '+ data.playerTwo);
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.width = 600
  canvas.height = 300
  canvas.classList.add('in-game')
  document.getElementById('gameList').classList.add('hide') //remove from DOM/use hide class?
  document.getElementById('lobby').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  let gameId = socket.game.id
  let scores = document.createElement('div')
  scores.id = 'scores'
  scores.classList.add('in-game')
 
  document.getElementById('lobby').appendChild(scores)

  let ctx = board.getContext('2d')
  ctx.font = '30px Arial'
  socket.game.p1Score = 0
  socket.game.p2Score = 0 //++ each time a score happends. 



  document.addEventListener('keydown', function(e){
        if (gameData.playerOneId == socket.id) {
             moveHandler(e, p1)
        }
        if (gameData.playerTwoId == socket.id) {
            moveHandler(e, p2)
          
        }
  }, false)

 let p1 = {colour:'#05EFFF',width: 10,height: 60, y: board.height/2, x: 10, dx: 0, dy: 0,name: 'P1', score: 0}
 let p2 = {colour: '#FFC300',width: 10,height: 60, y: board.height/2, x: board.width-20, dx: 0, dy: 0, name: 'P2', score: 0}
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 5, dy: -5, name: 'Ball'};

 let timerId = setInterval(draw, 30)
// Render elements.
  let coordTimerId
  // if(socket.game.playerOneId == socket.id){
  //   console.log('ball', ball)
    coordTimerId = setInterval(calcBallPos, 30)
  // }


  function draw() {
    //redraw canvas first add middle line? 
    ctx.clearRect(0, 0, 600, 300)
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(board.width/2, 0, 2, board.height)
    checkWin()
    drawBall()
    drawScore()
    drawPaddle(p2)
    drawPaddle(p1)
  }
  function checkWin(){
    if(socket.game.p1Score<6 && socket.game.p2Score<6){
      return 
    }
    let winner
    if (socket.game.p1Score>5){
      winner = socket.game.playerOne
    } 
    if(socket.game.p2Score>5) {
      winner = socket.game.playerTwo
    }
    
    socket.emit('endGame', {winText: winner+ '  WON THE GAME', game: socket.game.id})
    clearInterval(timerId)  
    if(coordTimerId){
      clearInterval(coordTimerId)
    }
    setExitToLobby()
      // ask if play again, if both say yes, run gameRountine, else return to lobby. 
  }
  socket.on('winner', function (data) {
    drawScore(data.winText)
  })

  function setExitToLobby() {
    let gameOver = document.createElement('button')  
    gameOver.classList.add('in-game')
    gameOver.innerHTML = 'Exit to Lobby'
    gameOver.addEventListener('click', function () {
      window.location.reload()
      console.log(socket.game)
    })
    document.getElementById('lobby').appendChild(gameOver)
  }

  function calcBallPos() {
      let resetBall 

      if(ball.y > board.height || ball.y < 0){
        ball.dy = -ball.dy
      }

   
      if(ball.x+ball.width > p1.x  && 
        ball.x < p1.x+p1.width&& 
        ball.y+ball.height>p1.y&& 
        ball.y<p1.y+p1.height){

        ball.dx = -ball.dx;
      }

      if(ball.x+ball.width/2 > p2.x && 
        ball.x < p2.x+p2.width &&
         ball.y+ball.height>p2.y && 
         ball.y<p2.y+p2.height){
         ball.dx = -ball.dx     
       }
      if(ball.x > board.width){
        socket.game.p1Score++
        ball.x = board.width/2
        ball.y = board.height/2
      }
      if(ball.x < 0){
        socket.game.p2Score++
        ball.x = board.width/2
        ball.y = board.height/2
      }

      ball.x+=ball.dx
      ball.y+=ball.dy
     console.log('ballX y DX dy',ball.x+'  '+ball.y+'   '+ball.dx+'  '+ball.dy)
  }   
   socket.on('getGameState', function (data) {
    console.log('getingServerGameState', data)
    // check if ball positions are too far out of sync and if so reset ball.
   })

  function drawBall() {  
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.width, 0, Math.PI*2);
    ctx.fillStyle = ball.colour;
    ctx.fill();
    ctx.closePath();
  }

  function drawPaddle(paddle) {
    ctx.fillStyle = paddle.colour;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }
  function drawScore(text) {
    if(text){
      document.getElementById('scores').innerHTML = text
    }
 
    ctx.fillStyle = "#FFFFFF"
    ctx.fillText(socket.game.p1Score, board.width/4, 28);
    ctx.fillText(socket.game.p2Score, board.width*3/4, 28);
  }


  function moveHandler(press, player) {
     if(press.key=='w' || press.code == 'keyW'){
        player.y-= 20
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.y+= 20 
     }
     if(player.y < 0){
        player.y = 0
     } 
     if(player.y + player.height > board.height){
        player.y = board.height - player.height
     }
     socket.emit('sendMove', {id:gameData.id, movement: player.y})
  }

  socket.on('getMove', function (opponent) {
    if (gameData.playerOneId == socket.id) {
      p2.y = opponent.movement
    }else{
      p1.y = opponent.movement
    }
  })

}
