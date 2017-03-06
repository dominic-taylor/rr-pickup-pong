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
socket.on('message', function (message) {
  log(message)
})

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
  log(data.playerOne+' VS '+ data.playerTwo);
  startGame(data)
})

function reqGame(e) {
  if(!inLobby){
    log('Please join the lobby to challenge players')
    return 
  }
  let player = e.target.innerHTML
  socket.emit('requestGame', player)
}

function log(message) {
  let li = document.createElement('LI')
  li.appendChild(document.createTextNode(message))
  let gameMessages = document.getElementById('gameMessages')
  gameMessages.appendChild(li)
  gameMessages.scrollTop = gameMessages.scrollHeight
}

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.width = 600
  canvas.height = 300
  canvas.classList.add('in-game')
  document.getElementById('gameList').classList.add('hide')
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
  socket.game.p2Score = 0 

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

  function draw() {
    calcBallPos()
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
    setExitToLobby() // ask if play again 
  }

  function setExitToLobby() {
    let gameOver = document.createElement('button')  
    gameOver.classList.add('in-game')
    gameOver.innerHTML = 'Exit to Lobby'
    gameOver.addEventListener('click', function () {
      window.location.reload()
    })
    document.getElementById('lobby').appendChild(gameOver)
  }

  function calcBallPos() {
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
  }   
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
  socket.on('winner', function (data) {
    drawScore(data.winText)
  })

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBzb2NrZXQgPSBpbygpXG5sZXQgaW5Mb2JieSA9IGZhbHNlXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luU2VydmVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgbGV0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZUlucHV0JylcbiAgaWYoIW5hbWUudmFsdWUpe1xuICAgIHJldHVybiBsb2coJ1BsZWFzZSBlbnRlciBhIG5hbWUnKVxuICB9O1xuICBzb2NrZXQuZW1pdCgnam9pbkxvYmJ5JywgbmFtZS52YWx1ZSlcbiAgaW5Mb2JieSA9IHRydWVcbn0pXG5cbnNvY2tldC5vbigncmVzSm9pbkxvYmJ5JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IG5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGl0bGUnKVswXS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuYXBwZW5kQ2hpbGQobmFtZU5vZGUpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGxldCB0aGlzVXNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmlubmVySFRNTFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYodXNlcnNbaV0ubmFtZSAhPSB0aGlzVXNlciAmJiAhdXNlcnNbaV0uaW5HYW1lKXtcbiAgICAgIHZhciBsaU5vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiTElcIilcbiAgICAgIHZhciBnYW1lID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodXNlcnNbaV0ubmFtZSlcbiAgICAgIGxpTm9kZS5hcHBlbmRDaGlsZChnYW1lKVxuICAgICAgbGlOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgcmVxR2FtZSwgZmFsc2UpXG4gICAgICBnYW1lTGlzdC5hcHBlbmRDaGlsZChsaU5vZGUpXG4gICAgfVxuICB9XG4gIGxldCBvdGhlclBsYXllcnMgPSBnYW1lTGlzdC5oYXNDaGlsZE5vZGVzKClcbiAgaWYoIW90aGVyUGxheWVycyl7XG4gICAgZ2FtZUxpc3QuaW5uZXJIVE1MID0gJ0p1c3QgeW91IGluIHRoZSBsb2JieSByaWdodCBub3cnXG4gIH1cbn0pXG5zb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICBsb2cobWVzc2FnZSlcbn0pXG5cbnNvY2tldC5vbignY2hhbGxlbmdlJywgZnVuY3Rpb24gKGNoYWxsZW5nZSkge1xuICBsZXQgbG9iYnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKVxuICBsZXQgYWNjZXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgYWNjZXB0LmlkID0gJ2FjY2VwdCdcbiAgYWNjZXB0LmlubmVySFRNTCA9IFwiSSdtIFJlYWR5IVwiXG4gIHNvY2tldC5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2VcbiAgYWNjZXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHNvY2tldC5lbWl0KCdyZWFkeUdhbWUnLCBzb2NrZXQuY2hhbGxlbmdlKVxuICB9KVxuICBsb2JieS5pbnNlcnRCZWZvcmUoYWNjZXB0LGxvYmJ5LmNoaWxkTm9kZXNbMV0pXG5cbiAgbG9nKCdDaGFsbGVuZ2UgZnJvbSAnKyBjaGFsbGVuZ2UuY2hhbGxlbmdlcisnLiBSZWFkeT8nKVxufSlcblxuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgcmVhZHlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWNjZXB0Jyk7XG4gIGlmIChyZWFkeUJ1dHRvbikge1xuICAgIHJlYWR5QnV0dG9uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocmVhZHlCdXR0b24pO1xuICB9XG4gIHNvY2tldC5nYW1lID0gZGF0YVxuICBsb2coZGF0YS5wbGF5ZXJPbmUrJyBWUyAnKyBkYXRhLnBsYXllclR3byk7XG4gIHN0YXJ0R2FtZShkYXRhKVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGlmKCFpbkxvYmJ5KXtcbiAgICBsb2coJ1BsZWFzZSBqb2luIHRoZSBsb2JieSB0byBjaGFsbGVuZ2UgcGxheWVycycpXG4gICAgcmV0dXJuIFxuICB9XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgc29ja2V0LmVtaXQoJ3JlcXVlc3RHYW1lJywgcGxheWVyKVxufVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBsZXQgZ2FtZU1lc3NhZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVNZXNzYWdlcycpXG4gIGdhbWVNZXNzYWdlcy5hcHBlbmRDaGlsZChsaSlcbiAgZ2FtZU1lc3NhZ2VzLnNjcm9sbFRvcCA9IGdhbWVNZXNzYWdlcy5zY3JvbGxIZWlnaHRcbn1cblxuZnVuY3Rpb24gc3RhcnRHYW1lKGRhdGEpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMuaWQgPSAnY2FudmFzJ1xuICBjYW52YXMud2lkdGggPSA2MDBcbiAgY2FudmFzLmhlaWdodCA9IDMwMFxuICBjYW52YXMuY2xhc3NMaXN0LmFkZCgnaW4tZ2FtZScpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG59XG5cbmZ1bmN0aW9uIGdhbWVSb3V0aW5lKGJvYXJkLCBnYW1lRGF0YSkge1xuICBsZXQgZ2FtZUlkID0gc29ja2V0LmdhbWUuaWRcbiAgbGV0IHNjb3JlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNjb3Jlcy5pZCA9ICdzY29yZXMnXG4gIHNjb3Jlcy5jbGFzc0xpc3QuYWRkKCdpbi1nYW1lJylcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoc2NvcmVzKVxuXG4gIGxldCBjdHggPSBib2FyZC5nZXRDb250ZXh0KCcyZCcpXG4gIGN0eC5mb250ID0gJzMwcHggQXJpYWwnXG4gIHNvY2tldC5nYW1lLnAxU2NvcmUgPSAwXG4gIHNvY2tldC5nYW1lLnAyU2NvcmUgPSAwIFxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICBtb3ZlSGFuZGxlcihlLCBwMSlcbiAgICB9XG4gICAgaWYgKGdhbWVEYXRhLnBsYXllclR3b0lkID09IHNvY2tldC5pZCkge1xuICAgICAgbW92ZUhhbmRsZXIoZSwgcDIpXG4gICAgfVxuICB9LCBmYWxzZSlcblxuIGxldCBwMSA9IHtjb2xvdXI6JyMwNUVGRkYnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogMTAsIGR4OiAwLCBkeTogMCxuYW1lOiAnUDEnLCBzY29yZTogMH1cbiBsZXQgcDIgPSB7Y29sb3VyOiAnI0ZGQzMwMCcsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC0yMCwgZHg6IDAsIGR5OiAwLCBuYW1lOiAnUDInLCBzY29yZTogMH1cbiBsZXQgYmFsbCA9IHtjb2xvdXI6ICcjQ0VGRjMzJyx3aWR0aDogMTAsaGVpZ2h0OiAxMCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IGJvYXJkLndpZHRoLzIsIGR4OiA1LCBkeTogLTUsIG5hbWU6ICdCYWxsJ307XG5cbiBsZXQgdGltZXJJZCA9IHNldEludGVydmFsKGRyYXcsIDMwKVxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgY2FsY0JhbGxQb3MoKVxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgNjAwLCAzMDApXG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiXG4gICAgY3R4LmZpbGxSZWN0KGJvYXJkLndpZHRoLzIsIDAsIDIsIGJvYXJkLmhlaWdodClcbiAgICBjaGVja1dpbigpXG4gICAgZHJhd0JhbGwoKVxuICAgIGRyYXdTY29yZSgpXG4gICAgZHJhd1BhZGRsZShwMilcbiAgICBkcmF3UGFkZGxlKHAxKVxuICB9XG4gIGZ1bmN0aW9uIGNoZWNrV2luKCl7XG4gICAgaWYoc29ja2V0LmdhbWUucDFTY29yZTw2ICYmIHNvY2tldC5nYW1lLnAyU2NvcmU8Nil7XG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIGxldCB3aW5uZXJcbiAgICBpZiAoc29ja2V0LmdhbWUucDFTY29yZT41KXtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllck9uZVxuICAgIH0gXG4gICAgaWYoc29ja2V0LmdhbWUucDJTY29yZT41KSB7XG4gICAgICB3aW5uZXIgPSBzb2NrZXQuZ2FtZS5wbGF5ZXJUd29cbiAgICB9XG4gICAgXG4gICAgc29ja2V0LmVtaXQoJ2VuZEdhbWUnLCB7d2luVGV4dDogd2lubmVyKyAnICBXT04gVEhFIEdBTUUnLCBnYW1lOiBzb2NrZXQuZ2FtZS5pZH0pXG4gICAgY2xlYXJJbnRlcnZhbCh0aW1lcklkKSAgXG4gICAgc2V0RXhpdFRvTG9iYnkoKSAvLyBhc2sgaWYgcGxheSBhZ2FpbiBcbiAgfVxuXG4gIGZ1bmN0aW9uIHNldEV4aXRUb0xvYmJ5KCkge1xuICAgIGxldCBnYW1lT3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpICBcbiAgICBnYW1lT3Zlci5jbGFzc0xpc3QuYWRkKCdpbi1nYW1lJylcbiAgICBnYW1lT3Zlci5pbm5lckhUTUwgPSAnRXhpdCB0byBMb2JieSdcbiAgICBnYW1lT3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgIH0pXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoZ2FtZU92ZXIpXG4gIH1cblxuICBmdW5jdGlvbiBjYWxjQmFsbFBvcygpIHtcbiAgICAgIGlmKGJhbGwueSA+IGJvYXJkLmhlaWdodCB8fCBiYWxsLnkgPCAwKXtcbiAgICAgICAgYmFsbC5keSA9IC1iYWxsLmR5XG4gICAgICB9XG4gICBcbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoID4gcDEueCAgJiYgXG4gICAgICAgIGJhbGwueCA8IHAxLngrcDEud2lkdGgmJiBcbiAgICAgICAgYmFsbC55K2JhbGwuaGVpZ2h0PnAxLnkmJiBcbiAgICAgICAgYmFsbC55PHAxLnkrcDEuaGVpZ2h0KXtcbiAgICAgICAgYmFsbC5keCA9IC1iYWxsLmR4O1xuICAgICAgfVxuXG4gICAgICBpZihiYWxsLngrYmFsbC53aWR0aC8yID4gcDIueCAmJiBcbiAgICAgICAgYmFsbC54IDwgcDIueCtwMi53aWR0aCAmJlxuICAgICAgICAgYmFsbC55K2JhbGwuaGVpZ2h0PnAyLnkgJiYgXG4gICAgICAgICBiYWxsLnk8cDIueStwMi5oZWlnaHQpe1xuICAgICAgICAgYmFsbC5keCA9IC1iYWxsLmR4ICAgICBcbiAgICAgICB9XG4gICAgICBpZihiYWxsLnggPiBib2FyZC53aWR0aCl7XG4gICAgICAgIHNvY2tldC5nYW1lLnAxU2NvcmUrK1xuICAgICAgICBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICB9XG4gICAgICBpZihiYWxsLnggPCAwKXtcbiAgICAgICAgc29ja2V0LmdhbWUucDJTY29yZSsrXG4gICAgICAgIGJhbGwueCA9IGJvYXJkLndpZHRoLzJcbiAgICAgICAgYmFsbC55ID0gYm9hcmQuaGVpZ2h0LzJcbiAgICAgIH1cblxuICAgICAgYmFsbC54Kz1iYWxsLmR4XG4gICAgICBiYWxsLnkrPWJhbGwuZHlcbiAgfSAgIFxuICBmdW5jdGlvbiBkcmF3QmFsbCgpIHsgIFxuICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICBjdHguYXJjKGJhbGwueCwgYmFsbC55LCBiYWxsLndpZHRoLCAwLCBNYXRoLlBJKjIpO1xuICAgIGN0eC5maWxsU3R5bGUgPSBiYWxsLmNvbG91cjtcbiAgICBjdHguZmlsbCgpO1xuICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdQYWRkbGUocGFkZGxlKSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHBhZGRsZS5jb2xvdXI7XG4gICAgY3R4LmZpbGxSZWN0KHBhZGRsZS54LCBwYWRkbGUueSwgcGFkZGxlLndpZHRoLCBwYWRkbGUuaGVpZ2h0KTtcbiAgfVxuICBmdW5jdGlvbiBkcmF3U2NvcmUodGV4dCkge1xuICAgIGlmKHRleHQpe1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlcycpLmlubmVySFRNTCA9IHRleHRcbiAgICB9XG4gICAgY3R4LmZpbGxTdHlsZSA9IFwiI0ZGRkZGRlwiXG4gICAgY3R4LmZpbGxUZXh0KHNvY2tldC5nYW1lLnAxU2NvcmUsIGJvYXJkLndpZHRoLzQsIDI4KTtcbsKgwqDCoMKgY3R4LmZpbGxUZXh0KHNvY2tldC5nYW1lLnAyU2NvcmUsIGJvYXJkLndpZHRoKjMvNCwgMjgpO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBpZihwcmVzcy5rZXk9PSd3JyB8fCBwcmVzcy5jb2RlID09ICdrZXlXJyl7XG4gICAgICAgIHBsYXllci55LT0gMjBcbiAgICAgfVxuICAgICBpZihwcmVzcy5rZXk9PSdzJyB8fCBwcmVzcy5jb2RlID09ICdrZXlTJyl7XG4gICAgICAgIHBsYXllci55Kz0gMjAgXG4gICAgIH1cbiAgICAgaWYocGxheWVyLnkgPCAwKXtcbiAgICAgICAgcGxheWVyLnkgPSAwXG4gICAgIH0gXG4gICAgIGlmKHBsYXllci55ICsgcGxheWVyLmhlaWdodCA+IGJvYXJkLmhlaWdodCl7XG4gICAgICAgIHBsYXllci55ID0gYm9hcmQuaGVpZ2h0IC0gcGxheWVyLmhlaWdodFxuICAgICB9XG4gICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIHtpZDpnYW1lRGF0YS5pZCwgbW92ZW1lbnQ6IHBsYXllci55fSlcbiAgfVxuXG4gIHNvY2tldC5vbignZ2V0TW92ZScsIGZ1bmN0aW9uIChvcHBvbmVudCkge1xuICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgIHAyLnkgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1lbHNle1xuICAgICAgcDEueSA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfVxuICB9KVxuICBzb2NrZXQub24oJ3dpbm5lcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZHJhd1Njb3JlKGRhdGEud2luVGV4dClcbiAgfSlcblxufVxuIl19
