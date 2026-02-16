// CONFIGURACIÓN
const urlBase = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0eXDrdN3C1ipuGXwHEhCk2Rre9QxEBErxNbpCFf5Q18o_0loL-IUL86msSSyX_2tc9dl2ffJA2p8/pub?output=csv"; // REEMPLAZA ESTO
const numeroWhatsapp = "5355391675"; // Tu número de WhatsApp sin el +

let todosLosProductos = [];

async function cargarDatos() {
    try {
        // Anti-caché para actualizaciones rápidas
        const urlFinal = `${urlBase}&v=${new Date().getTime()}`;
        const respuesta = await fetch(urlFinal);
        const texto = await respuesta.text();
        
        // Convertir CSV a lista de objetos
        const filas = texto.split('\n').slice(1);
        
        todosLosProductos = filas.map(fila => {
            // Manejo robusto de comas dentro de celdas
            const columnas = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            
            if (columnas.length >= 2 && columnas[0].trim() !== "") {
                return {
                    nombre: columnas[0].replace(/"/g, "").trim(),
                    precio: columnas[1].replace(/"/g, "").trim(),
                    imagen: columnas[2] ? columnas[2].replace(/"/g, "").trim() : "https://via.placeholder.com/300x200?text=Sin+Imagen",
                    categoria: columnas[3] ? columnas[3].replace(/"/g, "").trim() : "General"
                };
            }
            return null;
        }).filter(p => p !== null);

        mostrarProductos(todosLosProductos);
        
    } catch (error) {
        console.error("Error cargando datos:", error);
        document.getElementById('contenedor-productos').innerHTML = "<p>Error al conectar con la base de datos.</p>";
    }
}

function mostrarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = "<p class='loader'>No hay productos en esta categoría.</p>";
        return;
    }

    lista.forEach(p => {
        const mensajeWA = encodeURIComponent(`Hola! Me interesa el producto: ${p.nombre}. ¿Tienen disponibilidad?`);
        
        contenedor.innerHTML += `
            <div class="card">
                <img src="${p.imagen}" alt="${p.nombre}" onerror="this.src='https://via.placeholder.com/300x200?text=Error+Imagen'">
                <div class="info">
                    <span class="categoria-tag">${p.categoria}</span>
                    <h3>${p.nombre}</h3>
                    <p class="precio">${p.precio} CUP</p>
                    <a href="https://wa.me/${numeroWhatsapp}?text=${mensajeWA}" target="_blank" class="btn-wa">
                        <i class="fab fa-whatsapp"></i> Pedir por WhatsApp
                    </a>
                </div>
            </div>
        `;
    });
}

function filtrarProductos(categoria, evento) {
    // 1. Quitar clase activa de todos los botones
    document.querySelectorAll('.btn-filtro').forEach(btn => btn.classList.remove('active'));
    
    // 2. Poner clase activa al botón presionado
    evento.target.classList.add('active');

    // 3. Filtrar la lista
    if (categoria === 'todos') {
        mostrarProductos(todosLosProductos);
    } else {
        const filtrados = todosLosProductos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
        mostrarProductos(filtrados);
    }
}

// Iniciar aplicación
cargarDatos();