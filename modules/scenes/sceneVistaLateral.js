export class sceneVistaLateral extends Phaser.Scene {
  constructor() {
    super("sceneVistaLateral");
  }
  preload() {}

  init(data) {
    this.players = data.players;
    this.playerId = data.socketId;
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
    const arrayJugadores = Object.values(this.players);

    const { x: xBLUE, y: yBLUE } = arrayJugadores.find((x) => x.team == "blue");
    const { x: xRED, y: yRED } = arrayJugadores.find((x) => x.team == "red");

    // Mostrar u ocultar objetos según estén dentro del rango de visión
    const jugadorConsola = this.players[this.playerId];

    const distance = Phaser.Math.Distance.Between(xBLUE, yBLUE, xRED, yRED);
    if (distance <= visionObjets) {
      let lateralArk = this.matter.add.sprite(xBLUE, yBLUE, "lateralArkRoyale");
      lateralArk.setScale(0.65).setOrigin(0.5, 0.5);
      let lateralBismark = this.matter.add.sprite(xRED, yRED, "lateralBismark");
      lateralBismark.setScale(0.6).setOrigin(0.5, 0.5);
    } else {
      if (jugadorConsola.team == "red") {
        let lateralBismark = this.matter.add.sprite(
          xRED,
          yRED,
          "lateralBismark"
        );
        lateralBismark.setScale(0.6).setOrigin(0.5, 0.5);
      } else {
        let lateralArk = this.matter.add.sprite(
          xBLUE,
          yBLUE,
          "lateralArkRoyale"
        );
        lateralArk.setScale(0.65).setOrigin(0.5, 0.5);
      }
    }
  }

  update() {}
}
