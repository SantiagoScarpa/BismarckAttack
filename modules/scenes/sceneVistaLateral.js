export class sceneVistaLateral extends Phaser.Scene {
  constructor() {
    super("sceneVistaLateral");
  }
  preload() { }

  init(data) {
    this.players = data.players;
    this.playerId = data.socketId;
    this.franciaPosition = data.franciaPosition
    this.visionDelAvion = data.visionDelAvion
  }

  create() {
    const visionObjets = 210;

    const width = this.game.config.width;
    const height = this.game.config.height;

    this.add
      .text(width / 2, 50, "VISTA LATERAL !", {
        fontFamily: "Rockwell",
        fontSize: 64,
        color: "#e1f4b1",
      })
      .setOrigin(0.5, 0.5)
      .setDepth(1)

    const arrayJugadores = Object.values(this.players);

    const { x: xRED, y: yRED } = arrayJugadores.find((x) => x.team == "red");//solo barco

    let xAvion, yAVion, xBLUE, yBLUE;
    if (arrayJugadores.some((x) => x.team === "blue" && x.label === "avion")) {
      ({ x: xAvion, y: yAVion } = arrayJugadores.find((x) => x.team === "blue" && x.label === "avion"));
      ({ Px: xBLUE, Py: yBLUE } = arrayJugadores.find((x) => x.team === "blue")); // solo barco
    } else {
      ({ x: xBLUE, y: yBLUE } = arrayJugadores.find((x) => x.team === "blue")); // solo barco
    }



    const { x: xFrancia, y: yFrancia } = this.franciaPosition


    const jugadorConsola = this.players[this.playerId];
    const avionActivo = !!this.visionDelAvion
    const distanciaEntreBarcos = Phaser.Math.Distance.Between(xBLUE, yBLUE, xRED, yRED);
    const distanciaAvionBismark = Phaser.Math.Distance.Between(xAvion, yAVion, xRED, yRED) || null;
    const distanciaAvionArkRoyale = Phaser.Math.Distance.Between(xBLUE, yBLUE, xAvion, yAVion) || null;
    const distanciaAvionFrancia = Phaser.Math.Distance.Between(xFrancia, yFrancia, xAvion, yAVion) || null;
    let profundidadAzul = 0;
    let profundidadRojo = 0
    let ejeyAzul = 0;
    let ejeyRojo = 0;

    if (yBLUE < yRED) {
      profundidadAzul = 1;
      profundidadRojo = 2;
      ejeyAzul = 110;
      ejeyRojo = 80;
    }
    else {
      profundidadAzul = 2
      profundidadRojo = 1
      ejeyAzul = 80;
      ejeyRojo = 110;
    }

    if (!!avionActivo) {
      let avion = this.add.sprite(xAvion, 200, "lateralAvion");
      avion.setScale(1).setOrigin(0.5, 0.5).setDepth(2);

      if (distanciaAvionBismark <= this.visionDelAvion) {
        let lateralBismark = this.add.sprite(xRED, this.game.config.height - ejeyRojo, "lateralBismark");
        lateralBismark.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadRojo);
      }

      if (distanciaAvionArkRoyale <= this.visionDelAvion) {
        let lateralArk = this.add.sprite(xBLUE, this.game.config.height - ejeyAzul, "lateralArkRoyale");
        lateralArk.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadAzul);
      }

      if (distanciaAvionFrancia <= this.visionDelAvion) {
        this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
        this.francia.setScale(2.5)
        this.francia.setDepth(0)
      }
    }
    else {
      if (distanciaEntreBarcos <= visionObjets) {
        let lateralArk = this.add.sprite(xBLUE, this.game.config.height - ejeyAzul, "lateralArkRoyale");
        lateralArk.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadAzul);;
        let lateralBismark = this.add.sprite(xRED, this.game.config.height - ejeyRojo, "lateralBismark");
        lateralBismark.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadRojo);
        if (jugadorConsola.team == "red") {
          const distanceFranceBismark = Phaser.Math.Distance.Between(xRED, yRED, xFrancia, yFrancia);
          if (distanceFranceBismark <= visionObjets && jugadorConsola.team == "red") {
            this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
            this.francia.setScale(2.5)
            this.francia.setDepth(0)
          }
        }
        else {
          const distanceFranceArkRoyale = Phaser.Math.Distance.Between(xBLUE, yBLUE, xFrancia, yFrancia);
          if (distanceFranceArkRoyale <= visionObjets && jugadorConsola.team == "blue") {
            this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
            this.francia.setScale(2.5)
            this.francia.setDepth(0)
          }
        }


        if (xAvion && yAVion) {
          if (distanciaAvionBismark <= visionObjets) {
            let avion = this.add.sprite(xAvion, 200, "lateralAvion");
            avion.setScale(1).setOrigin(0.5, 0.5).setDepth(2);
          }
        }
        if (xAvion && yAVion) {
          if (distanciaAvionArkRoyale <= visionObjets) {
            let avion = this.add.sprite(xAvion, 200, "lateralAvion");
            avion.setScale(1).setOrigin(0.5, 0.5).setDepth(2);
          }
        }



      } else {
        if (jugadorConsola.team == "red") {
          let lateralBismark = this.add.sprite(
            xRED,
            this.game.config.height - ejeyRojo,
            "lateralBismark"
          );
          lateralBismark.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadRojo);
          const distanceFranceBismark = Phaser.Math.Distance.Between(xRED, yRED, xFrancia, yFrancia);
          if (distanceFranceBismark <= visionObjets && jugadorConsola.team == "red") {
            this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
            this.francia.setScale(2.5)
            this.francia.setDepth(0)
          }
        } else {
          let lateralArk = this.add.sprite(
            xBLUE,
            this.game.config.height - ejeyAzul,
            "lateralArkRoyale"
          );
          lateralArk.setScale(1).setOrigin(0.5, 0.5).setDepth(profundidadAzul);
          const distanceFranceArkRoyale = Phaser.Math.Distance.Between(xBLUE, yBLUE, xFrancia, yFrancia);
          if (distanceFranceArkRoyale <= visionObjets && jugadorConsola.team == "blue") {
            this.francia = this.add.image(this.game.config.width / 2, this.game.config.height / 2, 'franciaLateral');
            this.francia.setScale(2.5)
            this.francia.setDepth(0)
          }
        }
      }
    }

    this.time.delayedCall(
      5000,
      () => {
        this.scene.wake('gameScene')
        this.scene.stop()
      },
      [],
    );
  }

  update() {
  }
}
