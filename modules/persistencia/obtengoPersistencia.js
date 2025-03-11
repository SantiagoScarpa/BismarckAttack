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
    if (game.avionDesplegado) {
        respuesta = {
            codigoAzul: game.codigoPartida,
            arkRoyal: {
                x: game.portaAviones.x,
                y: game.portaAviones.y,
                angle: 0,
                vida: game.portaAviones.vida,
                avionesRestantes: game.portaAviones.avionesRestantes,
                avionActual: {
                    x: game.playerShip.x,
                    y: game.playerShip.y,
                    municion: game.playerShip.municion,
                    opcion: game.avionOpcion,
                    tiempoAvion: game.tiempoAvion,
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
                vida: game.playerShip.vida,
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

