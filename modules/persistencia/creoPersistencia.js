import mongoose from 'mongoose';

let Partida;
export function inicioConexionDB(app, { dbIp, dbPort, dbName }) {
    mongoose.connect(`mongodb://${dbIp}:${dbPort}/${dbName}`)
        .then(() => { console.log('Conexion a DB completada') })
        .catch(() => { console.error('Conexion a DB fallo') });

    const bismarckSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        vida: Number
    })
    const avionSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        municion: Boolean,
        observador: Boolean,
        operador: Boolean,
    })

    const arkRoyalSchema = new mongoose.Schema({
        x: Number,
        y: Number,
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
        tiempoPartida: Number,
        bismarck: bismarckSchema,
        arkRoyal: arkRoyalSchema,
        francia: franciaSchema
    })

    Partida = mongoose.model('Partidas', partidaSchema);

    app.get('/retomarPartida', (req, res) => {
        let { codigoAzul, codigoRojo } = req.query;

        if (codigoAzul)
            codigoRojo = 'N/A'
        else
            codigoAzul = 'N/A'

        Partida.findOne({
            $or: [
                { codigoAzul: codigoAzul },
                { codigoRojo: codigoRojo }]
        })
            .then((par) => {
                if (!par) {
                    return res.status(404).json({ mensaje: 'Partida no encontrada' });
                }
                res.json(par)

            })

            .catch(err => {
                console.log(`Error al obtener la partida::: ${err}`)
                return res.status(500).json({ mensaje: `Error al obtener la partida ${err}` });
            })

    })

}

export function persistoPartida(respuestaAzul, respuestaRojo) {
    if (!Partida)
        throw new Error('El modelo no se ha inicializado. Llama a inicioConexionDB primero.');
    else {
        const nuevaPartida = new Partida({
            codigoAzul: respuestaAzul.codigoAzul,
            codigoRojo: respuestaRojo.codigoRojo,
            tiempoPartida: respuestaRojo.tiempoPartida,
            bismarck: {
                x: respuestaRojo.bismarck.x,
                y: respuestaRojo.bismarck.y,
                vida: respuestaRojo.bismarck.vida
            },

            arkRoyal: {
                x: respuestaAzul.arkRoyal.x,
                y: respuestaAzul.arkRoyal.y,
                avionesRestantes: respuestaAzul.arkRoyal.avionesRestantes,
                avionActual: respuestaAzul.arkRoyal.avionActual
            },
            francia: {
                x: respuestaRojo.francia.x,
                y: respuestaRojo.francia.y
            }


        });

        nuevaPartida.save()
            .then((res) => console.log(`Partida guardada`))
            .catch((err) => console.log(`Error al guardar la partida::: ${err}`));
    }
}