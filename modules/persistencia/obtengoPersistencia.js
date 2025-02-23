// export function guardarPartida({ codigoAzul, codigoRojo, bismarck, arkRoyal, avion, francia }) {

//     let vFrancia = {
//         x: francia.x,
//         y: francia.y
//     }
//     let vBismarck = {
//         x: bismarck.x,
//         y: bismarck.y,
//         vida: bismarck.vida
//     }

//     let vArkRoyal = {
//         x: arkRoyal.x,
//         y: arkRoyal.y,
//         avionesRestantes: arkRoyal.avionesRestantes,
//         avionActual: {
//             x: 100,
//             y: 100,
//             municion: true,
//             operador: false,
//             observador: false
//         }
//     }

//     fetch('/guardarPartida', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ codigoAzul, codigoRojo, vBismarck, vArkRoyal, avion, vFrancia })
//     })
//         .then(response => response.json()) // Esperar respuesta en JSON
//         .then(data => {
//             console.log(data.mensaje); // Mostrar mensaje del servidor
//             // (Opcional) Mostrar mensaje en el juego
//         })
//         .catch(error => {
//             console.log('Error:', error);
//             // (Opcional) Mostrar mensaje de error en el juego
//         });
// }

// export function guardarPartida(game) {
//     console.log('guardarPartida')
//     let bismarckVida = game.playerShip.vida ? game.playerShip.vida : 0
//     let avionesRestantes = game.playerShip.avionesRestantes ? game.playerShip.avionesRestantes : 0

//     let bismarckX = 0
//     let bismarckY = 0
//     let bismarckAngle = 0
//     let arkRoyalX = 0
//     let arkRoyalY = 0
//     let arkRoyalAngle = 0

//     if (game.playerShip.label === 'bismarck') {
//         bismarckX = game.playerShip.x
//         bismarckY = game.playerShip.y
//         bismarckAngle = game.playerShip.angle

//     } else {
//         arkRoyalX = game.playerShip.x
//         arkRoyalY = game.playerShip.y
//         arkRoyalAngle = game.playerShip.angle
//     }

//     //ESTO TIENE QUE CAMBIAR CUANDO CARGUEMOS UN AVION
//     let avionActualX = 1;
//     let avionActualY = 1;
//     let avionActualMunicion = false;
//     let avionActualOperador = false;
//     let avionActualObservador = false;

//     game.socket.emit('guardo', {
//         nroPeticion: 1,
//         playerId: game.socket.id,
//         codigoAzul: game.codigoAzul,
//         codigoRojo: game.codigoRojo,
//         franciaX: game.francia.x,
//         franciaY: game.francia.y,
//         label: game.playerShip.label,
//         bismarckX: bismarckX,
//         bismarckY: bismarckY,
//         bismarckAngle: bismarckAngle,
//         bismarckVida: bismarckVida,
//         arkRoyalX: arkRoyalX,
//         arkRoyalY: arkRoyalY,
//         arkRoyalAngle: arkRoyalAngle,
//         arkRoyalAvionesRestantes: avionesRestantes,
//         avionX: avionActualX,
//         avionY: avionActualY,
//         avionMunicion: avionActualMunicion,
//         avionOperador: avionActualOperador,
//         avionObservador: avionActualObservador
//     });
// }

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