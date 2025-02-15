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
        this.socket = io(); // ✅ Mantuvimos la conexión dentro de `create()`

        this.players = {}; 

        let coordenadaInicio = Math.floor(Math.random() * (960 - 1 + 1)) + 1;

        this.francia = this.matter.add.image(600 + coordenadaInicio, 40, 'francia');
        this.francia.setScale(0.5);
        this.francia.setStatic(true);

        coordenadaInicio = Math.floor(Math.random() * (760 - 1 + 1)) + 1;

        this.bismarck = this.matter.add.sprite(800 + coordenadaInicio, 760, 'bismarck');
        this.bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        this.bismarck.velocity = settings.bismarckVelocity;

        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT');

        this.matter.world.on('collisionstart', (event) => {
            const { bodyA, bodyB } = event.pairs[0];

            if ((bodyA === this.bismarck.body && bodyB === this.francia.body) ||
                (bodyA === this.francia.body && bodyB === this.bismarck.body)) {
                this.scene.start('ganaBismarck');
            }
        });

        // ✅ Se emite `newPlayer` inmediatamente
        this.socket.emit('newPlayer', {
            id: this.socket.id,
            x: this.bismarck.x,
            y: this.bismarck.y
        });

        this.socket.on('newPlayer', (player) => {
            console.log(`🆕 Nuevo jugador conectado: ${player.id}`);
            if (!this.players[player.id]) {
                this.players[player.id] = this.matter.add.sprite(player.x, player.y, 'bismarck').setScale(0.10);
            }
        });

        this.socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id !== this.socket.id) {
                    if (!this.players[id]) {
                        this.players[id] = this.matter.add.sprite(players[id].x, players[id].y, 'bismarck').setScale(0.10);
                    } else {
                        this.players[id].setPosition(players[id].x, players[id].y);
                    }
                }
            });
        });

        this.socket.on('playerDisconnected', (id) => {
            console.log(`🚫 Jugador ${id} se ha desconectado`);
            if (this.players[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }
        });

        // ✅ Mostrar el número de jugadores conectados
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
            if (count === 2) {
                console.log("✅ ¡Dos jugadores están en la partida!");
            }
        });
    }

    update() {
        checkControlsBismarck(this);

        this.socket.emit('playerMove', {
            id: this.socket.id,
            x: this.bismarck.x,
            y: this.bismarck.y
        });
    }
}
