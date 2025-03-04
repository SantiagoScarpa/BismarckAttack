import { playAudios } from "../audios.js";

export class ganaBismarck extends Phaser.Scene {
    constructor() {
        super("ganaBismarck")
    }
    preload() { }

    create() {
        this.volMenu = sessionStorage.getItem('volMenu')
        const width = this.game.config.width;
        const height = this.game.config.height;

        this.add.image(width / 2, height / 2, 'bismarckGana')
            .setScale(0.5)
        this.add.text(width / 2, 50, 'EL EQUIPO ROJO GANA LA PARTIDA!',
            {
                fontFamily: 'Rockwell',
                fontSize: 64,
                color: "#e1f4b1"
            }
        )
            .setOrigin(0.5, 0.5)

        let returnBtn = this.add.sprite(50, 50, 'returnBtn')
            .setOrigin(0.5, 0.5)
            .setInteractive()

        returnBtn.on('pointerdown', () => {
            this.scene.start('menuScene')
            playAudios('return', this, this.volMenu)
        })

    }
    update() {

    }
}