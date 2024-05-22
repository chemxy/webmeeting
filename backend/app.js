const express = require("express")
const http = require("http")
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
})

io.on("connection", (socket) => {
    socket.emit("me", socket.id)

    socket.on("disconnect", () => {
        socket.broadcast.emit("callEnded")
    })

    socket.on("callUser", (data) => {
        console.log("calling a user " + data.userToCall);
        // console.log(data);
        io.to(data.userToCall).emit("receiveCall", {offer: data.offer, from: data.from})
    })

    socket.on("answerCall", (data) => {
        console.log("answering a call to " + data.to);
        console.log(data.answer);
        io.to(data.to).emit("callAccepted", {answer: data.answer})
    })

    socket.on('ice-candidate', data => {
        // console.log("Forward ICE candidate to " + data.to)
        // console.log(data.to);
        // console.log(data);
        socket.to(data.to).emit('ice-candidate', data.message);
    });

    socket.on('open-remote-camera', data => {
        console.log("sending open camera to " + data.to);
        socket.to(data.to).emit('open-remote-camera');
    })

    socket.on('close-remote-camera', data => {
        console.log("sending close camera to " + data.to);
        socket.to(data.to).emit('close-remote-camera');
    })
})

server.listen(5000, () => console.log("server is running on port 5000"))
