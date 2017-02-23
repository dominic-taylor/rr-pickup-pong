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
  socket.game = data
  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );
  startGame(data)
})

function startGame(data) {
  var canvas = document.createElement('canvas');
  canvas.id = 'canvas'
  canvas.addEventListener('keypress', function(){
  })
  document.getElementById('game').appendChild(canvas);
  gameRoutine()

}

function gameRoutine() {
  let playerTwoMove
  var game = new Game() // creating instance of Game obj
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
      this.keys = new KeyListener();

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

    if (this.keys.isPressed(83)) { // DOWN
        this.p1.y = Math.min(this.height - this.p1.height, this.p1.y + 4);
    } else if (this.keys.isPressed(87)) { // UP
        this.p1.y = Math.max(0, this.p1.y - 4);
    }

    //send this.p1.y to server
    let gameData = {
                id: socket.game.id,
                move: this.p1.y
              }

    socket.emit('sendMove', gameData)

      // recive opponents this.p1.y and apply to this.p2.y
    socket.on('getMove', function (data) {
      //how do I get this out of here?
      playerTwoMove =  data.move
    })
    this.p2.y = playerTwoMove


    // if (this.keys.isPressed(40)) { // DOWN
    //     this.p2.y = Math.min(this.height - this.p2.height, this.p2.y + 4);
    // } else if (this.keys.isPressed(38)) { // UP
    //     this.p2.y = Math.max(0, this.p2.y - 4);
    // }
  };

  function KeyListener() {
    this.pressedKeys = [];

    this.keydown = function(e) {
        this.pressedKeys[e.keyCode] = true;
    };

    this.keyup = function(e) {
        this.pressedKeys[e.keyCode] = false;
    };

    document.addEventListener("keydown", this.keydown.bind(this));
    document.addEventListener("keyup", this.keyup.bind(this));
}

KeyListener.prototype.isPressed = function(key)
{
    return this.pressedKeys[key] ? true : false;
};

KeyListener.prototype.addKeyPressListener = function(keyCode, callback)
{
    document.addEventListener("keypress", function(e) {
        if (e.keyCode == keyCode)
            callback(e);
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiY29uc3Qgc29ja2V0ID0gaW8oKVxuXG5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnam9pblNlcnZlcicpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oKSB7XG4gIGxldCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25hbWVJbnB1dCcpXG4gIGlmKCFuYW1lLnZhbHVlKXtcbiAgICByZXR1cm4gbG9nKCdQbGVhc2UgZW50ZXIgYSBuYW1lJylcbiAgfTtcbiAgc29ja2V0LmVtaXQoJ2pvaW5Mb2JieScsIG5hbWUudmFsdWUpXG4gIC8vZGlzYWJsZSBmdXJ0aGVyIGV2ZW50cyBmcm9tIHRoaXMgYnV0dG9uXG59KVxuXG5zb2NrZXQub24oJ3Jlc0pvaW5Mb2JieScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxldCBuYW1lTm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRhdGEpXG4gIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd1c2VyTmFtZScpLmFwcGVuZENoaWxkKG5hbWVOb2RlKVxufSlcblxuc29ja2V0Lm9uKCdyZXNVc2VycycsIGZ1bmN0aW9uICh1c2Vycykge1xuICBsZXQgZ2FtZUxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZUxpc3QnKVxuICBnYW1lTGlzdC5pbm5lckhUTUwgPSAnJ1xuICBsZXQgdGhpc1VzZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5pbm5lckhUTUxcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2Vycy5sZW5ndGg7IGkrKykge1xuICAgIGlmKHVzZXJzW2ldLm5hbWUgIT0gdGhpc1VzZXIpe1xuICAgICAgdmFyIGxpTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJMSVwiKVxuICAgICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgICAgbGlOb2RlLmFwcGVuZENoaWxkKGdhbWUpXG4gICAgICBsaU5vZGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCByZXFHYW1lLCBmYWxzZSlcbiAgICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgICB9XG4gIH1cbn0pXG5cbmZ1bmN0aW9uIHJlcUdhbWUoZSkge1xuICBsZXQgcGxheWVyID0gZS50YXJnZXQuaW5uZXJIVE1MXG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJykuaW5uZXJIVE1MID0gbWVzc2FnZVxufVxuXG5zb2NrZXQub24oJ2NoYWxsZW5nZScsIGZ1bmN0aW9uIChjaGFsbGVuZ2UpIHtcbiAgbGV0IGxvYmJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JylcbiAgbGV0IGFjY2VwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIGFjY2VwdC5pZCA9ICdhY2NlcHQnXG4gIGFjY2VwdC5pbm5lckhUTUwgPSBcIkknbSBSZWFkeSFcIlxuICBzb2NrZXQuY2hhbGxlbmdlID0gY2hhbGxlbmdlXG4gIGFjY2VwdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJywgc29ja2V0LmNoYWxsZW5nZSlcbiAgfSlcbiAgbG9iYnkuaW5zZXJ0QmVmb3JlKGFjY2VwdCxsb2JieS5jaGlsZE5vZGVzWzFdKVxuXG4gIGxvZygnQ2hhbGxlbmdlIGZyb20gJysgY2hhbGxlbmdlLmNoYWxsZW5nZXIrJy4gUmVhZHk/Jylcbn0pXG5cbnNvY2tldC5vbignc3RhcnRHYW1lJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgbGV0IHJlYWR5QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FjY2VwdCcpO1xuICBpZiAocmVhZHlCdXR0b24pIHtcbiAgICByZWFkeUJ1dHRvbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHJlYWR5QnV0dG9uKTtcbiAgfVxuICBzb2NrZXQuZ2FtZSA9IGRhdGFcbiAgbG9nKCdHYW1lIGJldHdlZW4gJytkYXRhLnBsYXllck9uZSsnIGFuZCAnKyBkYXRhLnBsYXllclR3bysnaXMgb24hJyApO1xuICBzdGFydEdhbWUoZGF0YSlcbn0pXG5cbmZ1bmN0aW9uIHN0YXJ0R2FtZShkYXRhKSB7XG4gIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgY2FudmFzLmlkID0gJ2NhbnZhcydcbiAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZnVuY3Rpb24oKXtcbiAgfSlcbiAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2dhbWUnKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuICBnYW1lUm91dGluZSgpXG5cbn1cblxuZnVuY3Rpb24gZ2FtZVJvdXRpbmUoKSB7XG4gIGxldCBwbGF5ZXJUd29Nb3ZlXG4gIHZhciBnYW1lID0gbmV3IEdhbWUoKSAvLyBjcmVhdGluZyBpbnN0YW5jZSBvZiBHYW1lIG9ialxuICAgLy9jYWxscyBsb29wKClcblxuICBmdW5jdGlvbiBNYWluTG9vcCgpIHtcbiAgICAgIGdhbWUudXBkYXRlKCk7ICAvL2NhbGxzIHRoZSBpbnN0YW5jZXMgdXBkYXRlIGFuZCBkcmF3KClcbiAgICAgIGdhbWUuZHJhdygpO1xuICAgICAgLy8gQ2FsbCB0aGUgbWFpbiBsb29wIGFnYWluIGF0IGEgZnJhbWUgcmF0ZSBvZiAzMGZwc1xuICAgICAgc2V0VGltZW91dChNYWluTG9vcCwgMzMuMzMzMyk7XG4gIH1cblxuICBmdW5jdGlvbiBHYW1lKCkge1xuICAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuICAgICAgdGhpcy53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgIHRoaXMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgIHRoaXMuY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICB0aGlzLmNvbnRleHQuZmlsbFN0eWxlID0gXCJ3aGl0ZVwiO1xuICAgICAgdGhpcy5rZXlzID0gbmV3IEtleUxpc3RlbmVyKCk7XG5cbiAgICAgIHRoaXMucDEgPSBuZXcgUGFkZGxlKDUsIDApO1xuICAgICAgdGhpcy5wMS55ID0gdGhpcy5oZWlnaHQvMiAtIHRoaXMucDEuaGVpZ2h0LzI7XG4gICAgICB0aGlzLnAyID0gbmV3IFBhZGRsZSh0aGlzLndpZHRoIC0gNSAtIDIsIDApO1xuICAgICAgdGhpcy5wMi55ID0gdGhpcy5oZWlnaHQvMiAtIHRoaXMucDIuaGVpZ2h0LzI7XG4gIH1cblxuICBHYW1lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oKVxuICB7XG4gICAgICB0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgIHRoaXMuY29udGV4dC5maWxsUmVjdCh0aGlzLndpZHRoLzIsIDAsIDIsIHRoaXMuaGVpZ2h0KTtcblxuICAgICAgdGhpcy5wMS5kcmF3KHRoaXMuY29udGV4dCk7XG4gICAgICB0aGlzLnAyLmRyYXcodGhpcy5jb250ZXh0KTtcbiAgfTtcblxuICBHYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpXG4gIHtcbiAgICAgIGlmICh0aGlzLnBhdXNlZClcbiAgICAgICAgICByZXR1cm47XG5cbiAgICBpZiAodGhpcy5rZXlzLmlzUHJlc3NlZCg4MykpIHsgLy8gRE9XTlxuICAgICAgICB0aGlzLnAxLnkgPSBNYXRoLm1pbih0aGlzLmhlaWdodCAtIHRoaXMucDEuaGVpZ2h0LCB0aGlzLnAxLnkgKyA0KTtcbiAgICB9IGVsc2UgaWYgKHRoaXMua2V5cy5pc1ByZXNzZWQoODcpKSB7IC8vIFVQXG4gICAgICAgIHRoaXMucDEueSA9IE1hdGgubWF4KDAsIHRoaXMucDEueSAtIDQpO1xuICAgIH1cblxuICAgIC8vc2VuZCB0aGlzLnAxLnkgdG8gc2VydmVyXG4gICAgbGV0IGdhbWVEYXRhID0ge1xuICAgICAgICAgICAgICAgIGlkOiBzb2NrZXQuZ2FtZS5pZCxcbiAgICAgICAgICAgICAgICBtb3ZlOiB0aGlzLnAxLnlcbiAgICAgICAgICAgICAgfVxuXG4gICAgc29ja2V0LmVtaXQoJ3NlbmRNb3ZlJywgZ2FtZURhdGEpXG5cbiAgICAgIC8vIHJlY2l2ZSBvcHBvbmVudHMgdGhpcy5wMS55IGFuZCBhcHBseSB0byB0aGlzLnAyLnlcbiAgICBzb2NrZXQub24oJ2dldE1vdmUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgLy9ob3cgZG8gSSBnZXQgdGhpcyBvdXQgb2YgaGVyZT9cbiAgICAgIHBsYXllclR3b01vdmUgPSAgZGF0YS5tb3ZlXG4gICAgfSlcbiAgICB0aGlzLnAyLnkgPSBwbGF5ZXJUd29Nb3ZlXG5cblxuICAgIC8vIGlmICh0aGlzLmtleXMuaXNQcmVzc2VkKDQwKSkgeyAvLyBET1dOXG4gICAgLy8gICAgIHRoaXMucDIueSA9IE1hdGgubWluKHRoaXMuaGVpZ2h0IC0gdGhpcy5wMi5oZWlnaHQsIHRoaXMucDIueSArIDQpO1xuICAgIC8vIH0gZWxzZSBpZiAodGhpcy5rZXlzLmlzUHJlc3NlZCgzOCkpIHsgLy8gVVBcbiAgICAvLyAgICAgdGhpcy5wMi55ID0gTWF0aC5tYXgoMCwgdGhpcy5wMi55IC0gNCk7XG4gICAgLy8gfVxuICB9O1xuXG4gIGZ1bmN0aW9uIEtleUxpc3RlbmVyKCkge1xuICAgIHRoaXMucHJlc3NlZEtleXMgPSBbXTtcblxuICAgIHRoaXMua2V5ZG93biA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5c1tlLmtleUNvZGVdID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgdGhpcy5rZXl1cCA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdGhpcy5wcmVzc2VkS2V5c1tlLmtleUNvZGVdID0gZmFsc2U7XG4gICAgfTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsIHRoaXMua2V5ZG93bi5iaW5kKHRoaXMpKTtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgdGhpcy5rZXl1cC5iaW5kKHRoaXMpKTtcbn1cblxuS2V5TGlzdGVuZXIucHJvdG90eXBlLmlzUHJlc3NlZCA9IGZ1bmN0aW9uKGtleSlcbntcbiAgICByZXR1cm4gdGhpcy5wcmVzc2VkS2V5c1trZXldID8gdHJ1ZSA6IGZhbHNlO1xufTtcblxuS2V5TGlzdGVuZXIucHJvdG90eXBlLmFkZEtleVByZXNzTGlzdGVuZXIgPSBmdW5jdGlvbihrZXlDb2RlLCBjYWxsYmFjaylcbntcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZS5rZXlDb2RlID09IGtleUNvZGUpXG4gICAgICAgICAgICBjYWxsYmFjayhlKTtcbiAgICB9KTtcbn07XG4gIGZ1bmN0aW9uIFBhZGRsZSh4LHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IDI7XG4gICAgdGhpcy5oZWlnaHQgPSAyODtcbiAgICB0aGlzLnNjb3JlID0gMDtcbiAgfVxuXG4gIFBhZGRsZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKHApXG4gIHtcbiAgICAgIHAuZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgfTtcblxuICBNYWluTG9vcCgpXG59XG4iXX0=
