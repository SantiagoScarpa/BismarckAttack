import { loadAudios, playAudios } from "../audios.js";
import settings from './../../settings.json' with {type: 'json'};

const menuOptions = { 'INICIO': 0, 'CONFIG': 1, 'PUREBA': 3 };
let actualMenuSel = menuOptions.PUREBA;


export class menuScene extends Phaser.Scene {
    constructor() {
        super("menuScene")
    }
    preload() {

    }


    create() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        this.add.text(width / 2, 200, 'MENU', {
            fontFamily: 'Rockwell',
            fontSize: 80,
            color: '#e1f4b1'
        })
            .setOrigin(0.5, 0.5)

        this.add.text(width / 2, 260, 'Selecciona en la opcion deseada', {
            fontFamily: 'Rockwell',
            fontSize: 28,
            color: '#e1f4b1'
        })
            .setOrigin(0.5, 0.5)

        //imagen de fondo
        this.add.image(width / 2, height - 270, 'bismarckMenu')
            .setScale(0.75)
            .setAlpha(0.20) //transparencia dela img
            .depth = 0

        const playBtn = this.add.sprite(width / 3, height / 2, 'PlayBtn')
        playBtn.setInteractive()
        playBtn.depth = 1


        this.add.text(width / 3, height / 2 + 55, 'INCIAR PARTIDA',
            {
                fontFamily: 'Rockwell',
                fontSize: 22,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)
            .depth = 2

        const configBtn = this.add.sprite(width / 3 * 2, height / 2, 'ConfigBtn')
        configBtn.setInteractive()
            .depth = 1
        this.add.text(width / 3 * 2, height / 2 + 55, 'CONFIGURACION',
            {
                fontFamily: 'Rockwell',
                fontSize: 22,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)
            .depth = 2



        playBtn.on('pointerover', function () {
            playBtn.setFrame(1)
        });

        playBtn.on('pointerout', function () {
            playBtn.setFrame(0);
        })

        playBtn.on('pointerdown', () => {
            playBtn.setFrame(2);
            playAudios('menuSelection', this, settings.volumeMenu);
            this.scene.start('gameScene')
            this.scene.remove('menuScene')
        });

        configBtn.on('pointerover', function () {
            configBtn.setFrame(1)
        });

        configBtn.on('pointerout', function () {
            configBtn.setFrame(0);
        })

        configBtn.on('pointerdown', () => {
            configBtn.setFrame(0);
            playAudios('menuSelection', this, settings.volumeMenu)
            this.scene.start('settingsScene')

        });


    }


    update() { }
}



