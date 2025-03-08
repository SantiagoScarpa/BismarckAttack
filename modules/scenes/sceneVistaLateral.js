export class sceneVistaLateral extends Phaser.Scene {
  constructor() {
    super("sceneVistaLateral");
  }
  preload() {}

  init(data) {
    this.players = data.players;
    this.playerId = data.socketId;
    this.franciaPosition = data.franciaPosition
  }

  create() {
    const visionObjets = 210; 
    this.time.delayedCall(
      5000,
      () => {
        console.log("VOLVERIA");
      },
      [],
      this
    );

    const width = this.game.config.width;
    const height = this.game.config.height;

    this.add
      .text(width / 2, 50, "VISTA LATERAL !", {
        fontFamily: "Rockwell",
        fontSize: 64,
        color: "#e1f4b1",
      })
      .setOrigin(0.5, 0.5);
    console.log(this.players);
    console.log(this.playerId);
    console.log(this.franciaPosition);
    const arrayJugadores = Object.values(this.players);
    
    const { x: xBLUE, y: yBLUE } = arrayJugadores.find((x) => x.team == "blue");
    const { x: xRED, y: yRED } = arrayJugadores.find((x) => x.team == "red");
    const { x: xFrancia, y: yFrancia } = this.franciaPosition
    

    const jugadorConsola = this.players[this.playerId];

    const distance = Phaser.Math.Distance.Between(xBLUE, yBLUE, xRED, yRED);
    let profundidadAzul = 0;
    let profundidadRojo = 0
    let ejeyAzul = 0;
    let ejeyRojo = 0;

      if(yBLUE < yRED){
        profundidadAzul = 1;
        profundidadRojo = 2;
        ejeyAzul = 110;
        ejeyRojo = 80;
      }
      else{
        profundidadAzul = 2
        profundidadRojo = 1
        ejeyAzul = 80;
        ejeyRojo = 110;
      }

    if (distance <= visionObjets) {
      let lateralArk = this.add.sprite(xBLUE, this.game.config.height - ejeyAzul, "lateralArkRoyale");
      lateralArk.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadAzul);;
      let lateralBismark = this.add.sprite(xRED, this.game.config.height - ejeyRojo, "lateralBismark");
      lateralBismark.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadRojo);
    } else {
      if (jugadorConsola.team == "red") {
        let lateralBismark = this.add.sprite(
          xRED,
          this.game.config.height - ejeyRojo,
          "lateralBismark"
        );
        lateralBismark.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadRojo);;
      } else {
        let lateralArk = this.add.sprite(
          xBLUE,
          this.game.config.height - ejeyAzul,
          "lateralArkRoyale"
        );
        lateralArk.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadAzul);
      }
    }
    const distanceFranceArkRoyale = Phaser.Math.Distance.Between(xBLUE, yBLUE, xFrancia, yFrancia);
    if (distanceFranceArkRoyale <= visionObjets && jugadorConsola.team == "blue") {
      this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
      this.francia.setScale(2.5)
      this.francia.setDepth(0)
    }

    const distanceFranceBismark = Phaser.Math.Distance.Between(xRED, yRED, xFrancia, yFrancia);
    if (distanceFranceBismark <= visionObjets && jugadorConsola.team == "red") {
      this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
      this.francia.setScale(2.5)
      this.francia.setDepth(0)
    }





  }

  update() {}
}
