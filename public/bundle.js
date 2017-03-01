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
  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );
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

 let timerId = setInterval(draw, 100)
// Render elements.
  let coordTimerId
  if(socket.game.playerOneId == socket.id){
    coordTimerId = setInterval(calcBallPos, 100)
  }


  function draw() {
    //redraw canvas first 
    ctx.clearRect(0, 0, 600, 300)
    checkWin()
    drawBall()
    drawPaddle(p2)
    drawPaddle(p1)
  }
  function checkWin(){
    if(p1.score<6 && p2.score<6){
      return 
    }
    let winner
    if (p1.score>5){
      winner = socket.game.playerOne
    } 
    if(p2.score>5) {
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
        p1.score++
        drawScore()
        // ball.x = board.width/2
        // ball.y = board.height/2
        resetBall = true
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p2.x:'+p2.x+' y: '+p2.y)

      }
      if(ball.x < 0){
        p2.score++
        drawScore()
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
     socket.emit('sendBallPos', {dx: ball.dx, dy: ball.dy, game:socket.game.id, shouldReset: resetBall})
  

  }   
  //when ball is scored, the ball.x and ball.y is not reset to halfway so getBallPos just continues... maybe include flag in sendBallpos/getBallPos?
  socket.on('getBallPos', function (data) {
      if(data.shouldReset == true){
        ball.x = board.width/2
        ball.y = board.height/2
        resetBall = false
      }else{
      ball.y += data.dy
      ball.x += data.dx
    }
      // console.log('GETTing BALL DATA',data)
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
      scoreStr = socket.game.playerOne+':' +p1.score +'  '+socket.game.playerTwo+':'+ p2.score
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RpdGxlJylbMF0uY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBsZXQgZ2FtZU1lc3NhZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVNZXNzYWdlcycpXG4gIGdhbWVNZXNzYWdlcy5hcHBlbmRDaGlsZChsaSlcbiAgZ2FtZU1lc3NhZ2VzLnNjcm9sbFRvcCA9IGdhbWVNZXNzYWdlcy5zY3JvbGxIZWlnaHRcbn1cblxuc29ja2V0Lm9uKCdjaGFsbGVuZ2UnLCBmdW5jdGlvbiAoY2hhbGxlbmdlKSB7XG4gIGxldCBsb2JieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpXG4gIGxldCBhY2NlcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBhY2NlcHQuaWQgPSAnYWNjZXB0J1xuICBhY2NlcHQuaW5uZXJIVE1MID0gXCJJJ20gUmVhZHkhXCJcbiAgc29ja2V0LmNoYWxsZW5nZSA9IGNoYWxsZW5nZVxuICBhY2NlcHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgc29ja2V0LmVtaXQoJ3JlYWR5R2FtZScsIHNvY2tldC5jaGFsbGVuZ2UpXG4gIH0pXG4gIGxvYmJ5Lmluc2VydEJlZm9yZShhY2NlcHQsbG9iYnkuY2hpbGROb2Rlc1sxXSlcblxuICBsb2coJ0NoYWxsZW5nZSBmcm9tICcrIGNoYWxsZW5nZS5jaGFsbGVuZ2VyKycuIFJlYWR5PycpXG59KVxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCByZWFkeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NlcHQnKTtcbiAgaWYgKHJlYWR5QnV0dG9uKSB7XG4gICAgcmVhZHlCdXR0b24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyZWFkeUJ1dHRvbik7XG4gIH1cbiAgc29ja2V0LmdhbWUgPSBkYXRhXG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIGNhbnZhcy53aWR0aCA9IDYwMFxuICBjYW52YXMuaGVpZ2h0ID0gMzAwXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVMaXN0JykuY2xhc3NMaXN0LmFkZCgnaGlkZScpIC8vcmVtb3ZlIGZyb20gRE9NL3VzZSBoaWRlIGNsYXNzP1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoYm9hcmQsIGdhbWVEYXRhKSB7XG4gIGxldCBzY29yZXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICBzY29yZXMuaWQgPSAnc2NvcmVzJ1xuICBzY29yZXMuaW5uZXJIVE1MID0gIHNvY2tldC5nYW1lLnBsYXllck9uZSsnOiAwJytzb2NrZXQuZ2FtZS5wbGF5ZXJUd28rJzogMCdcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoc2NvcmVzKVxuICBsZXQgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dCgnMmQnKVxuIFxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBmdW5jdGlvbihlKXtcbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAxKVxuICAgICAgICB9XG4gICAgICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJUd29JZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHAyKVxuICAgICAgICAgIFxuICAgICAgICB9XG4gIH0sIGZhbHNlKVxuXG4gbGV0IHAxID0ge2NvbG91cjonIzA1RUZGRicsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiAxMCwgZHg6IDAsIGR5OiAwLG5hbWU6ICdQMSBSb2NrJywgc2NvcmU6IDB9XG4gbGV0IHAyID0ge2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogYm9hcmQud2lkdGgtMjAsIGR4OiAwLCBkeTogMCwgbmFtZTogJ1AyJywgc2NvcmU6IDB9XG4gbGV0IGJhbGwgPSB7Y29sb3VyOiAnI0NFRkYzMycsd2lkdGg6IDEwLGhlaWdodDogMTAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC8yLCBkeDogOCwgZHk6IC04LCBuYW1lOiAnQmFsbCd9O1xuXG4gbGV0IHRpbWVySWQgPSBzZXRJbnRlcnZhbChkcmF3LCAxMDApXG4vLyBSZW5kZXIgZWxlbWVudHMuXG4gIGxldCBjb29yZFRpbWVySWRcbiAgaWYoc29ja2V0LmdhbWUucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKXtcbiAgICBjb29yZFRpbWVySWQgPSBzZXRJbnRlcnZhbChjYWxjQmFsbFBvcywgMTAwKVxuICB9XG5cblxuICBmdW5jdGlvbiBkcmF3KCkge1xuICAgIC8vcmVkcmF3IGNhbnZhcyBmaXJzdCBcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDYwMCwgMzAwKVxuICAgIGNoZWNrV2luKClcbiAgICBkcmF3QmFsbCgpXG4gICAgZHJhd1BhZGRsZShwMilcbiAgICBkcmF3UGFkZGxlKHAxKVxuICB9XG4gIGZ1bmN0aW9uIGNoZWNrV2luKCl7XG4gICAgaWYocDEuc2NvcmU8NiAmJiBwMi5zY29yZTw2KXtcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgbGV0IHdpbm5lclxuICAgIGlmIChwMS5zY29yZT41KXtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllck9uZVxuICAgIH0gXG4gICAgaWYocDIuc2NvcmU+NSkge1xuICAgICAgd2lubmVyID0gc29ja2V0LmdhbWUucGxheWVyVHdvXG4gICAgfVxuICAgIFxuICAgIHNvY2tldC5lbWl0KCdlbmRHYW1lJywge3dpblRleHQ6IHdpbm5lcisgJyAgV09OIFRIRSBHQU1FJywgZ2FtZTogc29ja2V0LmdhbWUuaWR9KVxuICAgIGNsZWFySW50ZXJ2YWwodGltZXJJZCkgIFxuICAgIGlmKGNvb3JkVGltZXJJZCl7XG4gICAgICBjbGVhckludGVydmFsKGNvb3JkVGltZXJJZClcbiAgICB9ICAgXG4gICAgICAvLyBhc2sgaWYgcGxheSBhZ2FpbiwgaWYgYm90aCBzYXkgeWVzLCBydW4gZ2FtZVJvdW50aW5lLCBlbHNlIHJldHVybiB0byBsb2JieS4gXG4gIH1cbiAgc29ja2V0Lm9uKCd3aW5uZXInLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRyYXdTY29yZShkYXRhLndpblRleHQpXG4gIH0pXG5cbiAgZnVuY3Rpb24gY2FsY0JhbGxQb3MoKSB7XG4gICAgICBsZXQgcmVzZXRCYWxsIFxuICAgICAgaWYoYmFsbC54ID4gYm9hcmQud2lkdGgpe1xuICAgICAgICBwMS5zY29yZSsrXG4gICAgICAgIGRyYXdTY29yZSgpXG4gICAgICAgIC8vIGJhbGwueCA9IGJvYXJkLndpZHRoLzJcbiAgICAgICAgLy8gYmFsbC55ID0gYm9hcmQuaGVpZ2h0LzJcbiAgICAgICAgcmVzZXRCYWxsID0gdHJ1ZVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmFsbDogeCcrYmFsbC55ICsgJyB5JytiYWxsLngpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwMi54OicrcDIueCsnIHk6ICcrcDIueSlcblxuICAgICAgfVxuICAgICAgaWYoYmFsbC54IDwgMCl7XG4gICAgICAgIHAyLnNjb3JlKytcbiAgICAgICAgZHJhd1Njb3JlKClcbiAgICAgICAgLy8gYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICAvLyBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgICByZXNldEJhbGwgPSB0cnVlXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYWxsOiB4JytiYWxsLnkgKyAnIHknK2JhbGwueClcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3AxLng6JytwMS54KycgeTogJytwMS55KVxuICAgICAgfVxuXG4gICAgICBpZihiYWxsLnkgPiBib2FyZC5oZWlnaHQgfHwgYmFsbC55IDwgMCl7XG4gICAgICAgIGJhbGwuZHkgPSAtYmFsbC5keVxuICAgICAgfVxuXG4gICBcbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoLzIgPiBwMS54ICAmJiBcbiAgICAgICAgYmFsbC54IDwgcDEueCtwMS53aWR0aCYmIFxuICAgICAgICBiYWxsLnkrYmFsbC5oZWlnaHQ+cDEueSYmIFxuICAgICAgICBiYWxsLnk8cDEueStwMS5oZWlnaHQpe1xuXG4gICAgICAgIGJhbGwuZHggPSAtYmFsbC5keDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2JhbGw6IHgnK2JhbGwueSArICcgeScrYmFsbC54KVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncDFISVQueDonK3AxLngrJyB5OiAnK3AxLnkpIFxuICAgICAgfVxuXG4gICAgICBpZihiYWxsLngrYmFsbC53aWR0aC8yID4gcDIueCAmJiBcbiAgICAgICAgYmFsbC54IDwgcDIueCtwMi53aWR0aCAmJlxuICAgICAgICAgYmFsbC55K2JhbGwuaGVpZ2h0PnAyLnkgJiYgXG4gICAgICAgICBiYWxsLnk8cDIueStwMi5oZWlnaHQpe1xuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdiYWxsOiB4JytiYWxsLnggKyAnIHknK2JhbGwueSlcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3AySElULng6JytwMi54KycgeTogJytwMi55KSAgXG4gICAgICAgIGJhbGwuZHggPSAtYmFsbC5keCAgICAgXG4gICAgICAgfVxuICAgICAvLyBjb25zb2xlLmxvZygnc2VuZEJhbGwgcG9zaXRpb24nKVxuICAgICBzb2NrZXQuZW1pdCgnc2VuZEJhbGxQb3MnLCB7ZHg6IGJhbGwuZHgsIGR5OiBiYWxsLmR5LCBnYW1lOnNvY2tldC5nYW1lLmlkLCBzaG91bGRSZXNldDogcmVzZXRCYWxsfSlcbiAgXG5cbiAgfSAgIFxuICAvL3doZW4gYmFsbCBpcyBzY29yZWQsIHRoZSBiYWxsLnggYW5kIGJhbGwueSBpcyBub3QgcmVzZXQgdG8gaGFsZndheSBzbyBnZXRCYWxsUG9zIGp1c3QgY29udGludWVzLi4uIG1heWJlIGluY2x1ZGUgZmxhZyBpbiBzZW5kQmFsbHBvcy9nZXRCYWxsUG9zP1xuICBzb2NrZXQub24oJ2dldEJhbGxQb3MnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgaWYoZGF0YS5zaG91bGRSZXNldCA9PSB0cnVlKXtcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgICByZXNldEJhbGwgPSBmYWxzZVxuICAgICAgfWVsc2V7XG4gICAgICBiYWxsLnkgKz0gZGF0YS5keVxuICAgICAgYmFsbC54ICs9IGRhdGEuZHhcbiAgICB9XG4gICAgICAvLyBjb25zb2xlLmxvZygnR0VUVGluZyBCQUxMIERBVEEnLGRhdGEpXG4gIH0pXG5cbiAgZnVuY3Rpb24gZHJhd0JhbGwoKSB7ICBcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBiYWxsLmNvbG91cjtcbiAgICAgIGN0eC5maWxsUmVjdChiYWxsLngsIGJhbGwueSwgYmFsbC53aWR0aCwgYmFsbC5oZWlnaHQpOyAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdQYWRkbGUocGFkZGxlKSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IHBhZGRsZS5jb2xvdXI7XG4gICAgY3R4LmZpbGxSZWN0KHBhZGRsZS54LCBwYWRkbGUueSwgcGFkZGxlLndpZHRoLCBwYWRkbGUuaGVpZ2h0KTtcbiAgfVxuICBmdW5jdGlvbiBkcmF3U2NvcmUodGV4dCkge1xuICAgIGxldCBzY29yZVN0clxuICAgIGlmKHRleHQpe1xuICAgICAgc2NvcmVTdHIgPSAgdGV4dFxuICAgIH1lbHNle1xuICAgICAgc2NvcmVTdHIgPSBzb2NrZXQuZ2FtZS5wbGF5ZXJPbmUrJzonICtwMS5zY29yZSArJyAgJytzb2NrZXQuZ2FtZS5wbGF5ZXJUd28rJzonKyBwMi5zY29yZVxuICAgIH1cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NvcmVzJykuaW5uZXJIVE1MID0gc2NvcmVTdHJcbiAgfVxuXG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBpZihwcmVzcy5rZXk9PSd4JyB8fCBwcmVzcy5jb2RlID09ICdrZXlYJyl7XG4gICAgICAgIHBsYXllci55Kz0gMjBcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKVxuICAgICB9XG4gICAgIGlmKHByZXNzLmtleT09J3MnIHx8IHByZXNzLmNvZGUgPT0gJ2tleVMnKXtcbiAgICAgICAgcGxheWVyLnktPSAyMCBcbiAgICAgICAgLy8gY29uc29sZS5sb2cocHJlc3Mua2V5ICsnICAnK0pTT04uc3RyaW5naWZ5KHBsYXllcikpIFxuICAgICB9XG4gICAgIGlmKHBsYXllci55IDwgMCl7XG4gICAgICAgIHBsYXllci55ID0gMFxuICAgICB9IFxuICAgICBpZihwbGF5ZXIueSArIHBsYXllci5oZWlnaHQgPiBib2FyZC5oZWlnaHQpe1xuICAgICAgICBwbGF5ZXIueSA9IGJvYXJkLmhlaWdodCAtIHBsYXllci5oZWlnaHRcbiAgICAgfVxuICAgICBzZW5kTW92ZSh7aWQ6Z2FtZURhdGEuaWQsIG1vdmVtZW50OiBwbGF5ZXIueX0pXG4gIH1cblxuICBmdW5jdGlvbiBzZW5kTW92ZShkYXRhKSB7IFxuICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIGRhdGEpXG4gIH1cblxuICBzb2NrZXQub24oJ2dldE1vdmUnLCBmdW5jdGlvbiAob3Bwb25lbnQpIHtcbiAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICBwMi55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9ZWxzZXtcbiAgICAgIHAxLnkgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1cbiAgfSlcblxufVxuIl19
