import { retomarPartida } from './persistencia/obtengoPersistencia.js';
/*MODULO PARA GUARDAR FUNCIONES Y VALORES GLOBALES*/

export function createAnimations(game) {
    game.anims.create({
        key: 'explode',
        frames: Array.from({ length: 32 }, (_, i) => ({ key: `explosion_${i}` })),
        frameRate: 24,
        hideOnComplete: true
    });

    game.anims.create({
        key: 'fire',
        frames: Array.from({ length: 119 }, (_, i) => ({ key: `fire${i}` })),
        frameRate: 24,
        repeat: -1 // Repite infinitamente
    });

    game.anims.create({
        key: 'saving',
        frames: game.anims.generateFrameNumbers(
            'save',
            { start: 0, end: 17 }),
        repeat: 0,
        frameRate: 30
    })

    game.anims.create({
        key: 'explode_arkRoyal',
        frames: Array.from({ length: 12 }, (_, i) => ({ key: `explotion_ark${i + 1}` })),
        frameRate: 24,
        hideOnComplete: true
    });

    game.anims.create({
        key: 'despegue',
        frames: Array.from({ length: 10 }, (_, i) => ({ key: `avion${i}` })),
        frameRate: 10,
        repeat: 0
    });

    game.anims.create({
        key: 'aterrizaje',
        frames: Array.from({ length: 10 }, (_, i) => ({ key: `atAvion${i}` })),
        frameRate: 10,
        repeat: 0
    });

}

export async function generarCodigoPartida() {
    let result = '';
    let ok = false;

    let i = 0;
    while (!ok) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const charactersLength = characters.length;

        while (i < 5) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
            i++;
        }
        //valido que no exista
        await retomarPartida(result.trim().toUpperCase())
            .then((partida) => { })
            .catch(e => {
                const status = parseInt(e.message.split(':')[0].trim());

                if (status == 500) {
                    throw Error(`Error en la conexion a la base de datos, contacte al administrador`)
                }
                else {
                    ok = true
                }
            })
    }

    return result

}

export function mostrarTextoTemporal(game, text, duration) {
    const tempText = game.add.text(800, 240, text, {
        fontFamily: 'Rockwell',
        fontSize: 24,
        color: '#ffffff'
    }).setOrigin(0.5).setDepth(11).setScrollFactor(0).setScale(0.5);
    game.time.delayedCall(duration, () => {
        tempText.destroy();
    });
}