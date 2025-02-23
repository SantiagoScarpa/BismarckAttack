import { gameScene } from './modules/scenes/game.js';
import { ganaBismarck } from './modules/scenes/ganaBismarck.js';
import { menuScene } from './modules/scenes/menu.js';
import { settingsScene } from './modules/scenes/settings.js';
import { loaderScene } from './modules/scenes/loader.js'
const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 900,
    backgroundColor: '#98D8EF',
    parent: 'game',
    physics: {
        default: 'matter',
        matter: {
            gravity: { y: 0 },
            setBounds: {
                left: true, right: true, bottom: true, top: true
            },
            debug: {
                showBody: true,
                showStaticBody: true
            }
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        max: {
            width: 1600,
            height: 900,
        }
    },
    scene: [loaderScene, menuScene, gameScene, ganaBismarck, settingsScene]
};

const game = new Phaser.Game(config);
console.log("⚡ Phaser ha sido inicializado correctamente");


