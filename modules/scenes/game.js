import settings from '../../settings.json' with {type: 'json'};
import { checkControlsBismarck, creacionBismarck } from '../controls/controlsBismarck.js';
import { playAudios } from './../audios.js';
import { creacionArkRoyale, checkControlsArkRoyale } from '../controls/controlsArkRoyale.js';
import { creacionAvion, checkControlsAvion } from '../controls/controlsAvion.js';
import { createAnimations } from '../globals.js'
//import { guardarPartida } from '../persistencia/obtengoPersistencia.js';


export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene");
        
        this.targetOffset = { x: 0, y: -150 };
    }

    init(data) {
        this.team = data.team;
    }

    activateFire(x, y, scale) {
        //if (!this.playerShip) return;
        if (this.playerShip.label === 'arkroyal'){
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
        if (this.playerShip.label === 'bismarck'){
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

            bullet.setRotation(angle + Math.PI/2); 

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

    create() {
        //ESTO SE TIENEN QUE PONER POR LOS CODIGOS QUE GENERMOS ANTES 
        this.codigoRojo = 'J1RO'
        this.codigoAzul = 'J1AZ'

        // Conexión y manejo de jugadores vía socket
        this.socket = io();
        this.players = {};

        // Inicializar balas y fuego
        this.bullets = [];
        this.fireSprite = null;

        // Configurar controles
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,W,A,S,D,SPACE');

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
                    this.scene.start('ganaBismarck');
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
                            this.playerShip.destroy();
                            this.playerShip = this.portaAviones;
                            this.portaAvionesIcon.destroy();
                            this.avionDesplegado = false;
                            this.playerShip.avionesRestantes += 1;
                            this.cameras.main.startFollow(this.playerShip, true, 0.1, 0.1);
                            this.minimapCamera.startFollow(this.playerShip, true, 0.1, 0.1);
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


        this.waterTrail = this.add.particles(0, 0, 'blueParticle', {
            speed: { min: 20, max: 50 },  // Velocidad de las partículas
            scale: { start: 0.5, end: 0 },  // Se hacen más pequeñas con el tiempo
            alpha: { start: 1, end: 0 }, // Se desvanecen
            lifespan: 800, // Duración en ms
            blendMode: 'ADD', // Efecto de fusión para más realismo
        });
        this.waterTrail.setDepth(1);  // Asegura que está debajo del barco

        this.keysMira = this.input.keyboard.addKeys('W,A,S,D');

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
           // guardarPartida(this)
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

        //if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck'){
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
                angle: 0,
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
        if(this.playerShip.label === 'bismarck'){
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

        this.input.setDefaultCursor('none');

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

        if (!this.playerShip) return;
        if (this.playerShip.label === 'bismarck') {
            checkControlsBismarck({ bismarck: this.playerShip, keys: this.keys });
            // Disparar bala al presionar SPACE
            if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
                this.shootBullet();
            }
        } else {
            //checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            if (this.avionDesplegado) {
                checkControlsAvion({ avion: this.playerShip, keys: this.keys });
            } else {
                checkControlsArkRoyale({ ArkRoyale: this.playerShip, keys: this.keys });
            }
            if (this.playerShip.label === 'arkroyal'){
                if (Phaser.Input.Keyboard.JustDown(this.keys.SPACE)) {
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
                    }
                }
            }
        }
            

        const tailOffset = { x: 0, y: 40 };
        //if (!this.playerShip) return;    
        if (this.playerShip.label === 'bismarck'){
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
            } else{
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
        if(this.playerShip.label === 'bismarck'){
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
        console.log(`creando Bismarck para ${playerId} en (${x}, ${y})`);

        let bismarck = this.matter.add.sprite(x, y, 'bismarck');
        bismarck.setScale(0.10).setOrigin(0.5, 0.5);
        bismarck.velocity = settings.bismarckVelocity;
        bismarck.body.label = 'bismarck'

        this.players[playerId] = bismarck;
        this.objects.push(bismarck);
    }
    createArkRoyal(playerId, x, y) {
        console.log(`creando ArkRoyale para ${playerId} en (${x}, ${y})`);

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
        console.log(`creando Avion para ${playerId} en (${x}, ${y})`);

        let avion = this.matter.add.sprite(x, y, 'avion');
        avion.setScale(0.15).setOrigin(0.5, 0.5);
        avion.velocity = settings.avionVelocity;
        avion.body.label = 'avion'
        this.avion = avion

        //this.players[playerId] = avion;
        this.objects.push(avion);
    }
}
