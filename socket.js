// socket.js
const socketIO = require("socket.io");
var gamerooms = [];

exports.initializeSocket = (server) => {
  const io = socketIO(server);

  io.of('gameRoomSocket').on("connection", (socket) => {
    console.log("A user connected");
    // Handle custom socket events here

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });

    socket.on('join-room', ({ gameCode, user }) => {
      console.log('heros => ', 'room-'+gameCode, user)
      socket.userInfo = user;
      socket.join('room-'+gameCode);

      io.of('gameRoomSocket').to('room-'+gameCode).emit('gameinfo-changed', gamerooms[gameCode]);
    })

    socket.on('leave-room', ({gameCode}) => {
      if(gamerooms[gameCode].joiners) {
        const newArray = gamerooms[gameCode].joiners.filter(item => {
          // Use a comparison logic based on the properties you want to match
          return (
            item.ds_email !== socket.userInfo.ds_email &&
            item.nm_user !== socket.userInfo.nm_user
          )
        });

        console.log(newArray);

        gamerooms[gameCode].joiners = newArray || [];
        
        io.of('gameRoomSocket').to('room-'+gameCode).emit('gameinfo-changed', gamerooms[gameCode]);
        socket.leave('room-'+gameCode);
      }
    })
  });

  return io;
}

exports.gamerooms = gamerooms;