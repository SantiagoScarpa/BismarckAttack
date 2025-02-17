import { gameScene } from './modules/game.js';
import { ganaBismarck } from './modules/scene/ganaBismarck.js';

const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 768,
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
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [gameScene, ganaBismarck]
};

const game = new Phaser.Game(config);
console.log("⚡ Phaser ha sido inicializado correctamente");
