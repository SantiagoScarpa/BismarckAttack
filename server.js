import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import settings from './settings.json' with { type: 'json' };
import { inicioConexionDB, persistoPartida } from './modules/persistencia/creoPersistencia.js';
import { expongoWsSettings } from './modules/persistencia/serviciosSettings.js';
const app = express();
const server = createServer(app);
const io = new Server(server);




app.use(express.static('.'));
app.use('/modules', express.static(path.join(process.cwd(), 'modules')));
app.use(express.json());

inicioConexionDB(app, settings.dbInfo);
expongoWsSettings(app)

const players = {}; // Guardar jugadores activos
const aviones = {}; // Guardar aviones activos
let franciaPosition = null; // ✅ Guardamos la posición de Francia
let respuestaAzul = null;
let respuestaRojo = null;
let obtubeDatosRojo = false;
let obtubeDatosAzul = false;
let updateDB = false;
let codigoEspero = null;
let esperoNuevaPartida = false;
let listoRojo = false
let listoAzul = false;

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

    socket.on("empiezaPartida", (reanuda) => {
        // Enviar la posición de Francia al nuevo jugador
        socket.emit('setFranciaPosition', franciaPosition)
        if (!reanuda) {
            updateDB = false;
            //creo el registro de la partida en la DB y pongo que ahora solo se actualiza
            io.emit('pidoAzul')
            io.emit('pidoRojo')
        }
    })

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

    socket.on('setPlayerTeam', (team => {
        console.log("team", team)
        players[socket.id].team = team;
    }))




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

    socket.on('shoot_bullet_bismarck', (data) => {
        socket.broadcast.emit('shoot_bullet_bismarck', data);
    });

    socket.on('shoot_bullet_avion', (data) => {
        socket.broadcast.emit('shoot_bullet_avion', data);
    });

    socket.on('shipDestroyed', (data) => {
        data.shipType = 'bismarck';
        data.team = 'red';
        io.emit('destroyShip', data);
    });

    socket.on('disconnect', () => {
        console.log(`Jugador desconectado: ${socket.id}`);
        delete players[socket.id];
        codigoEspero = null
        esperoNuevaPartida = false
        console.log(`Jugadores restantes: ${Object.keys(players).length}`);
        io.emit('playerCount', Object.keys(players).length);
        io.emit('playerDisconnected', socket.id);
    });

    socket.on('tiempoPartida', () => {
        console.log(`Partida terminada por tiempo`);
        io.emit('finalizacionPartida', 'blue');

    });

    socket.on('pidoGuardado', () => {
        console.log('PIDO GUARDADO ')
        updateDB = true;
        io.emit('pidoRojo')
        io.emit('pidoAzul')
    })

    socket.on('saleDePartida', () => {
        io.emit('finalizacionPartida', 'none');
    })
    socket.on('ganaBismarck', () => {
        io.emit('finalizacionPartida', 'red');
    })
    socket.on('ganaArkRoyal', () => {
        io.emit('finalizacionPartida', 'blue');
    })

    socket.on('respuestaRojo', (respuesta) => {
        respuestaRojo = respuesta
        obtubeDatosRojo = true;
        if (obtubeDatosAzul) {
            obtubeDatosRojo = false;
            obtubeDatosAzul = false;
            persistoPartida(respuestaAzul, respuestaRojo, updateDB)
        }
    })
    socket.on('respuestaAzul', (respuesta) => {
        respuestaAzul = respuesta
        obtubeDatosAzul = true
        if (obtubeDatosRojo) {
            obtubeDatosRojo = false;
            obtubeDatosAzul = false;
            persistoPartida(respuestaAzul, respuestaRojo, updateDB)
        }

    })

    socket.on('vistaLateral', () => {
        updateDB = true;
        io.emit('pidoRojo')
        io.emit('pidoAzul')

        io.emit('muestroVistaLateral', players,)
    })

    socket.on('esperoCodigo', (codigo) => {
        codigoEspero = codigo;
    })
    socket.on('esperoNuevaPartida', () => {
        esperoNuevaPartida = true;
    })


    socket.on('newPlane', (player) => {
        players[socket.id] = player;
        io.emit('newPlane', player);
    });

    socket.on('deletPlane', () => {
        io.emit('deletPlane');
    });

    socket.on('aterrizaje', () => {
        io.emit('aterrizaje');
    });

    socket.on('rojoCargado', () => {
        listoRojo = true
        console.log(`SERVER ROJO LISTO azul listo==${listoAzul}`)
        if (listoAzul) {
            console.log('server / ROJO listo todos')
            io.emit('listoTodos')
            listoAzul = false
            listoRojo = false
        }
    })

    socket.on('azulCargado', () => {
        listoAzul = true
        console.log(`SERVER AZUL LISTO rojo listo==${listoRojo}`)
        if (listoRojo) {
            console.log('server / AZUL listo todos')
            io.emit('listoTodos')
            listoAzul = false
            listoRojo = false
        }
    })
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


app.get('/getCodigoEspera', (req, res) => {
    res.json(codigoEspero)
})

app.get('/getEsperoNuevaPartida', (req, res) => {
    res.json(esperoNuevaPartida)
})

