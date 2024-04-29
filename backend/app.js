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
        console.log(data);
        io.to(data.userToCall).emit("receiveCall", {offer: data.offer, from: data.from})
    })

    socket.on("answerCall", (data) => {
        console.log("answering a call to " + data.to);
        // console.log(data);
        io.to(data.to).emit("callAccepted", {answer: data.answer})
    })

    socket.on('ice-candidate', data => {
        // console.log("Forward ICE candidate to " + data.to)
        // console.log(data.to);
        // console.log(data);
        socket.to(data.to).emit('ice-candidate', data.message);
    });
})

server.listen(5000, () => console.log("server is running on port 5000"))
