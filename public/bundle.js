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
  
  document.getElementById('game').appendChild(canvas);
  gameRoutine(canvas, data)

}

function gameRoutine(board, gameData) {
  // console.log('socket.game: '+JSON.stringify(socket.game))
  let shapes = []
  let ctx = board.getContext('2d')
  let boardLeft = board.offsetLeft
  let boardTop = board.offsetTop


  board.addEventListener('click', function(e){
    var x = e.pageX - boardLeft
    var y = e.pageY - boardTop
    console.log(x, y)
    // shapes.forEach(function (shape) {
    if (y > 50 && y < 150  && x > 50 && x < 150) {
      console.log('in the left shapre? ')
      // if (y > shape.top && y < shape.top + shape.height && x > shape.left && x < shape.left + shape.width) {
        // console.log('clicked a shape: '+ shape.name)  
        // console.log('shape.top', shape.top)  
        // console.log('shape.left', shape.left)  
        

      }
    })
  //}, false)

  shapes.push({colour:'#05EFFF',width: 50,height: 50, top: 25, left: 25, name: 'Rock'})
  shapes.push({colour: '#FFC300',width: 50,height: 50, top: 25, left: 175, name: 'Paper'})
  shapes.push({colour: '#CEFF33',width: 50,height: 50, top: 75, left: 125, name: 'Scissors'});
  

  // ctx.font = "15px Arial";
  // ctx.fillText("Paper",board.width/4, board.height/3);
  // ctx.fillText("Rock",board.width - board.width/4, board.height/3);
  // ctx.fillText("Scissors",board.width/2-30,125);

// Render elements.
shapes.forEach(function(element) {
    ctx.fillStyle = element.colour;
    ctx.fillRect(element.left, element.top, element.width, element.height);
});
  //retain coords of game options. 
  // if e.target.mouse coords are within a certain x/y of the options
  // then that option ios chosen and that event is emmited. 
 

}


},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBsZXQgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdMSScpXG4gIGxpLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKG1lc3NhZ2UpKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJykuYXBwZW5kQ2hpbGQobGkpXG59XG5cbnNvY2tldC5vbignY2hhbGxlbmdlJywgZnVuY3Rpb24gKGNoYWxsZW5nZSkge1xuICBsZXQgbG9iYnkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbG9iYnknKVxuICBsZXQgYWNjZXB0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJylcbiAgYWNjZXB0LmlkID0gJ2FjY2VwdCdcbiAgYWNjZXB0LmlubmVySFRNTCA9IFwiSSdtIFJlYWR5IVwiXG4gIHNvY2tldC5jaGFsbGVuZ2UgPSBjaGFsbGVuZ2VcbiAgYWNjZXB0LmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKCkge1xuICAgIHNvY2tldC5lbWl0KCdyZWFkeUdhbWUnLCBzb2NrZXQuY2hhbGxlbmdlKVxuICB9KVxuICBsb2JieS5pbnNlcnRCZWZvcmUoYWNjZXB0LGxvYmJ5LmNoaWxkTm9kZXNbMV0pXG5cbiAgbG9nKCdDaGFsbGVuZ2UgZnJvbSAnKyBjaGFsbGVuZ2UuY2hhbGxlbmdlcisnLiBSZWFkeT8nKVxufSlcblxuc29ja2V0Lm9uKCdzdGFydEdhbWUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgcmVhZHlCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYWNjZXB0Jyk7XG4gIGlmIChyZWFkeUJ1dHRvbikge1xuICAgIHJlYWR5QnV0dG9uLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQocmVhZHlCdXR0b24pO1xuICB9XG4gIHNvY2tldC5nYW1lID0gZGF0YVxuICBsb2coJ0dhbWUgYmV0d2VlbiAnK2RhdGEucGxheWVyT25lKycgYW5kICcrIGRhdGEucGxheWVyVHdvKydpcyBvbiEnICk7XG4gIHN0YXJ0R2FtZShkYXRhKVxufSlcblxuZnVuY3Rpb24gc3RhcnRHYW1lKGRhdGEpIHtcbiAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICBjYW52YXMuaWQgPSAnY2FudmFzJ1xuICBcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZShjYW52YXMsIGRhdGEpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoYm9hcmQsIGdhbWVEYXRhKSB7XG4gIC8vIGNvbnNvbGUubG9nKCdzb2NrZXQuZ2FtZTogJytKU09OLnN0cmluZ2lmeShzb2NrZXQuZ2FtZSkpXG4gIGxldCBzaGFwZXMgPSBbXVxuICBsZXQgY3R4ID0gYm9hcmQuZ2V0Q29udGV4dCgnMmQnKVxuICBsZXQgYm9hcmRMZWZ0ID0gYm9hcmQub2Zmc2V0TGVmdFxuICBsZXQgYm9hcmRUb3AgPSBib2FyZC5vZmZzZXRUb3BcblxuXG4gIGJvYXJkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSl7XG4gICAgdmFyIHggPSBlLnBhZ2VYIC0gYm9hcmRMZWZ0XG4gICAgdmFyIHkgPSBlLnBhZ2VZIC0gYm9hcmRUb3BcbiAgICBjb25zb2xlLmxvZyh4LCB5KVxuICAgIC8vIHNoYXBlcy5mb3JFYWNoKGZ1bmN0aW9uIChzaGFwZSkge1xuICAgIGlmICh5ID4gNTAgJiYgeSA8IDE1MCAgJiYgeCA+IDUwICYmIHggPCAxNTApIHtcbiAgICAgIGNvbnNvbGUubG9nKCdpbiB0aGUgbGVmdCBzaGFwcmU/ICcpXG4gICAgICAvLyBpZiAoeSA+IHNoYXBlLnRvcCAmJiB5IDwgc2hhcGUudG9wICsgc2hhcGUuaGVpZ2h0ICYmIHggPiBzaGFwZS5sZWZ0ICYmIHggPCBzaGFwZS5sZWZ0ICsgc2hhcGUud2lkdGgpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ2NsaWNrZWQgYSBzaGFwZTogJysgc2hhcGUubmFtZSkgIFxuICAgICAgICAvLyBjb25zb2xlLmxvZygnc2hhcGUudG9wJywgc2hhcGUudG9wKSAgXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdzaGFwZS5sZWZ0Jywgc2hhcGUubGVmdCkgIFxuICAgICAgICBcblxuICAgICAgfVxuICAgIH0pXG4gIC8vfSwgZmFsc2UpXG5cbiAgc2hhcGVzLnB1c2goe2NvbG91cjonIzA1RUZGRicsd2lkdGg6IDUwLGhlaWdodDogNTAsIHRvcDogMjUsIGxlZnQ6IDI1LCBuYW1lOiAnUm9jayd9KVxuICBzaGFwZXMucHVzaCh7Y29sb3VyOiAnI0ZGQzMwMCcsd2lkdGg6IDUwLGhlaWdodDogNTAsIHRvcDogMjUsIGxlZnQ6IDE3NSwgbmFtZTogJ1BhcGVyJ30pXG4gIHNoYXBlcy5wdXNoKHtjb2xvdXI6ICcjQ0VGRjMzJyx3aWR0aDogNTAsaGVpZ2h0OiA1MCwgdG9wOiA3NSwgbGVmdDogMTI1LCBuYW1lOiAnU2Npc3NvcnMnfSk7XG4gIFxuXG4gIC8vIGN0eC5mb250ID0gXCIxNXB4IEFyaWFsXCI7XG4gIC8vIGN0eC5maWxsVGV4dChcIlBhcGVyXCIsYm9hcmQud2lkdGgvNCwgYm9hcmQuaGVpZ2h0LzMpO1xuICAvLyBjdHguZmlsbFRleHQoXCJSb2NrXCIsYm9hcmQud2lkdGggLSBib2FyZC53aWR0aC80LCBib2FyZC5oZWlnaHQvMyk7XG4gIC8vIGN0eC5maWxsVGV4dChcIlNjaXNzb3JzXCIsYm9hcmQud2lkdGgvMi0zMCwxMjUpO1xuXG4vLyBSZW5kZXIgZWxlbWVudHMuXG5zaGFwZXMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgY3R4LmZpbGxTdHlsZSA9IGVsZW1lbnQuY29sb3VyO1xuICAgIGN0eC5maWxsUmVjdChlbGVtZW50LmxlZnQsIGVsZW1lbnQudG9wLCBlbGVtZW50LndpZHRoLCBlbGVtZW50LmhlaWdodCk7XG59KTtcbiAgLy9yZXRhaW4gY29vcmRzIG9mIGdhbWUgb3B0aW9ucy4gXG4gIC8vIGlmIGUudGFyZ2V0Lm1vdXNlIGNvb3JkcyBhcmUgd2l0aGluIGEgY2VydGFpbiB4L3kgb2YgdGhlIG9wdGlvbnNcbiAgLy8gdGhlbiB0aGF0IG9wdGlvbiBpb3MgY2hvc2VuIGFuZCB0aGF0IGV2ZW50IGlzIGVtbWl0ZWQuIFxuIFxuXG59XG5cbiJdfQ==
