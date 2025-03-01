import { loadAudios, playAudios } from "../audios.js";
import { obtenerVolumenMenu, obtenerBismarckVelocidad, obtenerDuracionPartida } from "../persistencia/consumoServiciosSettings.js";
import { retomarPartida } from "../persistencia/obtengoPersistencia.js";

const menuOptions = { 'INICIO': 0, 'CONFIG': 1, 'PUREBA': 3 };
let actualMenuSel = menuOptions.PUREBA;

export class menuScene extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    async create() {
        this.volumeMenu = await obtenerVolumenMenu()
        cargoValoresEnSession();
        const width = this.game.config.width;
        const height = this.game.config.height;

        this.add.text(width / 2, 200, 'MENU', {
            fontFamily: 'Rockwell',
            fontSize: 80,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5);

        this.add.text(width / 2, 260, 'Selecciona en la opción deseada', {
            fontFamily: 'Rockwell',
            fontSize: 28,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5);

        // Imagen de fondo
        this.add.image(width / 2, height - 270, 'bismarckMenu')
            .setScale(0.75)
            .setAlpha(0.20)
            .setDepth(0);

        // Botón de inicio de partida
        this.playBtn = this.add.sprite(width / 3, height / 2, 'PlayBtn').setInteractive().setDepth(1);
        this.add.text(width / 3, height / 2 + 55, 'INICIAR PARTIDA', {
            fontFamily: 'Rockwell',
            fontSize: 22,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5).setDepth(2);

        // Botón de configuración
        this.configBtn = this.add.sprite((width / 3) * 2, height / 2, 'ConfigBtn').setInteractive().setDepth(1);
        this.add.text((width / 3) * 2, height / 2 + 55, 'CONFIGURACIÓN', {
            fontFamily: 'Rockwell',
            fontSize: 22,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5).setDepth(2);

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
            .setDepth(2)

        await agregoFuncionalidadBotones(this)
    }

    async getPlayersCount() {
        const res = await fetch("/getPlayerConnections")
        const resJSON = await res.json();
        return resJSON;
    }

    async getPlayers() {
        const res = await fetch("/getPlayers")
        const resJSON = await res.json();
        return resJSON;
    }

    async showTeamSelectionMenu() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        const modalBackground = this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8).setDepth(10);
        this.add.text(width / 2, height / 2 - 50, 'Selecciona tu bando', {
            fontFamily: 'Rockwell',
            fontSize: 32,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);

        const playersData = await this.getPlayers();
        console.log("Información de jugadores:", playersData);

        const blueAgarrado = Object.values(playersData).some(p => p.team === 'blue');
        const redAgarrado = Object.values(playersData).some(p => p.team === 'red');

        // Si el equipo azul está libre, creamos el botón correspondiente
        if (!blueAgarrado) {
            const blueBtn = this.add.text(width / 2 - 100, height / 2 + 30, 'BANDO AZUL', {
                fontFamily: 'Rockwell',
                fontSize: 24,
                color: '#4d79ff',
                backgroundColor: '#333',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }).setOrigin(0.5).setInteractive().setDepth(11);
            blueBtn.on('pointerdown', () => {
                console.log("🔵 Jugador seleccionó el BANDO AZUL");
                this.startGame('blue');
            });
        }

        // Si el equipo rojo está libre, creamos el botón correspondiente
        if (!redAgarrado) {
            const redBtn = this.add.text(width / 2 + 100, height / 2 + 30, 'BANDO ROJO', {
                fontFamily: 'Rockwell',
                fontSize: 24,
                color: '#ff4d4d',
                backgroundColor: '#333',
                padding: { left: 10, right: 10, top: 5, bottom: 5 }
            }).setOrigin(0.5).setInteractive().setDepth(11);
            redBtn.on('pointerdown', () => {
                console.log("🔴 Jugador seleccionó el BANDO ROJO");
                this.startGame('red');
            });
        }
    }


    startGame(team) {
        this.scene.start('gameScene', { team });
    }
}

async function agregoFuncionalidadBotones(game) {
    const { playBtn, configBtn, replayBtn } = game;
    playBtn.on('pointerover', function () {
        playBtn.setFrame(1)
    });

    playBtn.on('pointerout', function () {
        playBtn.setFrame(0);
    })

    playBtn.on('pointerdown', async () => {
        const cantidadJugadores = await game.getPlayersCount();
        playBtn.setFrame(2);
        playAudios('menuSelection', game, game.volumeMenu);
        if (cantidadJugadores < 2) {
            await game.showTeamSelectionMenu();
        }
        else {
            alert("La cantidad de jugadores ha alcanzado su maximo ✌✔")
        }
    });

    configBtn.on('pointerover', function () {
        configBtn.setFrame(1)
    });

    configBtn.on('pointerout', function () {
        configBtn.setFrame(0);
    })

    configBtn.on('pointerdown', () => {
        configBtn.setFrame(0);
        playAudios('menuSelection', game, game.volumeMenu)
        game.scene.start('settingsScene',)

    });

    replayBtn.on('pointerover', function () {
        replayBtn.setFrame(1)
    });

    replayBtn.on('pointerout', function () {
        replayBtn.setFrame(0);
    })

    replayBtn.on('pointerdown', () => {
        replayBtn.setFrame(0)
        playAudios('menuSelection', game, game.volumeMenu)

        playBtn.setInteractive(false);
        replayBtn.setInteractive(false);
        configBtn.setInteractive(false);
        playBtn.removeListener('pointerdown');
        replayBtn.removeListener('pointerdown');
        configBtn.removeListener('pointerdown');
        playBtn.removeListener('pointerover');
        replayBtn.removeListener('pointerover');
        configBtn.removeListener('pointerover');
        showReanudarPartida(game)

    })
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

    let inputRectangle = game.add.rectangle(width / 2, height / 2 - 10, 300, 32, 0xFFFFFF, 0.8).setDepth(10);

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

        retomarPartida(txtCodigo.text.trim().toUpperCase())
            .then((partida) => console.dir(partida))
            .catch((e) => alert(e))

    });


    const cancelarBtn = game.add.text(width / 2 + 100, height / 2 + 50, 'CANCELAR', {
        fontFamily: 'Rockwell',
        fontSize: 24,
        color: '#ff4d4d',
        backgroundColor: '#333',
        padding: { left: 10, right: 10, top: 5, bottom: 5 }
    }).setOrigin(0.5).setInteractive().setDepth(11);

    cancelarBtn.on('pointerdown', () => {
        txtCodigo.setText('');

        game.input.keyboard.removeListener('keydown')
        group.destroy(true)

        agregoFuncionalidadBotones(game)
    });

    group.add(modalBackground)
    group.add(text)
    group.add(inputRectangle)
    group.add(cancelarBtn)
    group.add(retomarBtn)

}


function cargoValoresEnSession() {
    let vel = obtenerBismarckVelocidad()
    let vol = obtenerVolumenMenu()
    let dur = obtenerDuracionPartida()
}