(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxubGV0IGluTG9iYnkgPSBmYWxzZVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIGluTG9iYnkgPSB0cnVlXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RpdGxlJylbMF0uY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuXG4gICAgaWYodXNlcnNbaV0ubmFtZSAhPSB0aGlzVXNlciAmJiAhdXNlcnNbaV0uaW5HYW1lKXtcbiAgICAgIHZhciBsaU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIilcbiAgICAgIHZhciBnYW1lID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodXNlcnNbaV0ubmFtZSlcbiAgICAgIGxpTm9kZS5hcHBlbmRDaGlsZChnYW1lKVxuICAgICAgbGlOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVxR2FtZSwgZmFsc2UpXG4gICAgICBnYW1lTGlzdC5hcHBlbmRDaGlsZChsaU5vZGUpXG4gICAgfVxuICB9XG4gIGxldCBvdGhlclBsYXllcnMgPSBnYW1lTGlzdC5oYXNDaGlsZE5vZGVzKClcbiAgaWYoIW90aGVyUGxheWVycyl7XG4gICAgZ2FtZUxpc3QuaW5uZXJIVE1MID0gJ0p1c3QgeW91IGluIHRoZSBsb2JieSByaWdodCBub3cnXG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBpZighaW5Mb2JieSl7XG4gICAgbG9nKCdQbGVhc2Ugam9pbiB0aGUgbG9iYnkgdG8gY2hhbGxlbmdlIHBsYXllcnMnKVxuICAgIHJldHVybiBcbiAgfVxuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBsZXQgZ2FtZU1lc3NhZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVNZXNzYWdlcycpXG4gIGdhbWVNZXNzYWdlcy5hcHBlbmRDaGlsZChsaSlcbiAgZ2FtZU1lc3NhZ2VzLnNjcm9sbFRvcCA9IGdhbWVNZXNzYWdlcy5zY3JvbGxIZWlnaHRcbn1cblxuc29ja2V0Lm9uKCdjaGFsbGVuZ2UnLCBmdW5jdGlvbiAoY2hhbGxlbmdlKSB7XG4gIGNvbnNvbGUubG9nKCdnb3QgdGhlIGNoYWxsZW5nZScsIGNoYWxsZW5nZSlcbiAgbGV0IGxvYmJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JylcbiAgbGV0IGFjY2VwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIGFjY2VwdC5pZCA9ICdhY2NlcHQnXG4gIGFjY2VwdC5pbm5lckhUTUwgPSBcIkknbSBSZWFkeSFcIlxuICBzb2NrZXQuY2hhbGxlbmdlID0gY2hhbGxlbmdlXG4gIGFjY2VwdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJywgc29ja2V0LmNoYWxsZW5nZSlcbiAgfSlcbiAgbG9iYnkuaW5zZXJ0QmVmb3JlKGFjY2VwdCxsb2JieS5jaGlsZE5vZGVzWzFdKVxuXG4gIGxvZygnQ2hhbGxlbmdlIGZyb20gJysgY2hhbGxlbmdlLmNoYWxsZW5nZXIrJy4gUmVhZHk/Jylcbn0pXG5cbnNvY2tldC5vbignc3RhcnRHYW1lJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IHJlYWR5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY2VwdCcpO1xuICBpZiAocmVhZHlCdXR0b24pIHtcbiAgICByZWFkeUJ1dHRvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHJlYWR5QnV0dG9uKTtcbiAgfVxuICBzb2NrZXQuZ2FtZSA9IGRhdGFcbiAgbG9nKGRhdGEucGxheWVyT25lKycgVlMgJysgZGF0YS5wbGF5ZXJUd28pO1xuICBzdGFydEdhbWUoZGF0YSlcbn0pXG5cbmZ1bmN0aW9uIHN0YXJ0R2FtZShkYXRhKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLmlkID0gJ2NhbnZhcydcbiAgY2FudmFzLndpZHRoID0gNjAwXG4gIGNhbnZhcy5oZWlnaHQgPSAzMDBcbiAgY2FudmFzLmNsYXNzTGlzdC5hZGQoJ2luLWdhbWUnKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKS5jbGFzc0xpc3QuYWRkKCdoaWRlJykgLy9yZW1vdmUgZnJvbSBET00vdXNlIGhpZGUgY2xhc3M/XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIGdhbWVSb3V0aW5lKGNhbnZhcywgZGF0YSlcblxufVxuXG5mdW5jdGlvbiBnYW1lUm91dGluZShib2FyZCwgZ2FtZURhdGEpIHtcbiAgbGV0IGdhbWVJZCA9IHNvY2tldC5nYW1lLmlkXG4gIGxldCBzY29yZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzY29yZXMuaWQgPSAnc2NvcmVzJ1xuICBzY29yZXMuY2xhc3NMaXN0LmFkZCgnaW4tZ2FtZScpXG4gXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKHNjb3JlcylcblxuICBsZXQgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dCgnMmQnKVxuICBjdHguZm9udCA9ICczMHB4IEFyaWFsJ1xuICBzb2NrZXQuZ2FtZS5wMVNjb3JlID0gMFxuICBzb2NrZXQuZ2FtZS5wMlNjb3JlID0gMCAvLysrIGVhY2ggdGltZSBhIHNjb3JlIGhhcHBlbmRzLiBcblxuXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllclR3b0lkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDIpXG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgfSwgZmFsc2UpXG5cbiBsZXQgcDEgPSB7Y29sb3VyOicjMDVFRkZGJyx3aWR0aDogMTAsaGVpZ2h0OiA2MCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IDEwLCBkeDogMCwgZHk6IDAsbmFtZTogJ1AxJywgc2NvcmU6IDB9XG4gbGV0IHAyID0ge2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogYm9hcmQud2lkdGgtMjAsIGR4OiAwLCBkeTogMCwgbmFtZTogJ1AyJywgc2NvcmU6IDB9XG4gbGV0IGJhbGwgPSB7Y29sb3VyOiAnI0NFRkYzMycsd2lkdGg6IDEwLGhlaWdodDogMTAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC8yLCBkeDogNSwgZHk6IC01LCBuYW1lOiAnQmFsbCd9O1xuXG4gbGV0IHRpbWVySWQgPSBzZXRJbnRlcnZhbChkcmF3LCAzMClcbi8vIFJlbmRlciBlbGVtZW50cy5cbiAgbGV0IGNvb3JkVGltZXJJZFxuICAvLyBpZihzb2NrZXQuZ2FtZS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpe1xuICAvLyAgIGNvbnNvbGUubG9nKCdiYWxsJywgYmFsbClcbiAgICBjb29yZFRpbWVySWQgPSBzZXRJbnRlcnZhbChjYWxjQmFsbFBvcywgMzApXG4gIC8vIH1cblxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgLy9yZWRyYXcgY2FudmFzIGZpcnN0IGFkZCBtaWRkbGUgbGluZT8gXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCA2MDAsIDMwMClcbiAgICBjdHguZmlsbFN0eWxlID0gXCIjRkZGRkZGXCJcbiAgICBjdHguZmlsbFJlY3QoYm9hcmQud2lkdGgvMiwgMCwgMiwgYm9hcmQuaGVpZ2h0KVxuICAgIGNoZWNrV2luKClcbiAgICBkcmF3QmFsbCgpXG4gICAgZHJhd1Njb3JlKClcbiAgICBkcmF3UGFkZGxlKHAyKVxuICAgIGRyYXdQYWRkbGUocDEpXG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tXaW4oKXtcbiAgICBpZihzb2NrZXQuZ2FtZS5wMVNjb3JlPDYgJiYgc29ja2V0LmdhbWUucDJTY29yZTw2KXtcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgbGV0IHdpbm5lclxuICAgIGlmIChzb2NrZXQuZ2FtZS5wMVNjb3JlPjUpe1xuICAgICAgd2lubmVyID0gc29ja2V0LmdhbWUucGxheWVyT25lXG4gICAgfSBcbiAgICBpZihzb2NrZXQuZ2FtZS5wMlNjb3JlPjUpIHtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllclR3b1xuICAgIH1cbiAgICBcbiAgICBzb2NrZXQuZW1pdCgnZW5kR2FtZScsIHt3aW5UZXh0OiB3aW5uZXIrICcgIFdPTiBUSEUgR0FNRScsIGdhbWU6IHNvY2tldC5nYW1lLmlkfSlcbiAgICBjbGVhckludGVydmFsKHRpbWVySWQpICBcbiAgICBpZihjb29yZFRpbWVySWQpe1xuICAgICAgY2xlYXJJbnRlcnZhbChjb29yZFRpbWVySWQpXG4gICAgfVxuICAgIHNldEV4aXRUb0xvYmJ5KClcbiAgICAgIC8vIGFzayBpZiBwbGF5IGFnYWluLCBpZiBib3RoIHNheSB5ZXMsIHJ1biBnYW1lUm91bnRpbmUsIGVsc2UgcmV0dXJuIHRvIGxvYmJ5LiBcbiAgfVxuICBzb2NrZXQub24oJ3dpbm5lcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZHJhd1Njb3JlKGRhdGEud2luVGV4dClcbiAgfSlcblxuICBmdW5jdGlvbiBzZXRFeGl0VG9Mb2JieSgpIHtcbiAgICBsZXQgZ2FtZU92ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKSAgXG4gICAgZ2FtZU92ZXIuY2xhc3NMaXN0LmFkZCgnaW4tZ2FtZScpXG4gICAgZ2FtZU92ZXIuaW5uZXJIVE1MID0gJ0V4aXQgdG8gTG9iYnknXG4gICAgZ2FtZU92ZXIuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgIGNvbnNvbGUubG9nKHNvY2tldC5nYW1lKVxuICAgIH0pXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoZ2FtZU92ZXIpXG4gIH1cblxuICBmdW5jdGlvbiBjYWxjQmFsbFBvcygpIHtcbiAgICAgIGxldCByZXNldEJhbGwgXG5cbiAgICAgIGlmKGJhbGwueSA+IGJvYXJkLmhlaWdodCB8fCBiYWxsLnkgPCAwKXtcbiAgICAgICAgYmFsbC5keSA9IC1iYWxsLmR5XG4gICAgICB9XG5cbiAgIFxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGggPiBwMS54ICAmJiBcbiAgICAgICAgYmFsbC54IDwgcDEueCtwMS53aWR0aCYmIFxuICAgICAgICBiYWxsLnkrYmFsbC5oZWlnaHQ+cDEueSYmIFxuICAgICAgICBiYWxsLnk8cDEueStwMS5oZWlnaHQpe1xuXG4gICAgICAgIGJhbGwuZHggPSAtYmFsbC5keDtcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAyLnggJiYgXG4gICAgICAgIGJhbGwueCA8IHAyLngrcDIud2lkdGggJiZcbiAgICAgICAgIGJhbGwueStiYWxsLmhlaWdodD5wMi55ICYmIFxuICAgICAgICAgYmFsbC55PHAyLnkrcDIuaGVpZ2h0KXtcbiAgICAgICAgIGJhbGwuZHggPSAtYmFsbC5keCAgICAgXG4gICAgICAgfVxuICAgICAgaWYoYmFsbC54ID4gYm9hcmQud2lkdGgpe1xuICAgICAgICBzb2NrZXQuZ2FtZS5wMVNjb3JlKytcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgfVxuICAgICAgaWYoYmFsbC54IDwgMCl7XG4gICAgICAgIHNvY2tldC5nYW1lLnAyU2NvcmUrK1xuICAgICAgICBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICB9XG5cbiAgICAgIGJhbGwueCs9YmFsbC5keFxuICAgICAgYmFsbC55Kz1iYWxsLmR5XG4gICAgIGNvbnNvbGUubG9nKCdiYWxsWCB5IERYIGR5JyxiYWxsLngrJyAgJytiYWxsLnkrJyAgICcrYmFsbC5keCsnICAnK2JhbGwuZHkpXG4gIH0gICBcbiAgIHNvY2tldC5vbignZ2V0R2FtZVN0YXRlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZygnZ2V0aW5nU2VydmVyR2FtZVN0YXRlJywgZGF0YSlcbiAgICAvLyBjaGVjayBpZiBiYWxsIHBvc2l0aW9ucyBhcmUgdG9vIGZhciBvdXQgb2Ygc3luYyBhbmQgaWYgc28gcmVzZXQgYmFsbC5cbiAgIH0pXG5cbiAgZnVuY3Rpb24gZHJhd0JhbGwoKSB7ICBcbiAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgY3R4LmFyYyhiYWxsLngsIGJhbGwueSwgYmFsbC53aWR0aCwgMCwgTWF0aC5QSSoyKTtcbiAgICBjdHguZmlsbFN0eWxlID0gYmFsbC5jb2xvdXI7XG4gICAgY3R4LmZpbGwoKTtcbiAgICBjdHguY2xvc2VQYXRoKCk7XG4gIH1cblxuICBmdW5jdGlvbiBkcmF3UGFkZGxlKHBhZGRsZSkge1xuICAgIGN0eC5maWxsU3R5bGUgPSBwYWRkbGUuY29sb3VyO1xuICAgIGN0eC5maWxsUmVjdChwYWRkbGUueCwgcGFkZGxlLnksIHBhZGRsZS53aWR0aCwgcGFkZGxlLmhlaWdodCk7XG4gIH1cbiAgZnVuY3Rpb24gZHJhd1Njb3JlKHRleHQpIHtcbiAgICBpZih0ZXh0KXtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZXMnKS5pbm5lckhUTUwgPSB0ZXh0XG4gICAgfVxuIFxuICAgIGN0eC5maWxsU3R5bGUgPSBcIiNGRkZGRkZcIlxuICAgIGN0eC5maWxsVGV4dChzb2NrZXQuZ2FtZS5wMVNjb3JlLCBib2FyZC53aWR0aC80LCAyOCk7XG7CoMKgwqDCoGN0eC5maWxsVGV4dChzb2NrZXQuZ2FtZS5wMlNjb3JlLCBib2FyZC53aWR0aCozLzQsIDI4KTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBpZihwcmVzcy5rZXk9PSd3JyB8fCBwcmVzcy5jb2RlID09ICdrZXlXJyl7XG4gICAgICAgIHBsYXllci55LT0gMjBcbiAgICAgfVxuICAgICBpZihwcmVzcy5rZXk9PSdzJyB8fCBwcmVzcy5jb2RlID09ICdrZXlTJyl7XG4gICAgICAgIHBsYXllci55Kz0gMjAgXG4gICAgIH1cbiAgICAgaWYocGxheWVyLnkgPCAwKXtcbiAgICAgICAgcGxheWVyLnkgPSAwXG4gICAgIH0gXG4gICAgIGlmKHBsYXllci55ICsgcGxheWVyLmhlaWdodCA+IGJvYXJkLmhlaWdodCl7XG4gICAgICAgIHBsYXllci55ID0gYm9hcmQuaGVpZ2h0IC0gcGxheWVyLmhlaWdodFxuICAgICB9XG4gICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIHtpZDpnYW1lRGF0YS5pZCwgbW92ZW1lbnQ6IHBsYXllci55fSlcbiAgfVxuXG4gIHNvY2tldC5vbignZ2V0TW92ZScsIGZ1bmN0aW9uIChvcHBvbmVudCkge1xuICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgIHAyLnkgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1lbHNle1xuICAgICAgcDEueSA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfVxuICB9KVxuXG59XG4iXX0=
