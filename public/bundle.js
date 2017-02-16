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
  document.getElementById('gameMessages').innerHTML = message
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

  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );

  console.log(data);
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.addEventListener('keypress', function(){
    //if you press w or s send a socket.emit('move', signal)
    //where signal is the gameId and opponents id and the w/s

    //server
    //on 'move'(signal)
    //  take the signal data and
    //  send it to the opponent/both players(room)
    //

    //in the room
    // have gotMove(signal)
    //   moveHandler(signal)
    //   pass the signal to the Game() and update
    //
    //

  })
  document.getElementById('game').appendChild(canvas);
  gameRoutine()

}


function gameRoutine() {
  var game = new Game() // creating instance of Game obj
  console.log(game);
   //calls loop()



  function MainLoop() {
      game.update();  //calls the instances update and draw()
      game.draw();
      // Call the main loop again at a frame rate of 30fps
      setTimeout(MainLoop, 33.3333);
  }

  function Game() {
      var canvas = document.getElementById("canvas");
      this.width = canvas.width;
      this.height = canvas.height;
      this.context = canvas.getContext("2d");
      this.context.fillStyle = "white";

      this.p1 = new Paddle(5, 0);
      this.p1.y = this.height/2 - this.p1.height/2;
      this.p2 = new Paddle(this.width - 5 - 2, 0);
      this.p2.y = this.height/2 - this.p2.height/2;
  }

  Game.prototype.draw = function()
  {
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.fillRect(this.width/2, 0, 2, this.height);

      this.p1.draw(this.context);
      this.p2.draw(this.context);
  };

  Game.prototype.update = function()
  {
      if (this.paused)
          return;
  };
  function Paddle(x,y) {
    this.x = x;
    this.y = y;
    this.width = 2;
    this.height = 28;
    this.score = 0;
  }

  Paddle.prototype.draw = function(p)
  {
      p.fillRect(this.x, this.y, this.width, this.height);
  };

  MainLoop()
}

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJykuaW5uZXJIVE1MID0gbWVzc2FnZVxufVxuXG5zb2NrZXQub24oJ2NoYWxsZW5nZScsIGZ1bmN0aW9uIChjaGFsbGVuZ2UpIHtcbiAgbGV0IGxvYmJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JylcbiAgbGV0IGFjY2VwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIGFjY2VwdC5pZCA9ICdhY2NlcHQnXG4gIGFjY2VwdC5pbm5lckhUTUwgPSBcIkknbSBSZWFkeSFcIlxuICBzb2NrZXQuY2hhbGxlbmdlID0gY2hhbGxlbmdlXG4gIGFjY2VwdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJywgc29ja2V0LmNoYWxsZW5nZSlcbiAgfSlcbiAgbG9iYnkuaW5zZXJ0QmVmb3JlKGFjY2VwdCxsb2JieS5jaGlsZE5vZGVzWzFdKVxuXG4gIGxvZygnQ2hhbGxlbmdlIGZyb20gJysgY2hhbGxlbmdlLmNoYWxsZW5nZXIrJy4gUmVhZHk/Jylcbn0pXG5cbnNvY2tldC5vbignc3RhcnRHYW1lJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IHJlYWR5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY2VwdCcpO1xuICBpZiAocmVhZHlCdXR0b24pIHtcbiAgICByZWFkeUJ1dHRvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHJlYWR5QnV0dG9uKTtcbiAgfVxuXG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcblxuICBjb25zb2xlLmxvZyhkYXRhKTtcbiAgc3RhcnRHYW1lKGRhdGEpXG59KVxuXG5mdW5jdGlvbiBzdGFydEdhbWUoZGF0YSkge1xuICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIGNhbnZhcy5pZCA9ICdjYW52YXMnXG4gIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIGZ1bmN0aW9uKCl7XG4gICAgLy9pZiB5b3UgcHJlc3MgdyBvciBzIHNlbmQgYSBzb2NrZXQuZW1pdCgnbW92ZScsIHNpZ25hbClcbiAgICAvL3doZXJlIHNpZ25hbCBpcyB0aGUgZ2FtZUlkIGFuZCBvcHBvbmVudHMgaWQgYW5kIHRoZSB3L3NcblxuICAgIC8vc2VydmVyXG4gICAgLy9vbiAnbW92ZScoc2lnbmFsKVxuICAgIC8vICB0YWtlIHRoZSBzaWduYWwgZGF0YSBhbmRcbiAgICAvLyAgc2VuZCBpdCB0byB0aGUgb3Bwb25lbnQvYm90aCBwbGF5ZXJzKHJvb20pXG4gICAgLy9cblxuICAgIC8vaW4gdGhlIHJvb21cbiAgICAvLyBoYXZlIGdvdE1vdmUoc2lnbmFsKVxuICAgIC8vICAgbW92ZUhhbmRsZXIoc2lnbmFsKVxuICAgIC8vICAgcGFzcyB0aGUgc2lnbmFsIHRvIHRoZSBHYW1lKCkgYW5kIHVwZGF0ZVxuICAgIC8vXG4gICAgLy9cblxuICB9KVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZScpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gIGdhbWVSb3V0aW5lKClcblxufVxuXG5cbmZ1bmN0aW9uIGdhbWVSb3V0aW5lKCkge1xuICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCkgLy8gY3JlYXRpbmcgaW5zdGFuY2Ugb2YgR2FtZSBvYmpcbiAgY29uc29sZS5sb2coZ2FtZSk7XG4gICAvL2NhbGxzIGxvb3AoKVxuXG5cblxuICBmdW5jdGlvbiBNYWluTG9vcCgpIHtcbiAgICAgIGdhbWUudXBkYXRlKCk7ICAvL2NhbGxzIHRoZSBpbnN0YW5jZXMgdXBkYXRlIGFuZCBkcmF3KClcbiAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgLy8gQ2FsbCB0aGUgbWFpbiBsb29wIGFnYWluIGF0IGEgZnJhbWUgcmF0ZSBvZiAzMGZwc1xuICAgICAgc2V0VGltZW91dChNYWluTG9vcCwgMzMuMzMzMyk7XG4gIH1cblxuICBmdW5jdGlvbiBHYW1lKCkge1xuICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuICAgICAgdGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuXG4gICAgICB0aGlzLnAxID0gbmV3IFBhZGRsZSg1LCAwKTtcbiAgICAgIHRoaXMucDEueSA9IHRoaXMuaGVpZ2h0LzIgLSB0aGlzLnAxLmhlaWdodC8yO1xuICAgICAgdGhpcy5wMiA9IG5ldyBQYWRkbGUodGhpcy53aWR0aCAtIDUgLSAyLCAwKTtcbiAgICAgIHRoaXMucDIueSA9IHRoaXMuaGVpZ2h0LzIgLSB0aGlzLnAyLmhlaWdodC8yO1xuICB9XG5cbiAgR2FtZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKClcbiAge1xuICAgICAgdGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICB0aGlzLmNvbnRleHQuZmlsbFJlY3QodGhpcy53aWR0aC8yLCAwLCAyLCB0aGlzLmhlaWdodCk7XG5cbiAgICAgIHRoaXMucDEuZHJhdyh0aGlzLmNvbnRleHQpO1xuICAgICAgdGhpcy5wMi5kcmF3KHRoaXMuY29udGV4dCk7XG4gIH07XG5cbiAgR2FtZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24oKVxuICB7XG4gICAgICBpZiAodGhpcy5wYXVzZWQpXG4gICAgICAgICAgcmV0dXJuO1xuICB9O1xuICBmdW5jdGlvbiBQYWRkbGUoeCx5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMud2lkdGggPSAyO1xuICAgIHRoaXMuaGVpZ2h0ID0gMjg7XG4gICAgdGhpcy5zY29yZSA9IDA7XG4gIH1cblxuICBQYWRkbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihwKVxuICB7XG4gICAgICBwLmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gIH07XG5cbiAgTWFpbkxvb3AoKVxufVxuIl19
