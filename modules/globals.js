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
}