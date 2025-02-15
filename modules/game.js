import settings from './../settings.json' with {type: 'json'};
import { checkControlsBismarck } from './controls/controls.js';


export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }
    preload() {
        console.log(`version ${settings.version}`);

        this.load.image('bismarck', './assets/imgs/sprites/bismarckTransparente.PNG');


        //esto va para el agua pero aun no lo pude hacer bien
        this.load.image('waterImg', './assets/imgs/tiles/water5.png');
        this.load.image('francia', './assets/imgs/sprites/franciaTransparente.png')
        this.load.image('radar', './assets/imgs/sprites/radar.png')
    }


    create() {
        // Crear la imagen del radar en la esquina inferior derecha
        const radar = this.add.image(1140, 515, 'radar'); 
        radar.setScrollFactor(0); // Hace que la imagen no se mueva con la cámara
        radar.setScale(0.2); 

        // Coordenada X aleatoria de inicio para el Bismarck
        let coordenadaInicio = Math.floor(Math.random() * (960 - 1 + 1)) + 1;
    
        // Crear la imagen de Francia (solo para probar colisiones)
        const francia = this.matter.add.image(600 + coordenadaInicio, 40, 'francia');
        francia.setScale(0.5);
        francia.setStatic(true);
    
        // Coordenada X aleatoria de inicio para el Bismarck
        coordenadaInicio = Math.floor(Math.random() * (760 - 1 + 1)) + 1;
    
        // Crear el Bismarck con física
        this.bismarck = this.matter.add.sprite(800 + coordenadaInicio, 760, 'bismarck');
        this.bismarck.setScale(0.10)
            .setOrigin(0.5, 0.5);
        this.bismarck.velocity = settings.bismarckVelocity; 
    
    
        // Configurar las teclas
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT');
    
        // Configurar límites y cámara para Matter.js
        this.matter.world.setBounds(0, 0, 1920, 1080); 
        this.cameras.main.setBounds(0, 0, 1920, 1080);
        this.cameras.main.startFollow(this.bismarck, true, 0.1, 0.1); // Cámara sigue el Bismarck
        this.cameras.main.setZoom(2);  // Zoom para acercar la vista al Bismarck


        const minimapCamera = this.cameras
        .add(1315,560,320,180,false,'minimap')
        .setOrigin(0.5,0.5)
        .setZoom(0.05);
        minimapCamera.ignore([this.bismarck])
        minimapCamera.ignore([radar]);
        const bismarckIcon = this.add.circle(francia.x, francia.y, 60, 0xff0000, 1).setOrigin(0.5,0.5);
        this.cameras.main.ignore([bismarckIcon])
        minimapCamera.startFollow(this.bismarck, true, 0.1, 0.1);
        
        this.matter.world.on('collisionstart', (event) => {
            const { bodyA, bodyB } = event.pairs[0];
    
            if ((bodyA === this.bismarck.body && bodyB === francia.body) ||
                (bodyA === francia.body && bodyB === this.bismarck.body)) {
                this.scene.start('ganaBismarck');
            }
        });
    }


    update() {
        const { bismarck } = this; // guardar el bismarck en una variable para que sea más legible
        checkControlsBismarck(this);  // actualizar controles
    }
}

