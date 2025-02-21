import mongoose from 'mongoose';

export function inicioConexionDB(app) {
    mongoose.connect('mongodb://127.0.0.1:27017/bismarckAttack')
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
                    x: arkRoyal.avion.x,
                    y: arkRoyal.avion.y,
                    observador: arkRoyal.avion.observador,
                    operador: arkRoyal.avion.operador
                }
            }
        });
        console.log(nuevaPartida)
        nuevaPartida.save()
            .then(() => res.json({ mensaje: 'Datos guardados' })) // Enviar respuesta en JSON
            .catch(err => res.status(500).json({ error: 'Error al guardar datos' }));
    });

}
