import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck, creacionBismarck } from '../controls/controlsBismarck.js';
import { playAudios } from './../audios.js';
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
    }

    activateFire(x, y, scale) {
        //if (!this.playerShip) return;
        if (this.playerShip.label === 'arkroyal') {
            if (this.playerShip.isOnFire) return;

            this.playerShip.isOnFire = true;
            this.fireSprite = this.add.sprite(x, y, 'fire0').setScale(scale);
            this.fireSprite.play('fire');
            this.fireSprite.setDepth(1);

            this.fireSprite.setPosition(this.playerShip.x, this.playerShip.y);
        }
    }

    shootBullet() {
        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            let bullet = this.matter.add.sprite(this.playerShip.x, this.playerShip.y - 40, 'bismarckMisil');
            bullet.setScale(0.3);
            bullet.setCircle(3);

            let dx = this.crosshair.x - this.playerShip.x;
            let dy = this.crosshair.y - this.playerShip.y + 40;
            let angle = Math.atan2(dy, dx);

            // Definir la velocidad del misil (puedes ajustar este valor)
            let bulletSpeed = 10;
            let vx = bulletSpeed * Math.cos(angle);
            let vy = bulletSpeed * Math.sin(angle);
            bullet.setVelocity(vx, vy);

            bullet.setRotation(angle + Math.PI / 2);

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
    }

    //Crea el misil en cada cliente recibido por el sv
    createBulletFromData(data) {
        // Crear el misil usando la posición y los datos enviados
        let bullet = this.matter.add.sprite(data.x, data.y - 40, 'bismarckMisil');
        bullet.setScale(0.3);
        bullet.setCircle(3);

        // Calcular la dirección utilizando las coordenadas del puntero enviadas
        let dx = data.pointerX - data.x;
        let dy = data.pointerY - data.y + 40;
        let angle = Math.atan2(dy, dx);

        // Definir la velocidad del misil
        let bulletSpeed = 10;
        let vx = bulletSpeed * Math.cos(angle);
        let vy = bulletSpeed * Math.sin(angle);
        bullet.setVelocity(vx, vy);

        bullet.setRotation(angle + Math.PI / 2);
        bullet.body.label = 'bullet';

        // Crear la cola del misil
        let bulletTail = this.add.image(data.x, data.y - 56, 'bismarckMisilCola');
        bulletTail.setScale(0.5);

        playAudios('bismarckShoot', this, settings.volumeBismarckShoot);
        setTimeout(() => {
            bulletTail.destroy();
        }, 100);

        bullet.setSensor(true);
        this.bullets.push(bullet);
        this.time.delayedCall(2000, () => bullet?.destroy());
    }

    onBulletHit(arkroyal, bullet) {
        const bulletX = bullet.x;
        const bulletY = bullet.y;
        console.log("BulletX y BulletY:", bulletX, bulletY)

        let explosion = this.add.sprite(bulletX, bulletY, 'explosion_0').setScale(0.5);
        explosion.play('explode');
        explosion.on('animationcomplete', () => explosion.destroy());
        bullet.destroy();
        playAudios('explotion', this, settings.volumeBismarckShoot);

        arkroyal.vida--;
        console.log("Vida actual de ArkRoyal:", arkroyal.vida);
        console.log("ArkRoyal is on fire:", arkroyal.isOnFire);

        if (arkroyal.vida === 2 && !arkroyal.isOnFire) {
            // Usamos la posición del impacto para activar el fuego
            arkroyal.fireSprite = this.add.sprite(arkroyal.x, arkroyal.y - 20, 'fire0').setScale(0.9);
            arkroyal.fireSprite.play('fire');
            arkroyal.isOnFire = true
            arkroyal.fireSprite.setDepth(1);
            //this.activateFire(bullet.x, bullet.y, 0.9);
        }
        else if (arkroyal.vida === 1 && arkroyal.fireSprite) {
            arkroyal.fireSprite.setScale(1.5);
        }
        else if (arkroyal.vida === 0) {
            let explotion_ark = this.add.sprite(arkroyal.x, arkroyal.y - 40, 'explotion_ark1').setScale(1);
            explotion_ark.play('explode_arkRoyal');
            bullet.destroy()

            explotion_ark.once('animationcomplete', () => {
                if (arkroyal && arkroyal.fireSprite) { //Check if they exist before destroying.
                    arkroyal.fireSprite.destroy();
                }
            });
        }
    }

    preload() { }

    async create() {
        let durPartida = sessionStorage.getItem('duracionPartida')
        if (!durPartida)
            durPartida = 2
        this.duracionPartida = this.reanudo ? this.partida.tiempoPartida : durPartida * 60 * 1000
        this.inicioPartida = Date.now()
        this.time.delayedCall(this.duracionPartida, () => {
            this.socket.emit('tiempoPartida')
        }, [], this);

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

        this.add.text(490, 240, `Codigo de partida: ${this.codigoPartida}`, {
            fontFamily: 'Rockwell',
            fontSize: 24,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11).setScrollFactor(0).setScale(0.5);

        // Conexión y manejo de jugadores vía socket

        this.players = {};

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

        // Configurar controles
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE,P');

        // Manejar colisiones del mundo
        this.matter.world.on('collisionstart', (event) => {
            event.pairs.forEach(pair => {
                const { bodyA, bodyB } = pair;
                console.log('Colisión:', bodyA.label, bodyB.label);

                // Caso: Bismarck colisiona con Francia
                if (
                    this.playerShip.body.label === 'bismarck' &&
                    (
                        (bodyA === this.playerShip.body && bodyB === this.francia.body) ||
                        (bodyA === this.francia.body && bodyB === this.playerShip.body)
                    )
                ) {
                    this.socket.emit('ganaBismarck')
                }
                // Nuevo bloque para detectar colisión entre cualquier bala y un ArkRoyal
                else if (
                    (bodyA.label === 'bullet' && bodyB.label === 'arkroyal') ||
                    (bodyA.label === 'arkroyal' && bodyB.label === 'bullet')
                ) {
                    const bullet = bodyA.label === 'bullet' ? bodyA.gameObject : bodyB.gameObject;
                    const arkroyal = bodyA.label === 'arkroyal' ? bodyA.gameObject : bodyB.gameObject;
                    if (bullet && arkroyal) {
                        this.onBulletHit(arkroyal, bullet);
                    }
                }
                // Bloque para  la colicion entr el arkRoyal y el avion
                else if (
                    (bodyA.label === 'avion' && bodyB.label === 'arkroyal') ||
                    (bodyA.label === 'arkroyal' && bodyB.label === 'avion')
                ) {
                    if (this.team === 'blue') {
                        console.log('DESTROY AVION EQUIPO BLUE');
                        clearInterval(this.intervaloTiempo); // Detiene el intervalo
                        this.barraFondo.destroy(); // Destruye la barra de fondo
                        this.barraRelleno.destroy(); // Destruye la barra de relleno
                        this.avionDesplegado = false;
                        this.tiempoRestante = 0;
                        this.playerShip.destroy();
                        this.playerShip = this.portaAviones;
                        this.portaAvionesIcon.destroy();
                        this.playerShip.avionesRestantes += 1;
                        this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
                        this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
                        this.visionObjets = 210; // Radio para objetos
                        this.visionRadius = 200;  // Radio de visión
                    }
                    this.socket.emit('deletPlane', {
                        team: this.team,
                    });

                }

            });
        });

        const graphics = this.make.graphics();
        graphics.fillStyle(0x00aaff, 1);
        graphics.fillCircle(5, 5, 5);
        graphics.generateTexture('blueParticle', 10, 10);
        graphics.destroy();

        // Array de objetos para controlar la visibilidad según la distancia
        this.objects = [];

        this.waterTrail = this.add.particles(0, 0, 'blueParticle', {
            speed: { min: 20, max: 50 },  // Velocidad de las partículas
            scale: { start: 0.5, end: 0 },  // Se hacen más pequeñas con el tiempo
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
                console.log(`Recibida posición de Francia: (${position.x}, ${position.y})`);
                this.createFrancia(position.x, position.y);
                if (this.team === 'red') {
                    const franciaIcon = this.add.circle(position.x, position.y, 60, 0xff0000, 1).setOrigin(0.5, 0.5);
                    this.cameras.main.ignore([franciaIcon]);
                }
            });
        }
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
            this.socket.emit('pidoGuardado')
        })

        if (this.team === 'red') {
            this.socket.on('pidoRojo', () => {
                let respuesta = armoRespuestaRojo(this)
                console.log(respuesta.codigoRojo)
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
            //location.reload();
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
        } else if (this.team === 'blue') {
            let coordenadaInicioLocalX = Math.floor(Math.random() * (660 - 1 + 1)) + 1;
            let coordenadaInicioLocalY = Math.floor(Math.random() * (460 - 1 + 1)) + 1;
            posX = this.reanudo ? this.partida.arkRoyal.x : (100 + coordenadaInicioLocalX);
            posY = this.reanudo ? this.partida.arkRoyal.y : (100 + coordenadaInicioLocalY);
            angle = this.reanudo ? this.partida.arkRoyal.angle : 0;
            let avionesRestantes = this.reanudo ? this.partida.arkRoyal.avionesRestantes : 0;
            this.menuAvionDespegado = false;
            // Jugador azul obtiene el ArkRoyale
            this.playerShip = creacionArkRoyale(this, posX, posY, angle, avionesRestantes, settings);
            this.avionDesplegado = false;
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
                    console.log(`*********** ACA NO ENTRO NUNCA ****************************************************`);
                    if (player.team === 'red') {
                        this.createBismarck(player.id, player.x, player.y);
                    } else {
                        this.createArkRoyal(player.id, player.x, player.y);
                    }
                }
            }
        });

        this.socket.on('newPlane', (player) => {
            console.log(`Avion desplegado: ${player.team}`);
            if (this.team === 'red') {
                this.createAvion(player.id, player.x, player.y);
            }
        });

        this.socket.on('deletPlane', (player) => {
            console.log(`Avion fuera de escena: ${player.team}`);
            if (this.team === 'red') {
                console.log('DESTROY AVION EQUIPO RED ORDEN DEL SERVIDOR');
                let indice = this.objects.findIndex(obj => obj.body && obj.body.label === 'avion');
                if (indice !== -1) {
                    let avionEncontrado = this.objects[indice];
                    this.objects.splice(indice, 1);
                    avionEncontrado.destroy();
                }
                this.avion.destroy();
            }
        });

        this.socket.on('updatePlayers', (players) => {
            Object.keys(players).forEach((id) => {
                if (id !== this.socket.id) {
                    if (!this.players[id]) {
                        // Crear nave según el team
                        if (players[id].team === 'red') {
                            this.createBismarck(id, players[id].x, players[id].y, players[id].angle);
                        } else if (players[id].team === 'blue') {
                            this.createArkRoyal(id, players[id].x, players[id].y, players[id].angle);
                        }
                    } else {
                        // Actualizar posición y ángulo
                        if (players[id].label === 'avion') {
                            this.avion.setPosition(players[id].x, players[id].y);
                            this.avion.setAngle(players[id].angle);
                            this.players[id].setPosition(players[id].Px, players[id].Py);
                            this.players[id].setAngle(players[id].Pangle);
                        } else {
                            this.players[id].setPosition(players[id].x, players[id].y);
                            this.players[id].setAngle(players[id].angle);
                        }
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

        this.socket.on('shootBullet', (data) => {
            this.createBulletFromData(data);
        });

        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            this.input.on('pointerdown', (pointer) => {
                if (pointer.leftButtonDown()) {
                    if (!this.lastShotTime || this.time.now - this.lastShotTime > 200) {
                        const shootData = {
                            x: this.playerShip.x,
                            y: this.playerShip.y,
                            pointerX: this.input.activePointer.worldX,
                            pointerY: this.input.activePointer.worldY
                        };
                        // Emitir el disparo al servidor para sincronizarlo con otros clientes
                        this.socket.emit('shootBullet', shootData);

                        // Ejecutar el disparo localmente
                        this.shootBullet();
                        this.lastShotTime = this.time.now;
                    }
                }
            });
        }

        if (this.team === 'red') {
            this.input.setDefaultCursor('none');
        }

        // Crear las animaciones definidas globalmente        
        createAnimations(this);

        this.socket.on('finalizacionPartida', (ganador) => {
            this.socket.disconnect()
            if (ganador === 'blue') {
                this.scene.start('ganaArkRoyal');
            }
            else if (ganador === 'red') {

                this.scene.start('ganaBismarck');
            }
            else {
                this.scene.start('menuScene');
            }
        })

        this.socket.on('muestroVistaLateral', () => {
            this.scene.start('sceneVistaLateral')
            // console.log('FUNCIONA')
        })


        if (this.reanudo && this.partida.arkRoyal.avionActual !== null && this.team === 'blue') {
            this.avionDesplegado = true;
            this.portaAviones = this.playerShip;
            this.portaAvionesIcon = this.add.circle(this.portaAviones.x, this.portaAviones.y, 60, 0x0000ff, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([this.portaAvionesIcon]);
            this.playerShip = creacionAvion(this, (this.partida.arkRoyal.avionActual.x), this.partida.arkRoyal.avionActual.y, settings);
            this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
            this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
        }

    }

    update() {
        // Ejecuta controles según el equipo

        if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            checkControlsBismarck({ bismarck: this.playerShip, keys: this.keys });
            // Disparar bala al presionar SPACE
            if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                this.shootBullet();
            }
        } else {
            //checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            console.log(`GAME - UPDATE / avionDesplegado -- menuAvionDesplegado ===${this.avionDesplegado} / ${this.menuAvionDespegado} / ${this.playerShip.label}`)
            if (this.avionDesplegado) {
                checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            } else {
                if (!this.menuAvionDespegado)
                    checkControlsArkRoyale({ ArkRoyale: this.playerShip, keys: this.keys });
            }
            if (this.playerShip.label === 'arkroyal') {
                if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                    console.log(`GAME - UPDATE entro al space cuando lo presiono`)
                    if (!this.menuAvionDespegado) {
                        this.playerShip.setVelocityX(0);
                        this.playerShip.setVelocityY(0);
                        this.menuAvion(this.playerShip.x, this.playerShip.y);
                    }

                }
            }
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
            if (this.playerShip.body.velocity.x !== 0 || this.playerShip.body.velocity.y !== 0) {
                this.waterTrail.active = true;
            } else {
                this.waterTrail.active = false;
            }
        }
        // Actualiza el campo de visión y emite la posición del jugador
        if (this.playerShip) {  // Asegura que la nave del jugador existe
            this.visionMask.clear();
            this.visionMask.fillStyle(0xffffff); // Color para definir la zona visible
            this.visionMask.fillCircle(this.playerShip.x, this.playerShip.y, this.visionRadius); // Actualiza el círculo de visión

            // Emitir la posición actualizada del jugador al servidor
            if (this.avionDesplegado) {
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
                });
            } else {
                this.socket.emit('playerMove', {
                    id: this.socket.id,
                    x: this.playerShip.x,
                    y: this.playerShip.y,
                    angle: this.playerShip.angle,
                    team: this.team,
                    label: this.playerShip.label
                });
            }

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
        console.log("creando Francia en posición sinc");
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
    createBismarck(playerId, x, y) {
        console.log(`creando Bismarck para ${playerId} en(${x}, ${y})`);

        let bismarck = this.matter.add.sprite(x, y, 'bismarck');
        bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        bismarck.velocity = settings.bismarckVelocity;
        bismarck.body.label = 'bismarck'

        this.players[playerId] = bismarck;
        this.objects.push(bismarck);
    }
    createArkRoyal(playerId, x, y) {
        console.log(`creando ArkRoyale para ${playerId} en(${x}, ${y})`);

        let arkroyal = this.matter.add.sprite(x, y, 'portaAviones');
        arkroyal.setScale(0.15).setOrigin(0.5, 0.5);
        arkroyal.vida = 4;
        arkroyal.velocity = settings.arkRoyaleVelocity;
        arkroyal.body.label = 'arkroyal';
        arkroyal.isOnFire = false;

        this.players[playerId] = arkroyal;
        this.objects.push(arkroyal);
    }
    createAvion(playerId, x, y) {
        console.log(`creando Avion para ${playerId} en(${x}, ${y})`);

        let avion = this.matter.add.sprite(x, y, 'avion');
        avion.setScale(0.15).setOrigin(0.5, 0.5);
        avion.velocity = settings.avionVelocity;
        avion.body.label = 'avion'
        this.avion = avion

        //this.players[playerId] = avion;
        this.objects.push(avion);
    }



    menuAvion(x, y) {
        const espacioEntreIconos = 2;
        const tamañoIcono = 24;
        const radioMenu = 60;
        this.menuAvionDespegado = true;
        // Crea un contenedor para el menú
        this.menu = this.add.container(x, y);
        // Define las opciones del menú
        const opciones = [
            { imagenes: ['piloto'], valor: 1 },
            { imagenes: ['piloto', 'observador'], valor: 2 },
            { imagenes: ['piloto', 'observador', 'operador'], valor: 4 },
            { imagenes: ['piloto', 'operador'], valor: 3 },
        ];

        // Calcula el ángulo de cada opción
        const anguloOpcion = (Math.PI * 2) / opciones.length;

        // Crea los botones del menú
        opciones.forEach((opcion, index) => {
            // Calcula la posición del botón en el círculo
            const angulo = anguloOpcion * index - Math.PI / 2; // Iniciar desde arriba
            const botonX = Math.cos(angulo) * radioMenu;
            const botonY = Math.sin(angulo) * radioMenu;

            const boton = this.add.container(botonX, botonY);

            // Calcula el ancho del botón basado en las imágenes
            let anchoBoton = 0;
            opcion.imagenes.forEach(() => {
                anchoBoton += tamañoIcono + espacioEntreIconos;
            });
            anchoBoton -= espacioEntreIconos;

            // Calcula el offset inicial para centrar los iconos
            let xOffset = 0;

            // Agrega las imágenes al botón
            opcion.imagenes.forEach(imagen => {
                const img = this.add.image(xOffset + tamañoIcono / 2 - anchoBoton / 2, 0, imagen);
                img.setDisplaySize(tamañoIcono, tamañoIcono);
                img.setOrigin(0.5);
                boton.add(img);
                xOffset += tamañoIcono + espacioEntreIconos;
            });


            boton.setInteractive(new Phaser.Geom.Rectangle(-anchoBoton / 2, -tamañoIcono / 2, anchoBoton, tamañoIcono), Phaser.Geom.Rectangle.Contains);
            boton.on('pointerover', () => {
                const fondoHover = this.add.graphics();
                fondoHover.fillStyle(0x008000, 0.4);
                fondoHover.fillRect(-anchoBoton / 2, -tamañoIcono / 2, anchoBoton, tamañoIcono);
                boton.addAt(fondoHover, 0);
                boton.setData('fondoHover', fondoHover);
            });
            boton.on('pointerout', () => {
                const fondoHover = boton.getData('fondoHover');
                if (fondoHover)
                    fondoHover.destroy();
            });
            boton.on('pointerdown', () => {
                this.menu.destroy();
                this.menuAvionDespegado = false;
                this.despegueAvion(opcion.valor);
            });
            this.menu.add(boton);
        });

        // Centra el menú en la posición del jugador
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
        botonCentral.setInteractive(new Phaser.Geom.Rectangle(-tamañoIcono / 2, -tamañoIcono / 2, tamañoIcono, tamañoIcono), Phaser.Geom.Rectangle.Contains);
        botonCentral.on('pointerover', () => {
            const fondoHover = this.add.graphics();
            fondoHover.fillStyle(0xFFBDC0, 0.4);
            fondoHover.fillRect(-tamañoIcono / 2, -tamañoIcono / 2, tamañoIcono, tamañoIcono);
            botonCentral.addAt(fondoHover, 0);
            botonCentral.setData('fondoHover', fondoHover);
        });
        botonCentral.on('pointerout', () => {
            const fondoHover = botonCentral.getData('fondoHover');
            if (fondoHover)
                fondoHover.destroy();
        });
        botonCentral.on('pointerdown', () => {
            this.menu.destroy();
            this.menuAvionDespegado = false;
        });
        this.menu.add(botonCentral);

        const fondoMenu = this.add.image(0, 0, 'fondo_menu').setOrigin(0.5).setScale(0.65); // Centra la imagen
        this.menu.addAt(fondoMenu, 0); // Agrega el fondo como el primer elemento
    }

    despegueAvion(opcion) {
        console.log('Opción seleccionada:', opcion);
        if (!this.avionDesplegado) {
            this.portaAviones = this.playerShip;
            this.portaAvionesIcon = this.add.circle(this.portaAviones.x, this.portaAviones.y, 60, 0x0000ff, 1).setOrigin(0.5, 0.5);
            this.cameras.main.ignore([this.portaAvionesIcon]);
            this.portaAviones.setVelocity(0);
            if (this.playerShip.angle > -10 && this.playerShip.angle < 10) {
                this.playerShip = creacionAvion(this, (this.playerShip.x + 50), this.playerShip.y, settings);
            } else {
                this.playerShip = creacionAvion(this, (this.playerShip.x + 80), this.playerShip.y, settings);
            }
            this.avionDesplegado = true;
            this.portaAviones.avionesRestantes -= 1;
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
                    this.visionObjets = 50; // Radio para objetos
                    this.visionRadius = 45;  // Radio de visión
                    tiempoDeVida = 30000;
                    break;
                case 2:
                    this.visionObjets = 210; // Radio para objetos
                    this.visionRadius = 200;  // Radio de visión
                    tiempoDeVida = 20000;
                    break;

                case 3:
                    this.visionObjets = 50; // Radio para objetos
                    this.visionRadius = 45;  // Radio de visión
                    tiempoDeVida = 20000;
                    break;
                case 4:
                    this.visionObjets = 210; // Radio para objetos
                    this.visionRadius = 200;  // Radio de visión
                    tiempoDeVida = 10000;
                    break;
            }

            // Tiempo de vida del avión en milisegundos (ejemplo: 30 segundos)
            let tiempoRestante = tiempoDeVida;

            // Crea la barra de tiempo
            const barraAncho = 100;
            const barraAlto = 10;
            const barraX = 1080;
            const barraY = 555;

            const barraFondo = this.add.rectangle(barraX, barraY, barraAncho, barraAlto, 0x666666);
            barraFondo.setOrigin(0, 0);
            barraFondo.setScrollFactor(0);
            barraFondo.setDepth(2);
            this.cameras.main.ignore([barraFondo]);

            const barraRelleno = this.add.rectangle(barraX, barraY, barraAncho, barraAlto, 0x00ff00);
            barraRelleno.setOrigin(0, 0);
            barraRelleno.setScrollFactor(0);
            barraRelleno.setDepth(2);

            // Función para actualizar la barra de tiempo
            const actualizarBarra = () => {
                tiempoRestante -= 1000;
                const porcentaje = tiempoRestante / tiempoDeVida;
                barraRelleno.width = barraAncho * porcentaje;
                barraRelleno.x = barraX;
                barraRelleno.y = barraY;
                barraFondo.x = barraX;
                barraFondo.y = barraY;

                if (tiempoRestante <= 0) {
                    this.socket.emit('deletPlane', {
                        team: this.team,
                    });
                    // Destruye el avión y la barra
                    clearInterval(this.intervaloTiempo); // Detiene el intervalo
                    this.barraFondo.destroy();
                    this.barraRelleno.destroy();
                    this.avionDesplegado = false;
                    this.tiempoRestante = 0;
                    this.playerShip.destroy();
                    this.playerShip = this.portaAviones;
                    this.portaAvionesIcon.destroy();
                    this.playerShip.avionesRestantes -= 1;
                    this.cameras.main.startFollow(this.portaAviones, true, 0.1, 0.1);
                    this.minimapCamera.startFollow(this.portaAviones, true, 0.1, 0.1);
                    this.visionObjets = 210; // Radio para objetos
                    this.visionRadius = 200;  // Radio de visión
                }
            };

            // Actualiza la barra cada segundo
            this.intervaloTiempo = setInterval(actualizarBarra, 1000); // Guarda el intervalo en una variable

            this.barraFondo = barraFondo; // Guarda la barra de fondo
            this.barraRelleno = barraRelleno; // Guarda la barra de relleno
            this.tiempoRestante = tiempoRestante; // Guarda el tiempo restante
        }
    }

}
