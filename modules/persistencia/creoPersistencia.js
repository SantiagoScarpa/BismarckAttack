import mongoose from 'mongoose';

let Partida;
export function inicioConexionDB(app, { dbIp, dbPort, dbName }) {
    mongoose.connect(`mongodb://${dbIp}:${dbPort}/${dbName}`)
        .then(() => { console.log('Conexion a DB completada') })
        .catch(() => { console.error('Conexion a DB fallo') });

    const bismarckSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        angle: Number,
        vida: Number
    })
    const avionSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        municion: Boolean,
        tiempoVida: Number,
        opcion: Number
    })

    const arkRoyalSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        angle: Number,
        avionesRestantes: Number,
        avionActual: avionSchema
    })

    const franciaSchema = new mongoose.Schema({
        x: Number,
        y: Number
    })

    const partidaSchema = new mongoose.Schema({
        codigoAzul: String,
        codigoRojo: String,
        inicioPartida: Number,
        tiempoPartida: Number,
        bismarck: bismarckSchema,
        arkRoyal: arkRoyalSchema,
        francia: franciaSchema
    })

    Partida = mongoose.model('Partidas', partidaSchema);

    app.get('/retomarPartida/:codigo', (req, res) => {
        let { codigo } = req.params;

        Partida.findOne({
            $or: [
                { codigoAzul: codigo },
                { codigoRojo: codigo }]
        })
            .then((par) => {
                if (!par) {
                    return res.status(404).json({ mensaje: 'Partida no encontrada' });
                }
                res.json(par)
            })

            .catch(err => {
                console.log(`Error al obtener la partida::: ${err}`)
                return res.status(500).json({ status: 500, mensaje: `Error al obtener la partida ${err}` });
            })
    })

}

export async function persistoPartida(respuestaAzul, respuestaRojo, updateDB) {
    if (!Partida)
        throw new Error('El modelo no se ha inicializado. Llama a inicioConexionDB primero.');
    else {

        const nuevaPartida = new Partida({
            codigoAzul: respuestaAzul.codigoAzul,
            codigoRojo: respuestaRojo.codigoRojo,
            inicioPartida: respuestaRojo.inicioPartida,
            tiempoPartida: respuestaRojo.tiempoPartida,
            bismarck: {
                x: respuestaRojo.bismarck.x,
                y: respuestaRojo.bismarck.y,
                angle: respuestaRojo.bismarck.angle,
                vida: respuestaRojo.bismarck.vida
            },

            arkRoyal: {
                x: respuestaAzul.arkRoyal.x,
                y: respuestaAzul.arkRoyal.y,
                angle: respuestaAzul.arkRoyal.angle,
                avionesRestantes: respuestaAzul.arkRoyal.avionesRestantes,
                avionActual: respuestaAzul.arkRoyal.avionActual
            },
            francia: {
                x: respuestaRojo.francia.x,
                y: respuestaRojo.francia.y
            }

        });

        if (updateDB) {
            //borro el registro anterior, es mas facil que updetear cada campo cambiado del nuevo
            const resultado = await Partida.deleteMany({
                $or: [
                    { codigoAzul: respuestaAzul.codigoAzul },
                    { codigoRojo: respuestaRojo.codigoRojo }]
            })
        }
        nuevaPartida.save()
            .then((res) => console.log(`Partida guardada`))
            .catch((err) => console.log(`Error al guardar la partida::: ${err}`));
    }
}


