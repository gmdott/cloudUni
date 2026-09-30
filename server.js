const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "54.233.162.64" } // Ajuste para o domínio do seu site em produção
});

// Armazena os IPs ativos
const activeUsers = new Map(); 

io.on('connection', (socket) => {
    // Tenta pegar o IP real (útil se estiver atrás de um Load Balancer na AWS) ou o IP direto
    const clientIp = socket.handshake.headers['x-forwarded-for'] || socket.handshake.address;
    
    // Adiciona o usuário ao Map usando o ID do socket
    activeUsers.set(socket.id, clientIp);

    // Envia a lista atualizada para TODOS os clientes conectados
    io.emit('update-users', Array.from(activeUsers.values()));

    // Quando o usuário fechar a aba/desconectar
    socket.on('disconnect', () => {
        activeUsers.delete(socket.id);
        // Atualiza a lista para quem continuou conectado
        io.emit('update-users', Array.from(activeUsers.values()));
    });
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});