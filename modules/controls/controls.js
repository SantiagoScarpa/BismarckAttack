//seteo controles para el barco
export function checkControlsBismarck({ bismarck, keys }) {
    let speed = bismarck.velocity;

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
    if (bismarck.body.velocity.x !== 0 && bismarck.body.velocity.y !== 0) {
        const diagonalSpeed = Math.sqrt(speed * speed / 2);
        bismarck.setVelocityX(diagonalSpeed * Math.sign(bismarck.body.velocity.x));
        bismarck.setVelocityY(diagonalSpeed * Math.sign(bismarck.body.velocity.y));

    }
}