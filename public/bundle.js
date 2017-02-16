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
  console.log('server says '+data);
  // socket.emit('readyForChallenge', data)
})

socket.on('resUsers', function (users) {
  let gameList = document.getElementById('gameList')
  gameList.innerHTML = ''
  for (var i = 0; i < users.length; i++) {
    var liNode = document.createElement("LI")
    var game = document.createTextNode(users[i].name)
    liNode.appendChild(game)
    liNode.addEventListener('click', reqGame, false)
    gameList.appendChild(liNode)
  }
})

function reqGame(e) {
  let player = e.target.innerHTML
  console.log(e);
  socket.emit('requestGame', player)
}


socket.on('startGame', function (data) {
  log('Game between '+data.playerOne+' and '+ data.playerTwo+'is on!' );
  
  console.log(data);
})

socket.on('message', function (message) {
  log(message)
})

function log(message) {
  document.getElementById('gameMessages').innerHTML = message
}

socket.on('challenge', function (challenge) {
  let lobby = document.getElementById('lobby')
  let accept = document.createElement('button')
  accept.innerHTML = "I'm Ready!"
  socket.challenge = challenge
  accept.addEventListener('click', function () {
    socket.emit('readyGame', socket.challenge)
  })
  lobby.insertBefore(accept,lobby.childNodes[1])

  log('Challenge from '+ challenge.challenger+'. Ready?')
  // UPTO: Ask if they accept//are ready
  // if yes
  //   send server message to tell both clients to ready the game socket.emit('readyGame',
//          ({gameId, challenger, thisPlayer})

})

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwdWJsaWMvY2xpZW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImNvbnN0IHNvY2tldCA9IGlvKClcblxuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2pvaW5TZXJ2ZXInKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICBsZXQgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduYW1lSW5wdXQnKVxuICBpZighbmFtZS52YWx1ZSl7XG4gICAgcmV0dXJuIGxvZygnUGxlYXNlIGVudGVyIGEgbmFtZScpXG4gIH07XG4gIHNvY2tldC5lbWl0KCdqb2luTG9iYnknLCBuYW1lLnZhbHVlKVxuICAvL2Rpc2FibGUgZnVydGhlciBldmVudHMgZnJvbSB0aGlzIGJ1dHRvblxufSlcblxuc29ja2V0Lm9uKCdyZXNKb2luTG9iYnknLCBmdW5jdGlvbiAoZGF0YSkge1xuICBsZXQgbmFtZU5vZGUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXRhKVxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndXNlck5hbWUnKS5hcHBlbmRDaGlsZChuYW1lTm9kZSlcbiAgY29uc29sZS5sb2coJ3NlcnZlciBzYXlzICcrZGF0YSk7XG4gIC8vIHNvY2tldC5lbWl0KCdyZWFkeUZvckNoYWxsZW5nZScsIGRhdGEpXG59KVxuXG5zb2NrZXQub24oJ3Jlc1VzZXJzJywgZnVuY3Rpb24gKHVzZXJzKSB7XG4gIGxldCBnYW1lTGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdnYW1lTGlzdCcpXG4gIGdhbWVMaXN0LmlubmVySFRNTCA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdXNlcnMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbGlOb2RlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIkxJXCIpXG4gICAgdmFyIGdhbWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh1c2Vyc1tpXS5uYW1lKVxuICAgIGxpTm9kZS5hcHBlbmRDaGlsZChnYW1lKVxuICAgIGxpTm9kZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlcUdhbWUsIGZhbHNlKVxuICAgIGdhbWVMaXN0LmFwcGVuZENoaWxkKGxpTm9kZSlcbiAgfVxufSlcblxuZnVuY3Rpb24gcmVxR2FtZShlKSB7XG4gIGxldCBwbGF5ZXIgPSBlLnRhcmdldC5pbm5lckhUTUxcbiAgY29uc29sZS5sb2coZSk7XG4gIHNvY2tldC5lbWl0KCdyZXF1ZXN0R2FtZScsIHBsYXllcilcbn1cblxuXG5zb2NrZXQub24oJ3N0YXJ0R2FtZScsIGZ1bmN0aW9uIChkYXRhKSB7XG4gIGxvZygnR2FtZSBiZXR3ZWVuICcrZGF0YS5wbGF5ZXJPbmUrJyBhbmQgJysgZGF0YS5wbGF5ZXJUd28rJ2lzIG9uIScgKTtcbiAgXG4gIGNvbnNvbGUubG9nKGRhdGEpO1xufSlcblxuc29ja2V0Lm9uKCdtZXNzYWdlJywgZnVuY3Rpb24gKG1lc3NhZ2UpIHtcbiAgbG9nKG1lc3NhZ2UpXG59KVxuXG5mdW5jdGlvbiBsb2cobWVzc2FnZSkge1xuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZU1lc3NhZ2VzJykuaW5uZXJIVE1MID0gbWVzc2FnZVxufVxuXG5zb2NrZXQub24oJ2NoYWxsZW5nZScsIGZ1bmN0aW9uIChjaGFsbGVuZ2UpIHtcbiAgbGV0IGxvYmJ5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2xvYmJ5JylcbiAgbGV0IGFjY2VwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpXG4gIGFjY2VwdC5pbm5lckhUTUwgPSBcIkknbSBSZWFkeSFcIlxuICBzb2NrZXQuY2hhbGxlbmdlID0gY2hhbGxlbmdlXG4gIGFjY2VwdC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJywgc29ja2V0LmNoYWxsZW5nZSlcbiAgfSlcbiAgbG9iYnkuaW5zZXJ0QmVmb3JlKGFjY2VwdCxsb2JieS5jaGlsZE5vZGVzWzFdKVxuXG4gIGxvZygnQ2hhbGxlbmdlIGZyb20gJysgY2hhbGxlbmdlLmNoYWxsZW5nZXIrJy4gUmVhZHk/JylcbiAgLy8gVVBUTzogQXNrIGlmIHRoZXkgYWNjZXB0Ly9hcmUgcmVhZHlcbiAgLy8gaWYgeWVzXG4gIC8vICAgc2VuZCBzZXJ2ZXIgbWVzc2FnZSB0byB0ZWxsIGJvdGggY2xpZW50cyB0byByZWFkeSB0aGUgZ2FtZSBzb2NrZXQuZW1pdCgncmVhZHlHYW1lJyxcbi8vICAgICAgICAgICh7Z2FtZUlkLCBjaGFsbGVuZ2VyLCB0aGlzUGxheWVyfSlcblxufSlcbiJdfQ==
