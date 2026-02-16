// CONFIGURACIÓN: Reemplaza estos dos valores
const urlBase = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0eXDrdN3C1ipuGXwHEhCk2Rre9QxEBErxNbpCFf5Q18o_0loL-IUL86msSSyX_2tc9dl2ffJA2p8/pub?output=csv";
const numeroWhatsapp = "5355391675"; // Pon el número del dueño AQUÍ (sin el +)

async function leerProductos() {
    try {
        // Truco Anti-Caché: Añadimos un número aleatorio al final del URL
        const urlPublicada = `${urlBase}&v=${new Date().getTime()}`;
        
        const respuesta = await fetch(urlPublicada);
        const datos = await respuesta.text();
        
        const filas = datos.split('\n').slice(1);
        const contenedor = document.getElementById('contenedor-productos');
        contenedor.innerHTML = "";

        filas.forEach(fila => {
            // Esta línea limpia los datos por si el CSV tiene errores de formato
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

            if (columnas.length >= 2 && columnas[0].trim() !== "") {
                const nombre = columnas[0].replace(/"/g, "").trim();
                const precio = columnas[1].replace(/"/g, "").trim();
                const imagenUrl = columnas[2] ? columnas[2].replace(/"/g, "").trim() : "https://via.placeholder.com/300x200?text=Sin+Foto";

                // Crear mensaje automático para WhatsApp
                const mensajeWA = encodeURIComponent(`Hola, me interesa la ${nombre} que vi en la web. ¿Está disponible?`);

                contenedor.innerHTML += `
                    <div class="card">
                        <img src="${imagenUrl}" alt="${nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Error+al+cargar'">
                        <div class="info-container">
                            <h3>${nombre}</h3>
                            <p class="precio">${precio} CUP</p>
                            <a href="https://wa.me/${numeroWhatsapp}?text=${mensajeWA}" target="_blank" class="btn-whatsapp">
                                <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
                            </a>
                        </div>
                    </div>
                `;
            }
        });

    } catch (error) {
        console.error("Error:", error);
        document.getElementById('contenedor-productos').innerHTML = "<p>Ocurrió un error al cargar los datos. Revisa tu conexión.</p>";
    }
}

// Iniciar carga
leerProductos();