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



        this.load.image('waterImg', './assets/imgs/tiles/water5.png');
        // this.load.tilemapTiledJSON('map', 'assets/tilemaps/maps/water5.json');

    }
    create() {
        // const map = this.make.tilemap({ width: 1600, height: 768, tileWidth: 16, tileHeight: 16 });
        // const tiles = map.addTilesetImage('waterImg', null, 16, 16);
        // const layer = map.createBlankLayer('layerWater', tiles);
        // layer.randomize(0, 0, map.width, map.height, [0, 1, 2, 3, 4]);

        this.bismarck = this.matter.add.sprite(500, 500, 'bismarck');
        this.bismarck.setScale(0.10)
            .setOrigin(0.5, 0.5)
        //.setCollideWorldBounds(true);

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

