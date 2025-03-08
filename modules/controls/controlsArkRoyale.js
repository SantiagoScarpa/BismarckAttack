//ARCHIVO PARA CREACION DE ARK ROYALE Y SUS CONTROLES
export function creacionArkRoyale(game, posX, posY, angle, avionesRestantes, settings) {
    let arkRoyal = game.matter.add.sprite(posX, posY, 'portaAviones', null, { label: 'arkroyal' });
    //arkroyal.id = Phaser.Utils.String.UUID();
    arkRoyal.setScale(0.15).setOrigin(0.5, 0.5);
    arkRoyal.avionesRestantes = avionesRestantes;
    arkRoyal.vida = 3
    arkRoyal.isOnFire = false
    arkRoyal.label = 'arkroyal'
    arkRoyal.body.label = 'arkroyal'
    arkRoyal.angle = angle
    arkRoyal.velocity = settings.arkRoyalVelocity;
    return arkRoyal
}

export function checkControlsArkRoyale({ ArkRoyale, keys }) {
    let rotationSpeed = 0.4;
    let maxRotationDelta = 180;
    let topeVelocidad = 2;
    let acceleration = 0.012;
    let targetAngle = Math.atan2(ArkRoyale.body.velocity.y, ArkRoyale.body.velocity.x);
    targetAngle = Phaser.Math.RadToDeg(targetAngle);

    let currentAngle = ArkRoyale.angle;
    let deltaAngle = Phaser.Math.Angle.ShortestBetween(currentAngle, targetAngle);

    if (ArkRoyale.body.velocity.y !== 0 && ArkRoyale.body.velocity.x !== 0) {
        if (Math.abs(deltaAngle) <= maxRotationDelta) {
            let newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, rotationSpeed);
            ArkRoyale.angle = newAngle + 90;
        }
    } else if (keys.RIGHT.isDown) {
        if (Math.abs(deltaAngle) <= maxRotationDelta) {
            let newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, rotationSpeed);
            ArkRoyale.angle = newAngle + 90;
        }
    }

    let speedX = ArkRoyale.body.velocity.x;
    let speedY = ArkRoyale.body.velocity.y;

    if (keys.UP.isDown) {
        if (ArkRoyale.body.velocity.y > 0) {
            speedY -= 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY -= acceleration;
            }
        }
    } else if (keys.DOWN.isDown) {
        if (ArkRoyale.body.velocity.y < 0) {
            speedY += 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY += acceleration;
            }
        }
    }
    if (keys.LEFT.isDown) {
        if (ArkRoyale.body.velocity.x > 0) {
            speedX -= 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX -= acceleration;
            }
        }
    } else if (keys.RIGHT.isDown) {
        if (ArkRoyale.body.velocity.x < 0) {
            speedX += 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX += acceleration;
            }
        }
    }

    ArkRoyale.setVelocityX(speedX);
    ArkRoyale.setVelocityY(speedY);
}