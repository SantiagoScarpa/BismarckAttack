import fs from 'fs';
import { set } from 'mongoose';

export const funcionesSettings = {
    bajarVolMenu() {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            if (jsonData.volumeMenu >= 0.1) {
                let v = jsonData.volumeMenu - 0.1
                jsonData.volumeMenu = parseFloat(v.toFixed(1))
                const jsonString = JSON.stringify(jsonData, null, 2);
                fs.writeFileSync('settings.json', jsonString)
            } else {
                return;
            }
        } catch (err) {
            console.log('Error en bajarVolMenu')
            throw err;
        }
    },
    subirVolMenu() {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            if (jsonData.volumeMenu <= 0.8) {
                let v = jsonData.volumeMenu + 0.1
                jsonData.volumeMenu = parseFloat(v.toFixed(1))
                const jsonString = JSON.stringify(jsonData, null, 2);
                fs.writeFileSync('settings.json', jsonString)
            } else {
                return;
            }
        } catch (err) {
            console.log('Error en subirVolMenu')
            throw err;
        }
    },

    getVolMenu() {
        let vol = 0;
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            vol = jsonData.volumeMenu
            return vol;
        } catch (err) {
            console.log('Error en getVolMenu')
            throw err;
        }
    },

    getBismarckVel() {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            let vel = jsonData.bismarckVelocity
            return vel;
        } catch (err) {
            console.log('Error en getBismarckVel')
            throw err;
        }
    },

    cambioBismarckVel(subo) {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            if (!subo && jsonData.bismarckVelocity > 0)
                jsonData.bismarckVelocity--;
            else if (subo && jsonData.bismarckVelocity < 9)
                jsonData.bismarckVelocity++;
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync('settings.json', jsonString)

        }
        catch (err) {
            console.log('Error en bajarVolMenu')
            throw err;
        }
    },

    cambioDuracionPartida(subo) {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            if (!subo && jsonData.duracionPartida > 0)
                jsonData.duracionPartida--;
            else if (subo && jsonData.duracionPartida < 9)
                jsonData.duracionPartida++;
            const jsonString = JSON.stringify(jsonData, null, 2);
            fs.writeFileSync('settings.json', jsonString)
        }
        catch (err) {
            console.log('Error en bajarVolMenu')
            throw err;
        }
    },

    getDuracionPArtida() {
        try {
            const settings = fs.readFileSync('settings.json', 'utf8')
            const jsonData = JSON.parse(settings);
            let vel = jsonData.duracionPartida
            return vel;
        } catch (err) {
            console.log('Error en getBismarckVel')
            throw err;
        }
    },
}

