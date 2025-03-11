//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 

export function creacionAvion(game, posX, posY, settings) {
    let velInicial = 1;
    let imgName = 'avion0';
    if (game.reanudo && game.avionReanudado){
        velInicial = 0;
        imgName = 'avion9';
    }
    let avion = game.matter.add.sprite(posX, posY, imgName);
    avion.setScale(0.15).setOrigin(0.5, 0.5).setVelocityX(velInicial);
    avion.label = 'avion'
    avion.body.label = 'avion'
    avion.municion = (game.reanudo && game.avionReanudado) ? game.partida.arkRoyal.avionActual.municion : settings.avionMunicion;
    avion.observador = false;
    avion.observadorMarco = false;
    if (!(game.reanudo && game.avionReanudado)){
        avion.anims.play('despegue');
    }
    avion.visionDelAvion = 0;
    avion.velocity = settings.avionVelocity;
    return avion;
}

export function checkControlsAvion({ avion, keys }) {
    let multiVelocidad = 0.5 * avion.velocity;
    let rotationSpeed = 0.4 * multiVelocidad;
    let maxRotationDelta = 180;
    let topeVelocidad = 2 * multiVelocidad;
    let acceleration = 0.012 * multiVelocidad;
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

    if (keys.UP.isDown || keys.W.isDown) {
        if (avion.body.velocity.y > 0) {
            speedY -= 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY -= acceleration;
            }
        }
    } else if (keys.DOWN.isDown || keys.S.isDown) {
        if (avion.body.velocity.y < 0) {
            speedY += 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY += acceleration;
            }
        }
    }
    if (keys.LEFT.isDown || keys.A.isDown) {
        if (avion.body.velocity.x > 0) {
            speedX -= 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX -= acceleration;
            }
        }
    } else if (keys.RIGHT.isDown || keys.D.isDown) {
        if (avion.body.velocity.x < 0) {
            speedX += 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX += acceleration;
            }
        }
    }

    avion.setVelocityX(speedX);
    avion.setVelocityY(speedY);
}