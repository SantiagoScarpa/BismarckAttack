export function bajarVolumenMenu() {
    fetch('/bajarVolMenu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
        })
        .catch(error => {
            console.log('Error:', error);
        });
}
export function subirVolumenMenu() {
    fetch('/subirVolMenu', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.mensaje);
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

export async function obtenerVolumenMenu() {

    try {
        const response = await fetch('/getVolMenu');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const datos = await response.json();
        sessionStorage.setItem('volMenu', datos)
        return datos;
    } catch (err) {
        console.error('Error:', error);
        throw error;

    }

}

export async function obtenerBismarckVelocidad() {
    try {
        const response = await fetch('/getBismarckVel');
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        const datos = await response.json();
        sessionStorage.setItem('bismarckVelocity', datos)
        return datos;
    } catch (err) {
        console.error('Error:', error);
        throw error;
    }
}

export function cambiarBismarckVelocidad(subo) {
    let url;
    if (!subo)
        url = 'bajarVelBismarck'
    else
        url = 'subirVelBismarck'

    fetch(`/${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
        })
        .catch(error => {
            console.log('Error:', error);
        });
}

export function cambiarDuracionPartida(subo) {
    let url;
    if (!subo)
        url = 'bajarVelBismarck'
    else
        url = 'subirVelBismarck'

    fetch(`/${url}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
        })
        .catch(error => {
            console.log('Error:', error);
        });
}
