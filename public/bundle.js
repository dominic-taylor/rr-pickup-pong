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
  //disable further events from this button
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
  scores.innerHTML =  socket.game.playerOne+': 0'+socket.game.playerTwo+': 0'
  document.getElementById('lobby').appendChild(scores)
  let ctx = board.getContext('2d')
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

 let p1 = {colour:'#05EFFF',width: 10,height: 60, y: board.height/2, x: 10, dx: 0, dy: 0,name: 'P1 Rock', score: 0}
 let p2 = {colour: '#FFC300',width: 10,height: 60, y: board.height/2, x: board.width-20, dx: 0, dy: 0, name: 'P2', score: 0}
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 3, dy: -5, name: 'Ball'};

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
    //delete socket.game? 
    console.log(socket.game)
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

   
      if(ball.x+ball.width/2 > p1.x  && 
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
        socket.game.p1Score++
        ball.x = board.width/2
        ball.y = board.height/2
      }

      ball.x+=ball.dx
      ball.y+=ball.dy
     console.log('ballX y DX dy',ball.x+'  '+ball.y+'   '+ball.dx+'  '+ball.dy)
     // socket.emit('sendGameState', {dx: ball.dx, dy: ball.dy, game:socket.game})
    
    /// shortened version   dx, dy, p1, p2
    //socket.emit('sendGameState', {ball:ball, p1: p1, p2: p2, id: gameId})


  }   
   socket.on('getGameState', function (data) {
    console.log('getingServerGameState', data)

      // ball.x = data.x
      // ball.y = data.y
  
      // ball.y += data.dy
      // ball.x += data.dx
    
    //update game state? 
   // socket.game = data.game
    // drawthe score
  // console.log('GETting game state',data)
  })

  function drawBall() {  
      ctx.fillStyle = ball.colour;
      ctx.fillRect(ball.x, ball.y, ball.width, ball.height);    
  }

  function drawPaddle(paddle) {
    ctx.fillStyle = paddle.colour;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
  }
  function drawScore(text) {
    let scoreStr
    if(text){
      scoreStr =  text
    }else{
      scoreStr = socket.game.playerOne+':' +socket.game.p1Score +'  '+socket.game.playerTwo+':'+ socket.game.p2Score
    }
    document.getElementById('scores').innerHTML = scoreStr
  }


  function moveHandler(press, player) {
     if(press.key=='x' || press.code == 'keyX'){
        player.y+= 20
         // console.log(press.key +'  '+JSON.stringify(player))
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.y-= 20 
        // console.log(press.key +'  '+JSON.stringify(player)) 
     }
     if(player.y < 0){
        player.y = 0
     } 
     if(player.y + player.height > board.height){
        player.y = board.height - player.height
     }
     sendMove({id:gameData.id, movement: player.y})
  }

  function sendMove(data) { 
    socket.emit('sendMove', data)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBzb2NrZXQgPSBpbygpXG5sZXQgaW5Mb2JieSA9IGZhbHNlXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luU2VydmVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgbGV0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZUlucHV0JylcbiAgaWYoIW5hbWUudmFsdWUpe1xuICAgIHJldHVybiBsb2coJ1BsZWFzZSBlbnRlciBhIG5hbWUnKVxuICB9O1xuICBzb2NrZXQuZW1pdCgnam9pbkxvYmJ5JywgbmFtZS52YWx1ZSlcbiAgaW5Mb2JieSA9IHRydWVcbiAgLy9kaXNhYmxlIGZ1cnRoZXIgZXZlbnRzIGZyb20gdGhpcyBidXR0b25cbn0pXG5cbnNvY2tldC5vbigncmVzSm9pbkxvYmJ5JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IG5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGl0bGUnKVswXS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuYXBwZW5kQ2hpbGQobmFtZU5vZGUpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGxldCB0aGlzVXNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmlubmVySFRNTFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICBpZih1c2Vyc1tpXS5uYW1lICE9IHRoaXNVc2VyICYmICF1c2Vyc1tpXS5pbkdhbWUpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbiAgbGV0IG90aGVyUGxheWVycyA9IGdhbWVMaXN0Lmhhc0NoaWxkTm9kZXMoKVxuICBpZighb3RoZXJQbGF5ZXJzKXtcbiAgICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnSnVzdCB5b3UgaW4gdGhlIGxvYmJ5IHJpZ2h0IG5vdydcbiAgfVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGlmKCFpbkxvYmJ5KXtcbiAgICBsb2coJ1BsZWFzZSBqb2luIHRoZSBsb2JieSB0byBjaGFsbGVuZ2UgcGxheWVycycpXG4gICAgcmV0dXJuIFxuICB9XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgc29ja2V0LmVtaXQoJ3JlcXVlc3RHYW1lJywgcGxheWVyKVxufVxuXG5zb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICBsb2cobWVzc2FnZSlcbn0pXG5cbmZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XG4gIGxldCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJylcbiAgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpXG4gIGxldCBnYW1lTWVzc2FnZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJylcbiAgZ2FtZU1lc3NhZ2VzLmFwcGVuZENoaWxkKGxpKVxuICBnYW1lTWVzc2FnZXMuc2Nyb2xsVG9wID0gZ2FtZU1lc3NhZ2VzLnNjcm9sbEhlaWdodFxufVxuXG5zb2NrZXQub24oJ2NoYWxsZW5nZScsIGZ1bmN0aW9uIChjaGFsbGVuZ2UpIHtcbiAgY29uc29sZS5sb2coJ2dvdCB0aGUgY2hhbGxlbmdlJywgY2hhbGxlbmdlKVxuICBsZXQgbG9iYnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKVxuICBsZXQgYWNjZXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgYWNjZXB0LmlkID0gJ2FjY2VwdCdcbiAgYWNjZXB0LmlubmVySFRNTCA9IFwiSSdtIFJlYWR5IVwiXG4gIHNvY2tldC5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2VcbiAgYWNjZXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHNvY2tldC5lbWl0KCdyZWFkeUdhbWUnLCBzb2NrZXQuY2hhbGxlbmdlKVxuICB9KVxuICBsb2JieS5pbnNlcnRCZWZvcmUoYWNjZXB0LGxvYmJ5LmNoaWxkTm9kZXNbMV0pXG5cbiAgbG9nKCdDaGFsbGVuZ2UgZnJvbSAnKyBjaGFsbGVuZ2UuY2hhbGxlbmdlcisnLiBSZWFkeT8nKVxufSlcblxuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgcmVhZHlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWNjZXB0Jyk7XG4gIGlmIChyZWFkeUJ1dHRvbikge1xuICAgIHJlYWR5QnV0dG9uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocmVhZHlCdXR0b24pO1xuICB9XG4gIHNvY2tldC5nYW1lID0gZGF0YVxuICBsb2coZGF0YS5wbGF5ZXJPbmUrJyBWUyAnKyBkYXRhLnBsYXllclR3byk7XG4gIHN0YXJ0R2FtZShkYXRhKVxufSlcblxuZnVuY3Rpb24gc3RhcnRHYW1lKGRhdGEpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMuaWQgPSAnY2FudmFzJ1xuICBjYW52YXMud2lkdGggPSA2MDBcbiAgY2FudmFzLmhlaWdodCA9IDMwMFxuICBjYW52YXMuY2xhc3NMaXN0LmFkZCgnaW4tZ2FtZScpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKSAvL3JlbW92ZSBmcm9tIERPTS91c2UgaGlkZSBjbGFzcz9cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgZ2FtZVJvdXRpbmUoY2FudmFzLCBkYXRhKVxuXG59XG5cbmZ1bmN0aW9uIGdhbWVSb3V0aW5lKGJvYXJkLCBnYW1lRGF0YSkge1xuICBsZXQgZ2FtZUlkID0gc29ja2V0LmdhbWUuaWRcbiAgbGV0IHNjb3JlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNjb3Jlcy5pZCA9ICdzY29yZXMnXG4gIHNjb3Jlcy5jbGFzc0xpc3QuYWRkKCdpbi1nYW1lJylcbiAgc2NvcmVzLmlubmVySFRNTCA9ICBzb2NrZXQuZ2FtZS5wbGF5ZXJPbmUrJzogMCcrc29ja2V0LmdhbWUucGxheWVyVHdvKyc6IDAnXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKHNjb3JlcylcbiAgbGV0IGN0eCA9IGJvYXJkLmdldENvbnRleHQoJzJkJylcbiAgc29ja2V0LmdhbWUucDFTY29yZSA9IDBcbiAgc29ja2V0LmdhbWUucDJTY29yZSA9IDAgLy8rKyBlYWNoIHRpbWUgYSBzY29yZSBoYXBwZW5kcy4gXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllclR3b0lkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDIpXG4gICAgICAgICAgXG4gICAgICAgIH1cbiAgfSwgZmFsc2UpXG5cbiBsZXQgcDEgPSB7Y29sb3VyOicjMDVFRkZGJyx3aWR0aDogMTAsaGVpZ2h0OiA2MCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IDEwLCBkeDogMCwgZHk6IDAsbmFtZTogJ1AxIFJvY2snLCBzY29yZTogMH1cbiBsZXQgcDIgPSB7Y29sb3VyOiAnI0ZGQzMwMCcsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC0yMCwgZHg6IDAsIGR5OiAwLCBuYW1lOiAnUDInLCBzY29yZTogMH1cbiBsZXQgYmFsbCA9IHtjb2xvdXI6ICcjQ0VGRjMzJyx3aWR0aDogMTAsaGVpZ2h0OiAxMCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IGJvYXJkLndpZHRoLzIsIGR4OiAzLCBkeTogLTUsIG5hbWU6ICdCYWxsJ307XG5cbiBsZXQgdGltZXJJZCA9IHNldEludGVydmFsKGRyYXcsIDMwKVxuLy8gUmVuZGVyIGVsZW1lbnRzLlxuICBsZXQgY29vcmRUaW1lcklkXG4gIC8vIGlmKHNvY2tldC5nYW1lLnBsYXllck9uZUlkID09IHNvY2tldC5pZCl7XG4gIC8vICAgY29uc29sZS5sb2coJ2JhbGwnLCBiYWxsKVxuICAgIGNvb3JkVGltZXJJZCA9IHNldEludGVydmFsKGNhbGNCYWxsUG9zLCAzMClcbiAgLy8gfVxuXG5cbiAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAvL3JlZHJhdyBjYW52YXMgZmlyc3QgYWRkIG1pZGRsZSBsaW5lPyBcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDYwMCwgMzAwKVxuICAgIGNoZWNrV2luKClcbiAgICBkcmF3QmFsbCgpXG4gICAgZHJhd1Njb3JlKClcbiAgICBkcmF3UGFkZGxlKHAyKVxuICAgIGRyYXdQYWRkbGUocDEpXG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tXaW4oKXtcbiAgICBpZihzb2NrZXQuZ2FtZS5wMVNjb3JlPDYgJiYgc29ja2V0LmdhbWUucDJTY29yZTw2KXtcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgbGV0IHdpbm5lclxuICAgIGlmIChzb2NrZXQuZ2FtZS5wMVNjb3JlPjUpe1xuICAgICAgd2lubmVyID0gc29ja2V0LmdhbWUucGxheWVyT25lXG4gICAgfSBcbiAgICBpZihzb2NrZXQuZ2FtZS5wMlNjb3JlPjUpIHtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllclR3b1xuICAgIH1cbiAgICBcbiAgICBzb2NrZXQuZW1pdCgnZW5kR2FtZScsIHt3aW5UZXh0OiB3aW5uZXIrICcgIFdPTiBUSEUgR0FNRScsIGdhbWU6IHNvY2tldC5nYW1lLmlkfSlcbiAgICBjbGVhckludGVydmFsKHRpbWVySWQpICBcbiAgICBpZihjb29yZFRpbWVySWQpe1xuICAgICAgY2xlYXJJbnRlcnZhbChjb29yZFRpbWVySWQpXG4gICAgfVxuICAgIHNldEV4aXRUb0xvYmJ5KClcbiAgICAgIC8vIGFzayBpZiBwbGF5IGFnYWluLCBpZiBib3RoIHNheSB5ZXMsIHJ1biBnYW1lUm91bnRpbmUsIGVsc2UgcmV0dXJuIHRvIGxvYmJ5LiBcbiAgfVxuICBzb2NrZXQub24oJ3dpbm5lcicsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgZHJhd1Njb3JlKGRhdGEud2luVGV4dClcbiAgfSlcblxuICBmdW5jdGlvbiBzZXRFeGl0VG9Mb2JieSgpIHtcbiAgICAvL2RlbGV0ZSBzb2NrZXQuZ2FtZT8gXG4gICAgY29uc29sZS5sb2coc29ja2V0LmdhbWUpXG4gICAgbGV0IGdhbWVPdmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJykgIFxuICAgIGdhbWVPdmVyLmNsYXNzTGlzdC5hZGQoJ2luLWdhbWUnKVxuICAgIGdhbWVPdmVyLmlubmVySFRNTCA9ICdFeGl0IHRvIExvYmJ5J1xuICAgIGdhbWVPdmVyLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXG4gICAgICBjb25zb2xlLmxvZyhzb2NrZXQuZ2FtZSlcbiAgICB9KVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKGdhbWVPdmVyKVxuICB9XG5cbiAgZnVuY3Rpb24gY2FsY0JhbGxQb3MoKSB7XG4gICAgICBsZXQgcmVzZXRCYWxsIFxuXG4gICAgICBpZihiYWxsLnkgPiBib2FyZC5oZWlnaHQgfHwgYmFsbC55IDwgMCl7XG4gICAgICAgIGJhbGwuZHkgPSAtYmFsbC5keVxuICAgICAgfVxuXG4gICBcbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoLzIgPiBwMS54ICAmJiBcbiAgICAgICAgYmFsbC54IDwgcDEueCtwMS53aWR0aCYmIFxuICAgICAgICBiYWxsLnkrYmFsbC5oZWlnaHQ+cDEueSYmIFxuICAgICAgICBiYWxsLnk8cDEueStwMS5oZWlnaHQpe1xuXG4gICAgICAgIGJhbGwuZHggPSAtYmFsbC5keDtcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAyLnggJiYgXG4gICAgICAgIGJhbGwueCA8IHAyLngrcDIud2lkdGggJiZcbiAgICAgICAgIGJhbGwueStiYWxsLmhlaWdodD5wMi55ICYmIFxuICAgICAgICAgYmFsbC55PHAyLnkrcDIuaGVpZ2h0KXtcbiAgICAgICAgIGJhbGwuZHggPSAtYmFsbC5keCAgICAgXG4gICAgICAgfVxuICAgICAgaWYoYmFsbC54ID4gYm9hcmQud2lkdGgpe1xuICAgICAgICBzb2NrZXQuZ2FtZS5wMVNjb3JlKytcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgfVxuICAgICAgaWYoYmFsbC54IDwgMCl7XG4gICAgICAgIHNvY2tldC5nYW1lLnAxU2NvcmUrK1xuICAgICAgICBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICB9XG5cbiAgICAgIGJhbGwueCs9YmFsbC5keFxuICAgICAgYmFsbC55Kz1iYWxsLmR5XG4gICAgIGNvbnNvbGUubG9nKCdiYWxsWCB5IERYIGR5JyxiYWxsLngrJyAgJytiYWxsLnkrJyAgICcrYmFsbC5keCsnICAnK2JhbGwuZHkpXG4gICAgIC8vIHNvY2tldC5lbWl0KCdzZW5kR2FtZVN0YXRlJywge2R4OiBiYWxsLmR4LCBkeTogYmFsbC5keSwgZ2FtZTpzb2NrZXQuZ2FtZX0pXG4gICAgXG4gICAgLy8vIHNob3J0ZW5lZCB2ZXJzaW9uICAgZHgsIGR5LCBwMSwgcDJcbiAgICAvL3NvY2tldC5lbWl0KCdzZW5kR2FtZVN0YXRlJywge2JhbGw6YmFsbCwgcDE6IHAxLCBwMjogcDIsIGlkOiBnYW1lSWR9KVxuXG5cbiAgfSAgIFxuICAgc29ja2V0Lm9uKCdnZXRHYW1lU3RhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKCdnZXRpbmdTZXJ2ZXJHYW1lU3RhdGUnLCBkYXRhKVxuXG4gICAgICAvLyBiYWxsLnggPSBkYXRhLnhcbiAgICAgIC8vIGJhbGwueSA9IGRhdGEueVxuICBcbiAgICAgIC8vIGJhbGwueSArPSBkYXRhLmR5XG4gICAgICAvLyBiYWxsLnggKz0gZGF0YS5keFxuICAgIFxuICAgIC8vdXBkYXRlIGdhbWUgc3RhdGU/IFxuICAgLy8gc29ja2V0LmdhbWUgPSBkYXRhLmdhbWVcbiAgICAvLyBkcmF3dGhlIHNjb3JlXG4gIC8vIGNvbnNvbGUubG9nKCdHRVR0aW5nIGdhbWUgc3RhdGUnLGRhdGEpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZHJhd0JhbGwoKSB7ICBcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBiYWxsLmNvbG91cjtcbiAgICAgIGN0eC5maWxsUmVjdChiYWxsLngsIGJhbGwueSwgYmFsbC53aWR0aCwgYmFsbC5oZWlnaHQpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdQYWRkbGUocGFkZGxlKSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHBhZGRsZS5jb2xvdXI7XG4gICAgY3R4LmZpbGxSZWN0KHBhZGRsZS54LCBwYWRkbGUueSwgcGFkZGxlLndpZHRoLCBwYWRkbGUuaGVpZ2h0KTtcbiAgfVxuICBmdW5jdGlvbiBkcmF3U2NvcmUodGV4dCkge1xuICAgIGxldCBzY29yZVN0clxuICAgIGlmKHRleHQpe1xuICAgICAgc2NvcmVTdHIgPSAgdGV4dFxuICAgIH1lbHNle1xuICAgICAgc2NvcmVTdHIgPSBzb2NrZXQuZ2FtZS5wbGF5ZXJPbmUrJzonICtzb2NrZXQuZ2FtZS5wMVNjb3JlICsnICAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOicrIHNvY2tldC5nYW1lLnAyU2NvcmVcbiAgICB9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlcycpLmlubmVySFRNTCA9IHNjb3JlU3RyXG4gIH1cblxuXG4gIGZ1bmN0aW9uIG1vdmVIYW5kbGVyKHByZXNzLCBwbGF5ZXIpIHtcbiAgICAgaWYocHJlc3Mua2V5PT0neCcgfHwgcHJlc3MuY29kZSA9PSAna2V5WCcpe1xuICAgICAgICBwbGF5ZXIueSs9IDIwXG4gICAgICAgICAvLyBjb25zb2xlLmxvZyhwcmVzcy5rZXkgKycgICcrSlNPTi5zdHJpbmdpZnkocGxheWVyKSlcbiAgICAgfVxuICAgICBpZihwcmVzcy5rZXk9PSdzJyB8fCBwcmVzcy5jb2RlID09ICdrZXlTJyl7XG4gICAgICAgIHBsYXllci55LT0gMjAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKSBcbiAgICAgfVxuICAgICBpZihwbGF5ZXIueSA8IDApe1xuICAgICAgICBwbGF5ZXIueSA9IDBcbiAgICAgfSBcbiAgICAgaWYocGxheWVyLnkgKyBwbGF5ZXIuaGVpZ2h0ID4gYm9hcmQuaGVpZ2h0KXtcbiAgICAgICAgcGxheWVyLnkgPSBib2FyZC5oZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0XG4gICAgIH1cbiAgICAgc2VuZE1vdmUoe2lkOmdhbWVEYXRhLmlkLCBtb3ZlbWVudDogcGxheWVyLnl9KVxuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1vdmUoZGF0YSkgeyBcbiAgICBzb2NrZXQuZW1pdCgnc2VuZE1vdmUnLCBkYXRhKVxuICB9XG5cbiAgc29ja2V0Lm9uKCdnZXRNb3ZlJywgZnVuY3Rpb24gKG9wcG9uZW50KSB7XG4gICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgcDIueSA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfWVsc2V7XG4gICAgICBwMS55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9XG4gIH0pXG5cbn1cbiJdfQ==
