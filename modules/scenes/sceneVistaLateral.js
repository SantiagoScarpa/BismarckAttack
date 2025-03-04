

export class sceneVistaLateral extends Phaser.Scene {
    constructor() {
        super("sceneVistaLateral")
    }
    preload() { }

    create() {
        this.time.delayedCall(5000, () => {
            console.log('VOLVERIA')
        }, [], this);

        const width = this.game.config.width;
        const height = this.game.config.height;


        this.add.text(width / 2, 50, 'VISTA LATERAL !',
            {
                fontFamily: 'Rockwell',
                fontSize: 64,
                color: "#e1f4b1"
            }
        )
            .setOrigin(0.5, 0.5)

    }
    update() {

    }
}