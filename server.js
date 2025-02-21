import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import settings from './settings.json' with { type: 'json' };
import { inicioConexionDB } from './modules/creoPersistencia.js';

const app = express();
const server = createServer(app);
const io = new Server(server);




app.use(express.static('.'));
app.use('/modules', express.static(path.join(process.cwd(), 'modules')));
app.use(express.json());

inicioConexionDB(app);


const players = {}; // Guardar jugadores activos
let franciaPosition = null; // ✅ Guardamos la posición de Francia

io.on('connection', (socket) => {
    console.log(`🎮 Jugador conectado: ${socket.id}`);

    //Si `franciaPosition` no está definida, la creamos al conectar el primer jugador
    if (!franciaPosition) {
        franciaPosition = {
            x: Math.floor(Math.random() * (960 - 1 + 1)) + 600, // 🔹 Asegurar posición en el mapa
            y: 20
        };
        console.log(`🌍 Posición de Francia generada en: (${franciaPosition.x}, ${franciaPosition.y})`);
    }

    players[socket.id] = { id: socket.id };

    //Enviar la cantidad de jugadores conectados a todos
    io.emit('playerCount', Object.keys(players).length);

    //Enviar la posición de Francia al nuevo jugador
    socket.emit('setFranciaPosition', franciaPosition);

    socket.on('newPlayer', (player) => {
        players[socket.id] = player;
        console.log(`jugadores conectados: ${Object.keys(players).length}`);
        io.emit('newPlayer', player);
    });

    socket.on('playerMove', (player) => {
        if (players[socket.id]) {
            players[socket.id].x = player.x;
            players[socket.id].y = player.y;
            players[socket.id].angle = player.angle;
        }
        io.emit('updatePlayers', players);
    });

    socket.on('disconnect', () => {
        console.log(`jugador desconectado: ${socket.id}`);
        delete players[socket.id];

        console.log(`jugadores restantes: ${Object.keys(players).length}`);
        io.emit('playerCount', Object.keys(players).length);
    });
});

server.listen(settings.serverPort, () => {
    console.log('🚀 Servidor escuchando en http://localhost:3000');
});
