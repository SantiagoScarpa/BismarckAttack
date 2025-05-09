import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck, creacionBismarck } from '../controls/controlsBismarck.js';
import { playAudios, stopAudios } from './../audios.js';
import { creacionArkRoyale, checkControlsArkRoyale } from '../controls/controlsArkRoyale.js';
import { creacionAvion, checkControlsAvion } from '../controls/controlsAvion.js';
import { createAnimations, generarCodigoPartida, mostrarTextoTemporal } from '../globals.js'
import { armoRespuestaRojo, armoRespuestaAzul } from '../persistencia/obtengoPersistencia.js';


export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");

        this.targetOffset = { x: 0, y: -150 };
    }

    init(data) {
        this.team = data.team;
        this.socket = data.socket;
        this.reanudo = data.reanudo;
        this.partida = data.partida;
        this.playerDestroyed = false;
    }

    //si soy el bismarck veo una vida mas de el ark royal que en el cliente del ark royal
    shoot_bullet_bismarck() {
        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            let bullet = this.matter.add.sprite(this.playerShip.x, this.playerShip.y, 'bismarckMisil').setDepth(3);;
            bullet.owner = 'bismarck'
            bullet.setScale(0.3);
            bullet.setCircle(3);

            let dx = this.crosshair.x - this.playerShip.x;
            let dy = this.crosshair.y - this.playerShip.y;
            let angle = Math.atan2(dy, dx);

            // Definir la velocidad del misil (puedes ajustar este valor)
            let bulletSpeed = 10;
            let vx = bulletSpeed * Math.cos(angle);
            let vy = bulletSpeed * Math.sin(angle);
            bullet.setVelocity(vx, vy);

            bullet.setRotation(angle + Math.PI / 2);

            bullet.body.label = 'bullet';

            let bulletTail = this.add.image(this.playerShip.x, this.playerShip.y, 'bismarckMisilCola').setDepth(3);
            bulletTail.setScale(0.5)

            playAudios('bismarckShoot', this, settings.volumeBismarckShoot)
            setTimeout(() => {
                bulletTail.destroy();
            }, 100);

            bullet.setSensor(true);
            this.bullets.push(bullet);
            this.time.delayedCall(2000, () => bullet?.destroy());
        }
    }

    shoot_bullet_avion() {
        if (this.playerShip.label === 'avion') {
            let bullet = this.matter.add.sprite(this.playerShip.x, this.playerShip.y, 'torpedo');
            bullet.owner = 'avion'
            bullet.setScale(0.02);
            bullet.setCircle(3);

            let angle = this.playerShip.rotation;

            let bulletSpeed = 10;
            let vx = bulletSpeed * Math.cos(angle);
            let vy = bulletSpeed * Math.sin(angle);
            bullet.setVelocity(vx, vy);

            bullet.setRotation(angle + Math.PI / 2);
            bullet.body.label = 'bullet';

            let bulletTail = this.add.image(this.playerShip.x, this.playerShip.y, 'bismarckMisilCola')
            bulletTail.setScale(0.5)

            playAudios('avion_shoot', this, settings.volumneAvion_shoot)
            setTimeout(() => {
                bulletTail.destroy();
            }, 100);


            bullet.setSensor(true);
            this.bullets.push(bullet);
            this.time.delayedCall(2000, () => bullet?.destroy());
        }
    }

    //Crea el misil en cada cliente recibido por el sv

    createBulletFromData(data) {
        let spriteKey = data.spriteKey || 'bismarckMisil';
        let bullet = this.matter.add.sprite(data.x, data.y, spriteKey);
        bullet.setScale(0.3);

        if (spriteKey === 'torpedo') {
            bullet.setScale(0.02);
        }
        bullet.setCircle(3);

        if (data.rotation !== undefined) {
            // Si se envió la rotación, utilízala directamente
            let angle = data.rotation;
            let bulletSpeed = 10;
            let vx = bulletSpeed * Math.cos(angle);
            let vy = bulletSpeed * Math.sin(angle);
            bullet.setVelocity(vx, vy);
            bullet.setRotation(angle + Math.PI / 2);
        } else {
            // Calcular la dirección utilizando las coordenadas del puntero enviadas
            let dx = data.pointerX - data.x;
            let dy = data.pointerY - data.y;
            let angle = Math.atan2(dy, dx);

            // Definir la velocidad del misil
            let bulletSpeed = 10;
            let vx = bulletSpeed * Math.cos(angle);
            let vy = bulletSpeed * Math.sin(angle);
            bullet.setVelocity(vx, vy);

            bullet.setRotation(angle + Math.PI / 2);
        }
        bullet.body.label = 'bullet';
        bullet.owner = data.owner;
        // Crear la cola del misil
        let bulletTail = this.add.image(data.x, data.y, 'bismarckMisilCola');
        bulletTail.setScale(0.5);

        // Reproducir el audio correspondiente según el spriteKey
        if (spriteKey === 'torpedo') {
            playAudios('avion_shoot', this, settings.volumeAvionShoot);
        } else {
            playAudios('bismarckShoot', this, settings.volumeBismarckShoot);
        }

        setTimeout(() => {
            bulletTail.destroy();
        }, 100);

        bullet.setSensor(true);
        this.bullets.push(bullet);
        this.time.delayedCall(2000, () => bullet?.destroy());
    }


    onBulletHit(Nave, bullet) {
        const bulletX = bullet.x;
        const bulletY = bullet.y;

        let explosion = this.add.sprite(bulletX, bulletY, 'explosion_0').setScale(0.5);
        explosion.play('explode');
        explosion.on('animationcomplete', () => explosion.destroy());
        bullet.destroy();

        stopAudios('avion_shoot', this);
        playAudios('explotion', this, settings.volumeExplotion);

        if (Nave.vida === 2 && !Nave.isOnFire) {
            // Usamos la posición del impacto para activar el fuego
            Nave.fireSprite = this.add.sprite(Nave.x, Nave.y - 20, 'fire0').setScale(0.9);
            Nave.fireSprite.play('fire');
            Nave.isOnFire = true
            Nave.fireSprite.setDepth(3);
            this.objects.push(Nave.fireSprite);
        }

    }

    preload() { }

    async create() {
        let durPartida = sessionStorage.getItem('duracionPartida')
        if (!durPartida)
            durPartida = 2
        this.duracionPartida = this.reanudo ? this.partida.tiempoPartida : durPartida * 60 * 1000

        this.timerText = this.add.text(431, 260, '', {
            fontFamily: 'Rockwell',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11).setScrollFactor(0).setScale(0.5);



        if (!this.reanudo) {
            try {
                this.codigoPartida = await generarCodigoPartida()
            }
            catch (e) {
                alert(e)
            }
        } else {
            this.codigoPartida = this.team == 'red' ? this.partida.codigoRojo : this.partida.codigoAzul
        }

        this.dispTextCodigoPartida = this.add.text(490, 240, `Codigo de partida: ${this.codigoPartida}`, {
            fontFamily: 'Rockwell',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11).setScrollFactor(0).setScale(0.5);

        // // Imagen del radar
        const radar = this.add.image(1130, 615, 'radar');
        radar.setScrollFactor(0);
        radar.setScale(0.09);
        radar.setDepth(11);
        radar.setAlpha(0.6);

        const heartSpacing = 25;
        const heartsTotalWidth = (4 - 1) * heartSpacing;
        const startX = 1138 - heartsTotalWidth / 2;
        const startY = 615 - (radar.displayHeight / 2) - 20;
        let vidaBismarck = this.reanudo ? this.partida.bismarck.vida : settings.bismarckVida;
        let vidaArkRoyal = this.reanudo ? this.partida.arkRoyal.vida : settings.arkRoyalVida;
        if (this.team === 'red') {
            // Agregar los sprites de vida (corazones) sobre el radar
            this.bismarckHearts = [];
            for (let i = 0; i < vidaBismarck; i++) {
                let hearth = this.add.image(startX + i * heartSpacing, startY, 'hearth')
                hearth.setScrollFactor(0);
                hearth.setScale(0.04);
                hearth.setDepth(11);
                this.bismarckHearts.push(hearth);
            }
        }

        if (this.team === 'blue') {
            this.arkRoyalHearts = [];
            for (let i = 0; i < vidaArkRoyal; i++) {
                let hearth = this.add.image(startX + i * heartSpacing, startY, 'hearth')
                hearth.setScrollFactor(0);
                hearth.setScale(0.04);
                hearth.setDepth(11);
                this.arkRoyalHearts.push(hearth);
            }
        }

        // Conexión y manejo de jugadores vía socket

        this.players = {};
        this.jugadorDesconectado = false;
        // Inicializar balas y fuego
        this.bullets = [];
        this.fireSprite = null;

        // Contador de jugadores
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
            if (count > 2) {
                alert("⚠️ Límite de jugadores alcanzado. No puedes unirte a la partida en este momento.");
            }
            return;
        });

        this.socket.emit("empiezaPartida", this.reanudo)

        this.inicioPartida = Date.now()
        this.updateTimer = () => {
            let tiempoFaltante = this.duracionPartida - (Date.now() - this.inicioPartida);
            if (tiempoFaltante <= 0) {
                this.timerText.setText('00:00');
                this.socket.emit('tiempoPartida');
            } else {
                let minutes = Math.floor(tiempoFaltante / 60000);
                let seconds = Math.floor((tiempoFaltante % 60000) / 1000);
                this.timerText.setText(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
            }
        };

        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            callbackScope: this,
            loop: true
        });


        // Configurar controles
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,P');

        // Manejar colisiones del mundo
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;

                // Caso: Bismarck colisiona con Francia
                if (
                    this.playerShip.body.label === 'bismarck' &&
                    (
                        (bodyA === this.playerShip.body && bodyB === this.francia.body) ||
                        (bodyA === this.francia.body && bodyB === this.playerShip.body)
                    )
                ) {
                    this.socket.emit('hayGanador', {
                        teamGanador: 'red',
                        motivo: 'Bismarck llego a Francia'
                    })
                }
                // Colisión entre bala y ArkRoyal
                else if (
                    (bodyA.label === 'bullet' && bodyB.label === 'arkroyal') ||
                    (bodyA.label === 'arkroyal' && bodyB.label === 'bullet')
                ) {
                    const bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                    const arkroyal = bodyA.label === 'arkroyal' ? bodyA.gameObject : bodyB.gameObject;
                    if (bullet && arkroyal) {
                        arkroyal.vida--;
                        this.onBulletHit(arkroyal, bullet);
                        if (this.team === 'blue' && this.arkRoyalHearts.length > 0) {
                            let heartToRemove = this.arkRoyalHearts.pop();
                            heartToRemove.destroy();
                        }
                        if (arkroyal.vida === 0) {
                            this.socket.emit('hayGanador', {
                                teamGanador: 'red',
                                motivo: 'Bismarck hundio al Ark Royal'
                            })
                        }
                    }
                }
                // Colisión entre bala y avión
                else if (
                    (bodyA.label === 'bullet' && bodyB.label === 'avion') ||
                    (bodyA.label === 'avion' && bodyB.label === 'bullet')
                ) {
                    const bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                    const avion = bodyA.label === 'avion' ? bodyA.gameObject : bodyB.gameObject;
                    if (bullet.owner === 'avion') return;
                    if (bullet && avion) {
                        avion.vida--;
                        this.onBulletHit(avion, bullet);
                        let explotion_ark = this.add.sprite(avion.x, avion.y - 40, 'explotion_ark1').setScale(1);
                        explotion_ark.play('explode_arkRoyal');

                        explotion_ark.once('animationcomplete', () => {
                            if (avion && avion.fireSprite) {
                                avion.fireSprite.destroy();
                            }
                        });
                        if (this.team === 'blue') {

                            this.aterrizando = true;
                            this.playerShip.setVelocityX(0);
                            this.playerShip.setVelocityY(0);
                            stopAudios('avionAire', this);
                            this.socket.emit('aterrizaje');
                            this.avionMunicion.setText(' ');
                            this.playerShip.anims.play('aterrizaje');
                            // Escucha el evento 'animationcomplete' para la animación 'aterrizaje'
                            clearInterval(this.intervaloTiempo); // Detiene el intervalo
                            this.barraFondo.destroy();
                            this.barraRelleno.destroy();
                            this.tiempoRestante = 0;
                            this.playerShip.on('animationcomplete-aterrizaje', function () {
                                this.avionDesplegado = false;
                                this.playerShip.destroy();
                                this.playerShip = this.portaAviones;
                                this.portaAvionesIcon.destroy();
                                this.socket.emit('deletPlane');
                                this.playerShip.avionesRestantes -= 1;
                                if (this.playerShip.avionesRestantes <= 0) {
                                    this.socket.emit('hayGanador', {
                                        teamGanador: 'red',
                                        motivo: 'Todos los aviones fueron derribados'
                                    })
                                }
                                this.dispCantAviones.setText(`Aviones disponibles: ${this.playerShip.avionesRestantes}`);
                                this.cameras.main.startFollow(this.portaAviones, true, 0.1, 0.1);
                                this.minimapCamera.startFollow(this.portaAviones, true, 0.1, 0.1);
                                this.visionObjets = 210; // Radio para objetos
                                this.visionRadius = 200;  // Radio de visión
                                this.aterrizando = false;
                            }, this); // El 'this' final asegura que el contexto sea el correcto

                        }

                    }
                }
                // Colisión entre bala y bismarck
                else if (
                    (bodyA.label === 'bullet' && bodyB.label === 'bismarck') ||
                    (bodyA.label === 'bismarck' && bodyB.label === 'bullet')
                ) {
                    const bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                    const bismarck = bodyA.label === 'bismarck' ? bodyA.gameObject : bodyB.gameObject;
                    if (bullet.owner === 'bismarck') return;
                    if (bullet && bismarck) {
                        bismarck.vida--;
                        this.onBulletHit(bismarck, bullet);
                        if (this.team === 'red' && this.bismarckHearts.length > 0) {
                            let heartToRemove = this.bismarckHearts.pop();
                            heartToRemove.destroy();
                        }
                        if (bismarck.vida === 0) {
                            bismarck.destroyed = true;
                            this.socket.emit('hayGanador', {
                                teamGanador: 'blue',
                                motivo: 'El bismarck fue destruido'
                            })
                        }
                    }
                }
                // Colisión entre ArkRoyal y avión
                else if (
                    (bodyA.label === 'avion' && bodyB.label === 'arkroyal') ||
                    (bodyA.label === 'arkroyal' && bodyB.label === 'avion')
                ) {
                    if (this.team === 'blue' && !this.aterrizando) {
                        this.aterrizando = true;
                        this.playerShip.setVelocityX(0);
                        this.playerShip.setVelocityY(0);
                        this.portaAviones.setVelocityX(0);
                        this.portaAviones.setVelocityY(0);
                        this.socket.emit('aterrizaje', false);
                        stopAudios('avionAire', this);
                        this.playerShip.anims.play('aterrizaje');
                        clearInterval(this.intervaloTiempo); // Detiene el intervalo
                        this.barraFondo.destroy();
                        this.barraRelleno.destroy();
                        this.avionMunicion.setText(' ');
                        this.tiempoRestante = 0;
                        // Escucha el evento 'animationcomplete' para la animación 'aterrizaje'
                        this.playerShip.on('animationcomplete-aterrizaje', function () {
                            clearInterval(this.intervaloTiempo);
                            this.barraFondo.destroy();
                            this.barraRelleno.destroy();
                            this.avionDesplegado = false;
                            this.tiempoRestante = 0;
                            this.playerShip.destroy(); // Destruye el playerShip DESPUÉS de la animación
                            this.playerShip = this.portaAviones;
                            this.portaAvionesIcon.destroy();
                            this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
                            this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
                            this.visionObjets = 210;
                            this.visionRadius = 200;
                            this.socket.emit('deletPlane');
                            this.aterrizando = false;
                        }, this); // El 'this' final asegura que el contexto sea el correcto
                    }
                }


                else if ((bodyA.label === 'avion' && bodyB.label === 'bismarck') ||
                    (bodyA.label === 'bismarck' && bodyB.label === 'avion')) {
                    const avionBody = bodyA.label === 'avion' ? bodyA : bodyB;
                    avionBody.isSensor = true;
                }


            });
        });

        const graphics = this.make.graphics();
        graphics.fillStyle(0x00aaff, 1);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('blueParticle', 10, 10);
        graphics.destroy();

        this.aterrizando = false; //defino flag para animacion de aterrizaje
        // Array de objetos para controlar la visibilidad según la distancia
        this.objects = [];

        this.waterTrail = this.add.particles(0, 0, 'blueParticle', {
            speed: { min: 20, max: 50 },  // Velocidad de las partículas
            scale: { start: 0.3, end: 0 },  // Se hacen más pequeñas con el tiempo
            alpha: { start: 1, end: 0 }, // Se desvanecen
            lifespan: 800, // Duración en ms
            blendMode: 'ADD', // Efecto de fusión para más realismo
        });
        this.waterTrail.setDepth(1);  // Asegura que está debajo del barco

        //ESTO SE PODRIA BORRAR YA QUE APUNTAMOS CON EL MOUSE NO?
        this.keysMira = this.input.keyboard.addKeys('W,A,S,D');

        if (this.reanudo) {
            this.createFrancia(this.partida.francia.x, this.partida.francia.y);
            if (this.team === 'red') {
                const franciaIcon = this.add.circle(this.partida.francia.x, this.partida.francia.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
                this.cameras.main.ignore([franciaIcon]);
            }
        } else {
            // Esperar la posición de Francia desde el servidor
            this.socket.on('setFranciaPosition', (position) => {
                this.createFrancia(position.x, position.y);
                if (this.team === 'red') {
                    const franciaIcon = this.add.circle(position.x, position.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
                    this.cameras.main.ignore([franciaIcon]);
                }
            });
        }
        const homeBtn = this.add.sprite(1120, 240, 'home')
        homeBtn.setScrollFactor(0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(5)
            .setScale(0.3)

        const save = this.add.sprite(1150, 240, 'save')
        save.setScrollFactor(0)
            .setOrigin(0.5, 0.5)
            .setInteractive()
            .setDepth(5)

        //cartel de municion de avion
        if (this.team === 'blue') {
            this.avionMunicion = this.add.text(1130, 510, ' ', {
                fontFamily: 'Rockwell',
                fontSize: 19,
                color: '#ffffff'
            });
            this.avionMunicion.setScrollFactor(0)
                .setOrigin(0.5, 0.5)
                .setInteractive()
                .setDepth(11)
                .setScale(0.5)

        }


        save.on('pointerdown', () => {
            save.play('saving')
            this.socket.emit('pidoGuardado')
        })

        if (this.team === 'red') {
            this.socket.on('pidoRojo', () => {
                let respuesta = armoRespuestaRojo(this)
                this.socket.emit('respuestaRojo', respuesta)
                mostrarTextoTemporal(this, 'Partida guardada', 3000)
            })
        } else (
            this.socket.on('pidoAzul', () => {
                let respuesta = armoRespuestaAzul(this)
                this.socket.emit('respuestaAzul', respuesta)
                mostrarTextoTemporal(this, 'Partida guardada', 3000)
            })
        )

        save.on('animationcomplete', () => { save.setFrame(0) });

        homeBtn.on('pointerdown', () => {
            this.socket.emit('saleDePartida');
        })

        // Definir posición inicial aleatoria

        let posX, posY, angle;

        // Crear la nave del jugador según el bando seleccionado
        if (this.team === 'red') {
            let coordenadaInicioLocal = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
            posX = this.reanudo ? this.partida.bismarck.x : (800 + coordenadaInicioLocal);
            posY = this.reanudo ? this.partida.bismarck.y : 760;
            angle = this.reanudo ? this.partida.bismarck.angle : 0;
            // Jugador rojo obtiene el Bismarck
            this.playerShip = creacionBismarck(this, posX, posY, angle, settings);
            this.playerShip.id = this.socket.id;
        } else if (this.team === 'blue') {
            let coordenadaInicioLocalX = Math.floor(Math.random() * (660 - 1 + 1)) + 1;
            let coordenadaInicioLocalY = Math.floor(Math.random() * (460 - 1 + 1)) + 1;
            posX = this.reanudo ? this.partida.arkRoyal.x : (100 + coordenadaInicioLocalX);
            posY = this.reanudo ? this.partida.arkRoyal.y : (100 + coordenadaInicioLocalY);
            angle = this.reanudo ? this.partida.arkRoyal.angle : 0;
            let avionesRestantes = this.reanudo ? this.partida.arkRoyal.avionesRestantes : 10;
            vidaArkRoyal = this.reanudo ? this.partida.arkRoyal.vida : settings.arkRoyalVida;
            // Jugador azul obtiene el ArkRoyale
            this.playerShip = creacionArkRoyale(this, posX, posY, angle, avionesRestantes, vidaArkRoyal, settings);
            this.avionDesplegado = false;
            this.dispCantAviones = this.add.text(1130, 661, `Aviones disponibles: ${this.playerShip.avionesRestantes}`, {
                fontFamily: 'Rockwell',
                fontSize: 18,
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(11).setScrollFactor(0).setScale(0.5);
        }

        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            this.crosshair = this.add.image(
                this.playerShip.x + this.targetOffset.x,
                this.playerShip.y + this.targetOffset.y,
                'crosshair'
            );
            this.crosshair.setScale(0.05);
            this.crosshair.setDepth(3); // Asegura que esté por encima de otros elementos
            this.crosshairSpeed = 3
        }

        // Guardar el jugador local en el objeto players
        this.players[this.socket.id] = this.playerShip;

        // Campo de visión: Se añade la niebla sobre el mapa
        const overlay = this.add.graphics();
        overlay.fillStyle(0x000000, 0.8).fillRect(0, 0, 1920, 1080).setDepth(4);

        // Configuración de la zona de visión
        this.visionObjets = 210; // Radio para objetos
        this.visionRadius = 200;  // Radio de visión
        this.visionMask = this.make.graphics();
        this.visionMask.fillStyle(0xffffff);
        this.visionMask.fillCircle(this.playerShip.x, this.playerShip.y, this.visionRadius); // Círculo de visión

        this.mask = new Phaser.Display.Masks.BitmapMask(this, this.visionMask);
        this.mask.invertAlpha = true;
        overlay.setMask(this.mask);

        // Reprodusco musica de fondo si no se esta reproduciendo
        if (!this.musicFondoOn) {
            this.musicFondoOn = true;
            playAudios('musicfondo', this, settings.volumeMusicFondo);
        }

        // Imagen del radar
        // const radar = this.add.image(1130, 615, 'radar');
        // radar.setScrollFactor(0);
        // radar.setScale(0.09);
        // radar.setDepth(4);
        // radar.setAlpha(0.6);

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
        this.minimapCamera.ignore([this.playerShip, radar, overlay, this.dispTextCodigoPartida, homeBtn, save]); //
        this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);

        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        //------------------------INTERACCION CON EL SEVIIDOR--------------------------------------------------//
        /////////////////////////////////////////////////////////////////////////////////////////////////////////
        // Emitir al servidor que este jugador se unió
        this.socket.on("connect", () => {
            console.log(`Conectado con ID ${this.socket.id}, enviando al server`);
            this.socket.emit('newPlayer', {
                id: this.socket.id,
                x: posX,
                y: posY,
                angle: angle,
                team: this.team
            });
        });

        // Agregar nuevos jugadores al conectarse
        this.socket.on('newPlayer', (player) => {
            console.log(`Equipo del jugador conectado: ${player.team}`);
            if (player.id !== this.socket.id) {
                if (!this.players[player.id]) {
                    // Aquí verificamos el team
                    if (player.team === 'red') {
                        this.createBismarck(player.id, player.x, player.y);
                    } else {
                        this.createArkRoyal(player.id, player.x, player.y);
                    }
                }
            }
        });

        this.socket.on('newPlane', (player) => {
            if (this.team === 'red') {
                this.createAvion(player.id, player.x, player.y);
            }
        });

        this.socket.on('deletPlane', () => {
            if (this.team === 'red') {
                let indice = this.objects.findIndex(obj => obj.body && obj.body.label === 'avion');
                if (indice !== -1) {
                    let avionEncontrado = this.objects[indice];
                    this.objects.splice(indice, 1);
                    avionEncontrado.destroy();
                }
                this.avion.destroy();
            }
        });

        this.socket.on('aterrizaje', () => {
            if (this.team === 'red') {
                this.avion.anims.play('aterrizaje');
            }
        });

        this.socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id !== this.socket.id) {
                    const playerData = players[id];
                    if (!this.players[id]) {
                        // Crear nave según el equipo
                        if (playerData.team === 'red') {
                            this.createBismarck(game, id, playerData.x, playerData.y, playerData.angle);
                        } else if (playerData.team === 'blue') {
                            this.createArkRoyal(id, playerData.x, playerData.y, playerData.angle);
                        }
                    } else {
                        // Actualizar posición y ángulo
                        if (playerData.label === 'avion' && this.avion) {
                            this.avion.setPosition(playerData.x, playerData.y);
                            this.avion.setAngle(playerData.angle);
                            this.players[id].setPosition(playerData.Px, playerData.Py);
                            this.players[id].setAngle(playerData.Pangle);
                        } else {
                            this.players[id].setPosition(playerData.x, playerData.y);
                            this.players[id].setAngle(playerData.angle);
                        }

                        // Manejo del sprite de fuego para el jugador remoto
                        if (playerData.fireActive) {
                            // Crear el sprite de fuego si aún no existe
                            if (!this.players[id].fireSprite) {
                                this.players[id].fireSprite = this.add.sprite(
                                    playerData.x,
                                    playerData.y,
                                    'fire0'
                                )
                                    .setOrigin(0.5, 0.5)
                                    .play('fire')
                                    .setDepth(1)
                                    .setAlpha(0);

                                this.objects.push(this.players[id].fireSprite);
                                
                            }

                            // Calcular offset basado en la altura de la nave
                            const offsetY = this.players[id].displayHeight * 0.3;
                            // Convertir el ángulo (en grados) a radianes
                            const radAngle = Phaser.Math.DegToRad(playerData.angle);
                            // Calcular el offset aplicando la rotación
                            const fireOffset = new Phaser.Math.Vector2(0, -offsetY).rotate(radAngle);

                            // Actualizar posición y rotación del sprite de fuego
                            this.players[id].fireSprite.setPosition(
                                playerData.x + fireOffset.x,
                                playerData.y + fireOffset.y
                            );
                            this.players[id].fireSprite.setRotation(radAngle);

                        } else if (this.players[id].fireSprite) {
                            // Destruir el sprite de fuego si no está activo
                            this.players[id].fireSprite.destroy();
                            this.players[id].fireSprite = null;
                        }
                    }
                }
            });
        });


        // Manejar la desconexión de jugadores
        this.socket.on('playerDisconnected', (id) => {
            this.jugadorDesconectado = true
            if (this.players[id]) {
                this.players[id].destroy();
                delete this.players[id];
            }

            this.socket.emit('saleDePartida');
        });

        // Mostrar el número de jugadores conectados (evento duplicado en el ejemplo original)
        this.socket.on('playerCount', (count) => {
            console.log(`👥 Jugadores conectados: ${count}`);
        });

        this.socket.on('shoot_bullet_bismarck', (data) => {
            this.createBulletFromData(data);
        });

        this.socket.on('shoot_bullet_avion', (data) => {
            this.createBulletFromData(data);
        });

        if (this.playerShip.label === 'bismarck') {
            this.input.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) {
                    if (!this.lastShotTime || this.time.now - this.lastShotTime > 200) {
                        const shootData_bismarck = {
                            x: this.playerShip.x,
                            y: this.playerShip.y,
                            pointerX: this.input.activePointer.worldX,
                            pointerY: this.input.activePointer.worldY,
                            owner: 'bismarck'
                        };
                        // Emitir el disparo al servidor para sincronizarlo con otros clientes
                        this.socket.emit('shoot_bullet_bismarck', shootData_bismarck);

                        // Ejecutar el disparo localmente
                        this.shoot_bullet_bismarck();
                        this.lastShotTime = this.time.now;
                    }
                }
            });
        }

        if (this.team === 'red') {
            //this.input.setDefaultCursor('none');
        } else {
            this.minimapCamera.ignore([this.dispCantAviones, this.avionMunicion]);
        }

        // Crear las animaciones definidas globalmente        
        createAnimations(this);

        this.socket.on('finalizacionPartida', (ganador) => {
            this.socket.disconnect()
            if (ganador.teamGanador === 'none') {
                mostrarTextoTemporal(this, 'El otro jugador se ha desconectado, se cerrara la partida', 3000)
                setTimeout(() => {
                    location.reload();
                }, 3000);
            }
            else if (ganador.teamGanador === 'red') {
                if (this.team === 'red') {
                    this.scene.start('ganaBismarck', { motivo: ganador.motivo });
                } else {
                    this.scene.start('pierdeArkRoyal', { motivo: ganador.motivo });
                }
            }
            else if (ganador.teamGanador === 'blue') {
                if (this.team === 'blue') {
                    this.scene.start('ganaArkRoyal', { motivo: ganador.motivo });
                } else {
                    this.scene.start('pierdeBismarck', { motivo: ganador.motivo });
                }
            }
        })

        this.socket.on('muestroVistaLateral', (players) => {
            const franciaPosition = { x: this.francia.x, y: this.francia.y }
            this.scene.sleep();
            this.scene.launch('sceneVistaLateral', { players, socketId: this.socket.id, franciaPosition: franciaPosition, visionDelAvion: this.playerShip.visionDelAvion })
        })

        if (this.team === 'red' && this.reanudo && this.partida.arkRoyal.avionActual !== null) {
            this.socket.emit('rojoCargado') //tengo que avisar que el rojo ya cargo si hay un avion para que no den error los controles
        }
        if (this.reanudo && this.partida.arkRoyal.avionActual !== null && this.team === 'blue') {
            this.socket.emit('azulCargado')
            this.socket.on('listoTodos', () => {
                this.avionReanudado = true
                this.avionOpcion = this.partida.arkRoyal.avionActual.opcion
                this.despegueAvion(this.avionOpcion, this.partida.arkRoyal.avionActual.x, this.partida.arkRoyal.avionActual.y);
            })

        }

    }

    update() {
        // Ejecuta controles según el equipo

        if (this.playerDestroyed) return;
        if (!this.playerShip) return;
        if (this.jugadorDesconectado) return;

        if (this.playerShip?.fireSprite) {
            // Calcular offset basado en la altura de la nave
            const offsetY = this.playerShip.displayHeight * 0.3; // 30% de la altura de la nave

            // Aplicar posición relativa a la rotación
            const fireOffset = new Phaser.Math.Vector2(0, -offsetY)
                .rotate(this.playerShip.rotation);

            this.playerShip.fireSprite.setPosition(
                this.playerShip.x + fireOffset.x,
                this.playerShip.y + fireOffset.y
            );

            // Rotar el fuego junto con la nave
            this.playerShip.fireSprite.setRotation(this.playerShip.rotation);
        }

        if (this.playerShip.label === 'bismarck') {
            // Controles bismarck
            checkControlsBismarck({ bismarck: this.playerShip, keys: this.keys });
        } else if (this.playerShip.label === 'avion' && !this.aterrizando) {
            // Controles y disparo para Avión
            checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                if (this.playerShip.municion > 0) {
                    this.playerShip.municion--;
                    this.avionMunicion.setText('Munición de avión: ' + this.playerShip.municion);
                    this.shoot_bullet_avion();
                    const shootData_avion = {
                        x: this.playerShip.x,
                        y: this.playerShip.y,
                        spriteKey: 'torpedo',
                        rotation: this.playerShip.rotation,
                        owner: 'avion'
                    };
                    // Emitir el disparo al servidor para sincronizarlo con otros clientes
                    this.socket.emit('shoot_bullet_avion', shootData_avion);
                }
            }
        } else if (this.playerShip.label === 'arkroyal') {
            // Si el avión ya fue desplegado, se usan controles de avión; de lo contrario, controles de ArkRoyal.
            if (this.avionDesplegado) {
                checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            } else {
                if (!this.menuAvionDespegado)
                    checkControlsArkRoyale({ ArkRoyale: this.playerShip, keys: this.keys });
            }
            if (this.playerShip.label === 'arkroyal') {
                if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                    if (!this.menuAvionDespegado) {
                        this.playerShip.setVelocityX(0);
                        this.playerShip.setVelocityY(0);
                        this.menuAvion(this.playerShip.x, this.playerShip.y);
                    }

                }
            }
        }


        if (this.playerShip?.destroyed) {
            this.playerDestroyed = true;
            this.socket.emit('hayGanador', {
                teamGanador: 'blue',
                motivo: 'El bismarck fue destruido'
            })
            return;
        }

        if (Phaser.Input.Keyboard.JustDown(this.keys.P)) {
            this.socket.emit('vistaLateral')
        }
        const tailOffset = { x: 0, y: 40 };
        //if (!this.playerShip) return;    
        if (this.playerShip.label === 'bismarck') {
            // Obtén el ángulo actual del Bismarck
            const angle = this.playerShip.rotation;

            // Aplica la transformación de rotación al vector (0,40)
            const rotatedOffsetX = tailOffset.x * Math.cos(angle) - tailOffset.y * Math.sin(angle);
            const rotatedOffsetY = tailOffset.x * Math.sin(angle) + tailOffset.y * Math.cos(angle);

            // Posiciona el efecto en la cola del barco rotando el offset
            this.waterTrail.setPosition(this.playerShip.x + rotatedOffsetX, this.playerShip.y + rotatedOffsetY);

            // Activa o desactiva el efecto en función de la velocidad
            if (this.playerShip.body.velocity.x > 0.05 || this.playerShip.body.velocity.x < -0.05 ||
                this.playerShip.body.velocity.y > 0.05 || this.playerShip.body.velocity.y < -0.05) {
                this.waterTrail.active = true;
            } else {
                this.waterTrail.active = false;
                this.waterTrail.killAll();
            }
        }
        // Actualiza el campo de visión y emite la posición del jugador
        if (this.playerShip) {  // Asegura que la nave del jugador existe
            this.visionMask.clear();
            this.visionMask.fillStyle(0xffffff); // Color para definir la zona visible
            this.visionMask.fillCircle(this.playerShip.x, this.playerShip.y, this.visionRadius); // Actualiza el círculo de visión

            // Emitir la posición actualizada del jugador al servidor
            if (this.avionDesplegado) {
                if (!this.aterrizando) {
                    this.socket.emit('playerMove', {
                        id: this.socket.id,
                        x: this.playerShip.x,
                        y: this.playerShip.y,
                        angle: this.playerShip.angle,
                        team: this.team,
                        label: this.playerShip.label,
                        Px: this.portaAviones.x,
                        Py: this.portaAviones.y,
                        Pangle: this.portaAviones.angle
                        //fireActive: this.playerShip.isOnFire || false,
                        //fireOffset: {
                        //    x: 0,  // Offset horizontal relativo (ajustar según nave)
                        //    y: -20 // Offset vertical fijo
                        //}
                    });
                }
            } else {
                this.socket.emit('playerMove', {
                    id: this.socket.id,
                    x: this.playerShip.x,
                    y: this.playerShip.y,
                    angle: this.playerShip.angle,
                    team: this.team,
                    label: this.playerShip.label,
                    fireActive: this.playerShip.isOnFire || false,
                    fireOffset: {
                        x: 0,  // Offset horizontal relativo (ajustar según nave)
                        y: -20 // Offset vertical fijo
                    }
                });
            }

        }

        // Mostrar u ocultar objetos según estén dentro del rango de visión
        if (this.objects.length > 0) {
            this.objects.forEach((obj) => {
                const distance = Phaser.Math.Distance.Between(this.playerShip.x, this.playerShip.y, obj.x, obj.y);
                if (distance <= this.visionObjets) {
                    obj.setAlpha(1);  // Objeto visible
                    if (!!obj.body) {
                        if (obj.body.label === 'bismarck' && this.playerShip.label === 'avion' && this.playerShip.observador && !this.playerShip.observadorMarco) {
                            this.bismarckIcon = this.add.circle(obj.x, obj.y, 60, 0xea8700, 1).setOrigin(0.5, 0.5);
                            this.cameras.main.ignore([this.bismarckIcon]);
                            this.playerShip.observadorMarco = true;
                        }
                    }
                } else {
                    obj.setAlpha(0);  // Objeto invisible
                }
            });
        }

        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            this.crosshair.x = this.input.activePointer.worldX;
            this.crosshair.y = this.input.activePointer.worldY;
            let pointerX = this.input.activePointer.worldX;
            let pointerY = this.input.activePointer.worldY;
            // Calcular la diferencia respecto al Bismarck
            let dx = pointerX - this.playerShip.x;
            let dy = pointerY - this.playerShip.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let maxDistance = 200;
            if (distance > maxDistance) {
                // Si la distancia es mayor a 150, calculamos el ángulo y posicionamos la mira a 150 píxeles
                let angle = Math.atan2(dy, dx);
                this.crosshair.x = this.playerShip.x + maxDistance * Math.cos(angle);
                this.crosshair.y = this.playerShip.y + maxDistance * Math.sin(angle);
            } else {
                // Si no supera el límite, la mira sigue al mouse
                this.crosshair.x = pointerX;
                this.crosshair.y = pointerY;
            }
        }

    }


    /**
     ** Crea Francia en una posición sincronizada desde el servidor.
     * @param {number} x - Posición X de Francia.
     * @param {number} y - Posición Y de Francia.
     */
    createFrancia(x, y) {
        this.francia = this.matter.add.image(x, y, 'francia');
        this.francia.setScale(0.5);
        this.francia.setStatic(true);
        this.francia.setAlpha(0);
        this.francia.body.label = 'francia'
        this.objects.push(this.francia);
    }

    /**
     * Crea un barco Bismarck en la escena.
     * @param {string} playerId - ID del jugador.
     * @param {number} x - Posición X.
     * @param {number} y - Posición Y.
     */
    createBismarck(game, playerId, x, y) {

        let bismarck = this.matter.add.sprite(x, y, 'bismarck');
        bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        //bismarck.velocity = settings.bismarckVelocity;
        bismarck.vida = game.reanudo ? game.partida.bismarck.vida : settings.bismarckVida;;
        bismarck.destroyed = false;
        bismarck.body.label = 'bismarck'

        this.players[playerId] = bismarck;
        this.objects.push(bismarck);
    }
    createArkRoyal(playerId, x, y) {

        let arkroyal = this.matter.add.sprite(x, y, 'portaAviones');
        arkroyal.setScale(0.15).setOrigin(0.5, 0.5);
        arkroyal.vida = 3;
        arkroyal.body.label = 'arkroyal';
        arkroyal.isOnFire = false;

        this.players[playerId] = arkroyal;
        this.objects.push(arkroyal);
    }
    createAvion(playerId, x, y) {

        let avion = this.matter.add.sprite(x, y, 'avion');
        avion.setScale(0.15).setOrigin(0.5, 0.5).setDepth(3);
        //avion.velocity = settings.avionVelocity;
        avion.vida = 1
        avion.body.label = 'avion'
        avion.body.isSensor = true;
        avion.anims.play('despegue');
        this.avion = avion
        //this.players[playerId] = avion;
        this.objects.push(avion);
    }



    menuAvion(x, y) {
        const espacioEntreIconos = 2;
        const tamañoIcono = 24;
        const radioMenu = 60;
        this.menuAvionDespegado = true;
        this.menu = this.add.container(x, y);
        const opciones = [
            { imagenes: ['piloto'], valor: 1 },
            { imagenes: ['piloto', 'observador'], valor: 2 },
            { imagenes: ['piloto', 'observador', 'operador'], valor: 4 },
            { imagenes: ['piloto', 'operador'], valor: 3 },
        ];

        const anguloOpcion = (Math.PI * 2) / opciones.length;

        opciones.forEach((opcion, index) => {
            const angulo = anguloOpcion * index - Math.PI / 2;
            const botonX = Math.cos(angulo) * radioMenu;
            const botonY = Math.sin(angulo) * radioMenu;

            const boton = this.add.container(botonX, botonY);

            let anchoBoton = 0;
            opcion.imagenes.forEach(() => {
                anchoBoton += tamañoIcono + espacioEntreIconos;
            });
            anchoBoton -= espacioEntreIconos;

            let xOffset = 0;

            opcion.imagenes.forEach(imagen => {
                const img = this.add.image(xOffset + tamañoIcono / 2 - anchoBoton / 2, 0, imagen);
                img.setDisplaySize(tamañoIcono, tamañoIcono);
                img.setOrigin(0.5);
                boton.add(img);
                xOffset += tamañoIcono + espacioEntreIconos;
            });

            boton.setInteractive(new Phaser.Geom.Circle(0, 0, radioMenu - 15), Phaser.Geom.Circle.Contains);
            boton.on('pointerover', () => {
                fondoMenu.setTexture(`fondo_menu${index}`);
            });
            boton.on('pointerout', () => {
                fondoMenu.setTexture('fondo_menu');
            });
            boton.on('pointerdown', () => {
                this.menu.destroy();
                this.menuAvionDespegado = false;
                this.avionOpcion = opcion.valor;
                this.avionReanudado = false;
                this.despegueAvion(opcion.valor, 0, 0);
            });
            this.menu.add(boton);
        });

        this.menu.x = x + 80;
        this.menu.y = y + 70;
        this.menu.x -= this.menu.getBounds().width / 2;
        this.menu.y -= this.menu.getBounds().height / 2;

        const centroMenuX = this.menu.getBounds().width / 2;
        const centroMenuY = this.menu.getBounds().height / 2;

        const botonCentral = this.add.container(centroMenuX - 85, centroMenuY - 70);
        const imgSalir = this.add.image(0, 0, 'cancelar');
        imgSalir.setDisplaySize(tamañoIcono, tamañoIcono);
        botonCentral.add(imgSalir);
        botonCentral.setInteractive(new Phaser.Geom.Circle(0, 0, 25), Phaser.Geom.Circle.Contains);
        botonCentral.on('pointerover', () => {
            fondoMenu.setTexture('fondo_menu5');
        });
        botonCentral.on('pointerout', () => {
            fondoMenu.setTexture('fondo_menu');
        });
        botonCentral.on('pointerdown', () => {
            this.menu.destroy();
            this.menuAvionDespegado = false;
        });
        this.menu.add(botonCentral);

        const fondoMenu = this.add.image(0, 0, 'fondo_menu').setOrigin(0.5).setScale(0.65);
        this.menu.addAt(fondoMenu, 0);
    }

    despegueAvion(opcion, reanudoX, reanudoY) {
        if (!this.avionDesplegado) {
            this.portaAviones = this.playerShip;
            this.portaAvionesIcon = this.add.circle(this.portaAviones.x, this.portaAviones.y, 60, 0x0000ff, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([this.portaAvionesIcon]);
            this.portaAviones.setVelocity(0);
            // Variable para almacenar la instancia del sonido
            this.avionDespegueSound = playAudios('avionDespegue', this, settings.volumenavionDespegue);
            // Escucha el evento 'complete' para reproducir el segundo sonido
            this.avionDespegueSound.on('complete', () => {
                playAudios('avionAire', this, settings.volumenavionAire);
            });
            let despegoX = (this.reanudo && this.avionReanudado) ? reanudoX : this.playerShip.x
            let despegoY = (this.reanudo && this.avionReanudado) ? reanudoY : this.playerShip.y
            if ((!this.reanudo) || !this.avionReanudado) {
                if (this.playerShip.angle > -10 && this.playerShip.angle < 10) {
                    despegoX = despegoX + 50
                } else {
                    despegoX = despegoX + 80
                }
            }
            this.playerShip = creacionAvion(this, despegoX, despegoY, settings);
            this.avionDesplegado = true;
            this.avionMunicion.setText('Munición de avión: ' + this.playerShip.municion);
            this.socket.emit('newPlane', {
                x: this.playerShip.x,
                y: this.playerShip.y,
                angle: this.playerShip.angle,
                team: this.team,
                label: this.playerShip.label
            });
            this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
            this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
            let tiempoDeVida = 0;
            switch (opcion) {
                case 1:
                    this.visionObjets = 100; // Radio para objetos
                    this.visionRadius = 95;  // Radio de visión
                    tiempoDeVida = 30000;
                    break;
                case 2:
                    this.visionObjets = 210; // Radio para objetos
                    this.visionRadius = 200;  // Radio de visión
                    tiempoDeVida = 20000;
                    break;

                case 3:
                    this.visionObjets = 100; // Radio para objetos
                    this.visionRadius = 95;  // Radio de visión
                    tiempoDeVida = 20000;
                    this.playerShip.observador = true;
                    break;
                case 4:
                    this.visionObjets = 210; // Radio para objetos
                    this.visionRadius = 200;  // Radio de visión
                    tiempoDeVida = 10000;
                    this.playerShip.observador = true;
                    break;
            }
            this.playerShip.visionDelAvion = this.visionObjets;
            // Tiempo de vida del avión en milisegundos (ejemplo: 30 segundos)
            let tiempoRestante = (this.reanudo && this.avionReanudado) ? this.partida.arkRoyal.avionActual.tiempoAvion : tiempoDeVida;
            this.tiempoAvion = tiempoRestante;

            // Crea la barra de tiempo
            const barraAncho = 100;
            const barraAlto = 10;
            const barraX = 1080;
            const barraY = 525;

            const barraFondo = this.add.rectangle(barraX, barraY, barraAncho, barraAlto, 0x666666);
            barraFondo.setOrigin(0, 0);
            barraFondo.setScrollFactor(0);
            barraFondo.setDepth(4);
            this.cameras.main.ignore([barraFondo]);
            this.minimapCamera.ignore([barraFondo]);

            const barraRelleno = this.add.rectangle(barraX, barraY, barraAncho, barraAlto, 0x00ff00);
            barraRelleno.setOrigin(0, 0);
            barraRelleno.setScrollFactor(0);
            barraRelleno.setDepth(4);
            this.minimapCamera.ignore([barraRelleno]);
            this.avionReanudado = false
            // Función para actualizar la barra de tiempo
            const actualizarBarra = () => {
                tiempoRestante -= 250;
                let porcentaje = tiempoRestante / tiempoDeVida;
                porcentaje = Math.max(0, Math.min(1, porcentaje));
                this.tiempoAvion = tiempoRestante;
                barraRelleno.width = barraAncho * porcentaje;
                barraRelleno.x = barraX;
                barraRelleno.y = barraY;
                barraFondo.x = barraX;
                barraFondo.y = barraY;

                if (porcentaje < 0.55) {
                    barraRelleno.fillColor = 0xffff00; // Amarillo si es menor al 50%
                }
                if (porcentaje < 0.25) {
                    barraRelleno.fillColor = 0xff0000; // Rojo si es menor al 25%
                }

                if (tiempoRestante <= 0) {
                    // Destruye el avión y la barra
                    this.aterrizando = true;
                    this.playerShip.setVelocityX(0);
                    this.playerShip.setVelocityY(0);
                    stopAudios('avionAire', this);
                    this.socket.emit('aterrizaje');
                    this.playerShip.anims.play('aterrizaje');
                    // Escucha el evento 'animationcomplete' para la animación 'aterrizaje'
                    clearInterval(this.intervaloTiempo); // Detiene el intervalo
                    this.avionMunicion.setText(' ');
                    this.barraFondo.destroy();
                    this.barraRelleno.destroy();
                    this.tiempoRestante = 0;
                    this.playerShip.on('animationcomplete-aterrizaje', function () {
                        this.avionDesplegado = false;
                        this.playerShip.destroy();
                        this.playerShip = this.portaAviones;
                        this.portaAvionesIcon.destroy();
                        this.socket.emit('deletPlane');
                        this.playerShip.avionesRestantes -= 1;
                        if (this.playerShip.avionesRestantes <= 0) {
                            this.socket.emit('hayGanador', {
                                teamGanador: 'red',
                                motivo: 'Todos los aviones fueron derribados'
                            })
                        }
                        this.dispCantAviones.setText(`Aviones disponibles: ${this.playerShip.avionesRestantes}`);
                        this.cameras.main.startFollow(this.portaAviones, true, 0.1, 0.1);
                        this.minimapCamera.startFollow(this.portaAviones, true, 0.1, 0.1);
                        this.visionObjets = 210; // Radio para objetos
                        this.visionRadius = 200;  // Radio de visión
                        this.aterrizando = false;
                    }, this); // El 'this' final asegura que el contexto sea el correcto
                }
            };

            // Actualiza la barra cada 250 milisegundos
            this.intervaloTiempo = setInterval(actualizarBarra, 250); // Guarda el intervalo en una variable

            this.barraFondo = barraFondo; // Guarda la barra de fondo
            this.barraRelleno = barraRelleno; // Guarda la barra de relleno
            this.tiempoRestante = tiempoRestante; // Guarda el tiempo restante
        }
    }

    destruirAvion() {

    }

}
