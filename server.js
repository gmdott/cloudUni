const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express()

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    res.sendFile(__dirname + '/style.css');
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "54.20.190.40" }
});

const activeUsers = new Map(); 

io.on('connection', (socket) => {

    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    
    activeUsers.set(socket.id, clientIp);

    io.emit('update-users', Array.from(activeUsers.values()));

    socket.on('disconnect', () => {
        activeUsers.delete(socket.id);
        io.emit('update-users', Array.from(activeUsers.values()));
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});