//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 
export function creacionBismarck(game, posX, posY, angle, settings) {

    try {
        let vel = sessionStorage.getItem('bismarckVelocity')
        if (!vel)
            vel = settings.bismarckVelocity
        let bismarck = game.matter.add.sprite(posX, posY, 'bismarck', null, { label: 'bismarck' });
        bismarck.setScale(0.10).setOrigin(0.5, 0.5).setDepth(2);
        bismarck.vida = game.reanudo ? game.partida.bismarck.vida : settings.bismarckVida;
        bismarck.isOnFire = false;
        bismarck.label = 'bismarck'
        bismarck.angle = angle
        bismarck.destroyed = false
        bismarck.velocity = vel;
        return bismarck;
    } catch (err) {
        console.log(err)
    }
}

/*export function checkControlsBismarck({ bismarck, keys, anyKeyDown }) {
    let speed = bismarck.velocity;

    let diagonalArIz = keys.W.isDown && keys.A.isDown
    let diagnolaArDe = keys.W.isDown && keys.D.isDown
    let diagnolaAbIz = keys.S.isDown && keys.A.isDown
    let diagonalAbDe = keys.S.isDown && keys.D.isDown

    if (diagonalArIz) {
        if (bismarck.angle > -45)
            bismarck.angle -= 1;
        else
            bismarck.angle += 1;
        setVelocidadDiagonal(bismarck, -speed, -speed)
    }
    else if (diagnolaArDe) {
        if (bismarck.angle < 45)
            bismarck.angle += 1;
        else
            bismarck.angle -= 1;
        setVelocidadDiagonal(bismarck, speed, -speed)
    } else if (diagnolaAbIz) {
        if (bismarck.angle < 45)
            bismarck.angle += 1;
        else
            bismarck.angle -= 1;
        setVelocidadDiagonal(bismarck, -speed, speed)
    } else if (diagonalAbDe) {
        if (bismarck.angle > -45)
            bismarck.angle -= 1;
        else
            bismarck.angle += 1;
        setVelocidadDiagonal(bismarck, speed, speed)
    }
    else {

        if (keys.W.isDown) {
            if (bismarck.angle > 0)
                bismarck.angle -= 1;
            else
                bismarck.angle += 1;
            bismarck.setVelocityY(-speed);
        } else if (keys.S.isDown) {
            if (bismarck.angle > 0)
                bismarck.angle -= 1;
            else
                bismarck.angle += 1;
            bismarck.setVelocityY(speed);
        } else if (keys.A.isDown) {

            if (bismarck.angle > -90)
                bismarck.angle -= 1;
            bismarck.setVelocityX(-speed);
        } else if (keys.D.isDown) {
            if (bismarck.angle < 90)
                bismarck.angle += 1;

            bismarck.setVelocityX(speed);
        } else {
            bismarck.setVelocityY(0);
            bismarck.setVelocityX(0);
        }
    }
}


function setVelocidadDiagonal(bismarck, velX, velY) {
    bismarck.setVelocityX(velX);
    bismarck.setVelocityY(velY);
}*/

export function checkControlsBismarck({ bismarck, keys }) {
    let rotationSpeed = 0.4;
    let maxRotationDelta = 180;
    let topeVelocidad = 2;
    let acceleration = 0.012;
    let targetAngle = Math.atan2(bismarck.body.velocity.y, bismarck.body.velocity.x);
    targetAngle = Phaser.Math.RadToDeg(targetAngle);

    let currentAngle = bismarck.angle;
    let deltaAngle = Phaser.Math.Angle.ShortestBetween(currentAngle, targetAngle);

    if (bismarck.body.velocity.y !== 0 && bismarck.body.velocity.x !== 0) {
        if (Math.abs(deltaAngle) <= maxRotationDelta) {
            let newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, rotationSpeed);
            bismarck.angle = newAngle + 90;
        }
    } else if (keys.RIGHT.isDown || keys.D.isDown) {
        if (Math.abs(deltaAngle) <= maxRotationDelta) {
            let newAngle = Phaser.Math.Angle.RotateTo(currentAngle, targetAngle, rotationSpeed);
            bismarck.angle = newAngle + 90;
        }
    }

    let speedX = bismarck.body.velocity.x;
    let speedY = bismarck.body.velocity.y;

    if (keys.UP.isDown || keys.W.isDown) {
        if (bismarck.body.velocity.y > 0) {
            speedY -= 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY -= acceleration;
            }
        }
    } else if (keys.DOWN.isDown || keys.S.isDown) {
        if (bismarck.body.velocity.y < 0) {
            speedY += 0.01;
        } else {
            if ((Math.abs(speedY)) < topeVelocidad) {
                speedY += acceleration;
            }
        }
    }
    if (keys.LEFT.isDown || keys.A.isDown) {
        if (bismarck.body.velocity.x > 0) {
            speedX -= 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX -= acceleration;
            }
        }
    } else if (keys.RIGHT.isDown || keys.D.isDown) {
        if (bismarck.body.velocity.x < 0) {
            speedX += 0.01;
        } else {
            if ((Math.abs(speedX)) < topeVelocidad) {
                speedX += acceleration;
            }
        }
    }

    bismarck.setVelocityX(speedX);
    bismarck.setVelocityY(speedY);
}