import { funcionesSettings } from "./modificoSettings.js"

export function expongoWsSettings(app) {
    wsBajarVolMenu(app);
    wsSubirVolMenu(app);
    wsGetVolMenu(app);
    wsGetBismarckVel(app);
    wsBajarVelBismarck(app);
    wsSubirVelBismarck(app);
    wsSubirDuracionPartida(app);
    wsBajarDuracionPartida(app);
    wsGetDuracionPartida(app);
}

function wsBajarVolMenu(app) {
    app.post('/bajarVolMenu', (req, res) => {
        funcionesSettings.bajarVolMenu()
        res.json({ mensaje: 'volumen bajado' })
    })
}
function wsSubirVolMenu(app) {
    app.post('/subirVolMenu', (req, res) => {
        funcionesSettings.subirVolMenu()
        res.json({ mensaje: 'volumen subido' })
    })
}
function wsGetVolMenu(app) {
    app.get('/getVolMenu', (req, res) => {
        res.json(funcionesSettings.getVolMenu())
    })
}


function wsGetBismarckVel(app) {
    app.get('/getBismarckVel', (req, res) => {
        res.json(funcionesSettings.getBismarckVel())
    })
}

function wsBajarVelBismarck(app) {
    app.post('/bajarVelBismarck', (req, res) => {
        funcionesSettings.cambioBismarckVel(false)
        res.json({ mensaje: 'velocidad bajada' })
    })
}

function wsSubirVelBismarck(app) {
    app.post('/subirVelBismarck', (req, res) => {
        funcionesSettings.cambioBismarckVel(true)
        res.json({ mensaje: 'velocidad subida' })
    })
}


function wsSubirDuracionPartida(app) {
    app.post('/subirDuracionPartida', (req, res) => {
        funcionesSettings.cambioDuracionPartida(true)
        res.json({ mensaje: 'velocidad subida' })
    })
}

function wsBajarDuracionPartida(app) {
    app.post('/bajarDuracionPartida', (req, res) => {
        funcionesSettings.cambioDuracionPartida(false)
        res.json({ mensaje: 'velocidad subida' })
    })
}

function wsGetDuracionPartida(app) {
    app.get('/getDuracionPartida', (req, res) => {
        res.json(funcionesSettings.getDuracionPArtida())
    })
}