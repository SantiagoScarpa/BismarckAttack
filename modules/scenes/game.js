import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck, creacionBismarck } from '../controls/controlsBismarck.js';
import { playAudios } from './../audios.js';
import { creacionArkRoyal } from '../controls/controlsArkRoyal.js';
import { createAnimations } from '../globals.js'
import { guardarPartida } from '../persistencia/obtengoPersistencia.js';

export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
    }

    activateFire(x, y, scale) {
        if (this.bismarck.isOnFire) return;

        this.bismarck.isOnFire = true;
        this.fireSprite = this.add.sprite(x, y, 'fire0').setScale(scale);
        this.fireSprite.play('fire');
        this.fireSprite.setDepth(1);

        this.fireSprite.setPosition(this.bismarck.x, this.bismarck.y);
    }
    shootBullet() {
        let bullet = this.matter.add.sprite(this.bismarck.x, this.bismarck.y - 40, 'bismarckMisil');
        bullet.setScale(0.3);
        bullet.setCircle(3);
        bullet.setVelocity(0, -10);
        bullet.body.label = 'bullet';

        let bulletTail = this.add.image(this.bismarck.x, this.bismarck.y - 56, 'bismarckMisilCola')
        bulletTail.setScale(0.5)
        playAudios('bismarckShoot', this, settings.volumeBismarckShoot)
        setTimeout(() => {
            bulletTail.destroy();
        }, 100);


        bullet.setSensor(true);
        this.bullets.push(bullet);
        this.time.delayedCall(2000, () => bullet?.destroy());
    }

    onBulletHit(bullet) {
        let explosion = this.add.sprite(bullet.x, bullet.y, 'explosion_0').setScale(0.5);
        let bulletX = bullet.x;
        let bulletY = bullet.y;

        explosion.play('explode');
        explosion.on('animationcomplete', () => explosion.destroy());
        bullet.destroy();
        playAudios('explotion', this, settings.volumeBismarckShoot)

        if (this.bismarck.vida < 4) {
            this.bismarck.vida++;
        }


        if (this.bismarck.vida === 2 && !this.bismarck.isOnFire) {
            this.activateFire(bulletX, bulletY, 0.9);
        }
        // Al recibir 3 balas, agranda la escala del fuego
        else if (this.bismarck.vida === 3 && this.fireSprite) {
            this.fireSprite.setScale(1.5);
        }
    }

    preload() { }

    create() {
        this.socket = io();
        this.players = {};

        console.log("🎮 Iniciando escena...");

        //ACA PONEMOS EL CODIGO QUE GENERMOS AL INICIAR PARTIDA
        this.codigoAzul = 'B1A'
        this.codigoRojo = 'B1R'

        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');

        this.matter.world.on('collisionstart', (event) => {
            const { bodyA, bodyB } = event.pairs[0];

            if (((bodyA === this.bismarck.body && bodyB === this.francia.body) ||
                (bodyA === this.francia.body && bodyB === this.bismarck.body))) {
                this.scene.start('ganaBismarck');
            } else if (((bodyA.label === 'bullet' && bodyB === this.arkRoyal.body) ||
                (bodyA === this.arkRoyal.body && bodyB.label === 'bullet'))) {
                let bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                this.onBulletHit(bullet);
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

        this.bismarck = creacionBismarck(this, posX, posY, settings);
        this.arkRoyal = creacionArkRoyal(this, posX, posY, settings);

        this.bullets = [];
        this.fireSprite = null;

        // Campo de vision
        // Añadir la niebla: Cubrir todo el mapa
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8).fillRect(0, 0, 1920, 1080).setDepth(1);

        this.visionObjets = 210; // Radio de vision de objetos
        this.visionRadius = 200; // Radio de vision
        this.visionMask = this.make.graphics();
        this.visionMask.fillStyle(0xffffff);
        this.visionMask.fillCircle(this.bismarck.x, this.bismarck.y, this.visionRadius); // Crear un círculo de vision

        this.mask = new Phaser.Display.Masks.BitmapMask(this, this.visionMask);
        this.mask.invertAlpha = true;
        overlay.setMask(this.mask);

        const homeBtn = this.add.sprite(1120, 250, 'home')
        homeBtn.setScrollFactor(0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(2)
            .setScale(0.3)

        const save = this.add.sprite(1150, 250, 'save')
        save.setScrollFactor(0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(2)

        // Crear el array de objetos para ocultar segun el rango de vision
        this.objects = [];

        // Imagen del radar
        const radar = this.add.image(1140, 610, 'radar');
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
            .add(1315, 685, 320, 180, false, 'minimap')
            .setOrigin(0.5, 0.5)
            .setZoom(0.05);
        minimapCamera.ignore([this.bismarck])
        minimapCamera.ignore([radar]);
        minimapCamera.ignore([overlay]);
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



        save.on('pointerdown', () => {
            save.play('saving')
            guardarPartida(this)
        })
        save.on('animationcomplete', () => { save.setFrame(0) });

        homeBtn.on('pointerdown', () => {
            this.scene.start('menuScene')
        })


        createAnimations(this)
    }

    update() {

        checkControlsBismarck(this);

        if (this.bismarck) {  //Asegurar que el jugador local existe

            this.visionMask.clear();
            this.visionMask.fillStyle(0xffffff); // Color transparente para la zona de visión
            this.visionMask.fillCircle(this.bismarck.x, this.bismarck.y, this.visionRadius); // Círculo donde no habrá niebla

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
                if (distance <= this.visionObjets) {
                    obj.setAlpha(1);  // Hace el objeto visible 
                } else {
                    obj.setAlpha(0);  // Hace el objeto invisible 
                }
            });
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.shootBullet();
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

