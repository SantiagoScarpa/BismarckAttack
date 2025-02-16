import { loadAudios, playAudios } from "../audios.js";
import settings from './../../settings.json' with {type: 'json'}

export class settingsScene extends Phaser.Scene {
    constructor() {
        super("settingsScene")
    }

    preload() {
        this.load.spritesheet('returnBtn', './assets/imgs/buttons/return.png',
            { frameWidth: 42, frameHeight: 58 }
        );

        this.load.spritesheet('spriteVol', './assets/imgs/sprites/bars.png',
            { frameWidth: 48, frameHeight: 20 });

        this.load.image('flechaIzq', './assets/imgs/buttons/flechaIzq.png');
        this.load.image('flechaDer', './assets/imgs/buttons/flechaDer.png');


        loadAudios(this);
    }
    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;
        this.add.text(width / 2, 50, 'CONFIGURACION',
            {
                fontFamily: 'Rockwell',
                fontSize: 64,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)

        let returnBtn = this.add.sprite(50, 50, 'returnBtn')
            .setOrigin(0.5, 0.5)
            .setInteractive()

        returnBtn.on('pointerdown', () => {
            console.log('asdfasdf')
            this.scene.start('menuScene')
            playAudios('return', this, settings.volumeMenu)
        })


        this.add.text(width / 3, height / 4, 'Volumen de menu:',
            {
                fontFamily: 'Rockwell',
                fontSize: 32,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)

        let volumeBar = this.add.sprite(width / 3 * 1.5, height / 4, 'spriteVol')
            .setScale(2)
            .setFrame(3)
            .setOrigin(0.5, 0.5)

        let btnBajoVol = this.add.sprite(width / 3 * 1.5 - 60, height / 4, 'flechaIzq')
            .setScale(0.5)
            .setInteractive()
        let btnSuboVol = this.add.sprite(width / 3 * 1.5 + 60, height / 4, 'flechaDer')
            .setScale(0.5)
            .setInteractive()

        btnBajoVol.on('pointerdown', () => {
            let volFrame = volumeBar.frame.name

            if (volFrame !== 7) {
                if (volFrame <= 6) {
                    volumeBar.setFrame(volFrame + 1)
                    btnSuboVol.clearTint()
                }
                if (volFrame + 1 === 7)
                    btnBajoVol.setTint(0x808080);
            }
            playAudios('menuSelection', this, settings.volumeMenu);

        });

        btnSuboVol.on('pointerdown', () => {
            let volFrame = volumeBar.frame.name

            if (volFrame !== 0) {
                if (volFrame >= 1) {
                    volumeBar.setFrame(volFrame - 1)
                    btnBajoVol.clearTint()
                }
                if (volFrame - 1 === 0)
                    btnSuboVol.setTint(0x808080);
            }
            playAudios('menuSelection', this, settings.volumeMenu);
        });

    }
    upload() { }
}