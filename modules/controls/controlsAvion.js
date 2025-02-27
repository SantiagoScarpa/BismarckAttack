//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 

export function creacionAvion(game, posX, posY, settings) {
    let avion = game.matter.add.sprite(posX, posY, 'avion0');
    avion.setScale(0.15).setOrigin(0.5, 0.5).setVelocityX(1);
    avion.label = 'avion' 
    avion.anims.play('despegue');
    return avion;
}

export function checkControlsAvion({ avion, keys }) {
    let rotationSpeed = 0.4;
    let maxRotationDelta = 180;
    let topeVelocidad = 2;
    let acceleration = 0.012;
    let targetAngle = Math.atan2(avion.body.velocity.y, avion.body.velocity.x);
    targetAngle = Phaser.Math.RadToDeg(targetAngle);

    let currentAngle = avion.angle;
    let deltaAngle = Phaser.Math.Angle.ShortestBetween(currentAngle, targetAngle);

    if (Math.abs(deltaAngle) <= maxRotationDelta) {
        let newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, rotationSpeed);
        avion.angle = newAngle;
    }

    let speedX = avion.body.velocity.x;
    let speedY = avion.body.velocity.y;

    if (keys.UP.isDown) {
        if (avion.body.velocity.y > 0) {
            speedY -= 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad){
                speedY -= acceleration;
            }
        }
    } else if (keys.DOWN.isDown) {
        if (avion.body.velocity.y < 0) {
            speedY += 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad){
                speedY += acceleration;
            } 
        }
    }
    if (keys.LEFT.isDown) {
        if (avion.body.velocity.x > 0) {
            speedX -= 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad){
                speedX -= acceleration;
            } 
        }
    } else if (keys.RIGHT.isDown) {
        if (avion.body.velocity.x < 0) {
            speedX += 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad){
                speedX += acceleration;
            } 
        }
    }

    avion.setVelocityX(speedX);
    avion.setVelocityY(speedY);
}