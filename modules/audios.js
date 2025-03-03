export const loadAudios = ({ load }) => {
    load.audio('menuSelection', './assets/sounds/Retro Event StereoUP 02.wav')
    load.audio('return', './assets/sounds/Retro Event UI 13.wav')
    load.audio('explotion', './assets/sounds/torpedo_explotion.mp3')
    load.audio('bismarckShoot', './assets/sounds/bismarckShoot.wav')
    load.audio('avion_shoot', './assets/sounds/torpedo2Cut.mp3')
}

export const playAudios = (id, { sound }, volume) => {
    return sound.add(id, { volume: volume }).play()
}

export function stopAudios(audioKey, scene) {
    if (scene.sound.get(audioKey)) {
        scene.sound.stopByKey(audioKey);
    }
}
