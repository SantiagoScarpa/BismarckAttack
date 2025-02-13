//import settings from './settings.json' with {type: 'json'};
import { gameScene } from './modules/game'

const config = {//Objeto global que viene en archivo min de Phaser 
    type: Phaser.AUTO, // tipo de renderizado para el juego
    width: 800,
    height: 600,
    backgroundColor: '#8AC4FF',
    parent: 'game', //contenedor donde se va a renderizar el juego, es el div que esta en el html
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 200 },
            debug: false
        }
    },
    scene:
        [gameScene]

}
const game = new Phaser.Game(config);