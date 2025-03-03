
export class sceneVistaLateral extends Phaser.Scene {
    constructor() {
        super("sceneVistaLateral")
    }
    preload() { }

    create(players) {

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
        console.log(players)
        const arrayDeObjetos = Object.values(players);
        const {x:xBLUE,y:yBLUE} = arrayDeObjetos.find(x => x.team=="blue")
        let lateralArk = this.matter.add.sprite(xBLUE, yBLUE, "lateralArkRoyale")
        lateralArk.setScale(0.35).setOrigin(0.5, 0.5);
        lateralArk.vida = 4;
        lateralArk.body.label = 'lateralArk';
        lateralArk.isOnFire = false;

        const {x:xRED,y:yRED} = arrayDeObjetos.find(x => x.team=="red")
        let lateralBismark =  this.matter.add.sprite(xRED, yRED, "lateralBismark")
        lateralBismark.setScale(0.30).setOrigin(0.5, 0.5);
        lateralBismark.body.label = 'bismarck'
    }

    update() {

    }
}