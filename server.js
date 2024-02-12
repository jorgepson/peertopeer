const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let precioSubasta = 100000;

let ofertas = {}; 

let tiempoRestante = 30;  
let tiempoInterval;  
let subastaActiva = false;  

function iniciarSubasta() {
    tiempoInterval = setInterval(() => {
        tiempoRestante--;

        if (tiempoRestante <= 0) {
            finalizarSubasta();
        } else {
            io.emit('tiempoRestante', tiempoRestante);
        }
    }, 1000);
}

function finalizarSubasta() {
    clearInterval(tiempoInterval);
    const ganador = obtenerGanador();

    if (ganador && ganador.usuario) {
        io.emit('subastaFinalizada', { ganador: ganador.usuario, precio: ganador.precio });
    } else {
        io.emit('subastaFinalizada', { mensaje: "Nadie ofertó. La subasta ha finalizado." });
    }

    // Reiniciar valores
    tiempoRestante = 30;
    subastaActiva = false;
    ofertas = {};
    precioSubasta = 100000;
    io.emit('valorActual', precioSubasta);
}


function obtenerGanador() {
    let ganador = null;
    let precioGanador = 0;

    for (const usuario in ofertas) {
        const ofertaUsuario = ofertas[usuario];
        if (ofertaUsuario > precioGanador) {
            precioGanador = ofertaUsuario;
            ganador = usuario;
        }
    }

    return { usuario: ganador, precio: precioGanador };
}


io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);

    socket.on('oferta', (data) => {
        const usuario = data.usuario;

        if (!ofertas[usuario]) {
            ofertas[usuario] = data.oferta;

            if (data.oferta > precioSubasta) {
                precioSubasta = data.oferta;
                io.emit('valorActual', precioSubasta);
                tiempoRestante = 30;  
            }
        }
    });

    socket.on('iniciarSubasta', () => {
        if (!subastaActiva) {
            subastaActiva = true;
            iniciarSubasta();
        }
    });
});

app.use(express.static('public'));

app.use('/socket.io', express.static(__dirname + '/node_modules/socket.io/client-dist'));

const PORT = process.env.PORT || 3003;
server.listen(PORT, () => {
    console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
