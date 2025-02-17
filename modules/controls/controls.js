//seteo controles para el barco
export function checkControlsBismarck({ bismarck, keys, anyKeyDown }) {
    let speed = bismarck.velocity;

    let diagonalArIz = keys.UP.isDown && keys.LEFT.isDown
    let diagnolaArDe = keys.UP.isDown && keys.RIGHT.isDown
    let diagnolaAbIz = keys.DOWN.isDown && keys.LEFT.isDown
    let diagonalAbDe = keys.DOWN.isDown && keys.RIGHT.isDown

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

        if (keys.UP.isDown) {
            if (bismarck.angle > 0)
                bismarck.angle -= 1;
            else
                bismarck.angle += 1;

            bismarck.setVelocityY(-speed);
        } else if (keys.DOWN.isDown) {
            if (bismarck.angle > 0)
                bismarck.angle -= 1;
            else
                bismarck.angle += 1;

            bismarck.setVelocityY(speed);
        } else {
            //si no apreto nada, me quedo quieto 
            bismarck.setVelocityY(0);

        }
        if (keys.LEFT.isDown) {
            bismarck.setVelocityX(-speed);
            if (bismarck.angle > -90)
                bismarck.angle -= 1;

        } else if (keys.RIGHT.isDown) {
            if (bismarck.angle < 90)
                bismarck.angle += 1;

            bismarck.setVelocityX(speed);
        } else {
            bismarck.setVelocityX(0);
        }
    }
}


function setVelocidadDiagonal(bismarck, velX, velY) {
    bismarck.setVelocityX(velX);
    bismarck.setVelocityY(velY);
}