import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck } from '../controls/controls.js';

export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    preload() {

        this.load.spritesheet('bismarck',
            './assets/imgs/sprites/bismarckTransparente.PNG',
            { frameWidth: 828, frameHeight: 145 }
        );

        this.load.image('waterImg', './assets/imgs/tiles/water5.png');
        this.load.image('francia', './assets/imgs/sprites/franciaTransparente.png');
        this.load.image('radar', './assets/imgs/sprites/radar.png');
        this.load.image('fog', './assets/imgs/tiles/fog2.png');
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
            const franciaIcon = this.add.circle(position.x, position.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([franciaIcon])
        });

        //Crear el barco del jugador local (sin cambios)
        let coordenadaInicioLocal = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
        let posX = 800 + coordenadaInicioLocal;
        let posY = 760;

        this.bismarck = this.matter.add.sprite(posX, posY, 'bismarck');
        this.bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        this.bismarck.velocity = settings.bismarckVelocity;
        // Campo de vision
        this.visionRadius = 200; // Radio de vision
        this.visionMask = this.add.graphics();
        this.visionMask.fillStyle(0x000000, 0);
        this.visionMask.fillCircle(this.bismarck.x, this.bismarck.y, this.visionRadius); // Crear un círculo de vision

        // Crear el array de objetos para ocultar segun el rango de vision
        this.objects = [];

        // Imagen con Niebla
        const fog = this.add.image(800, 450, 'fog');
        fog.setScrollFactor(0);
        fog.setScale(0.430);
        fog.setDepth(1);

        // Imagen del radar
        const radar = this.add.image(1140, 550, 'radar');
        radar.setScrollFactor(0);
        radar.setScale(0.15);
        radar.setDepth(2);

        // Configurar límites y cámara
        this.matter.world.setBounds(0, 0, 1920, 1080);
        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.cameras.main.startFollow(this.bismarck, true, 0.1, 0.1); // Cámara sigue el Bismarck
        this.cameras.main.setZoom(2);  // Zoom para acercar la vista al Bismarck

        // Creacion y configuracion de Minimapa
        const minimapCamera = this.cameras
            .add(1315, 560, 320, 180, false, 'minimap')
            .setOrigin(0.5, 0.5)
            .setZoom(0.05);
        minimapCamera.ignore([this.bismarck])
        minimapCamera.ignore([radar]);
        minimapCamera.ignore([fog]);
        //const franciaIcon = this.add.circle(francia.x, francia.y, 60, 0xff0000, 1).setOrigin(0.5,0.5);
        //this.cameras.main.ignore([franciaIcon])
        minimapCamera.startFollow(this.bismarck, true, 0.1, 0.1);

        this.players[this.socket.id] = this.bismarck;

        //Emitimos al servidor que este jugador se unió
        this.socket.on("connect", () => {
            console.log(`conectado con ID ${this.socket.id}, enviano al server`);
            this.socket.emit('newPlayer', {
                id: this.socket.id,
                x: posX,
                y: posY,
                angle: 0

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
                        this.createBismarck(id, players[id].x, players[id].y, players[id].angle);
                    } else {
                        this.players[id].setPosition(players[id].x, players[id].y);
                        this.players[id].setAngle(players[id].angle);
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
                y: this.bismarck.y,
                angle: this.bismarck.angle // no se si esta bien esto
            });
        }
        // Mostrar o ocultar objetos si si estn o no en el radio de vision
        if (this.objects.length > 0) {
            this.objects.forEach((obj) => {
                const distance = Phaser.Math.Distance.Between(this.bismarck.x, this.bismarck.y, obj.x, obj.y);
                if (distance <= this.visionRadius) {
                    obj.setAlpha(1);  // Hace el objeto visible 
                } else {
                    obj.setAlpha(0);  // Hace el objeto invisible 
                }
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
        this.francia.setAlpha(0);
        this.objects.push(this.francia);
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
        this.objects.push(bismarck);
    }
}
