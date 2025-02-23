//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 

export function creacionAvion(game, posX, posY, settings) {
    let avion = game.matter.add.sprite(posX , posY , 'avion0')
    avion.setScale(0.15).setOrigin(0.5, 0.5).setVelocityX(1);
    avion.velocity = settings.avionVelocity;
    avion.anims.play('despegue');
    return avion
}

export function checkControlsAvion({ avion, keys }) {
    // Variables para la velocidad en los ejes X y Y
    let speed = avion.velocity;
    let velocityX = 0;
    let velocityY = 0;

    // Control de movimiento en el eje Y (arriba y abajo)
    if (keys.UP.isDown) {
        velocityY = -speed;  // Mover hacia arriba
    } else if (keys.DOWN.isDown) {
        velocityY = speed;  // Mover hacia abajo
    }

    // Control de movimiento en el eje X (izquierda y derecha)
    if (keys.LEFT.isDown) {
        velocityX = -speed;  // Mover hacia la izquierda
    } else if (keys.RIGHT.isDown) {
        velocityX = speed;  // Mover hacia la derecha
    }

    // Aplicar velocidad al sprite
    avion.setVelocityX(velocityX);
    avion.setVelocityY(velocityY);

    // Rote el avión en función de las teclas presionadas
    if (keys.LEFT.isDown && keys.UP.isDown) {
        avion.angle = -135;  // Hacia arriba y a la izquierda
    } else if (keys.LEFT.isDown && keys.DOWN.isDown) {
        avion.angle = 135;  // Hacia abajo y a la izquierda
    } else if (keys.RIGHT.isDown && keys.UP.isDown) {
        avion.angle = -45;  // Hacia arriba y a la derecha
    } else if (keys.RIGHT.isDown && keys.DOWN.isDown) {
        avion.angle = 45;  // Hacia abajo y a la derecha
    } else if (keys.LEFT.isDown) {
        avion.angle = 180;  // Solo izquierda
    } else if (keys.RIGHT.isDown) {
        avion.angle = 0;  // Solo derecha
    } else if (keys.UP.isDown) {
        avion.angle = -90;   // Solo arriba (sin rotación, ya que mira hacia la derecha)
    } else if (keys.DOWN.isDown) {
        avion.angle = 90; // Solo abajo
    } else {
        //avion.angle = 0;   // Sin rotación (cuando no se mueve)
    }
}