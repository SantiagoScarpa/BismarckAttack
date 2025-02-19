//ARCHIVO PARA CREACION DE ARK ROYALE Y SUS CONTROLES
export function creacionArkRoyale(game, posX, posY, settings) {
    let arkRoyal = game.matter.add.sprite(posX - 100, posY - 100, 'portaAviones')
    arkRoyal
        .setScale(0.20)
        .setOrigin(0.5, 0.5)
        .avionesRestantes = 10;
    arkRoyal.velocity = settings.arkRoyalVelocity
    return arkRoyal
}