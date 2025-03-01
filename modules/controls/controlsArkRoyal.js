//ARCHIVO PARA CREACION DE ARK ROYALE Y SUS CONTROLES
export function creacionArkRoyal(game, posX, posY, settings) {
    let arkRoyal = game.matter.add.sprite(posX - 100, posY - 100, 'portaAviones')
    arkRoyal
        .setScale(0.20)
        .setOrigin(0.5, 0.5)
        .avionesRestantes = 10;
    arkRoyal.velocity = settings.arkRoyalVelocity
    arkRoyal.avionesRestantes = 10

    return arkRoyal
}

export function crearAvion(game, posX, posY, obs, ope, muni, settings) {
    let avion = game.matter.add.sprite(posX - 100, posY - 100, 'avion')
    avion.observador = obs
    avion.operador = ope
    avion.municion = muni
    avion.velocity = settings.avionVelocity
    return avion
}