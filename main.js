import { gameScene } from './modules/game.js'

const config = {//Objeto global que viene en archivo min de Phaser 
    type: Phaser.AUTO, // tipo de renderizado para el juego
    width: 1920,
    height: 1080,
    backgroundColor: '#8AC4FF',
    parent: 'game', //contenedor donde se va a renderizar el juego, es el div que esta en el html
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }

    },
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:
        [gameScene]

}
const game = new Phaser.Game(config);