import settings from '../../settings.json' with {type: 'json'};

//seteo controles para el barco
export function checkControlsBismarck({ bismarck, keys }) {

    if (keys.LEFT.isDown) {
        if (bismarck.angle > -90 && bismarck.angle <= 91) {
            bismarck.angle -= 1;
        } else {
            bismarck.angle += 1;
        }
        bismarck.x -= settings.bismarckVelocity

    } else if (keys.RIGHT.isDown) {
        bismarck.x += settings.bismarckVelocity
        if (bismarck.angle < 90 && bismarck.angle >= -90) {
            bismarck.angle += 1;
        } else {
            bismarck.angle -= 1;
        }

    } else if (keys.UP.isDown) {
        bismarck.y -= settings.bismarckVelocity
        if (bismarck.angle > 0 && bismarck.angle < 180) {// si esta apuntando hacia la derecha
            bismarck.angle -= 1;
        } else if (bismarck.angle >= -91 && bismarck.angle < 0) {
            bismarck.angle += 1;
        }
    } else if (keys.DOWN.isDown) {
        bismarck.y += settings.bismarckVelocity

        if (bismarck.angle < 0 && bismarck.angle > -180) {
            bismarck.angle -= 1;
        } else if (bismarck.angle >= 0 && bismarck.angle < 180) {
            bismarck.angle += 1;
        }
    }


}