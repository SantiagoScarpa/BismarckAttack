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
        frames: Array.from({ length: 12}, (_, i) => ({ key: `explotion_ark${i + 1}` })),
        frameRate: 24,
        hideOnComplete: true 
    });

    game.anims.create({
        key: 'despegue',
        frames: Array.from({ length: 10 }, (_, i) => ({ key: `avion${i}` })),
        frameRate: 10,
        repeat: 0
    });

}

export function generarCodigoPartida() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;
    let i = 0;
    while (i < 5) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        i++;
    }
    return result;
}

