import mongoose from 'mongoose';

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
        operador: Boolean
    })

    const arkRoyalSchema = new mongoose.Schema({
        x: Number,
        y: Number,
        avionesRestantes: Number,
        avionActual: avionSchema
    })

    const partidaSchema = new mongoose.Schema({
        codigoAzul: String,
        codigoRojo: String,
        bismarck: bismarckSchema,
        arkRoyal: arkRoyalSchema
    })

    const partida = mongoose.model('Partidas', partidaSchema);




    app.post('/guardarPartida', (req, res) => {
        const { codigoAzul, codigoRojo, vBismarck: bismarck, vArkRoyal: arkRoyal } = req.body; // Datos del juego

        const nuevaPartida = new partida({
            codigoAzul: codigoAzul, codigoRojo: codigoRojo,
            bismarck: {
                x: bismarck.x,
                y: bismarck.y,
                vida: bismarck.vida
            },
            arkRoyal: {
                x: arkRoyal.x,
                y: arkRoyal.y,
                avionesRestantes: arkRoyal.avionesRestantes,
                avionActual: {
                    x: arkRoyal.avionActual.x,
                    y: arkRoyal.avionActual.y,
                    observador: arkRoyal.avionActual.observador,
                    operador: arkRoyal.avionActual.operador
                }
            }
        });
        nuevaPartida.save()
            .then(() => res.json({ mensaje: 'Partida guardada' }))
            .catch(err => res.status(500).json({ error: 'Error al guardar partida' }));
    });

    app.get('/retomarPartida', (req, res) => {
        let { codigoAzul, codigoRojo } = req.query;

        if (codigoAzul)
            codigoRojo = 'N/A'
        else
            codigoAzul = 'N/A'

        partida.findOne({
            $or: [
                { codigoAzul: codigoAzul },
                { codigoRojo: codigoRojo }]
        })
            .then((par) => {
                if (!partida) {
                    return res.status(404).json({ mensaje: 'Partida no encontrada' });
                }
                res.json(par)

            })
            .catch(err => res.status(500).json({ error: 'Error al retomar partida ' }))

    })

}
