import { loadAudios, playAudios, stopAudios } from "../audios.js";
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

        this.partida = null;
        this.codigoEspera = null;

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
        
        // Reprodusco musica de menu si no se esta reproduciendo
        if (!this.musicOn){
            this.musicOn = true;
            playAudios('music', this, this.volumeMenu);
        }
        

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
        this.playWaiting = false
        this.replayWaiting = false
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

        // Modal de selección
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


        // Botón para bando azul
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
                this.selectedTeam = 'blue';
                this.socket = io();
                this.socket.emit('setPlayerTeam', 'blue')
                this.socket.emit('esperoNuevaPartida')
                this.showWaitingModal();
                this.waitForOtherPlayer();
            });
        }

        // Botón para bando rojo
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
                this.selectedTeam = 'red';
                this.socket = io();
                this.socket.emit('setPlayerTeam', 'red')
                this.socket.emit('esperoNuevaPartida')
                this.showWaitingModal();
                this.waitForOtherPlayer();
            });
        }

    }

    showWaitingModal() {
        if (!this.waitingModal) {
            const width = this.game.config.width;
            const height = this.game.config.height;


            this.waitingModal = this.add.rectangle(width / 2, height / 2, 600, 300, 0x000000, 1).setDepth(20);

            this.waitingText = this.add.text(width / 2, height / 2, 'Esperando al otro jugador', {
                fontFamily: 'Rockwell',
                fontSize: 24,
                color: '#ffffff'
            }).setOrigin(0.5).setDepth(21);

            let dots = "";
            this.time.addEvent({
                delay: 300,
                loop: true,
                callback: () => {
                    dots = dots.length < 5 ? dots + "." : "";
                    this.waitingText.setText(`Esperando al otro jugador${dots}`);
                },
                callbackScope: this
            });
        }
    }

    hideWaitingModal() {
        if (this.waitingModal) {
            this.waitingModal.destroy(); this.waitingText.destroy();
            this.waitingModal = null;
            this.waitingText = null;
        }
    }

    async waitForOtherPlayer() {
        const intervalId = setInterval(async () => {
            const playersCount = await this.getPlayersCount();
            if (playersCount === 2) {
                clearInterval(intervalId);
                this.hideWaitingModal();
                this.startGame(this.selectedTeam, this.socket, this.reanudo, this.partida);
            }
        }, 1000);
    }
    async esperoNuevaPartida() {
        let res = await fetch('/getEsperoNuevaPartida')
        let resJson = await res.json();
        return resJson;
    }

    startGame(team, socket, reanudo, partida) {
        stopAudios('music', this);
        this.scene.start('gameScene', { team, socket, reanudo, partida });
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
        game.reanudo = false
        playBtn.setFrame(2);
        playAudios('menuSelection', game, game.volumeMenu);
        game.codigoEspera = await esperoCodigo();
        if (game.codigoEspera == null) {
            if (cantidadJugadores < 2) {
                await game.showTeamSelectionMenu();
            }
            else {
                alert("La cantidad de jugadores ha alcanzado su maximo ✌✔")
            }
        } else {
            alert("Otro jugador esta reanudando una partida, no se puede iniciar una nueva")
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

    replayBtn.on('pointerdown', async () => {
        let esperoNuevaPartida = await game.esperoNuevaPartida();
        game.codigoEspera = await esperoCodigo();
        if (!esperoNuevaPartida) {
            replayBtn.setFrame(0)
            game.reanudo = true
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
        } else {
            alert('Un usuario se encuentra iniciando una partida nueva, no se puede reanudar otra')
        }
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
        let codigo = txtCodigo.text.trim().toUpperCase()

        if (game.codigoEspera === null || codigo === game.codigoEspera) {
            retomarPartida(codigo)
                .then((partida) => esperoJugador(game, codigo, partida))
                .catch((e) => alert(e))
        } else {
            alert('Un jugador se encuentra esperando continuar otra partida')
            txtCodigo.setText('');
        }

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

async function esperoJugador(game, codigo, partida) {
    game.partida = partida;
    if (codigo === partida.codigoRojo) {
        console.log("🔴 Jugador seleccionó el BANDO ROJO");
        game.selectedTeam = 'red';
        game.socket = io();
        game.socket.emit('setPlayerTeam', 'red')
        game.socket.emit('esperoCodigo', partida.codigoAzul)
        game.showWaitingModal();
        game.waitForOtherPlayer();
    } else if (codigo === partida.codigoAzul) {
        console.log("🔵 Jugador seleccionó el BANDO AZUL");
        game.selectedTeam = 'blue';
        game.socket = io();
        game.socket.emit('setPlayerTeam', 'blue')
        game.socket.emit('esperoCodigo', partida.codigoRojo)
        game.showWaitingModal();
        game.waitForOtherPlayer();
    }

}

async function esperoCodigo() {
    let res = await fetch('/getCodigoEspera')
    let resJson = await res.json();
    return resJson;
}
