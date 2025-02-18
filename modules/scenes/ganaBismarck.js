import { loadfont } from "../globals.js";

export class ganaBismarck extends Phaser.Scene {
    constructor() {
        super("ganaBismarck")
    }
    preload() {
        this.load.image('bismarckGana', './assets/imgs/bismarckGana.png');
        loadfont(this);
    }
    create() {
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
    }
    update() {

    }
}