//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 

export function creacionAvion(game, posX, posY, settings) {
    let avion = game.matter.add.sprite(posX , posY , 'avion0')
    avion.setScale(0.15).setOrigin(0.5, 0.5).setVelocityX(1);
    avion.velocity = settings.avionVelocity;
    avion.anims.play('despegue');
    return avion
}

export function checkControlsAvion({ avion, keys }) {
    let speed = avion.velocity;

    // Control de movimiento en el eje Y (arriba y abajo)
    if (keys.UP.isDown) {
        avion.setVelocityY(-speed);
    } else if (keys.DOWN.isDown) {
        avion.setVelocityY(speed);
    } else if (keys.LEFT.isDown) {
        avion.setVelocityX(-speed);
    } else if (keys.RIGHT.isDown) {
        avion.setVelocityX(speed);
    }

    // Rote el avión en función de las teclas presionadas
    if (keys.LEFT.isDown && keys.UP.isDown) {
        avion.angle = -135;
    } else if (keys.LEFT.isDown && keys.DOWN.isDown) {
        avion.angle = 135;
    } else if (keys.RIGHT.isDown && keys.UP.isDown) {
        avion.angle = -45;
    } else if (keys.RIGHT.isDown && keys.DOWN.isDown) {
        avion.angle = 45;
    } else if (keys.LEFT.isDown) {
        avion.angle = 180;
    } else if (keys.RIGHT.isDown) {
        avion.angle = 0;
    } else if (keys.UP.isDown) {
        avion.angle = -90;
    } else if (keys.DOWN.isDown) {
        avion.angle = 90;
    }
}