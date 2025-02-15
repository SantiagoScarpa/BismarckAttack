import settings from './../settings.json' with {type: 'json'};
import { checkControlsBismarck } from './controls/controls.js';

export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    preload() {
        console.log(`version ${settings.version}`);

        this.load.spritesheet('bismarck',
            './assets/imgs/sprites/bismarckTransparente.PNG',
            { frameWidth: 828, frameHeight: 145 }
        );

        this.load.image('waterImg', './assets/imgs/tiles/water5.png');
        this.load.image('francia', './assets/imgs/sprites/franciaTransparente.png');
    }

    create() {
        this.socket = io();
        this.players = {}; 

        console.log("🎮 Iniciando escena...");

        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT');

        this.matter.world.on('collisionstart', (event) => {
            const { bodyA, bodyB } = event.pairs[0];

            if (this.bismarck && this.francia && ((bodyA === this.bismarck.body && bodyB === this.francia.body) ||
                (bodyA === this.francia.body && bodyB === this.bismarck.body))) {
                this.scene.start('ganaBismarck');
            }
        });

        //Esperar la posición de Francia desde el servidor
        this.socket.on('setFranciaPosition', (position) => {
            console.log(`recibida posicion Francia: (${position.x}, ${position.y})`);
            this.createFrancia(position.x, position.y);
        });

        //Crear el barco del jugador local (sin cambios)
        let coordenadaInicioLocal = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
        let posX = 800 + coordenadaInicioLocal;
        let posY = 760;

        this.bismarck = this.matter.add.sprite(posX, posY, 'bismarck');
        this.bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        this.bismarck.velocity = settings.bismarckVelocity;

        this.players[this.socket.id] = this.bismarck;

        //Emitimos al servidor que este jugador se unió
        this.socket.on("connect", () => {
            console.log(`conectado con ID ${this.socket.id}, enviano al server`);
            this.socket.emit('newPlayer', {
                id: this.socket.id,
                x: posX,
                y: posY
            });
        });

        //Agregar nuevos jugadores cuando se conectan
        this.socket.on('newPlayer', (player) => {
            console.log(`nuevo jugador conectado: ${player.id}`);
            if (player.id !== this.socket.id) {
                if (!this.players[player.id]) {
                    this.createBismarck(player.id, player.x, player.y);
                }
            }
        });

        //Sincronizar solo los otros jugadores
        this.socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id !== this.socket.id) { 
                    if (!this.players[id]) {
                        this.createBismarck(id, players[id].x, players[id].y);
                    } else {
                        this.players[id].setPosition(players[id].x, players[id].y);
                    }
                }
            });
        });

        this.socket.on('playerDisconnected', (id) => {
            console.log(`jugador ${id} se desconecto`);
            if (this.players[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }
        });

        //Mostrar el número de jugadores conectados
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
            if (count === 2) {
                console.log(" dos jugadores están en la partida");
            }
        });
    }

    update() {
        checkControlsBismarck(this);

        if (this.bismarck) {  //Asegurar que el jugador local existe
            this.socket.emit('playerMove', {
                id: this.socket.id,
                x: this.bismarck.x,
                y: this.bismarck.y
            });
        }
    }

    /**
     ** Crea Francia en una posición sincronizada desde el servidor.
     * @param {number} x - Posición X de Francia.
     * @param {number} y - Posición Y de Francia.
     */
    createFrancia(x, y) {
        console.log("creando Francia en posición sinc");
        this.francia = this.matter.add.image(x, y, 'francia');
        this.francia.setScale(0.5);
        this.francia.setStatic(true);
    }

    /**
     * Crea un barco Bismarck en la escena.
     * @param {string} playerId - ID del jugador.
     * @param {number} x - Posición X.
     * @param {number} y - Posición Y.
     */
    createBismarck(playerId, x, y) {
        console.log(`creando Bismarck para ${playerId} en (${x}, ${y})`);

        let bismarck = this.matter.add.sprite(x, y, 'bismarck');
        bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        bismarck.velocity = settings.bismarckVelocity;

        this.players[playerId] = bismarck;
    }
}
