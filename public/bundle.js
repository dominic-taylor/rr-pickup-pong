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
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 1, dy: -1, name: 'Ball'};

 let timerId = setInterval(draw, 30)
// Render elements.
  let coordTimerId
  if(socket.game.playerOneId == socket.id){
    console.log('ball', ball)
    coordTimerId = setInterval(calcBallPos, 30)
  }


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
      if(ball.x > board.width){
        socket.game.p1Score++
        resetBall = true
      }
      if(ball.x < 0){
        socket.game.p2Score++
        resetBall = true
      }

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
     console.log('sendGameState', ball.dx+'  '+ball.dy)
     socket.emit('sendGameState', {dx: ball.dx, dy: ball.dy, game:socket.game, shouldReset: resetBall})
   

  }   
  //when ball is scored, the ball.x and ball.y is not reset to halfway so getBallPos just continues... maybe include flag in sendBallpos/getBallPos?
  socket.on('getGameState', function (data) {
      if(data.shouldReset == true){
        ball.x = board.width/2
        ball.y = board.height/2
        resetBall = false
      }else{
      ball.y += data.dy
      ball.x += data.dx
    }
    //update game state? 
    socket.game = data.game
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHNvY2tldCA9IGlvKClcbmxldCBpbkxvYmJ5ID0gZmFsc2VcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pvaW5TZXJ2ZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICBsZXQgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYW1lSW5wdXQnKVxuICBpZighbmFtZS52YWx1ZSl7XG4gICAgcmV0dXJuIGxvZygnUGxlYXNlIGVudGVyIGEgbmFtZScpXG4gIH07XG4gIHNvY2tldC5lbWl0KCdqb2luTG9iYnknLCBuYW1lLnZhbHVlKVxuICBpbkxvYmJ5ID0gdHJ1ZVxuICAvL2Rpc2FibGUgZnVydGhlciBldmVudHMgZnJvbSB0aGlzIGJ1dHRvblxufSlcblxuc29ja2V0Lm9uKCdyZXNKb2luTG9iYnknLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgbmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKVxuICBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCd0aXRsZScpWzBdLmNsYXNzTGlzdC5hZGQoJ2hpZGUnKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5hcHBlbmRDaGlsZChuYW1lTm9kZSlcbn0pXG5cbnNvY2tldC5vbigncmVzVXNlcnMnLCBmdW5jdGlvbiAodXNlcnMpIHtcbiAgbGV0IGdhbWVMaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVMaXN0JylcbiAgZ2FtZUxpc3QuaW5uZXJIVE1MID0gJydcbiAgbGV0IHRoaXNVc2VyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuaW5uZXJIVE1MXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcblxuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIgJiYgIXVzZXJzW2ldLmluR2FtZSl7XG4gICAgICB2YXIgbGlOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpXG4gICAgICB2YXIgZ2FtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVzZXJzW2ldLm5hbWUpXG4gICAgICBsaU5vZGUuYXBwZW5kQ2hpbGQoZ2FtZSlcbiAgICAgIGxpTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlcUdhbWUsIGZhbHNlKVxuICAgICAgZ2FtZUxpc3QuYXBwZW5kQ2hpbGQobGlOb2RlKVxuICAgIH1cbiAgfVxuICBsZXQgb3RoZXJQbGF5ZXJzID0gZ2FtZUxpc3QuaGFzQ2hpbGROb2RlcygpXG4gIGlmKCFvdGhlclBsYXllcnMpe1xuICAgIGdhbWVMaXN0LmlubmVySFRNTCA9ICdKdXN0IHlvdSBpbiB0aGUgbG9iYnkgcmlnaHQgbm93J1xuICB9XG59KVxuXG5mdW5jdGlvbiByZXFHYW1lKGUpIHtcbiAgaWYoIWluTG9iYnkpe1xuICAgIGxvZygnUGxlYXNlIGpvaW4gdGhlIGxvYmJ5IHRvIGNoYWxsZW5nZSBwbGF5ZXJzJylcbiAgICByZXR1cm4gXG4gIH1cbiAgbGV0IHBsYXllciA9IGUudGFyZ2V0LmlubmVySFRNTFxuICBzb2NrZXQuZW1pdCgncmVxdWVzdEdhbWUnLCBwbGF5ZXIpXG59XG5cbnNvY2tldC5vbignbWVzc2FnZScsIGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gIGxvZyhtZXNzYWdlKVxufSlcblxuZnVuY3Rpb24gbG9nKG1lc3NhZ2UpIHtcbiAgbGV0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnTEknKVxuICBsaS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShtZXNzYWdlKSlcbiAgbGV0IGdhbWVNZXNzYWdlcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTWVzc2FnZXMnKVxuICBnYW1lTWVzc2FnZXMuYXBwZW5kQ2hpbGQobGkpXG4gIGdhbWVNZXNzYWdlcy5zY3JvbGxUb3AgPSBnYW1lTWVzc2FnZXMuc2Nyb2xsSGVpZ2h0XG59XG5cbnNvY2tldC5vbignY2hhbGxlbmdlJywgZnVuY3Rpb24gKGNoYWxsZW5nZSkge1xuICBjb25zb2xlLmxvZygnZ290IHRoZSBjaGFsbGVuZ2UnLCBjaGFsbGVuZ2UpXG4gIGxldCBsb2JieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpXG4gIGxldCBhY2NlcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBhY2NlcHQuaWQgPSAnYWNjZXB0J1xuICBhY2NlcHQuaW5uZXJIVE1MID0gXCJJJ20gUmVhZHkhXCJcbiAgc29ja2V0LmNoYWxsZW5nZSA9IGNoYWxsZW5nZVxuICBhY2NlcHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgc29ja2V0LmVtaXQoJ3JlYWR5R2FtZScsIHNvY2tldC5jaGFsbGVuZ2UpXG4gIH0pXG4gIGxvYmJ5Lmluc2VydEJlZm9yZShhY2NlcHQsbG9iYnkuY2hpbGROb2Rlc1sxXSlcblxuICBsb2coJ0NoYWxsZW5nZSBmcm9tICcrIGNoYWxsZW5nZS5jaGFsbGVuZ2VyKycuIFJlYWR5PycpXG59KVxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCByZWFkeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NlcHQnKTtcbiAgaWYgKHJlYWR5QnV0dG9uKSB7XG4gICAgcmVhZHlCdXR0b24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyZWFkeUJ1dHRvbik7XG4gIH1cbiAgc29ja2V0LmdhbWUgPSBkYXRhXG4gIGxvZyhkYXRhLnBsYXllck9uZSsnIFZTICcrIGRhdGEucGxheWVyVHdvKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIGNhbnZhcy53aWR0aCA9IDYwMFxuICBjYW52YXMuaGVpZ2h0ID0gMzAwXG4gIGNhbnZhcy5jbGFzc0xpc3QuYWRkKCdpbi1nYW1lJylcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVMaXN0JykuY2xhc3NMaXN0LmFkZCgnaGlkZScpIC8vcmVtb3ZlIGZyb20gRE9NL3VzZSBoaWRlIGNsYXNzP1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoYm9hcmQsIGdhbWVEYXRhKSB7XG4gIGxldCBzY29yZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzY29yZXMuaWQgPSAnc2NvcmVzJ1xuICBzY29yZXMuY2xhc3NMaXN0LmFkZCgnaW4tZ2FtZScpXG4gIHNjb3Jlcy5pbm5lckhUTUwgPSAgc29ja2V0LmdhbWUucGxheWVyT25lKyc6IDAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOiAwJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChzY29yZXMpXG4gIGxldCBjdHggPSBib2FyZC5nZXRDb250ZXh0KCcyZCcpXG4gIHNvY2tldC5nYW1lLnAxU2NvcmUgPSAwXG4gIHNvY2tldC5nYW1lLnAyU2NvcmUgPSAwIC8vKysgZWFjaCB0aW1lIGEgc2NvcmUgaGFwcGVuZHMuIFxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAxKVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJUd29JZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAyKVxuICAgICAgICAgIFxuICAgICAgICB9XG4gIH0sIGZhbHNlKVxuXG4gbGV0IHAxID0ge2NvbG91cjonIzA1RUZGRicsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiAxMCwgZHg6IDAsIGR5OiAwLG5hbWU6ICdQMSBSb2NrJywgc2NvcmU6IDB9XG4gbGV0IHAyID0ge2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogYm9hcmQud2lkdGgtMjAsIGR4OiAwLCBkeTogMCwgbmFtZTogJ1AyJywgc2NvcmU6IDB9XG4gbGV0IGJhbGwgPSB7Y29sb3VyOiAnI0NFRkYzMycsd2lkdGg6IDEwLGhlaWdodDogMTAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC8yLCBkeDogMSwgZHk6IC0xLCBuYW1lOiAnQmFsbCd9O1xuXG4gbGV0IHRpbWVySWQgPSBzZXRJbnRlcnZhbChkcmF3LCAzMClcbi8vIFJlbmRlciBlbGVtZW50cy5cbiAgbGV0IGNvb3JkVGltZXJJZFxuICBpZihzb2NrZXQuZ2FtZS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpe1xuICAgIGNvbnNvbGUubG9nKCdiYWxsJywgYmFsbClcbiAgICBjb29yZFRpbWVySWQgPSBzZXRJbnRlcnZhbChjYWxjQmFsbFBvcywgMzApXG4gIH1cblxuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgLy9yZWRyYXcgY2FudmFzIGZpcnN0IGFkZCBtaWRkbGUgbGluZT8gXG4gICAgY3R4LmNsZWFyUmVjdCgwLCAwLCA2MDAsIDMwMClcbiAgICBjaGVja1dpbigpXG4gICAgZHJhd0JhbGwoKVxuICAgIGRyYXdTY29yZSgpXG4gICAgZHJhd1BhZGRsZShwMilcbiAgICBkcmF3UGFkZGxlKHAxKVxuICB9XG4gIGZ1bmN0aW9uIGNoZWNrV2luKCl7XG4gICAgaWYoc29ja2V0LmdhbWUucDFTY29yZTw2ICYmIHNvY2tldC5nYW1lLnAyU2NvcmU8Nil7XG4gICAgICByZXR1cm4gXG4gICAgfVxuICAgIGxldCB3aW5uZXJcbiAgICBpZiAoc29ja2V0LmdhbWUucDFTY29yZT41KXtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllck9uZVxuICAgIH0gXG4gICAgaWYoc29ja2V0LmdhbWUucDJTY29yZT41KSB7XG4gICAgICB3aW5uZXIgPSBzb2NrZXQuZ2FtZS5wbGF5ZXJUd29cbiAgICB9XG4gICAgXG4gICAgc29ja2V0LmVtaXQoJ2VuZEdhbWUnLCB7d2luVGV4dDogd2lubmVyKyAnICBXT04gVEhFIEdBTUUnLCBnYW1lOiBzb2NrZXQuZ2FtZS5pZH0pXG4gICAgY2xlYXJJbnRlcnZhbCh0aW1lcklkKSAgXG4gICAgaWYoY29vcmRUaW1lcklkKXtcbiAgICAgIGNsZWFySW50ZXJ2YWwoY29vcmRUaW1lcklkKVxuICAgIH1cbiAgICBzZXRFeGl0VG9Mb2JieSgpXG4gICAgICAvLyBhc2sgaWYgcGxheSBhZ2FpbiwgaWYgYm90aCBzYXkgeWVzLCBydW4gZ2FtZVJvdW50aW5lLCBlbHNlIHJldHVybiB0byBsb2JieS4gXG4gIH1cbiAgc29ja2V0Lm9uKCd3aW5uZXInLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRyYXdTY29yZShkYXRhLndpblRleHQpXG4gIH0pXG5cbiAgZnVuY3Rpb24gc2V0RXhpdFRvTG9iYnkoKSB7XG4gICAgLy9kZWxldGUgc29ja2V0LmdhbWU/IFxuICAgIGNvbnNvbGUubG9nKHNvY2tldC5nYW1lKVxuICAgIGxldCBnYW1lT3ZlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpICBcbiAgICBnYW1lT3Zlci5jbGFzc0xpc3QuYWRkKCdpbi1nYW1lJylcbiAgICBnYW1lT3Zlci5pbm5lckhUTUwgPSAnRXhpdCB0byBMb2JieSdcbiAgICBnYW1lT3Zlci5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKVxuICAgICAgY29uc29sZS5sb2coc29ja2V0LmdhbWUpXG4gICAgfSlcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChnYW1lT3ZlcilcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbGNCYWxsUG9zKCkge1xuICAgICAgbGV0IHJlc2V0QmFsbCBcbiAgICAgIGlmKGJhbGwueCA+IGJvYXJkLndpZHRoKXtcbiAgICAgICAgc29ja2V0LmdhbWUucDFTY29yZSsrXG4gICAgICAgIHJlc2V0QmFsbCA9IHRydWVcbiAgICAgIH1cbiAgICAgIGlmKGJhbGwueCA8IDApe1xuICAgICAgICBzb2NrZXQuZ2FtZS5wMlNjb3JlKytcbiAgICAgICAgcmVzZXRCYWxsID0gdHJ1ZVxuICAgICAgfVxuXG4gICAgICBpZihiYWxsLnkgPiBib2FyZC5oZWlnaHQgfHwgYmFsbC55IDwgMCl7XG4gICAgICAgIGJhbGwuZHkgPSAtYmFsbC5keVxuICAgICAgfVxuXG4gICBcbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoLzIgPiBwMS54ICAmJiBcbiAgICAgICAgYmFsbC54IDwgcDEueCtwMS53aWR0aCYmIFxuICAgICAgICBiYWxsLnkrYmFsbC5oZWlnaHQ+cDEueSYmIFxuICAgICAgICBiYWxsLnk8cDEueStwMS5oZWlnaHQpe1xuXG4gICAgICAgIGJhbGwuZHggPSAtYmFsbC5keDtcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAyLnggJiYgXG4gICAgICAgIGJhbGwueCA8IHAyLngrcDIud2lkdGggJiZcbiAgICAgICAgIGJhbGwueStiYWxsLmhlaWdodD5wMi55ICYmIFxuICAgICAgICAgYmFsbC55PHAyLnkrcDIuaGVpZ2h0KXtcbiAgICAgICAgIGJhbGwuZHggPSAtYmFsbC5keCAgICAgXG4gICAgICAgfVxuICAgICBjb25zb2xlLmxvZygnc2VuZEdhbWVTdGF0ZScsIGJhbGwuZHgrJyAgJytiYWxsLmR5KVxuICAgICBzb2NrZXQuZW1pdCgnc2VuZEdhbWVTdGF0ZScsIHtkeDogYmFsbC5keCwgZHk6IGJhbGwuZHksIGdhbWU6c29ja2V0LmdhbWUsIHNob3VsZFJlc2V0OiByZXNldEJhbGx9KVxuICAgXG5cbiAgfSAgIFxuICAvL3doZW4gYmFsbCBpcyBzY29yZWQsIHRoZSBiYWxsLnggYW5kIGJhbGwueSBpcyBub3QgcmVzZXQgdG8gaGFsZndheSBzbyBnZXRCYWxsUG9zIGp1c3QgY29udGludWVzLi4uIG1heWJlIGluY2x1ZGUgZmxhZyBpbiBzZW5kQmFsbHBvcy9nZXRCYWxsUG9zP1xuICBzb2NrZXQub24oJ2dldEdhbWVTdGF0ZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBpZihkYXRhLnNob3VsZFJlc2V0ID09IHRydWUpe1xuICAgICAgICBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICAgIHJlc2V0QmFsbCA9IGZhbHNlXG4gICAgICB9ZWxzZXtcbiAgICAgIGJhbGwueSArPSBkYXRhLmR5XG4gICAgICBiYWxsLnggKz0gZGF0YS5keFxuICAgIH1cbiAgICAvL3VwZGF0ZSBnYW1lIHN0YXRlPyBcbiAgICBzb2NrZXQuZ2FtZSA9IGRhdGEuZ2FtZVxuICAgIC8vIGRyYXd0aGUgc2NvcmVcbiAgLy8gY29uc29sZS5sb2coJ0dFVHRpbmcgZ2FtZSBzdGF0ZScsZGF0YSlcbiAgfSlcblxuICBmdW5jdGlvbiBkcmF3QmFsbCgpIHsgIFxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGJhbGwuY29sb3VyO1xuICAgICAgY3R4LmZpbGxSZWN0KGJhbGwueCwgYmFsbC55LCBiYWxsLndpZHRoLCBiYWxsLmhlaWdodCk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gZHJhd1BhZGRsZShwYWRkbGUpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gcGFkZGxlLmNvbG91cjtcbiAgICBjdHguZmlsbFJlY3QocGFkZGxlLngsIHBhZGRsZS55LCBwYWRkbGUud2lkdGgsIHBhZGRsZS5oZWlnaHQpO1xuICB9XG4gIGZ1bmN0aW9uIGRyYXdTY29yZSh0ZXh0KSB7XG4gICAgbGV0IHNjb3JlU3RyXG4gICAgaWYodGV4dCl7XG4gICAgICBzY29yZVN0ciA9ICB0ZXh0XG4gICAgfWVsc2V7XG4gICAgICBzY29yZVN0ciA9IHNvY2tldC5nYW1lLnBsYXllck9uZSsnOicgK3NvY2tldC5nYW1lLnAxU2NvcmUgKycgICcrc29ja2V0LmdhbWUucGxheWVyVHdvKyc6Jysgc29ja2V0LmdhbWUucDJTY29yZVxuICAgIH1cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmVzJykuaW5uZXJIVE1MID0gc2NvcmVTdHJcbiAgfVxuXG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBpZihwcmVzcy5rZXk9PSd4JyB8fCBwcmVzcy5jb2RlID09ICdrZXlYJyl7XG4gICAgICAgIHBsYXllci55Kz0gMjBcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKVxuICAgICB9XG4gICAgIGlmKHByZXNzLmtleT09J3MnIHx8IHByZXNzLmNvZGUgPT0gJ2tleVMnKXtcbiAgICAgICAgcGxheWVyLnktPSAyMCBcbiAgICAgICAgLy8gY29uc29sZS5sb2cocHJlc3Mua2V5ICsnICAnK0pTT04uc3RyaW5naWZ5KHBsYXllcikpIFxuICAgICB9XG4gICAgIGlmKHBsYXllci55IDwgMCl7XG4gICAgICAgIHBsYXllci55ID0gMFxuICAgICB9IFxuICAgICBpZihwbGF5ZXIueSArIHBsYXllci5oZWlnaHQgPiBib2FyZC5oZWlnaHQpe1xuICAgICAgICBwbGF5ZXIueSA9IGJvYXJkLmhlaWdodCAtIHBsYXllci5oZWlnaHRcbiAgICAgfVxuICAgICBzZW5kTW92ZSh7aWQ6Z2FtZURhdGEuaWQsIG1vdmVtZW50OiBwbGF5ZXIueX0pXG4gIH1cblxuICBmdW5jdGlvbiBzZW5kTW92ZShkYXRhKSB7IFxuICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIGRhdGEpXG4gIH1cblxuICBzb2NrZXQub24oJ2dldE1vdmUnLCBmdW5jdGlvbiAob3Bwb25lbnQpIHtcbiAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICBwMi55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9ZWxzZXtcbiAgICAgIHAxLnkgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1cbiAgfSlcblxufVxuIl19
