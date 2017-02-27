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
     

     if(press.key=='x' || press.code == 'keyX'){// && player is not at top of canvas
        player.top+= 5
         // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed x')
     }
     if(press.key=='s' || press.code == 'keyS'){
        player.top-= 5
        // console.log(press.key +'  '+JSON.stringify(player))
        // console.log(player+' pressed s')
   
     }
     if(player.top<=-5){
        player.top = -5
     } 
     if(player.top>=100){
        player.top = 100
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJjb25zdCBzb2NrZXQgPSBpbygpXG5cbmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdqb2luU2VydmVyJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgbGV0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmFtZUlucHV0JylcbiAgaWYoIW5hbWUudmFsdWUpe1xuICAgIHJldHVybiBsb2coJ1BsZWFzZSBlbnRlciBhIG5hbWUnKVxuICB9O1xuICBzb2NrZXQuZW1pdCgnam9pbkxvYmJ5JywgbmFtZS52YWx1ZSlcbiAgLy9kaXNhYmxlIGZ1cnRoZXIgZXZlbnRzIGZyb20gdGhpcyBidXR0b25cbn0pXG5cbnNvY2tldC5vbigncmVzSm9pbkxvYmJ5JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IG5hbWVOb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF0YSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3VzZXJOYW1lJykuYXBwZW5kQ2hpbGQobmFtZU5vZGUpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGxldCB0aGlzVXNlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmlubmVySFRNTFxuICBmb3IgKHZhciBpID0gMDsgaSA8IHVzZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYodXNlcnNbaV0ubmFtZSAhPSB0aGlzVXNlcil7XG4gICAgICB2YXIgbGlOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpXG4gICAgICB2YXIgZ2FtZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHVzZXJzW2ldLm5hbWUpXG4gICAgICBsaU5vZGUuYXBwZW5kQ2hpbGQoZ2FtZSlcbiAgICAgIGxpTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlcUdhbWUsIGZhbHNlKVxuICAgICAgZ2FtZUxpc3QuYXBwZW5kQ2hpbGQobGlOb2RlKVxuICAgIH1cbiAgfVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgc29ja2V0LmVtaXQoJ3JlcXVlc3RHYW1lJywgcGxheWVyKVxufVxuXG5zb2NrZXQub24oJ21lc3NhZ2UnLCBmdW5jdGlvbiAobWVzc2FnZSkge1xuICBsb2cobWVzc2FnZSlcbn0pXG5cbmZ1bmN0aW9uIGxvZyhtZXNzYWdlKSB7XG4gIGxldCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ0xJJylcbiAgbGkuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobWVzc2FnZSkpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTWVzc2FnZXMnKS5hcHBlbmRDaGlsZChsaSlcbn1cblxuc29ja2V0Lm9uKCdjaGFsbGVuZ2UnLCBmdW5jdGlvbiAoY2hhbGxlbmdlKSB7XG4gIGxldCBsb2JieSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdsb2JieScpXG4gIGxldCBhY2NlcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKVxuICBhY2NlcHQuaWQgPSAnYWNjZXB0J1xuICBhY2NlcHQuaW5uZXJIVE1MID0gXCJJJ20gUmVhZHkhXCJcbiAgc29ja2V0LmNoYWxsZW5nZSA9IGNoYWxsZW5nZVxuICBhY2NlcHQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoKSB7XG4gICAgc29ja2V0LmVtaXQoJ3JlYWR5R2FtZScsIHNvY2tldC5jaGFsbGVuZ2UpXG4gIH0pXG4gIGxvYmJ5Lmluc2VydEJlZm9yZShhY2NlcHQsbG9iYnkuY2hpbGROb2Rlc1sxXSlcblxuICBsb2coJ0NoYWxsZW5nZSBmcm9tICcrIGNoYWxsZW5nZS5jaGFsbGVuZ2VyKycuIFJlYWR5PycpXG59KVxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCByZWFkeUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdhY2NlcHQnKTtcbiAgaWYgKHJlYWR5QnV0dG9uKSB7XG4gICAgcmVhZHlCdXR0b24ucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChyZWFkeUJ1dHRvbik7XG4gIH1cbiAgc29ja2V0LmdhbWUgPSBkYXRhXG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIFxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoYm9hcmQsIGdhbWVEYXRhKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdzb2NrZXQuZ2FtZTogJytKU09OLnN0cmluZ2lmeShzb2NrZXQuZ2FtZSkpXG4gIGxldCBzaGFwZXMgPSBbXVxuICBsZXQgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dCgnMmQnKVxuICBsZXQgYm9hcmRMZWZ0ID0gYm9hcmQub2Zmc2V0TGVmdFxuICBsZXQgYm9hcmRUb3AgPSBib2FyZC5vZmZzZXRUb3BcblxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24oZSl7XG4gICAgICBzaGFwZXMuZm9yRWFjaChmdW5jdGlvbiAoc2hhcGUpIHtcbiAgICAgICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgICAgICAgIG1vdmVIYW5kbGVyKGUsIHNoYXBlc1swXSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZ2FtZURhdGEucGxheWVyVHdvSWQgPT0gc29ja2V0LmlkKSB7XG4gICAgICAgICAgICBtb3ZlSGFuZGxlcihlLCBzaGFwZXNbMV0pXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICB9LCBmYWxzZSlcbiAgLy9Ub3A6IGRpc3RhbmNlIGZyb20gdG9wIG9mIGNhbnZhc1xuICAvLyBMZWZ0OiBkaXN0YW5jZSBmcm9tIGxlZnQgb2YgY2FudmFzXG4gIC8vIEhlaWdodDogSGVpZ2h0IGluIGRpc3RjbmNlIGZyb20gVG9wXG4gIC8vIFdpZHRoOiBXaWR0aCBpbiBkaXN0YW5jZSBmcm9tIExlZnRcblxuICBzaGFwZXMucHVzaCh7Y29sb3VyOicjMDVFRkZGJyx3aWR0aDogNTAsaGVpZ2h0OiA1MCwgdG9wOiAyNSwgbGVmdDogMjUsIG5hbWU6ICdQMSBSb2NrJ30pXG4gIHNoYXBlcy5wdXNoKHtjb2xvdXI6ICcjRkZDMzAwJyx3aWR0aDogNTAsaGVpZ2h0OiA1MCwgdG9wOiAyNSwgbGVmdDogMTc1LCBuYW1lOiAnUDIgUGFwZXInfSlcbiAgc2hhcGVzLnB1c2goe2NvbG91cjogJyNDRUZGMzMnLHdpZHRoOiA1LGhlaWdodDogNSwgdG9wOiA3NSwgbGVmdDogMTI1LCBuYW1lOiAnQmFsbCd9KTtcbiAgZHJhdyhzaGFwZXMpXG5cbi8vIFJlbmRlciBlbGVtZW50cy5cbiAgZnVuY3Rpb24gZHJhdyhnYW1lT2JqZWN0cykge1xuICAgIC8vcmVkcmF3IGNhbnZhcyBmaXJzdCBcbiAgICBjdHguY2xlYXJSZWN0KDAsIDAsIDgwMCwgNDAwKVxuXG4gICAgZ2FtZU9iamVjdHMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICBjdHguZmlsbFN0eWxlID0gZWxlbWVudC5jb2xvdXI7XG4gICAgICBjdHguZmlsbFJlY3QoZWxlbWVudC5sZWZ0LCBlbGVtZW50LnRvcCwgZWxlbWVudC53aWR0aCwgZWxlbWVudC5oZWlnaHQpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZUhhbmRsZXIocHJlc3MsIHBsYXllcikge1xuICAgICBcblxuICAgICBpZihwcmVzcy5rZXk9PSd4JyB8fCBwcmVzcy5jb2RlID09ICdrZXlYJyl7Ly8gJiYgcGxheWVyIGlzIG5vdCBhdCB0b3Agb2YgY2FudmFzXG4gICAgICAgIHBsYXllci50b3ArPSA1XG4gICAgICAgICAvLyBjb25zb2xlLmxvZyhwcmVzcy5rZXkgKycgICcrSlNPTi5zdHJpbmdpZnkocGxheWVyKSlcbiAgICAgICAgLy8gY29uc29sZS5sb2cocGxheWVyKycgcHJlc3NlZCB4JylcbiAgICAgfVxuICAgICBpZihwcmVzcy5rZXk9PSdzJyB8fCBwcmVzcy5jb2RlID09ICdrZXlTJyl7XG4gICAgICAgIHBsYXllci50b3AtPSA1XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHByZXNzLmtleSArJyAgJytKU09OLnN0cmluZ2lmeShwbGF5ZXIpKVxuICAgICAgICAvLyBjb25zb2xlLmxvZyhwbGF5ZXIrJyBwcmVzc2VkIHMnKVxuICAgXG4gICAgIH1cbiAgICAgaWYocGxheWVyLnRvcDw9LTUpe1xuICAgICAgICBwbGF5ZXIudG9wID0gLTVcbiAgICAgfSBcbiAgICAgaWYocGxheWVyLnRvcD49MTAwKXtcbiAgICAgICAgcGxheWVyLnRvcCA9IDEwMFxuICAgICB9XG4gICAgIGRyYXcoc2hhcGVzKVxuICAgICBzZW5kTW92ZSh7aWQ6Z2FtZURhdGEuaWQsIG1vdmVtZW50OiBwbGF5ZXIudG9wfSlcbiAgICAgLy8gZ2V0IHByZXNzLmtleSBhbmQgcGxheWVyXG4gICAgIC8vIGNoZWNrIHdoYXQga2V5IHdhcyBwcmVzc2VkXG4gICAgIC8vIGlmIHcgb3Igc1xuICAgICAvLyAgICBjaGFuZ2UgY29kZSBvZiB0aGF0IHBsYXllciBzaGFwZVxuICAgICAvLyAgICByZWRyYXdcbiAgICAgLy8gICAgc2VuZCB0byBzZXJ2ZXJcblxuICB9XG5cbiAgZnVuY3Rpb24gc2VuZE1vdmUoZGF0YSkgeyBcbiAgICBzb2NrZXQuZW1pdCgnc2VuZE1vdmUnLCBkYXRhKVxuICB9XG5cbiAgc29ja2V0Lm9uKCdnZXRNb3ZlJywgZnVuY3Rpb24gKG9wcG9uZW50KSB7XG4gICAgY29uc29sZS5sb2cob3Bwb25lbnQpXG4gICAgaWYgKGdhbWVEYXRhLnBsYXllck9uZUlkID09IHNvY2tldC5pZCkge1xuICAgICAgc2hhcGVzWzFdLnRvcCA9IG9wcG9uZW50Lm1vdmVtZW50XG4gICAgfWVsc2V7XG4gICAgICBzaGFwZXNbMF0udG9wID0gb3Bwb25lbnQubW92ZW1lbnRcbiAgICB9XG4gICAgZHJhdyhzaGFwZXMpXG4gIH0pXG5cbn1cbiJdfQ==
