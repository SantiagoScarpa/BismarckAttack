import { loadAudios, playAudios } from "../audios.js";
import settings from './../../settings.json' with { type: 'json' };

const menuOptions = { 'INICIO': 0, 'CONFIG': 1, 'PUREBA': 3 };
let actualMenuSel = menuOptions.PUREBA;

export class menuScene extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    create() {
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
        const playBtn = this.add.sprite(width / 3, height / 2, 'PlayBtn').setInteractive().setDepth(1);
        this.add.text(width / 3, height / 2 + 55, 'INICIAR PARTIDA', {
            fontFamily: 'Rockwell',
            fontSize: 22,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5).setDepth(2);

        // Botón de configuración
        const configBtn = this.add.sprite((width / 3) * 2, height / 2, 'ConfigBtn').setInteractive().setDepth(1);
        this.add.text((width / 3) * 2, height / 2 + 55, 'CONFIGURACIÓN', {
            fontFamily: 'Rockwell',
            fontSize: 22,
            color: '#e1f4b1'
        }).setOrigin(0.5, 0.5).setDepth(2);

        playBtn.on('pointerover', () => playBtn.setFrame(1));
        playBtn.on('pointerout', () => playBtn.setFrame(0));

        playBtn.on('pointerdown', async () => {
            const cantidadJugadores = await this.getPlayers();
            playBtn.setFrame(2);
            playAudios('menuSelection', this, settings.volumeMenu);
            if (cantidadJugadores < 2) {
                this.showTeamSelectionMenu();
            }
            else {
                alert("La cantidad de jugadores ha alcanzado su maximo ✌✔")
            }
        });

        configBtn.on('pointerover', () => configBtn.setFrame(1));
        configBtn.on('pointerout', () => configBtn.setFrame(0));

        configBtn.on('pointerdown', () => {
            configBtn.setFrame(0);
            playAudios('menuSelection', this, settings.volumeMenu);
            this.scene.start('settingsScene');
        });
    }

    async getPlayers() {
        const res = await fetch("/getPlayerConnections")
        const resJSON = await res.json();
        console.log(resJSON)
        return resJSON;
    }

    showTeamSelectionMenu() {
        const width = this.game.config.width;
        const height = this.game.config.height;

        const modalBackground = this.add.rectangle(width / 2, height / 2, 400, 200, 0x000000, 0.8).setDepth(10);
        this.add.text(width / 2, height / 2 - 50, 'Selecciona tu bando', {
            fontFamily: 'Rockwell',
            fontSize: 32,
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(11);

        const blueBtn = this.add.text(width / 2 - 100, height / 2 + 30, 'BANDO AZUL', {
            fontFamily: 'Rockwell',
            fontSize: 24,
            color: '#4d79ff',
            backgroundColor: '#333',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive().setDepth(11);

        const redBtn = this.add.text(width / 2 + 100, height / 2 + 30, 'BANDO ROJO', {
            fontFamily: 'Rockwell',
            fontSize: 24,
            color: '#ff4d4d',
            backgroundColor: '#333',
            padding: { left: 10, right: 10, top: 5, bottom: 5 }
        }).setOrigin(0.5).setInteractive().setDepth(11);

        blueBtn.on('pointerdown', () => {
            console.log("🔵 Jugador seleccionó el BANDO AZUL");
            this.startGame('blue');
        });

        redBtn.on('pointerdown', () => {
            console.log("🔴 Jugador seleccionó el BANDO ROJO");
            this.startGame('red');
        });
    }

    startGame(team) {
        this.scene.start('gameScene', { team });
        this.scene.remove('menuScene');
    }


}
