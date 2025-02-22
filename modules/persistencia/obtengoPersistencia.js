export function guardarPartida({ codigoAzul, codigoRojo, bismarck, arkRoyal, avion }) {

    let vBismarck = {
        x: bismarck.x,
        y: bismarck.y,
        vida: bismarck.vida
    }

    let vArkRoyal = {
        x: arkRoyal.x,
        y: arkRoyal.y,
        avionesRestantes: arkRoyal.avionesRestantes,
        avionActual: {
            x: 100,
            y: 100,
            municion: true,
            operador: false,
            observador: false
        }
    }

    fetch('/guardarPartida', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ codigoAzul, codigoRojo, vBismarck, vArkRoyal })

    })
        .then(response => response.json()) // Esperar respuesta en JSON
        .then(data => {
            console.log(data.mensaje); // Mostrar mensaje del servidor
            // (Opcional) Mostrar mensaje en el juego
        })
        .catch(error => {
            console.log('Error:', error);
            // (Opcional) Mostrar mensaje de error en el juego
        });
}

export function retomarPartida(codigo) {
    fetch('/guardarPartida', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },


    })
        .then(response => response.json()) // Esperar respuesta en JSON
        .then(data => {
            console.log(data.mensaje); // Mostrar mensaje del servidor
            // (Opcional) Mostrar mensaje en el juego
        })
        .catch(error => {
            console.error('Error:', error);
            // (Opcional) Mostrar mensaje de error en el juego
        });
}