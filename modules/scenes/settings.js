import { loadAudios, playAudios } from "../audios.js";
import settings from './../../settings.json' with {type: 'json'}
import { cambiarBismarckVelocidad, bajarVolumenMenu, subirVolumenMenu, obtenerVolumenMenu, obtenerBismarckVelocidad, cambiarDuracionPartida, obtenerDuracionPartida } from "../persistencia/consumoServiciosSettings.js";

export class settingsScene extends Phaser.Scene {
    constructor() {
        super("settingsScene")
    }

    preload() { }
    create() {
        this.volMenu = sessionStorage.getItem('volMenu')
        this.width = this.game.config.width;
        this.height = this.game.config.height;
        this.add.text(this.width / 2, 50, 'CONFIGURACION',
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
            this.scene.start('menuScene')
            playAudios('return', this, this.volMenu)
        })


        agregarVolMenu(this)
        agregarVelBismarck(this)
        agregarTiempoPartida(this)
    }
    upload() { }
}

function agregarVolMenu(game) {

    game.add.text(game.width / 3, game.height / 4, 'Volumen de menu:',
        {
            fontFamily: 'Rockwell',
            fontSize: 32,
            color: '#e1f4b1'
        })
        .setOrigin(0.5, 0.5)


    let volNum = game.add.sprite(game.width / 3 * 1.5, game.height / 4, 'numeros')
        .setScale(0.25)
        .setFrame(game.volMenu * 10)
        .setOrigin(0.5, 0.5)

    let btnBajoVol = game.add.sprite(game.width / 3 * 1.5 - 60, game.height / 4, 'flechaIzq')
        .setScale(0.5)
        .setInteractive()
    let btnSuboVol = game.add.sprite(game.width / 3 * 1.5 + 60, game.height / 4, 'flechaDer')
        .setScale(0.5)
        .setInteractive()

    let volFrame = game.volMenu * 10
    if (volFrame === 0)
        btnBajoVol.setTint(0x808080);
    else if (volFrame === 9)
        btnSuboVol.setTint(0x808080);


    btnBajoVol.on('pointerdown', async () => {
        if (!volFrame < 1) {
            volFrame--;
            if (volFrame === 0)
                btnBajoVol.setTint(0x808080);
            bajarVolumenMenu()
            volNum.setFrame(volFrame)
            btnSuboVol.clearTint()
            playAudios('menuSelection', game, volFrame / 10);
        }

    });

    btnSuboVol.on('pointerdown', async () => {

        if (volFrame < 9) {
            volFrame++;
            if (volFrame === 9)
                btnSuboVol.setTint(0x808080);
            subirVolumenMenu()
            volNum.setFrame(volFrame)
            btnBajoVol.clearTint()
            playAudios('menuSelection', game, volFrame / 10);
        }

    });
}

function agregarVelBismarck(game) {
    let velBismarck = sessionStorage.getItem('bismarckVelocity')
    game.add.text(game.width / 3, game.height / 4 * 1.25, 'Velocidad Bismarck:',
        {
            fontFamily: 'Rockwell',
            fontSize: 32,
            color: '#e1f4b1'
        })
        .setOrigin(0.5, 0.5)

    let bisNum = game.add.sprite(game.width / 3 * 1.5, game.height / 4 * 1.25, 'numeros')
        .setScale(0.25)
        .setFrame(velBismarck)
        .setOrigin(0.5, 0.5)

    let btnBajoVol = game.add.sprite(game.width / 3 * 1.5 - 60, game.height / 4 * 1.25, 'flechaIzq')
        .setScale(0.5)
        .setInteractive()
    let btnSuboVol = game.add.sprite(game.width / 3 * 1.5 + 60, game.height / 4 * 1.25, 'flechaDer')
        .setScale(0.5)
        .setInteractive()

    btnBajoVol.on('pointerdown', () => {

        if (velBismarck > 0) {
            velBismarck--;
            cambiarBismarckVelocidad(false)
            if (velBismarck < 1)
                btnBajoVol.setTint(0x808080);
            if (velBismarck < 9)
                btnSuboVol.clearTint()
            bisNum.setFrame(velBismarck)

        }
        else {
            btnBajoVol.setTint(0x808080);
        }
    });

    btnSuboVol.on('pointerdown', () => {
        if (velBismarck < 9) {
            cambiarBismarckVelocidad(true)
            let v = obtenerBismarckVelocidad()
            velBismarck++;
            if (velBismarck > 8)
                btnSuboVol.setTint(0x808080);

            if (velBismarck > 0) {
                btnBajoVol.clearTint()
            }
            bisNum.setFrame(velBismarck)
        } else {

            btnSuboVol.setTint(0x808080);
        }

    });
}

function agregarTiempoPartida(game) {
    let durPartida = sessionStorage.getItem('duracionPartida')
    game.add.text(game.width / 3, game.height / 4 * 1.5, 'Duracion Partida:',
        {
            fontFamily: 'Rockwell',
            fontSize: 32,
            color: '#e1f4b1'
        })
        .setOrigin(0.5, 0.5)

    let bisNum = game.add.sprite(game.width / 3 * 1.5, game.height / 4 * 1.5, 'numeros')
        .setScale(0.25)
        .setFrame(durPartida)
        .setOrigin(0.5, 0.5)

    let btnBajoVol = game.add.sprite(game.width / 3 * 1.5 - 60, game.height / 4 * 1.5, 'flechaIzq')
        .setScale(0.5)
        .setInteractive()
    let btnSuboVol = game.add.sprite(game.width / 3 * 1.5 + 60, game.height / 4 * 1.5, 'flechaDer')
        .setScale(0.5)
        .setInteractive()

    btnBajoVol.on('pointerdown', () => {

        if (durPartida > 0) {
            durPartida--;
            cambiarDuracionPartida(false)
            if (durPartida < 1)
                btnBajoVol.setTint(0x808080);
            if (durPartida < 9)
                btnSuboVol.clearTint()
            bisNum.setFrame(durPartida)

        }
        else {
            btnBajoVol.setTint(0x808080);
        }
    });

    btnSuboVol.on('pointerdown', () => {
        if (durPartida < 9) {
            cambiarDuracionPartida(true)
            let v = obtenerDuracionPartida()
            durPartida++;
            if (durPartida > 8)
                btnSuboVol.setTint(0x808080);

            if (durPartida > 0) {
                btnBajoVol.clearTint()
            }
            bisNum.setFrame(durPartida)
        } else {

            btnSuboVol.setTint(0x808080);
        }

    });
}