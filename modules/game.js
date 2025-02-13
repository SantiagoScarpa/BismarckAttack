import settings from './settings.json' with {type: 'json'};
export class gameScene extends Phaser.Scene {
    constructor() {
        super("gameScene")
    }
    preload() {
        console.log(`version ${settings.version}`)
    }
    create() {

    }
    update() {

    }
}

