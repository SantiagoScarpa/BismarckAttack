import settings from './../settings.json' with {type: 'json'};
import { checkControlsBismarck } from './controls/controls.js';

export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }
    preload() {
        console.log(`version ${settings.version}`);

        this.load.spritesheet('bismarck',
            './assets/imgs/sprites/bismarckTransparente.PNG',
            { frameWidth: 828, frameHeight: 145 }
        );


        //esto va para el agua pero aun no lo pude hacer bien
        this.load.image('waterImg', './assets/imgs/tiles/water5.png');


        this.load.image('francia', './assets/imgs/sprites/franciaTransparente.png')
    }
    create() {
        //obtengo coordinada x de inicio para que sea aleatorio, de la mitad del mapa hacia arriba/derecha
        let coordenadaInicio = Math.floor(Math.random() * (960 - 1 + 1)) + 1;

        const francia = this.matter.add.image(600 + coordenadaInicio, 50, 'francia')
        francia.setScale(0.5)
        francia.setStatic(true)

        //la seteo de nuevo para el bismarck
        coordenadaInicio = Math.floor(Math.random() * (760 - 1 + 1)) + 1;

        this.bismarck = this.matter.add.sprite(800 + coordenadaInicio, 760, 'bismarck');
        this.bismarck.setScale(0.10)
            .setOrigin(0.5, 0.5)
        this.bismarck.velocity = settings.bismarckVelocity;

        //cargo teclas a usar
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,P,W,A,S,D');


        //seteo de las camaras, aun tenemos que ver como hacerlos
        // this.physics.world.setBounds(0, 0, 1920, 1080);
        // this.cameras.main.setBounds(0, 0, 1920, 1440);
        // this.cameras.main.startFollow(this.bismarck);

    }
    update() {
        const { bismarck } = this; //guardo el bismarck en una variable para que sea mas legible
        checkControlsBismarck(this) //seteo controles 
    }
}

