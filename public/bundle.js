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
     if(press.key=='x' || press.code == 'keyX'){
        player.top+= 5
        // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed x')
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.top-= 5
        // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed s')
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJykuYXBwZW5kQ2hpbGQobGkpXG59XG5cbnNvY2tldC5vbignY2hhbGxlbmdlJywgZnVuY3Rpb24gKGNoYWxsZW5nZSkge1xuICBsZXQgbG9iYnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKVxuICBsZXQgYWNjZXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgYWNjZXB0LmlkID0gJ2FjY2VwdCdcbiAgYWNjZXB0LmlubmVySFRNTCA9IFwiSSdtIFJlYWR5IVwiXG4gIHNvY2tldC5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2VcbiAgYWNjZXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHNvY2tldC5lbWl0KCdyZWFkeUdhbWUnLCBzb2NrZXQuY2hhbGxlbmdlKVxuICB9KVxuICBsb2JieS5pbnNlcnRCZWZvcmUoYWNjZXB0LGxvYmJ5LmNoaWxkTm9kZXNbMV0pXG5cbiAgbG9nKCdDaGFsbGVuZ2UgZnJvbSAnKyBjaGFsbGVuZ2UuY2hhbGxlbmdlcisnLiBSZWFkeT8nKVxufSlcblxuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgcmVhZHlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWNjZXB0Jyk7XG4gIGlmIChyZWFkeUJ1dHRvbikge1xuICAgIHJlYWR5QnV0dG9uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocmVhZHlCdXR0b24pO1xuICB9XG4gIHNvY2tldC5nYW1lID0gZGF0YVxuICBsb2coJ0dhbWUgYmV0d2VlbiAnK2RhdGEucGxheWVyT25lKycgYW5kICcrIGRhdGEucGxheWVyVHdvKydpcyBvbiEnICk7XG4gIHN0YXJ0R2FtZShkYXRhKVxufSlcblxuZnVuY3Rpb24gc3RhcnRHYW1lKGRhdGEpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMuaWQgPSAnY2FudmFzJ1xuICBcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JykuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgZ2FtZVJvdXRpbmUoY2FudmFzLCBkYXRhKVxuXG59XG5cbmZ1bmN0aW9uIGdhbWVSb3V0aW5lKGJvYXJkLCBnYW1lRGF0YSkge1xuICAvLyBjb25zb2xlLmxvZygnc29ja2V0LmdhbWU6ICcrSlNPTi5zdHJpbmdpZnkoc29ja2V0LmdhbWUpKVxuICBsZXQgc2hhcGVzID0gW11cbiAgbGV0IGN0eCA9IGJvYXJkLmdldENvbnRleHQoJzJkJylcbiAgbGV0IGJvYXJkTGVmdCA9IGJvYXJkLm9mZnNldExlZnRcbiAgbGV0IGJvYXJkVG9wID0gYm9hcmQub2Zmc2V0VG9wXG5cbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGZ1bmN0aW9uKGUpe1xuICAgICAgc2hhcGVzLmZvckVhY2goZnVuY3Rpb24gKHNoYXBlKSB7XG4gICAgICAgIGlmIChnYW1lRGF0YS5wbGF5ZXJPbmVJZCA9PSBzb2NrZXQuaWQpIHtcbiAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHNoYXBlc1swXSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyVHdvSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICBtb3ZlSGFuZGxlcihlLCBzaGFwZXNbMV0pXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9LCBmYWxzZSlcbiAgLy9Ub3A6IGRpc3RhbmNlIGZyb20gdG9wIG9mIGNhbnZhc1xuICAvLyBMZWZ0OiBkaXN0YW5jZSBmcm9tIGxlZnQgb2YgY2FudmFzXG4gIC8vIEhlaWdodDogSGVpZ2h0IGluIGRpc3RjbmNlIGZyb20gVG9wXG4gIC8vIFdpZHRoOiBXaWR0aCBpbiBkaXN0YW5jZSBmcm9tIExlZnRcblxuXG4gIHNoYXBlcy5wdXNoKHtjb2xvdXI6JyMwNUVGRkYnLHdpZHRoOiA1MCxoZWlnaHQ6IDUwLCB0b3A6IDI1LCBsZWZ0OiAyNSwgbmFtZTogJ1AxIFJvY2snfSlcbiAgc2hhcGVzLnB1c2goe2NvbG91cjogJyNGRkMzMDAnLHdpZHRoOiA1MCxoZWlnaHQ6IDUwLCB0b3A6IDI1LCBsZWZ0OiAxNzUsIG5hbWU6ICdQMiBQYXBlcid9KVxuICBzaGFwZXMucHVzaCh7Y29sb3VyOiAnI0NFRkYzMycsd2lkdGg6IDUsaGVpZ2h0OiA1LCB0b3A6IDc1LCBsZWZ0OiAxMjUsIG5hbWU6ICdCYWxsJ30pO1xuICBkcmF3KHNoYXBlcylcblxuLy8gUmVuZGVyIGVsZW1lbnRzLlxuICBmdW5jdGlvbiBkcmF3KGdhbWVPYmplY3RzKSB7XG4gICAgLy9yZWRyYXcgY2FudmFzIGZpcnN0IFxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgODAwLCA0MDApXG5cbiAgICBnYW1lT2JqZWN0cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgIGN0eC5maWxsU3R5bGUgPSBlbGVtZW50LmNvbG91cjtcbiAgICAgIGN0eC5maWxsUmVjdChlbGVtZW50LmxlZnQsIGVsZW1lbnQudG9wLCBlbGVtZW50LndpZHRoLCBlbGVtZW50LmhlaWdodCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlSGFuZGxlcihwcmVzcywgcGxheWVyKSB7XG4gICAgIGlmKHByZXNzLmtleT09J3gnIHx8IHByZXNzLmNvZGUgPT0gJ2tleVgnKXtcbiAgICAgICAgcGxheWVyLnRvcCs9IDVcbiAgICAgICAgLy8gY29uc29sZS5sb2cocHJlc3Mua2V5ICsnICAnK0pTT04uc3RyaW5naWZ5KHBsYXllcikpXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHBsYXllcisnIHByZXNzZWQgeCcpXG4gICAgIH1cbiAgICAgaWYocHJlc3Mua2V5PT0ncycgfHwgcHJlc3MuY29kZSA9PSAna2V5Uycpe1xuICAgICAgICBwbGF5ZXIudG9wLT0gNVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhwcmVzcy5rZXkgKycgICcrSlNPTi5zdHJpbmdpZnkocGxheWVyKSlcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGxheWVyKycgcHJlc3NlZCBzJylcbiAgICAgfVxuICAgICBcbiAgICAgZHJhdyhzaGFwZXMpXG4gICAgIHNlbmRNb3ZlKHtpZDpnYW1lRGF0YS5pZCwgbW92ZW1lbnQ6IHBsYXllci50b3B9KVxuICAgICAvLyBnZXQgcHJlc3Mua2V5IGFuZCBwbGF5ZXJcbiAgICAgLy8gY2hlY2sgd2hhdCBrZXkgd2FzIHByZXNzZWRcbiAgICAgLy8gaWYgdyBvciBzXG4gICAgIC8vICAgIGNoYW5nZSBjb2RlIG9mIHRoYXQgcGxheWVyIHNoYXBlXG4gICAgIC8vICAgIHJlZHJhd1xuICAgICAvLyAgICBzZW5kIHRvIHNlcnZlclxuXG4gIH1cblxuICBmdW5jdGlvbiBzZW5kTW92ZShkYXRhKSB7IFxuICAgIHNvY2tldC5lbWl0KCdzZW5kTW92ZScsIGRhdGEpXG4gIH1cblxuICBzb2NrZXQub24oJ2dldE1vdmUnLCBmdW5jdGlvbiAob3Bwb25lbnQpIHtcbiAgICBjb25zb2xlLmxvZyhvcHBvbmVudClcbiAgICBpZiAoZ2FtZURhdGEucGxheWVyT25lSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICBzaGFwZXNbMV0udG9wID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9ZWxzZXtcbiAgICAgIHNoYXBlc1swXS50b3AgPSBvcHBvbmVudC5tb3ZlbWVudFxuICAgIH1cbiAgICBkcmF3KHNoYXBlcylcbiAgfSlcblxufVxuIl19
