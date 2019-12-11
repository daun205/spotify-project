///// What should server do?
//// Server should broadcast to all subscribers about current song
//// 

const io = require('socket.io')();

io.on('connection', (client) => {
    io.sockets.emit('broadcast', {clients: io.engine.clientsCount})
    // client.on('update_playback', (obj) => {
        // client.emit('updating_playback', obj);
    // })

    client.on('bc_votes', (data) =>{
        io.sockets.emit('update_votes', data);
    })

    client.on('notify_playback', (data) => {
        // setInterval(() => {
        io.sockets.emit('updating_playback', data);
        // }, 5000);
    })

    client.on('vote_skip', (data) => {
        console.log("broadcasting vote down")
        io.sockets.emit('vote_entered', data);
    })

    client.on('vote_noskip', (data) => {
        console.log("broadcasting vote down")
        io.sockets.emit('vote_entered', data);
    })

    

    // client.on('admin_broadcast', (data) => {})
});


io.on('disconnect', (client) => {
    io.sockets.emit('broadcast', {clients: io.engine.clientsCount})
});

const port = 8000;
io.listen(port);
console.log('listening on port ', port);