/*// export function guardarPartida({ codigoAzul, codigoRojo, bismarck, arkRoyal, avion, francia }) {

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
*/

export function armoRespuestaRojo(game) {

    const tiempoDePartida = Date.now() - game.inicioPartida;
    const tiempoDisponible = game.duracionPartida - tiempoDePartida;

    let respuesta = {
        codigoRojo: game.codigoPartida,
        tiempoPartida: tiempoDisponible,
        inicioPartida: game.inicioPartida,
        bismarck: {
            x: game.playerShip.x,
            y: game.playerShip.y,
            angle: game.playerShip.angle,
            vida: game.playerShip.vida
        },
        francia: {
            x: game.francia.x,
            y: game.francia.y
        }
    }
    return respuesta
}

export function armoRespuestaAzul(game) {
    let respuesta;
    console.log(game.tiempo)
    if (game.avionDesplegado) {
        respuesta = {
            codigoAzul: game.codigoPartida,
            arkRoyal: {
                x: game.portaAviones.x,
                y: game.portaAviones.y,
                angle: 0,
                avionesRestantes: game.portaAviones.avionesRestantes,
                avionActual: {
                    x: game.playerShip.x,
                    y: game.playerShip.y,
                    //ESTO SE TIENE QUE CAMBIAR UNA VEZ TENGAMOS LA FUNCIONALIDAD DE ELEGIR Y MUNICION
                    municion: true,
                    opcion: game.avionOpcion,
                    tiempoVida: 9999,
                }
            }
        }

    } else {
        respuesta = {
            codigoAzul: game.codigoPartida,
            arkRoyal: {
                x: game.playerShip.x,
                y: game.playerShip.y,
                angle: game.playerShip.angle,
                avionesRestantes: game.playerShip.avionesRestantes,
                avionActual: null
            }
        }
    }


    return respuesta
}

export async function retomarPartida(codigo) {
    try {
        const response = await fetch(`/retomarPartida/${codigo}`);
        const datos = await response.json();
        if (!response.ok) {
            throw new Error(`${response.status} : ${datos.mensaje}`);
        }

        return datos;
    } catch (err) {
        throw err;
    }
}

