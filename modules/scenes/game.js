import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck, creacionBismarck } from '../controls/controlsBismarck.js';
import { playAudios } from './../audios.js';
import { creacionArkRoyale } from '../controls/controlsArkRoyale.js';
import { creacionAvion, checkControlsAvion } from '../controls/controlsAvion.js';
import { createAnimations } from '../globals.js'

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

        this.fireSprite.setPosition(this.playerShip.x, this.playerShip.y);
    }
    shootBullet() {
        let bullet = this.matter.add.sprite(this.playerShip.x, this.playerShip.y - 40, 'bismarckMisil');
        bullet.setScale(0.3);
        bullet.setCircle(3);
        bullet.setVelocity(0, -10);
        bullet.body.label = 'bullet';

        let bulletTail = this.add.image(this.playerShip.x, this.playerShip.y - 56, 'bismarckMisilCola')
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

    preload() {
    }

    create() {
    // Conexión y manejo de jugadores vía socket
    this.socket = io();
    this.players = {};


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
            } else {
                // Aquí podrías definir otra escena o lógica para el equipo azul
                //this.scene.start('ganaArkRoyale');
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
        // Si coliciona el avion con el ArkRoyal siempre y cuando el avion este en el aire
        if (this.avionDesplegado){
            if (
                ((bodyA === this.playerShip.body && bodyB === this.portaAviones.body) ||
                (bodyA === this.portaAviones.body && bodyB === this.playerShip.body))
            ) {
                this.playerShip.destroy();
                this.playerShip = this.portaAviones;
                this.portaAvionesIcon.destroy();
                this.avionDesplegado = false;
                this.playerShip.avionesRestantes += 1;
                this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
                this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
            }
        }
    });

    // Esperar la posición de Francia desde el servidor
    this.socket.on('setFranciaPosition', (position) => {
        console.log(`Recibida posición de Francia: (${position.x}, ${position.y})`);
        this.createFrancia(position.x, position.y);
        if (this.team === 'red'){
            const franciaIcon = this.add.circle(position.x, position.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([franciaIcon]);
        }
        
    });

    // Definir posición inicial aleatoria segun el team
    let posX, posY
    // Crear la nave del jugador según el bando seleccionado
    if (this.team === 'red') {
        let coordenadaInicioLocal = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
        posX = 800 + coordenadaInicioLocal;
        posY = 760;
        // Jugador rojo obtiene el Bismarck
        this.playerShip = creacionBismarck(this, posX, posY, settings);
    } else if (this.team === 'blue') {
        let coordenadaInicioLocalX = Math.floor(Math.random() * (660 - 1 + 1)) + 1;
        let coordenadaInicioLocalY = Math.floor(Math.random() * (460 - 1 + 1)) + 1;
        posX = 100 + coordenadaInicioLocalX;
        posY = 100 + coordenadaInicioLocalY;
        // Jugador azul obtiene el ArkRoyale
        this.playerShip = creacionArkRoyale(this, posX, posY, settings);
        this.avionDesplegado = false;
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
    const radar = this.add.image(1130, 615, 'radar');
    radar.setScrollFactor(0);
    radar.setScale(0.09);
    radar.setDepth(2);

    // Configuración de límites y cámara
    this.matter.world.setBounds(0, 0, 1920, 1080);
    this.cameras.main.setBounds(0, 0, 1920, 1080);
    this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
    this.cameras.main.setZoom(2);

    // Configurar la cámara del minimapa
    this.minimapCamera = this.cameras
        .add(1300, 695, 320, 180, false, 'minimap')
        .setOrigin(0.5, 0.5)
        .setZoom(0.05);
    this.minimapCamera.ignore([this.playerShip, radar, overlay]); //
    this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);

    // Emitir al servidor que este jugador se unió
    this.socket.on("connect", () => {
        console.log(`Conectado con ID ${this.socket.id}, enviando al server`);
        this.socket.emit('newPlayer', {
            id: this.socket.id,
            x: posX,
            y: posY,
            angle: 0,
            team: this.team
        });
    });

    // Agregar nuevos jugadores al conectarse
    this.socket.on('newPlayer', (player) => {
        console.log(`Nuevo jugador conectado: ${player.id}`);
        console.log(`Equipo del jugador conectado: ${player.team}`);
        if (player.id !== this.socket.id) {
            if (!this.players[player.id]) {
                if (player.team === 'blue') {
                    this.createArkRoyale(player.id, player.x, player.y);
                }
                else {
                    this.createBismarck(player.id, player.x, player.y);
                }
            }
        }
    });

    // Sincronizar la posición de los otros jugadores
    this.socket.on('updatePlayers', (players) => {
        Object.keys(players).forEach((id) => {
            if (id !== this.socket.id) {
                if (!this.players[id]) {
                    if (this.team=== 'red') {
                        this.createArkRoyale(id, players[id].x, players[id].y, players[id].angle);
                    }
                    else {
                        this.createBismarck(id, players[id].x, players[id].y, players[id].angle);
                    }
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
}


update() {
    // Ejecuta controles según el equipo
    
    
    if (this.team === 'red') {
        checkControlsBismarck({ bismarck: this.playerShip, keys: this.keys });
        // Disparar bala al presionar SPACE
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            this.shootBullet();
        }
    } else {
        //checkControlsAvion({ avion: this.playerShip, keys: this.keys });
        if (this.avionDesplegado){
            checkControlsAvion({ avion: this.playerShip, keys: this.keys });
        }
        if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
            if (!this.avionDesplegado) {
                
                this.portaAviones = this.playerShip;
                this.portaAvionesIcon = this.add.circle(this.portaAviones.x, this.portaAviones.y, 60, 0x0000ff, 1).setOrigin(0.5, 0.5);
                this.cameras.main.ignore([this.portaAvionesIcon]);
                if(this.playerShip.angle > -10 && this.playerShip.angle < 10){
                    this.playerShip = creacionAvion(this, (this.playerShip.x + 50), this.playerShip.y, settings);
                } else {
                    this.playerShip = creacionAvion(this, (this.playerShip.x + 80), this.playerShip.y, settings);
                }
                this.avionDesplegado = true;
                this.portaAviones.avionesRestantes -= 1;
                this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
                this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
            }
        }
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
            angle: this.playerShip.angle,
            team: this.team
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
    createArkRoyale(playerId, x, y) {
        console.log(`creando ArkRoyale para ${playerId} en (${x}, ${y})`);

        let arkroyal = this.matter.add.sprite(x, y, 'portaAviones');
        arkroyal.setScale(0.15).setOrigin(0.5, 0.5);
        arkroyal.velocity = settings.arkRoyaleVelocity;

        this.players[playerId] = arkroyal;
        this.objects.push(arkroyal);
    }
    createAvion(playerId, x, y) {
        console.log(`creando Avion para ${playerId} en (${x}, ${y})`);

        let avion = this.matter.add.sprite(x, y, 'avion');
        avion.setScale(0.15).setOrigin(0.5, 0.5);
        avion.velocity = settings.avionVelocity;

        this.players[playerId] = avion;
        this.objects.push(avion);
    }
}
