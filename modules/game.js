import settings from './../settings.json' with {type: 'json'};

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
        this.bismarck = this.physics.add.sprite(50, 250, 'bismarck')
        this.bismarck.setScale(0.10)
    }
    update() {

    }
}

