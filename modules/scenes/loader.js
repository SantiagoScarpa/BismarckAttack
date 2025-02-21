//cargo los assets necesarios
import { loadAudios } from "../audios.js";

export class loaderScene extends Phaser.Scene {
    constructor() {
        super('loaderScene');
    }
    preload() {
        //MENU 
        this.load.image('bismarckMenu', './assets/imgs/bismarckMenu.png');

        this.load.spritesheet('PlayBtn', './assets/imgs/buttons/playSprite.png',
            { frameWidth: 160, frameHeight: 85 });
        this.load.spritesheet('ConfigBtn', './assets/imgs/buttons/configSprite.png',
            { frameWidth: 160, frameHeight: 84 });

        //SETTINGS
        this.load.image('flechaIzq', './assets/imgs/buttons/flechaIzq.png');
        this.load.image('flechaDer', './assets/imgs/buttons/flechaDer.png');
        this.load.spritesheet('returnBtn', './assets/imgs/buttons/return.png',
            { frameWidth: 42, frameHeight: 58 }
        );
        this.load.spritesheet('spriteVol', './assets/imgs/sprites/bars.png',
            { frameWidth: 48, frameHeight: 20 });

        //JUEGO
        this.load.image('radar', './assets/imgs/sprites/radar.png');
        this.load.image('fog', './assets/imgs/tiles/fog.png');
        this.load.image('francia', './assets/imgs/sprites/franciaTransparente.png');
        this.load.image('bismarckGana', './assets/imgs/bismarckGana.png');
        this.load.spritesheet('save', './assets/imgs/sprites/save.png',
            { frameWidth: 16, frameHeight: 16 })

        //ROJO
        this.load.spritesheet('bismarck',
            './assets/imgs/sprites/bismarckTransparente.PNG',
            { frameWidth: 828, frameHeight: 145 }
        );
        this.load.spritesheet('bismarckMisil', './assets/imgs/sprites/bismarckBullet.png',
            { frameWidth: 32, frameHeight: 72 });
        this.load.spritesheet('bismarckMisilCola', './assets/imgs/sprites/bismarckBulletTail.png',
            { frameWidth: 53, frameHeight: 71 });


        for (let i = 0; i < 32; i++) {
            this.load.image(`explosion_${i}`, `./assets/imgs/sprites/explotion/frames/1_${i}.png`);
        }

        for (let i = 0; i < 119; i++) {
            this.load.image(`fire${i}`, `./assets/imgs/sprites/fire1/1_${i}.png`);
        }

        //AZUL
        this.load.spritesheet('portaAviones', './assets/imgs/sprites/portaAvion.png',
            { frameWidth: 350, frameHeight: 600 });





        loadAudios(this);

        this.load.on("complete", () => {
            this.scene.start("menuScene");
        });

    }
    create() { }
}