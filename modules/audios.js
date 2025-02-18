export const loadAudios = ({ load }) => {
    load.audio('menuSelection', './assets/sounds/Retro Event StereoUP 02.wav')
    load.audio('return', './assets/sounds/Retro Event UI 13.wav')
}

export const playAudios = (id, { sound }, volume) => {

    return sound.add(id, { volume: volume }).play()
}