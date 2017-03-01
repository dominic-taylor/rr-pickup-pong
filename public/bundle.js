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

  document.getElementById('gameList').remove() //remove from Dom?
  document.getElementById('lobby').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  // console.log('socket.game: '+JSON.stringify(socket.game))
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
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 2, dy: -2, name: 'Ball'};
 let drawId = setInterval(draw, 10)
// Render elements.
  function draw() {
    //redraw canvas first 
    ctx.clearRect(0, 0, 600, 300)
    drawBall()
    drawPaddle(p1)
    drawPaddle(p2)
    checkWin()
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
      clearInterval(drawId)
      drawScore(winner+' WON THE GAME')
      // ask if play again, if both say yes, run gameRountine, else return to lobby. 
  }
  function drawBall() {
      let diff = 5

      if(ball.x > board.width){
        p1.score++
        drawScore()
        ball.x = board.width/2
        ball.y = board.height/2
      }
      if(ball.x < 0){
        p2.score++
        drawScore()
        ball.x = board.width/2
        ball.y = board.height/2
      }

      if(ball.y > board.height || ball.y < 0){
        ball.dy = -ball.dy
      }

   
      if(ball.x+ball.width/2 > p1.x +p2.width
        && ball.x < p1.x+p1.width 
        && ball.y+ball.height>p1.y 
        && ball.y<p1.y+p1.height){
        ball.dx = -ball.dx;
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p2.x:'+p1.x+' y: '+p1.y) 
      }

      if(ball.x+ball.width/2 > p2.x && ball.x < p2.x+p2.width && ball.y+ball.height>p2.y && ball.y<p2.y+p2.height){
        // console.log('ball: x'+ball.y + ' y'+ball.x)
        // console.log('p2.x:'+p2.x+' y: '+p2.y)  
        ball.dx = -ball.dx     
       }

      ball.y += ball.dy
      ball.x += ball.dx
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
        // console.log(player+' pressed x')
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.y-= 20 
        // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed s')
   
     }
     if(player.y < 0){
        player.y = 0
     } 
     if(player.y + player.height > board.height){
        player.y = board.height - player.height
     }
     sendMove({id:gameData.id, movement: player.y})
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
    if (gameData.playerOneId == socket.id) {
      p2.y = opponent.movement
    }else{
      p1.y = opponent.movement
    }
  })

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ3RpdGxlJylbMF0uY2xhc3NMaXN0LmFkZCgnaGlkZScpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBsZXQgZ2FtZU1lc3NhZ2VzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVNZXNzYWdlcycpXG4gIGdhbWVNZXNzYWdlcy5hcHBlbmRDaGlsZChsaSlcbiAgZ2FtZU1lc3NhZ2VzLnNjcm9sbFRvcCA9IGdhbWVNZXNzYWdlcy5zY3JvbGxIZWlnaHRcbn1cblxuc29ja2V0Lm9uKCdjaGFsbGVuZ2UnLCBmdW5jdGlvbiAoY2hhbGxlbmdlKSB7XG4gIGxldCBsb2JieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpXG4gIGxldCBhY2NlcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBhY2NlcHQuaWQgPSAnYWNjZXB0J1xuICBhY2NlcHQuaW5uZXJIVE1MID0gXCJJJ20gUmVhZHkhXCJcbiAgc29ja2V0LmNoYWxsZW5nZSA9IGNoYWxsZW5nZVxuICBhY2NlcHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgc29ja2V0LmVtaXQoJ3JlYWR5R2FtZScsIHNvY2tldC5jaGFsbGVuZ2UpXG4gIH0pXG4gIGxvYmJ5Lmluc2VydEJlZm9yZShhY2NlcHQsbG9iYnkuY2hpbGROb2Rlc1sxXSlcblxuICBsb2coJ0NoYWxsZW5nZSBmcm9tICcrIGNoYWxsZW5nZS5jaGFsbGVuZ2VyKycuIFJlYWR5PycpXG59KVxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCByZWFkeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NlcHQnKTtcbiAgaWYgKHJlYWR5QnV0dG9uKSB7XG4gICAgcmVhZHlCdXR0b24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyZWFkeUJ1dHRvbik7XG4gIH1cbiAgc29ja2V0LmdhbWUgPSBkYXRhXG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIGNhbnZhcy53aWR0aCA9IDYwMFxuICBjYW52YXMuaGVpZ2h0ID0gMzAwXG5cbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWVMaXN0JykucmVtb3ZlKCkgLy9yZW1vdmUgZnJvbSBEb20/XG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIGdhbWVSb3V0aW5lKGNhbnZhcywgZGF0YSlcblxufVxuXG5mdW5jdGlvbiBnYW1lUm91dGluZShib2FyZCwgZ2FtZURhdGEpIHtcbiAgLy8gY29uc29sZS5sb2coJ3NvY2tldC5nYW1lOiAnK0pTT04uc3RyaW5naWZ5KHNvY2tldC5nYW1lKSlcbiAgbGV0IHNjb3JlcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gIHNjb3Jlcy5pZCA9ICdzY29yZXMnXG4gIHNjb3Jlcy5pbm5lckhUTUwgPSAgc29ja2V0LmdhbWUucGxheWVyT25lKyc6IDAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOiAwJ1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChzY29yZXMpXG4gIGxldCBjdHggPSBib2FyZC5nZXRDb250ZXh0KCcyZCcpXG4gXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDEpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllclR3b0lkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgbW92ZUhhbmRsZXIoZSwgcDIpXG4gICAgICAgIH1cbiAgfSwgZmFsc2UpXG5cbiBsZXQgcDEgPSB7Y29sb3VyOicjMDVFRkZGJyx3aWR0aDogMTAsaGVpZ2h0OiA2MCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IDEwLCBkeDogMCwgZHk6IDAsbmFtZTogJ1AxIFJvY2snLCBzY29yZTogMH1cbiBsZXQgcDIgPSB7Y29sb3VyOiAnI0ZGQzMwMCcsd2lkdGg6IDEwLGhlaWdodDogNjAsIHk6IGJvYXJkLmhlaWdodC8yLCB4OiBib2FyZC53aWR0aC0yMCwgZHg6IDAsIGR5OiAwLCBuYW1lOiAnUDInLCBzY29yZTogMH1cbiBsZXQgYmFsbCA9IHtjb2xvdXI6ICcjQ0VGRjMzJyx3aWR0aDogMTAsaGVpZ2h0OiAxMCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IGJvYXJkLndpZHRoLzIsIGR4OiAyLCBkeTogLTIsIG5hbWU6ICdCYWxsJ307XG4gbGV0IGRyYXdJZCA9IHNldEludGVydmFsKGRyYXcsIDEwKVxuLy8gUmVuZGVyIGVsZW1lbnRzLlxuICBmdW5jdGlvbiBkcmF3KCkge1xuICAgIC8vcmVkcmF3IGNhbnZhcyBmaXJzdCBcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDYwMCwgMzAwKVxuICAgIGRyYXdCYWxsKClcbiAgICBkcmF3UGFkZGxlKHAxKVxuICAgIGRyYXdQYWRkbGUocDIpXG4gICAgY2hlY2tXaW4oKVxuICB9XG4gIGZ1bmN0aW9uIGNoZWNrV2luKCl7XG4gICAgaWYocDEuc2NvcmU8NiAmJiBwMi5zY29yZTw2KXtcbiAgICAgIHJldHVybiBcbiAgICB9XG4gICAgbGV0IHdpbm5lclxuICAgIGlmIChwMS5zY29yZT41KXtcbiAgICAgIHdpbm5lciA9IHNvY2tldC5nYW1lLnBsYXllck9uZVxuICAgIH0gXG4gICAgaWYocDIuc2NvcmU+NSkge1xuICAgICAgd2lubmVyID0gc29ja2V0LmdhbWUucGxheWVyVHdvXG4gICAgfVxuICAgICAgY2xlYXJJbnRlcnZhbChkcmF3SWQpXG4gICAgICBkcmF3U2NvcmUod2lubmVyKycgV09OIFRIRSBHQU1FJylcbiAgICAgIC8vIGFzayBpZiBwbGF5IGFnYWluLCBpZiBib3RoIHNheSB5ZXMsIHJ1biBnYW1lUm91bnRpbmUsIGVsc2UgcmV0dXJuIHRvIGxvYmJ5LiBcbiAgfVxuICBmdW5jdGlvbiBkcmF3QmFsbCgpIHtcbiAgICAgIGxldCBkaWZmID0gNVxuXG4gICAgICBpZihiYWxsLnggPiBib2FyZC53aWR0aCl7XG4gICAgICAgIHAxLnNjb3JlKytcbiAgICAgICAgZHJhd1Njb3JlKClcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgfVxuICAgICAgaWYoYmFsbC54IDwgMCl7XG4gICAgICAgIHAyLnNjb3JlKytcbiAgICAgICAgZHJhd1Njb3JlKClcbiAgICAgICAgYmFsbC54ID0gYm9hcmQud2lkdGgvMlxuICAgICAgICBiYWxsLnkgPSBib2FyZC5oZWlnaHQvMlxuICAgICAgfVxuXG4gICAgICBpZihiYWxsLnkgPiBib2FyZC5oZWlnaHQgfHwgYmFsbC55IDwgMCl7XG4gICAgICAgIGJhbGwuZHkgPSAtYmFsbC5keVxuICAgICAgfVxuXG4gICBcbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoLzIgPiBwMS54ICtwMi53aWR0aFxuICAgICAgICAmJiBiYWxsLnggPCBwMS54K3AxLndpZHRoIFxuICAgICAgICAmJiBiYWxsLnkrYmFsbC5oZWlnaHQ+cDEueSBcbiAgICAgICAgJiYgYmFsbC55PHAxLnkrcDEuaGVpZ2h0KXtcbiAgICAgICAgYmFsbC5keCA9IC1iYWxsLmR4O1xuICAgICAgICAvLyBjb25zb2xlLmxvZygnYmFsbDogeCcrYmFsbC55ICsgJyB5JytiYWxsLngpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdwMi54OicrcDEueCsnIHk6ICcrcDEueSkgXG4gICAgICB9XG5cbiAgICAgIGlmKGJhbGwueCtiYWxsLndpZHRoLzIgPiBwMi54ICYmIGJhbGwueCA8IHAyLngrcDIud2lkdGggJiYgYmFsbC55K2JhbGwuaGVpZ2h0PnAyLnkgJiYgYmFsbC55PHAyLnkrcDIuaGVpZ2h0KXtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2JhbGw6IHgnK2JhbGwueSArICcgeScrYmFsbC54KVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncDIueDonK3AyLngrJyB5OiAnK3AyLnkpICBcbiAgICAgICAgYmFsbC5keCA9IC1iYWxsLmR4ICAgICBcbiAgICAgICB9XG5cbiAgICAgIGJhbGwueSArPSBiYWxsLmR5XG4gICAgICBiYWxsLnggKz0gYmFsbC5keFxuICAgICAgY3R4LmZpbGxTdHlsZSA9IGJhbGwuY29sb3VyO1xuICAgICAgY3R4LmZpbGxSZWN0KGJhbGwueCwgYmFsbC55LCBiYWxsLndpZHRoLCBiYWxsLmhlaWdodCk7ICAgIFxuICB9XG5cbiAgZnVuY3Rpb24gZHJhd1BhZGRsZShwYWRkbGUpIHtcbiAgICBjdHguZmlsbFN0eWxlID0gcGFkZGxlLmNvbG91cjtcbiAgICBjdHguZmlsbFJlY3QocGFkZGxlLngsIHBhZGRsZS55LCBwYWRkbGUud2lkdGgsIHBhZGRsZS5oZWlnaHQpO1xuICB9XG4gIGZ1bmN0aW9uIGRyYXdTY29yZSh0ZXh0KSB7XG4gICAgbGV0IHNjb3JlU3RyXG4gICAgaWYodGV4dCl7XG4gICAgICBzY29yZVN0ciA9ICB0ZXh0XG4gICAgfWVsc2V7XG4gICAgICBzY29yZVN0ciA9IHNvY2tldC5nYW1lLnBsYXllck9uZSsnOicgK3AxLnNjb3JlICsnICAnK3NvY2tldC5nYW1lLnBsYXllclR3bysnOicrIHAyLnNjb3JlXG4gICAgfVxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY29yZXMnKS5pbm5lckhUTUwgPSBzY29yZVN0clxuICB9XG5cblxuICBmdW5jdGlvbiBtb3ZlSGFuZGxlcihwcmVzcywgcGxheWVyKSB7XG4gICAgIGlmKHByZXNzLmtleT09J3gnIHx8IHByZXNzLmNvZGUgPT0gJ2tleVgnKXtcbiAgICAgICAgcGxheWVyLnkrPSAyMFxuICAgICAgICAgLy8gY29uc29sZS5sb2cocHJlc3Mua2V5ICsnICAnK0pTT04uc3RyaW5naWZ5KHBsYXllcikpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBsYXllcisnIHByZXNzZWQgeCcpXG4gICAgIH1cbiAgICAgaWYocHJlc3Mua2V5PT0ncycgfHwgcHJlc3MuY29kZSA9PSAna2V5Uycpe1xuICAgICAgICBwbGF5ZXIueS09IDIwIFxuICAgICAgICAvLyBjb25zb2xlLmxvZyhwcmVzcy5rZXkgKycgICcrSlNPTi5zdHJpbmdpZnkocGxheWVyKSlcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGxheWVyKycgcHJlc3NlZCBzJylcbiAgIFxuICAgICB9XG4gICAgIGlmKHBsYXllci55IDwgMCl7XG4gICAgICAgIHBsYXllci55ID0gMFxuICAgICB9IFxuICAgICBpZihwbGF5ZXIueSArIHBsYXllci5oZWlnaHQgPiBib2FyZC5oZWlnaHQpe1xuICAgICAgICBwbGF5ZXIueSA9IGJvYXJkLmhlaWdodCAtIHBsYXllci5oZWlnaHRcbiAgICAgfVxuICAgICBzZW5kTW92ZSh7aWQ6Z2FtZURhdGEuaWQsIG1vdmVtZW50OiBwbGF5ZXIueX0pXG4gICAgIC8vIGdldCBwcmVzcy5rZXkgYW5kIHBsYXllclxuICAgICAvLyBjaGVjayB3aGF0IGtleSB3YXMgcHJlc3NlZFxuICAgICAvLyBpZiB3IG9yIHNcbiAgICAgLy8gICAgY2hhbmdlIGNvZGUgb2YgdGhhdCBwbGF5ZXIgc2hhcGVcbiAgICAgLy8gICAgcmVkcmF3XG4gICAgIC8vICAgIHNlbmQgdG8gc2VydmVyXG5cbiAgfVxuXG5cblxuICBmdW5jdGlvbiBzZW5kTW92ZShkYXRhKSB7IFxuICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIGRhdGEpXG4gIH1cblxuICBzb2NrZXQub24oJ2dldE1vdmUnLCBmdW5jdGlvbiAob3Bwb25lbnQpIHtcbiAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICBwMi55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9ZWxzZXtcbiAgICAgIHAxLnkgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1cbiAgfSlcblxufVxuIl19
