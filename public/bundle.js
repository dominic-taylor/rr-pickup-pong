(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  document.getElementsByClassName('title')[0].classList.add('hide')
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
  let gameMessages = document.getElementById('gameMessages')
  gameMessages.appendChild(li)
  gameMessages.scrollTop = gameMessages.scrollHeight
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
  log(data.playerOne+' VS '+ data.playerTwo);
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.width = 600
  canvas.height = 300

  document.getElementById('gameList').classList.add('hide') //remove from DOM/use hide class?
  document.getElementById('lobby').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  let scores = document.createElement('div')
  scores.id = 'scores'
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
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 8, dy: -8, name: 'Ball'};

 let timerId = setInterval(draw, 30)
// Render elements.
  let coordTimerId
  if(socket.game.playerOneId == socket.id){
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
      // ask if play again, if both say yes, run gameRountine, else return to lobby. 
  }
  socket.on('winner', function (data) {
    drawScore(data.winText)
  })

  function calcBallPos() {
      let resetBall 
      if(ball.x > board.width){
        socket.game.p1Score++
        // p1.score++
        //drawScore()
        // ball.x = board.width/2
        // ball.y = board.height/2
        resetBall = true
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p2.x:'+p2.x+' y: '+p2.y)

      }
      if(ball.x < 0){
        socket.game.p2Score++
        // p2.score++
        //drawScore()
        // ball.x = board.width/2
        // ball.y = board.height/2
        resetBall = true
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p1.x:'+p1.x+' y: '+p1.y)
      }

      if(ball.y > board.height || ball.y < 0){
        ball.dy = -ball.dy
      }

   
      if(ball.x+ball.width/2 > p1.x  && 
        ball.x < p1.x+p1.width&& 
        ball.y+ball.height>p1.y&& 
        ball.y<p1.y+p1.height){

        ball.dx = -ball.dx;
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p1HIT.x:'+p1.x+' y: '+p1.y) 
      }

      if(ball.x+ball.width/2 > p2.x && 
        ball.x < p2.x+p2.width &&
         ball.y+ball.height>p2.y && 
         ball.y<p2.y+p2.height){

        // console.log('ball: x'+ball.x + ' y'+ball.y)
        // console.log('p2HIT.x:'+p2.x+' y: '+p2.y)  
        ball.dx = -ball.dx     
       }
     // console.log('sendBall position')
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
  console.log('GETting game state',data)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBzb2NrZXQgPSBpbygpXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luU2VydmVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgbGV0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZUlucHV0JylcbiAgaWYoIW5hbWUudmFsdWUpe1xuICAgIHJldHVybiBsb2coJ1BsZWFzZSBlbnRlciBhIG5hbWUnKVxuICB9O1xuICBzb2NrZXQuZW1pdCgnam9pbkxvYmJ5JywgbmFtZS52YWx1ZSlcbiAgLy9kaXNhYmxlIGZ1cnRoZXIgZXZlbnRzIGZyb20gdGhpcyBidXR0b25cbn0pXG5cbnNvY2tldC5vbigncmVzSm9pbkxvYmJ5JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IG5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgndGl0bGUnKVswXS5jbGFzc0xpc3QuYWRkKCdoaWRlJylcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuYXBwZW5kQ2hpbGQobmFtZU5vZGUpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGxldCB0aGlzVXNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmlubmVySFRNTFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYodXNlcnNbaV0ubmFtZSAhPSB0aGlzVXNlcil7XG4gICAgICB2YXIgbGlOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpXG4gICAgICB2YXIgZ2FtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVzZXJzW2ldLm5hbWUpXG4gICAgICBsaU5vZGUuYXBwZW5kQ2hpbGQoZ2FtZSlcbiAgICAgIGxpTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlcUdhbWUsIGZhbHNlKVxuICAgICAgZ2FtZUxpc3QuYXBwZW5kQ2hpbGQobGlOb2RlKVxuICAgIH1cbiAgfVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgc29ja2V0LmVtaXQoJ3JlcXVlc3RHYW1lJywgcGxheWVyKVxufVxuXG5zb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICBsb2cobWVzc2FnZSlcbn0pXG5cbmZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XG4gIGxldCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJylcbiAgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpXG4gIGxldCBnYW1lTWVzc2FnZXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJylcbiAgZ2FtZU1lc3NhZ2VzLmFwcGVuZENoaWxkKGxpKVxuICBnYW1lTWVzc2FnZXMuc2Nyb2xsVG9wID0gZ2FtZU1lc3NhZ2VzLnNjcm9sbEhlaWdodFxufVxuXG5zb2NrZXQub24oJ2NoYWxsZW5nZScsIGZ1bmN0aW9uIChjaGFsbGVuZ2UpIHtcbiAgbGV0IGxvYmJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JylcbiAgbGV0IGFjY2VwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIGFjY2VwdC5pZCA9ICdhY2NlcHQnXG4gIGFjY2VwdC5pbm5lckhUTUwgPSBcIkknbSBSZWFkeSFcIlxuICBzb2NrZXQuY2hhbGxlbmdlID0gY2hhbGxlbmdlXG4gIGFjY2VwdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJywgc29ja2V0LmNoYWxsZW5nZSlcbiAgfSlcbiAgbG9iYnkuaW5zZXJ0QmVmb3JlKGFjY2VwdCxsb2JieS5jaGlsZE5vZGVzWzFdKVxuXG4gIGxvZygnQ2hhbGxlbmdlIGZyb20gJysgY2hhbGxlbmdlLmNoYWxsZW5nZXIrJy4gUmVhZHk/Jylcbn0pXG5cbnNvY2tldC5vbignc3RhcnRHYW1lJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IHJlYWR5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY2VwdCcpO1xuICBpZiAocmVhZHlCdXR0b24pIHtcbiAgICByZWFkeUJ1dHRvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHJlYWR5QnV0dG9uKTtcbiAgfVxuICBzb2NrZXQuZ2FtZSA9IGRhdGFcbiAgbG9nKGRhdGEucGxheWVyT25lKycgVlMgJysgZGF0YS5wbGF5ZXJUd28pO1xuICBzdGFydEdhbWUoZGF0YSlcbn0pXG5cbmZ1bmN0aW9uIHN0YXJ0R2FtZShkYXRhKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLmlkID0gJ2NhbnZhcydcbiAgY2FudmFzLndpZHRoID0gNjAwXG4gIGNhbnZhcy5oZWlnaHQgPSAzMDBcblxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKS5jbGFzc0xpc3QuYWRkKCdoaWRlJykgLy9yZW1vdmUgZnJvbSBET00vdXNlIGhpZGUgY2xhc3M/XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIGdhbWVSb3V0aW5lKGNhbnZhcywgZGF0YSlcblxufVxuXG5mdW5jdGlvbiBnYW1lUm91dGluZShib2FyZCwgZ2FtZURhdGEpIHtcbiAgbGV0IHNjb3JlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNjb3Jlcy5pZCA9ICdzY29yZXMnXG4gIHNjb3Jlcy5pbm5lckhUTUwgPSAgc29ja2V0LmdhbWUucGxheWVyT25lKyc6IDAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOiAwJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChzY29yZXMpXG4gIGxldCBjdHggPSBib2FyZC5nZXRDb250ZXh0KCcyZCcpXG4gIHNvY2tldC5nYW1lLnAxU2NvcmUgPSAwXG4gIHNvY2tldC5nYW1lLnAyU2NvcmUgPSAwIC8vKysgZWFjaCB0aW1lIGEgc2NvcmUgaGFwcGVuZHMuIFxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAxKVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJUd29JZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAyKVxuICAgICAgICAgIFxuICAgICAgICB9XG4gIH0sIGZhbHNlKVxuXG4gbGV0IHAxID0ge2NvbG91cjonIzA1RUZGRicsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiAxMCwgZHg6IDAsIGR5OiAwLG5hbWU6ICdQMSBSb2NrJywgc2NvcmU6IDB9XG4gbGV0IHAyID0ge2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogYm9hcmQud2lkdGgtMjAsIGR4OiAwLCBkeTogMCwgbmFtZTogJ1AyJywgc2NvcmU6IDB9XG4gbGV0IGJhbGwgPSB7Y29sb3VyOiAnI0NFRkYzMycsd2lkdGg6IDEwLGhlaWdodDogMTAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC8yLCBkeDogOCwgZHk6IC04LCBuYW1lOiAnQmFsbCd9O1xuXG4gbGV0IHRpbWVySWQgPSBzZXRJbnRlcnZhbChkcmF3LCAzMClcbi8vIFJlbmRlciBlbGVtZW50cy5cbiAgbGV0IGNvb3JkVGltZXJJZFxuICBpZihzb2NrZXQuZ2FtZS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpe1xuICAgIGNvb3JkVGltZXJJZCA9IHNldEludGVydmFsKGNhbGNCYWxsUG9zLCAzMClcbiAgfVxuXG5cbiAgZnVuY3Rpb24gZHJhdygpIHtcbiAgICAvL3JlZHJhdyBjYW52YXMgZmlyc3QgYWRkIG1pZGRsZSBsaW5lPyBcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDYwMCwgMzAwKVxuICAgIGNoZWNrV2luKClcbiAgICBkcmF3QmFsbCgpXG4gICAgZHJhd1Njb3JlKClcbiAgICBkcmF3UGFkZGxlKHAyKVxuICAgIGRyYXdQYWRkbGUocDEpXG4gIH1cbiAgZnVuY3Rpb24gY2hlY2tXaW4oKXtcbiAgICBpZihzb2NrZXQuZ2FtZS5wMVNjb3JlPDYgJiYgc29ja2V0LmdhbWUucDJTY29yZTw2KXtcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgbGV0IHdpbm5lclxuICAgIGlmIChzb2NrZXQuZ2FtZS5wMVNjb3JlPjUpe1xuICAgICAgd2lubmVyID0gc29ja2V0LmdhbWUucGxheWVyT25lXG4gICAgfSBcbiAgICBpZihzb2NrZXQuZ2FtZS5wMlNjb3JlPjUpIHtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllclR3b1xuICAgIH1cbiAgICBcbiAgICBzb2NrZXQuZW1pdCgnZW5kR2FtZScsIHt3aW5UZXh0OiB3aW5uZXIrICcgIFdPTiBUSEUgR0FNRScsIGdhbWU6IHNvY2tldC5nYW1lLmlkfSlcbiAgICBjbGVhckludGVydmFsKHRpbWVySWQpICBcbiAgICBpZihjb29yZFRpbWVySWQpe1xuICAgICAgY2xlYXJJbnRlcnZhbChjb29yZFRpbWVySWQpXG4gICAgfSAgIFxuICAgICAgLy8gYXNrIGlmIHBsYXkgYWdhaW4sIGlmIGJvdGggc2F5IHllcywgcnVuIGdhbWVSb3VudGluZSwgZWxzZSByZXR1cm4gdG8gbG9iYnkuIFxuICB9XG4gIHNvY2tldC5vbignd2lubmVyJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkcmF3U2NvcmUoZGF0YS53aW5UZXh0KVxuICB9KVxuXG4gIGZ1bmN0aW9uIGNhbGNCYWxsUG9zKCkge1xuICAgICAgbGV0IHJlc2V0QmFsbCBcbiAgICAgIGlmKGJhbGwueCA+IGJvYXJkLndpZHRoKXtcbiAgICAgICAgc29ja2V0LmdhbWUucDFTY29yZSsrXG4gICAgICAgIC8vIHAxLnNjb3JlKytcbiAgICAgICAgLy9kcmF3U2NvcmUoKVxuICAgICAgICAvLyBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIC8vIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICAgIHJlc2V0QmFsbCA9IHRydWVcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2JhbGw6IHgnK2JhbGwueSArICcgeScrYmFsbC54KVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncDIueDonK3AyLngrJyB5OiAnK3AyLnkpXG5cbiAgICAgIH1cbiAgICAgIGlmKGJhbGwueCA8IDApe1xuICAgICAgICBzb2NrZXQuZ2FtZS5wMlNjb3JlKytcbiAgICAgICAgLy8gcDIuc2NvcmUrK1xuICAgICAgICAvL2RyYXdTY29yZSgpXG4gICAgICAgIC8vIGJhbGwueCA9IGJvYXJkLndpZHRoLzJcbiAgICAgICAgLy8gYmFsbC55ID0gYm9hcmQuaGVpZ2h0LzJcbiAgICAgICAgcmVzZXRCYWxsID0gdHJ1ZVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmFsbDogeCcrYmFsbC55ICsgJyB5JytiYWxsLngpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwMS54OicrcDEueCsnIHk6ICcrcDEueSlcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC55ID4gYm9hcmQuaGVpZ2h0IHx8IGJhbGwueSA8IDApe1xuICAgICAgICBiYWxsLmR5ID0gLWJhbGwuZHlcbiAgICAgIH1cblxuICAgXG4gICAgICBpZihiYWxsLngrYmFsbC53aWR0aC8yID4gcDEueCAgJiYgXG4gICAgICAgIGJhbGwueCA8IHAxLngrcDEud2lkdGgmJiBcbiAgICAgICAgYmFsbC55K2JhbGwuaGVpZ2h0PnAxLnkmJiBcbiAgICAgICAgYmFsbC55PHAxLnkrcDEuaGVpZ2h0KXtcblxuICAgICAgICBiYWxsLmR4ID0gLWJhbGwuZHg7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYWxsOiB4JytiYWxsLnkgKyAnIHknK2JhbGwueClcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3AxSElULng6JytwMS54KycgeTogJytwMS55KSBcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAyLnggJiYgXG4gICAgICAgIGJhbGwueCA8IHAyLngrcDIud2lkdGggJiZcbiAgICAgICAgIGJhbGwueStiYWxsLmhlaWdodD5wMi55ICYmIFxuICAgICAgICAgYmFsbC55PHAyLnkrcDIuaGVpZ2h0KXtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmFsbDogeCcrYmFsbC54ICsgJyB5JytiYWxsLnkpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwMkhJVC54OicrcDIueCsnIHk6ICcrcDIueSkgIFxuICAgICAgICBiYWxsLmR4ID0gLWJhbGwuZHggICAgIFxuICAgICAgIH1cbiAgICAgLy8gY29uc29sZS5sb2coJ3NlbmRCYWxsIHBvc2l0aW9uJylcbiAgICAgc29ja2V0LmVtaXQoJ3NlbmRHYW1lU3RhdGUnLCB7ZHg6IGJhbGwuZHgsIGR5OiBiYWxsLmR5LCBnYW1lOnNvY2tldC5nYW1lLCBzaG91bGRSZXNldDogcmVzZXRCYWxsfSlcbiAgIFxuXG4gIH0gICBcbiAgLy93aGVuIGJhbGwgaXMgc2NvcmVkLCB0aGUgYmFsbC54IGFuZCBiYWxsLnkgaXMgbm90IHJlc2V0IHRvIGhhbGZ3YXkgc28gZ2V0QmFsbFBvcyBqdXN0IGNvbnRpbnVlcy4uLiBtYXliZSBpbmNsdWRlIGZsYWcgaW4gc2VuZEJhbGxwb3MvZ2V0QmFsbFBvcz9cbiAgc29ja2V0Lm9uKCdnZXRHYW1lU3RhdGUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgaWYoZGF0YS5zaG91bGRSZXNldCA9PSB0cnVlKXtcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgICByZXNldEJhbGwgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICBiYWxsLnkgKz0gZGF0YS5keVxuICAgICAgYmFsbC54ICs9IGRhdGEuZHhcbiAgICB9XG4gICAgLy91cGRhdGUgZ2FtZSBzdGF0ZT8gXG4gICAgc29ja2V0LmdhbWUgPSBkYXRhLmdhbWVcbiAgICAvLyBkcmF3dGhlIHNjb3JlXG4gIGNvbnNvbGUubG9nKCdHRVR0aW5nIGdhbWUgc3RhdGUnLGRhdGEpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZHJhd0JhbGwoKSB7ICBcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBiYWxsLmNvbG91cjtcbiAgICAgIGN0eC5maWxsUmVjdChiYWxsLngsIGJhbGwueSwgYmFsbC53aWR0aCwgYmFsbC5oZWlnaHQpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdQYWRkbGUocGFkZGxlKSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHBhZGRsZS5jb2xvdXI7XG4gICAgY3R4LmZpbGxSZWN0KHBhZGRsZS54LCBwYWRkbGUueSwgcGFkZGxlLndpZHRoLCBwYWRkbGUuaGVpZ2h0KTtcbiAgfVxuICBmdW5jdGlvbiBkcmF3U2NvcmUodGV4dCkge1xuICAgIGxldCBzY29yZVN0clxuICAgIGlmKHRleHQpe1xuICAgICAgc2NvcmVTdHIgPSAgdGV4dFxuICAgIH1lbHNle1xuICAgICAgc2NvcmVTdHIgPSBzb2NrZXQuZ2FtZS5wbGF5ZXJPbmUrJzonICtzb2NrZXQuZ2FtZS5wMVNjb3JlICsnICAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOicrIHNvY2tldC5nYW1lLnAyU2NvcmVcbiAgICB9XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Njb3JlcycpLmlubmVySFRNTCA9IHNjb3JlU3RyXG4gIH1cblxuXG4gIGZ1bmN0aW9uIG1vdmVIYW5kbGVyKHByZXNzLCBwbGF5ZXIpIHtcbiAgICAgaWYocHJlc3Mua2V5PT0neCcgfHwgcHJlc3MuY29kZSA9PSAna2V5WCcpe1xuICAgICAgICBwbGF5ZXIueSs9IDIwXG4gICAgICAgICAvLyBjb25zb2xlLmxvZyhwcmVzcy5rZXkgKycgICcrSlNPTi5zdHJpbmdpZnkocGxheWVyKSlcbiAgICAgfVxuICAgICBpZihwcmVzcy5rZXk9PSdzJyB8fCBwcmVzcy5jb2RlID09ICdrZXlTJyl7XG4gICAgICAgIHBsYXllci55LT0gMjAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKSBcbiAgICAgfVxuICAgICBpZihwbGF5ZXIueSA8IDApe1xuICAgICAgICBwbGF5ZXIueSA9IDBcbiAgICAgfSBcbiAgICAgaWYocGxheWVyLnkgKyBwbGF5ZXIuaGVpZ2h0ID4gYm9hcmQuaGVpZ2h0KXtcbiAgICAgICAgcGxheWVyLnkgPSBib2FyZC5oZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0XG4gICAgIH1cbiAgICAgc2VuZE1vdmUoe2lkOmdhbWVEYXRhLmlkLCBtb3ZlbWVudDogcGxheWVyLnl9KVxuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1vdmUoZGF0YSkgeyBcbiAgICBzb2NrZXQuZW1pdCgnc2VuZE1vdmUnLCBkYXRhKVxuICB9XG5cbiAgc29ja2V0Lm9uKCdnZXRNb3ZlJywgZnVuY3Rpb24gKG9wcG9uZW50KSB7XG4gICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgcDIueSA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfWVsc2V7XG4gICAgICBwMS55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9XG4gIH0pXG5cbn1cbiJdfQ==
