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

    init(data) {
        this.team = data.team;
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
        //ESTO SE TIENEN QUE PONER POR LOS CODIGOS QUE GENERMOS ANTES 
        this.codigoRojo = 'J1RO'
        this.codigoAzul = 'J1AZ'

        // Conexión y manejo de jugadores vía socket
        this.socket = io();
        this.players = {};

        // Contador de jugadores
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
            if (count > 2) {
                alert("⚠️ Límite de jugadores alcanzado. No puedes unirte a la partida en este momento.");
            }
            return;
        });

        // Configurar controles
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');

        // Manejar colisiones del mundo
        this.matter.world.on('collisionstart', (event) => {
            const { bodyA, bodyB } = event.pairs[0];

            // Si colisiona el jugador (this.playerShip) con Francia, se dispara la escena de victoria (o derrota) según corresponda
            if (
                (bodyA === this.playerShip.body && bodyB === this.francia.body) ||
                (bodyA === this.francia.body && bodyB === this.playerShip.body)
            ) {
                // Por ejemplo, si el jugador rojo es el Bismarck, se dispara 'ganaBismarck'
                if (this.team === 'red') {
                    this.scene.start('ganaBismarck');
                }
            }
            // Si colisiona una bala contra el jugador, se ejecuta la función onBulletHit
            else if (
                ((bodyA.label === 'bullet' && bodyB === this.playerShip.body) ||
                    (bodyA === this.playerShip.body && bodyB.label === 'bullet'))
            ) {
                let bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                this.onBulletHit(bullet);
            }
        });

        // Esperar la posición de Francia desde el servidor
        this.socket.on('setFranciaPosition', (position) => {
            console.log(`Recibida posición de Francia: (${position.x}, ${position.y})`);
            this.createFrancia(position.x, position.y);
            const franciaIcon = this.add.circle(position.x, position.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([franciaIcon]);
        });

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

        save.on('pointerdown', () => {
            save.play('saving')
            guardarPartida(this)
        })
        save.on('animationcomplete', () => { save.setFrame(0) });

        homeBtn.on('pointerdown', () => {
            this.socket.disconnect()
            this.scene.start('menuScene')
        })

        // Definir posición inicial aleatoria
        let coordenadaInicioLocal = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
        let posX = 800 + coordenadaInicioLocal;
        let posY = 760;

        // Crear la nave del jugador según el bando seleccionado
        if (this.team === 'red') {
            // Jugador rojo obtiene el Bismarck
            this.playerShip = creacionBismarck(this, posX, posY, settings);
            this.playerShip.label = 'bismarck'
        } else if (this.team === 'blue') {
            // Jugador azul obtiene el ArkRoyal
            this.playerShip = creacionArkRoyal(this, posX, posY, settings);
            this.playerShip.label = 'arkRoyal'
        }

        // Guardar el jugador local en el objeto players
        this.players[this.socket.id] = this.playerShip;

        // Inicializar balas y fuego
        this.bullets = [];
        this.fireSprite = null;

        // Campo de visión: Se añade la niebla sobre el mapa
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8).fillRect(0, 0, 1920, 1080).setDepth(1);

        // Configuración de la zona de visión
        this.visionObjets = 210; // Radio para objetos
        this.visionRadius = 200;  // Radio de visión
        this.visionMask = this.make.graphics();
        this.visionMask.fillStyle(0xffffff);
        this.visionMask.fillCircle(this.playerShip.x, this.playerShip.y, this.visionRadius); // Círculo de visión

        this.mask = new Phaser.Display.Masks.BitmapMask(this, this.visionMask);
        this.mask.invertAlpha = true;
        overlay.setMask(this.mask);

        // Array de objetos para controlar la visibilidad según la distancia
        this.objects = [];

        // Imagen del radar
        const radar = this.add.image(1140, 610, 'radar');
        radar.setScrollFactor(0);
        radar.setScale(0.15);
        radar.setDepth(2);

        // Configuración de límites y cámara
        this.matter.world.setBounds(0, 0, 1920, 1080);
        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
        this.cameras.main.setZoom(2);

        // Configurar la cámara del minimapa
        const minimapCamera = this.cameras
            .add(1315, 685, 320, 180, false, 'minimap')
            .setOrigin(0.5, 0.5)
            .setZoom(0.05);
        minimapCamera.ignore([this.playerShip, radar, overlay]);
        minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);

        // Emitir al servidor que este jugador se unió
        this.socket.on("connect", () => {
            console.log(`Conectado con ID ${this.socket.id}, enviando al server`);
            this.socket.emit('newPlayer', {
                id: this.socket.id,
                x: posX,
                y: posY,
                angle: 0
            });
        });

        // Agregar nuevos jugadores al conectarse
        this.socket.on('newPlayer', (player) => {
            console.log(`Nuevo jugador conectado: ${player.id}`);
            if (player.id !== this.socket.id) {
                if (!this.players[player.id]) {
                    this.createBismarck(player.id, player.x, player.y);
                }
            }
        });

        // Sincronizar la posición de los otros jugadores
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

        // Manejar la desconexión de jugadores
        this.socket.on('playerDisconnected', (id) => {
            console.log(`Jugador ${id} se desconectó`);
            if (this.players[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }
        });

        // Mostrar el número de jugadores conectados (evento duplicado en el ejemplo original)
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
            if (count === 2) {
                console.log("Dos jugadores están en la partida");
            }
        });

        // Crear las animaciones definidas globalmente        
        createAnimations(this);

        // this.socket.on('pidoGuardado', (data) => {
        //     console.log('pidoGuardado' + this.socket.id)
        //     if (data.label === 'bismarck') {

        //         if (this.playerShip.label == 'arkRoyal') {
        //             data.arkRoyalX = this.playerShip.x
        //             data.arkRoyalY = this.playerShip.y
        //             data.arkRoyalAngle = this.playerShip.angle
        //             data.arkRoyalAvionesRestantes = this.playerShip.avionesRestantes

        //             //ESTO SE TIENE QUE CARGAR CUANDO TENGAMOS EL AVION
        //             data.avionX = 0
        //             data.avionY = 0
        //             data.avionMunicion = false
        //             data.avionOperador = false
        //             data.avionObservador = false
        //         }
        //     } else {

        //         if (this.playerShip.label == 'bismarck') {
        //             data.bismarckX = this.playerShip.x
        //             data.bismarckY = this.playerShip.y
        //             data.bismarckAngle = this.playerShip.angle
        //             data.bismarckVida = this.playerShip.vida
        //         }
        //     }
        //     data.playerId = this.socket.id
        //     data.nroPeticion = 2
        //     this.socket.emit('guardo', data)
        // })
    }

    update() {
        // Ejecuta controles según el equipo
        if (this.team === 'red') {
            checkControlsBismarck({ bismarck: this.playerShip, keys: this.keys });
        }

        // Actualiza el campo de visión y emite la posición del jugador
        if (this.playerShip) {  // Asegura que la nave del jugador existe
            this.visionMask.clear();
            this.visionMask.fillStyle(0xffffff); // Color para definir la zona visible
            this.visionMask.fillCircle(this.playerShip.x, this.playerShip.y, this.visionRadius); // Actualiza el círculo de visión

            // Emitir la posición actualizada del jugador al servidor
            this.socket.emit('playerMove', {
                id: this.socket.id,
                x: this.playerShip.x,
                y: this.playerShip.y,
                angle: this.playerShip.angle
            });
        }

        // Mostrar u ocultar objetos según estén dentro del rango de visión
        if (this.objects.length > 0) {
            this.objects.forEach((obj) => {
                const distance = Phaser.Math.Distance.Between(this.playerShip.x, this.playerShip.y, obj.x, obj.y);
                if (distance <= this.visionObjets) {
                    obj.setAlpha(1);  // Objeto visible
                } else {
                    obj.setAlpha(0);  // Objeto invisible
                }
            });
        }

        // Disparar bala al presionar SPACE
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

