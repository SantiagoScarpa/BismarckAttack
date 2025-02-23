//ARCHIVO PARA CREACION DE ARK ROYALE Y SUS CONTROLES
export function creacionArkRoyale(game, posX, posY, settings) {
    let arkRoyal = game.matter.add.sprite(posX , posY , 'portaAviones')
    arkRoyal.setScale(0.15).setOrigin(0.5, 0.5);
    arkRoyal.avionesRestantes = 10;
    arkRoyal.velocity = settings.arkRoyalVelocity;
    return arkRoyal
}
