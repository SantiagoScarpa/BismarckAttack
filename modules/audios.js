export const loadAudios = ({ load }) => {
    load.audio('menuSelection', './assets/sounds/Retro Event StereoUP 02.wav')
    load.audio('return', './assets/sounds/Retro Event UI 13.wav')
    load.audio('explotion', './assets/sounds/torpedo_explotion.mp3')
    load.audio('bismarckShoot', './assets/sounds/bismarckShoot.wav')
    load.audio('avion_shoot', './assets/sounds/torpedo2Cut.mp3')
    load.audio('music', './assets/sounds/Sink The Bismarck - Johnny Horton.mp3')
    load.audio('musicfondo', './assets/sounds/MÚSICA ÉPICA SIN COPYRIGHT 1 - GUERRA MUNDIAL (I).mp3')
    load.audio('avionDespegue', './assets/sounds/avionDespegue.wav')
    load.audio('avionAire', './assets/sounds/avionAire.wav')
    
}

export const playAudios = (id, { sound }, volume) => {
    //return sound.add(id, { volume: volume }).play()
    const soundInstance = sound.add(id, { volume: volume }); // Crea la instancia
    soundInstance.play(); // Reproduce el sonido
    return soundInstance;
}

export function stopAudios(audioKey, scene) {
    if (scene.sound.get(audioKey)) {
        scene.sound.stopByKey(audioKey);
    }
}
