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

        this.playBtn = this.add.sprite(width / 3, height / 2, 'PlayBtn')
        this.playBtn.setInteractive()
        this.playBtn.depth = 1


        this.add.text(width / 3, height / 2 + 55, 'INCIAR PARTIDA',
            {
                fontFamily: 'Rockwell',
                fontSize: 22,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)
            .depth = 2

        this.replayBtn = this.add.sprite(width / 3 * 1.5, height / 2, 'replayBtn')
        this.replayBtn.setInteractive()
            .depth = 1
        this.add.text(width / 3 * 1.5, height / 2 + 55, 'CONTINUAR PARTIDA',
            {
                fontFamily: 'Rockwell',
                fontSize: 22,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)
            .depth = 2

        this.configBtn = this.add.sprite(width / 3 * 2, height / 2, 'ConfigBtn')
        this.configBtn.setInteractive()
            .depth = 1
        this.add.text(width / 3 * 2, height / 2 + 55, 'CONFIGURACION',
            {
                fontFamily: 'Rockwell',
                fontSize: 22,
                color: '#e1f4b1'
            })
            .setOrigin(0.5, 0.5)
            .depth = 2



        agregoFuncionalidadBotones(this)



        getJugadores()

    }


    update() { }
}

function showReanudarPartida(game) {
    const { width, height } = game.game.config
    const group = game.add.group();
    const modalBackground = game.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.9).setDepth(3);
    let text = game.add.text(width / 2, height / 2 - 60, 'Ingresa el codigo de partida', {
        fontFamily: 'Rockwell',
        fontSize: 28,
        color: '#ffffff'
    }).setOrigin(0.5).setDepth(11);


    let txtCodigo = game.add.text(width / 2, height / 2 - 10, ' ',
        { font: '32px Rockwell', fill: '#4d79ff' }).setDepth(11).setOrigin(0.5);

    game.input.keyboard.on('keydown', event => {
        if (event.keyCode === 8 && txtCodigo.text.length > 0) {
            txtCodigo.text = txtCodigo.text.substr(0, txtCodigo.text.length - 1);
        }
        else if (event.keyCode === 32 || (event.keyCode >= 48 && event.keyCode <= 90)) {
            txtCodigo.text += event.key;
        }
    });

    const retomarBtn = game.add.text(width / 2 - 100, height / 2 + 50, 'RETOMAR', {
        fontFamily: 'Rockwell',
        fontSize: 24,
        color: '#4d79ff',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive().setDepth(11);

    retomarBtn.on('pointerdown', () => {
        //busco

    });


    const cancelarBtn = game.add.text(width / 2 + 100, height / 2 + 50, 'CANCELAR', {
        fontFamily: 'Rockwell',
        fontSize: 24,
        color: '#ff4d4d',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
        // txtCodigo.removeListener('keydown')
    }).setOrigin(0.5).setInteractive().setDepth(11);

    cancelarBtn.on('pointerdown', () => {
        txtCodigo.setText('');

        group.destroy(true)

        agregoFuncionalidadBotones(game)
    });

    group.add(modalBackground)
    group.add(text)
    group.add(cancelarBtn)
    group.add(retomarBtn)

}

function getJugadores() {
    fetch('/getPlayersCount', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => console.log(response.json())) // Esperar respuesta en JSON
        .then(data => {
            console.log(data.mensaje); // Mostrar mensaje del servidor
            // (Opcional) Mostrar mensaje en el juego
        })
        .catch(error => {
            console.error('Error:', error);
            // (Opcional) Mostrar mensaje de error en el juego
        });

}

function agregoFuncionalidadBotones(game) {
    const { playBtn, configBtn, replayBtn } = game;
    playBtn.on('pointerover', function () {
        playBtn.setFrame(1)
    });

    playBtn.on('pointerout', function () {
        playBtn.setFrame(0);
    })

    playBtn.on('pointerdown', () => {
        playBtn.setFrame(2);
        playAudios('menuSelection', game, settings.volumeMenu);
        game.scene.start('gameScene')
    });

    configBtn.on('pointerover', function () {
        configBtn.setFrame(1)
    });

    configBtn.on('pointerout', function () {
        configBtn.setFrame(0);
    })

    configBtn.on('pointerdown', () => {
        configBtn.setFrame(0);
        playAudios('menuSelection', game, settings.volumeMenu)
        game.scene.start('settingsScene')

    });

    replayBtn.on('pointerover', function () {
        replayBtn.setFrame(1)
    });

    replayBtn.on('pointerout', function () {
        replayBtn.setFrame(0);
    })

    replayBtn.on('pointerdown', () => {
        replayBtn.setFrame(0)
        playAudios('menuSelection', game, settings.volumeMenu)

        playBtn.setInteractive(false);
        replayBtn.setInteractive(false);
        configBtn.setInteractive(false);
        playBtn.removeListener('pointerdown');
        replayBtn.removeListener('pointerdown');
        configBtn.removeListener('pointerdown');
        playBtn.removeListener('pointerover');
        replayBtn.removeListener('pointerover');
        configBtn.removeListener('pointerover');


        showReanudarPartida(game);

    })
}