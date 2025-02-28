import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import settings from './settings.json' with { type: 'json' };
import { inicioConexionDB } from './modules/persistencia/creoPersistencia.js';

const app = express();
const server = createServer(app);
const io = new Server(server);




app.use(express.static('.'));
app.use('/modules', express.static(path.join(process.cwd(), 'modules')));
app.use(express.json());

inicioConexionDB(app, settings.dbInfo);


const players = {}; // Guardar jugadores activos
const aviones = {}; // Guardar aviones activos
let franciaPosition = null; // ✅ Guardamos la posición de Francia

io.on('connection', (socket) => {
    socket.on('newPlayer', (player) => {
        // Verificar si ya existe un jugador con el mismo equipo
        const teamAlreadyTaken = Object.values(players).some(p => p.team === player.team);
        debugger;
        if (teamAlreadyTaken) {
            // Si el equipo ya está ocupado, notificar al cliente con un error y no continuar
            socket.emit('teamError', { message: `El equipo ${player.team} ya está ocupado.` });
            console.log(`Equipo ${player.team} ya está ocupado para ${socket.id}`);
            return;
        }
        
        // Si el equipo está disponible, se actualiza el objeto del jugador
        players[socket.id] = player;
        console.log(`Jugadores conectados: ${Object.keys(players).length}`);
        io.emit('newPlayer', player);
    });
    console.log(`🎮 Jugador conectado: ${socket.id}`);

    // Si `franciaPosition` no está definida, la creamos al conectar el primer jugador
    if (!franciaPosition) {
        franciaPosition = {
            x: Math.floor(Math.random() * (960 - 1 + 1)) + 600, // 🔹 Asegurar posición en el mapa
            y: 20
        };
        console.log(`🌍 Posición de Francia generada en: (${franciaPosition.x}, ${franciaPosition.y})`);
    }

    // Inicialmente registramos al jugador con solo su ID
    players[socket.id] = { id: socket.id };

    // Enviar la cantidad de jugadores conectados a todos
    io.emit('playerCount', Object.keys(players).length);

    // Enviar la posición de Francia al nuevo jugador
    socket.emit('setFranciaPosition', franciaPosition);

   

    socket.on('playerMove', (player) => {
        if (players[socket.id]) {
            players[socket.id].x = player.x;
            players[socket.id].y = player.y;
            players[socket.id].angle = player.angle;
            players[socket.id].team = player.team;
            players[socket.id].label = player.label;
            players[socket.id].Px = player.Px;
            players[socket.id].Py = player.Py;
            players[socket.id].Pangle = player.Pangle;
        }
        io.emit('updatePlayers', players);
    });

    socket.on('shootBullet', (data) => {
        socket.broadcast.emit('shootBullet', data);
    });

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
        delete players[socket.id];

        console.log(`Jugadores restantes: ${Object.keys(players).length}`);
        io.emit('playerCount', Object.keys(players).length);
    });

    socket.on('newPlane', (player) => {
        players[socket.id] = player;
        console.log(`Avion llego al server y es enviado a los jugadores`);
        io.emit('newPlane', player);
    });
});


server.listen(settings.serverPort, () => {
    console.log('🚀 Servidor escuchando en http://localhost:3000');
});

app.get('/getPlayerConnections', (req, res) => {
    res.json(Object.keys(players).length)
})

app.get('/getPlayers', (req, res) => {
    res.json(players)
})


