import openSocket from 'socket.io-client';
var  socket = openSocket("http://localhost:8000");

// function open_connect(ip, port){
  // console.log("opening connection on:", ip + ":" + port)
  // socket = openSocket(ip + ":" + port);
// }

function client_update_playback(cb){
  console.log("attempting to update client playback");
  if (socket != null){
    
  // socket.on('updating_playback', (data => cb(null, data));
    socket.on('updating_playback', (data => cb(null, data)));
  }
  else{
    console.log("stupid socket is still null?")
  }
}

function client_numbers(cb){
  if (socket != null){
    socket.on('broadcast', (data => cb(null, data)));
  }
}

function broadcast_votes(data){
  if (socket != null){
    socket.emit('bc_votes',data);
  }
}

function update_votes(cb){
  if (socket != null){
    socket.on('update_votes', (data => cb(null, data)));
  }
}

function server_update_playback(data){
  if (socket != null){
    socket.emit('notify_playback', data);
  }
}

function vote_down(data){
  if (socket != null){
    if (data === -1){
      socket.emit('vote_noskip', data)
    }else{
      socket.emit('vote_skip', data)
    }
  }
}

function vote_entered(cb){
  if (socket != null){
    socket.on('vote_entered', (data => cb(null, data)));
  }
}


export { 
  // subscribeToTimer, 
  // open_connect,
  client_update_playback, 
  server_update_playback,
  client_numbers,
  vote_entered,
  vote_down,
  broadcast_votes,
  update_votes
};