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
    }
    create() {
        this.bismarck = this.physics.add.sprite(500, 500, 'bismarck');
        this.bismarck.setScale(0.10)
            .setOrigin(0.5, 0.5)
            .setCollideWorldBounds(true);

        //cargo teclas a usar
        this.keys = this.input.keyboard.addKeys('UP,DOWN,LEFT,RIGHT,SPACE,SHIFT,P,W,A,S,D');


        //seteo de las camaras, aun tenemos que ver como hacerlos
        this.physics.world.setBounds(0, 0, 1920, 1080);
        // this.cameras.main.setBounds(0, 0, 1920, 1440);
        // this.cameras.main.startFollow(this.bismarck);

    }
    update() {
        const { bismarck } = this; //guardo el bismarck en una variable para que sea mas legible
        checkControlsBismarck(this) //seteo controles 
    }
}

