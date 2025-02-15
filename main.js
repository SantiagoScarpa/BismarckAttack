import { gameScene } from './modules/game.js'
import { ganaBismarck } from './modules/scene/ganaBismarck.js';

const config = {
    type: Phaser.AUTO, // tipo de renderizado para el juego
    width: 1600,
    height: 768,
    backgroundColor: '#98D8EF',
    parent: 'game', //contenedor donde se va a renderizar el juego, es el div que esta en el html
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            setBounds: {
                left: true, right: true, bottom: true, top: true
            },
            debug: {
                showBody: false,
                showStaticBody: false
            }
        }
    },
    scale: {
        // Fit to window
        mode: Phaser.Scale.FIT,
        // Center vertically and horizontally
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene:
        [gameScene, ganaBismarck]

}
const game = new Phaser.Game(config);