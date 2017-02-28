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
  canvas.width = 600
  canvas.height = 300
  
  document.getElementById('lobby').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  // console.log('socket.game: '+JSON.stringify(socket.game))
  let shapes = []
  let ctx = board.getContext('2d')
 
  document.addEventListener('keydown', function(e){
        if (gameData.playerOneId == socket.id) {
             moveHandler(e, p1)
        }
        if (gameData.playerTwoId == socket.id) {
            moveHandler(e, p2)
        }
  }, false)
  //Top: distance from top of canvas
  // x: distance from x of canvas
  // Height: Height in distcnce from Top
  // Width: Width in distance from x

 let p1 = {colour:'#05EFFF',width: 10,height: 60, y: board.height/2, x: 10, dx: 0, dy: 0,name: 'P1 Rock'}
 let p2 = {colour: '#FFC300',width: 10,height: 60, y: board.height/2, x: board.width-20, dx: 0, dy: 0, name: 'P2 Paper'}
 let ball = {colour: '#CEFF33',width: 10,height: 10, y: board.height/2, x: board.width/2, dx: 2, dy: -2, name: 'Ball'};
 setInterval(draw, 10)
// Render elements.
  function draw() {
    //redraw canvas first 
    ctx.clearRect(0, 0, 600, 300)
    drawBall()
    drawPaddle(p1)
    drawPaddle(p2)
  }
  function drawBall() {
      console.log(p2)
      let diff = 5

      if(ball.x > board.width || ball.x < 0){
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
        console.log('ball: x'+ball.y + ' y'+ball.x)
        console.log('p2.x:'+p1.x+' y: '+p1.y) 
      }

      if(ball.x+ball.width/2 > p2.x && ball.x < p2.x+p2.width && ball.y+ball.height>p2.y && ball.y<p2.y+p2.height){
        console.log('ball: x'+ball.y + ' y'+ball.x)
        console.log('p2.x:'+p2.x+' y: '+p2.y)  
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
    //draw(shapes)
  })

}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBzb2NrZXQgPSBpbygpXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luU2VydmVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgbGV0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZUlucHV0JylcbiAgaWYoIW5hbWUudmFsdWUpe1xuICAgIHJldHVybiBsb2coJ1BsZWFzZSBlbnRlciBhIG5hbWUnKVxuICB9O1xuICBzb2NrZXQuZW1pdCgnam9pbkxvYmJ5JywgbmFtZS52YWx1ZSlcbiAgLy9kaXNhYmxlIGZ1cnRoZXIgZXZlbnRzIGZyb20gdGhpcyBidXR0b25cbn0pXG5cbnNvY2tldC5vbigncmVzSm9pbkxvYmJ5JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IG5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuYXBwZW5kQ2hpbGQobmFtZU5vZGUpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGxldCB0aGlzVXNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmlubmVySFRNTFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYodXNlcnNbaV0ubmFtZSAhPSB0aGlzVXNlcil7XG4gICAgICB2YXIgbGlOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpXG4gICAgICB2YXIgZ2FtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVzZXJzW2ldLm5hbWUpXG4gICAgICBsaU5vZGUuYXBwZW5kQ2hpbGQoZ2FtZSlcbiAgICAgIGxpTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlcUdhbWUsIGZhbHNlKVxuICAgICAgZ2FtZUxpc3QuYXBwZW5kQ2hpbGQobGlOb2RlKVxuICAgIH1cbiAgfVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgc29ja2V0LmVtaXQoJ3JlcXVlc3RHYW1lJywgcGxheWVyKVxufVxuXG5zb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICBsb2cobWVzc2FnZSlcbn0pXG5cbmZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XG4gIGxldCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJylcbiAgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTWVzc2FnZXMnKS5hcHBlbmRDaGlsZChsaSlcbn1cblxuc29ja2V0Lm9uKCdjaGFsbGVuZ2UnLCBmdW5jdGlvbiAoY2hhbGxlbmdlKSB7XG4gIGxldCBsb2JieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpXG4gIGxldCBhY2NlcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBhY2NlcHQuaWQgPSAnYWNjZXB0J1xuICBhY2NlcHQuaW5uZXJIVE1MID0gXCJJJ20gUmVhZHkhXCJcbiAgc29ja2V0LmNoYWxsZW5nZSA9IGNoYWxsZW5nZVxuICBhY2NlcHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgc29ja2V0LmVtaXQoJ3JlYWR5R2FtZScsIHNvY2tldC5jaGFsbGVuZ2UpXG4gIH0pXG4gIGxvYmJ5Lmluc2VydEJlZm9yZShhY2NlcHQsbG9iYnkuY2hpbGROb2Rlc1sxXSlcblxuICBsb2coJ0NoYWxsZW5nZSBmcm9tICcrIGNoYWxsZW5nZS5jaGFsbGVuZ2VyKycuIFJlYWR5PycpXG59KVxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCByZWFkeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NlcHQnKTtcbiAgaWYgKHJlYWR5QnV0dG9uKSB7XG4gICAgcmVhZHlCdXR0b24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyZWFkeUJ1dHRvbik7XG4gIH1cbiAgc29ja2V0LmdhbWUgPSBkYXRhXG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIGNhbnZhcy53aWR0aCA9IDYwMFxuICBjYW52YXMuaGVpZ2h0ID0gMzAwXG4gIFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoYm9hcmQsIGdhbWVEYXRhKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdzb2NrZXQuZ2FtZTogJytKU09OLnN0cmluZ2lmeShzb2NrZXQuZ2FtZSkpXG4gIGxldCBzaGFwZXMgPSBbXVxuICBsZXQgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dCgnMmQnKVxuIFxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgICAgICBtb3ZlSGFuZGxlcihlLCBwMSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyVHdvSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICBtb3ZlSGFuZGxlcihlLCBwMilcbiAgICAgICAgfVxuICB9LCBmYWxzZSlcbiAgLy9Ub3A6IGRpc3RhbmNlIGZyb20gdG9wIG9mIGNhbnZhc1xuICAvLyB4OiBkaXN0YW5jZSBmcm9tIHggb2YgY2FudmFzXG4gIC8vIEhlaWdodDogSGVpZ2h0IGluIGRpc3RjbmNlIGZyb20gVG9wXG4gIC8vIFdpZHRoOiBXaWR0aCBpbiBkaXN0YW5jZSBmcm9tIHhcblxuIGxldCBwMSA9IHtjb2xvdXI6JyMwNUVGRkYnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogMTAsIGR4OiAwLCBkeTogMCxuYW1lOiAnUDEgUm9jayd9XG4gbGV0IHAyID0ge2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiAxMCxoZWlnaHQ6IDYwLCB5OiBib2FyZC5oZWlnaHQvMiwgeDogYm9hcmQud2lkdGgtMjAsIGR4OiAwLCBkeTogMCwgbmFtZTogJ1AyIFBhcGVyJ31cbiBsZXQgYmFsbCA9IHtjb2xvdXI6ICcjQ0VGRjMzJyx3aWR0aDogMTAsaGVpZ2h0OiAxMCwgeTogYm9hcmQuaGVpZ2h0LzIsIHg6IGJvYXJkLndpZHRoLzIsIGR4OiAyLCBkeTogLTIsIG5hbWU6ICdCYWxsJ307XG4gc2V0SW50ZXJ2YWwoZHJhdywgMTApXG4vLyBSZW5kZXIgZWxlbWVudHMuXG4gIGZ1bmN0aW9uIGRyYXcoKSB7XG4gICAgLy9yZWRyYXcgY2FudmFzIGZpcnN0IFxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgNjAwLCAzMDApXG4gICAgZHJhd0JhbGwoKVxuICAgIGRyYXdQYWRkbGUocDEpXG4gICAgZHJhd1BhZGRsZShwMilcbiAgfVxuICBmdW5jdGlvbiBkcmF3QmFsbCgpIHtcbiAgICAgIGNvbnNvbGUubG9nKHAyKVxuICAgICAgbGV0IGRpZmYgPSA1XG5cbiAgICAgIGlmKGJhbGwueCA+IGJvYXJkLndpZHRoIHx8IGJhbGwueCA8IDApe1xuICAgICAgICBiYWxsLnggPSBib2FyZC53aWR0aC8yXG4gICAgICAgIGJhbGwueSA9IGJvYXJkLmhlaWdodC8yXG4gICAgICB9XG5cbiAgICAgIGlmKGJhbGwueSA+IGJvYXJkLmhlaWdodCB8fCBiYWxsLnkgPCAwKXtcbiAgICAgICAgYmFsbC5keSA9IC1iYWxsLmR5XG4gICAgICB9XG5cbiAgIFxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAxLnggK3AyLndpZHRoXG4gICAgICAgICYmIGJhbGwueCA8IHAxLngrcDEud2lkdGggXG4gICAgICAgICYmIGJhbGwueStiYWxsLmhlaWdodD5wMS55IFxuICAgICAgICAmJiBiYWxsLnk8cDEueStwMS5oZWlnaHQpe1xuICAgICAgICBiYWxsLmR4ID0gLWJhbGwuZHg7XG4gICAgICAgIGNvbnNvbGUubG9nKCdiYWxsOiB4JytiYWxsLnkgKyAnIHknK2JhbGwueClcbiAgICAgICAgY29uc29sZS5sb2coJ3AyLng6JytwMS54KycgeTogJytwMS55KSBcbiAgICAgIH1cblxuICAgICAgaWYoYmFsbC54K2JhbGwud2lkdGgvMiA+IHAyLnggJiYgYmFsbC54IDwgcDIueCtwMi53aWR0aCAmJiBiYWxsLnkrYmFsbC5oZWlnaHQ+cDIueSAmJiBiYWxsLnk8cDIueStwMi5oZWlnaHQpe1xuICAgICAgICBjb25zb2xlLmxvZygnYmFsbDogeCcrYmFsbC55ICsgJyB5JytiYWxsLngpXG4gICAgICAgIGNvbnNvbGUubG9nKCdwMi54OicrcDIueCsnIHk6ICcrcDIueSkgIFxuICAgICAgICBiYWxsLmR4ID0gLWJhbGwuZHggICAgIFxuICAgICAgIH1cblxuICAgICAgYmFsbC55ICs9IGJhbGwuZHlcbiAgICAgIGJhbGwueCArPSBiYWxsLmR4XG4gICAgICBjdHguZmlsbFN0eWxlID0gYmFsbC5jb2xvdXI7XG4gICAgICBjdHguZmlsbFJlY3QoYmFsbC54LCBiYWxsLnksIGJhbGwud2lkdGgsIGJhbGwuaGVpZ2h0KTsgICAgXG4gIH1cblxuICBmdW5jdGlvbiBkcmF3UGFkZGxlKHBhZGRsZSkge1xuICAgICAgICBjdHguZmlsbFN0eWxlID0gcGFkZGxlLmNvbG91cjtcbiAgICAgICAgY3R4LmZpbGxSZWN0KHBhZGRsZS54LCBwYWRkbGUueSwgcGFkZGxlLndpZHRoLCBwYWRkbGUuaGVpZ2h0KTtcbiAgfVxuXG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBpZihwcmVzcy5rZXk9PSd4JyB8fCBwcmVzcy5jb2RlID09ICdrZXlYJyl7XG4gICAgICAgIHBsYXllci55Kz0gMjBcbiAgICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhwbGF5ZXIrJyBwcmVzc2VkIHgnKVxuICAgICB9XG4gICAgIGlmKHByZXNzLmtleT09J3MnIHx8IHByZXNzLmNvZGUgPT0gJ2tleVMnKXtcbiAgICAgICAgcGxheWVyLnktPSAyMCBcbiAgICAgICAgLy8gY29uc29sZS5sb2cocHJlc3Mua2V5ICsnICAnK0pTT04uc3RyaW5naWZ5KHBsYXllcikpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBsYXllcisnIHByZXNzZWQgcycpXG4gICBcbiAgICAgfVxuICAgICBpZihwbGF5ZXIueSA8IDApe1xuICAgICAgICBwbGF5ZXIueSA9IDBcbiAgICAgfSBcbiAgICAgaWYocGxheWVyLnkgKyBwbGF5ZXIuaGVpZ2h0ID4gYm9hcmQuaGVpZ2h0KXtcbiAgICAgICAgcGxheWVyLnkgPSBib2FyZC5oZWlnaHQgLSBwbGF5ZXIuaGVpZ2h0XG4gICAgIH1cbiAgICAgc2VuZE1vdmUoe2lkOmdhbWVEYXRhLmlkLCBtb3ZlbWVudDogcGxheWVyLnl9KVxuICAgICAvLyBnZXQgcHJlc3Mua2V5IGFuZCBwbGF5ZXJcbiAgICAgLy8gY2hlY2sgd2hhdCBrZXkgd2FzIHByZXNzZWRcbiAgICAgLy8gaWYgdyBvciBzXG4gICAgIC8vICAgIGNoYW5nZSBjb2RlIG9mIHRoYXQgcGxheWVyIHNoYXBlXG4gICAgIC8vICAgIHJlZHJhd1xuICAgICAvLyAgICBzZW5kIHRvIHNlcnZlclxuXG4gIH1cblxuXG5cbiAgZnVuY3Rpb24gc2VuZE1vdmUoZGF0YSkgeyBcbiAgICBzb2NrZXQuZW1pdCgnc2VuZE1vdmUnLCBkYXRhKVxuICB9XG5cbiAgc29ja2V0Lm9uKCdnZXRNb3ZlJywgZnVuY3Rpb24gKG9wcG9uZW50KSB7XG4gICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgcDIueSA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfWVsc2V7XG4gICAgICBwMS55ID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9XG4gICAgLy9kcmF3KHNoYXBlcylcbiAgfSlcblxufVxuIl19
