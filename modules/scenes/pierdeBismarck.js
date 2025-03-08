import { playAudios } from "../audios.js";

export class ganaBismarck extends Phaser.Scene {
    constructor() {
        super("pierdeBismarck")
    }
    preload() { }

    create() {
        this.volMenu = sessionStorage.getItem('volMenu')
        const width = this.game.config.width;
        const height = this.game.config.height;
        const motivo = this.data.get('motivo');

        this.add.image(width / 2, height / 2, 'bismarckGana')
            .setScale(0.5)
        this.add.text(width / 2, 50, 'HAS PERDIDO !',
            {
                fontFamily: 'Rockwell',
                fontSize: 64,
                color: "#e1f4b1"
            }
        )
        .setOrigin(0.5, 0.5)

        this.add.text(width / 2, 70, motivo,
            {
                fontFamily: 'Rockwell',
                fontSize: 30,
                color: "#e1f4b1"
            }
        )
        .setOrigin(0.5, 0.5)

        let returnBtn = this.add.sprite(50, 50, 'returnBtn')
            .setOrigin(0.5, 0.5)
            .setInteractive()

        returnBtn.on('pointerdown', () => {
            playAudios('return', this, this.volMenu)
            location.reload();
        })

    }
    update() {

    }
}