const socket = io();
let selectedUser = "Ninguno";
let ofertaRealizada = false;

function elegirUsuario() {
    selectedUser = prompt("Ingrese el número de usuario (1, 2 o 3):");
    if (selectedUser && (selectedUser === "1" || selectedUser === "2" || selectedUser === "3")) {
        document.getElementById("selectedUser").innerText = selectedUser;
        document.getElementById("userContainer").style.display = "block";
        document.getElementById("infoContainer").style.display = "none";
        ofertaRealizada = false;  // Reiniciar la bandera al elegir usuario
    } else {
        alert("Usuario no válido");
    }
}

function verInformacion() {
    document.getElementById("infoContainer").style.display = "block";
    document.getElementById("userContainer").style.display = "none";
    ofertaRealizada = false;  // Reiniciar la bandera al ver información
}

function realizarOferta() {
    if (!ofertaRealizada) {
        const ofertaInput = document.getElementById("ofertaInput");
        const oferta = parseInt(ofertaInput.value);

        if (!isNaN(oferta)) {
            socket.emit('oferta', { usuario: selectedUser, oferta: oferta });
            ofertaRealizada = true;  // Marcar que la oferta ya fue realizada
            ofertaInput.value = "";
        } else {
            alert("Ingrese una oferta válida");
        }
    } else {
        alert("Ya has realizado una oferta en esta subasta.");
    }
}

function regresar() {
    document.getElementById("userContainer").style.display = "none";
    document.getElementById("infoContainer").style.display = "block";
}

function iniciarSubasta() {
    socket.emit('iniciarSubasta');
}

socket.on('tiempoRestante', (tiempoRestante) => {
    document.getElementById("tiempoRestante").innerText = tiempoRestante;
});

socket.on('valorActual', (valorActual) => {
    document.getElementById("valorActual").innerText = valorActual;
});

socket.on('subastaFinalizada', ({ ganador, precio, mensaje }) => {
    if (ganador) {
        alert(`Subasta finalizada. Ganador: Usuario ${ganador}, Precio: $${precio}`);
    } else if (mensaje) {
        alert(mensaje);
    }
});


socket.on('subastaIniciada', () => {
    alert('Subasta iniciada manualmente.');
});
