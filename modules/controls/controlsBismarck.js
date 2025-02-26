//ARCHIVO PARA CREACION DE BISMARCK Y SUS CONTROLES 

export function creacionBismarck(game, posX, posY, settings) {
    let bismarck = game.matter.add.sprite(posX, posY, 'bismarck', null, { label: 'bismarck' });
    bismarck.setScale(0.10).setOrigin(0.5, 0.5);
    bismarck.vida = 3;
    bismarck.isOnFire = false;
    bismarck.label = 'bismarck'
    bismarck.velocity = settings.bismarckVelocity;
    return bismarck;
}

export function checkControlsBismarck({ bismarck, keys, anyKeyDown }) {
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
            //            if (bismarck.angle >= -95 && bismarck.angle <= -85)
            bismarck.setVelocityX(-speed);
        } else if (keys.D.isDown) {
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