// CONFIGURACIÓN
const urlBase = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0eXDrdN3C1ipuGXwHEhCk2Rre9QxEBErxNbpCFf5Q18o_0loL-IUL86msSSyX_2tc9dl2ffJA2p8/pub?output=csv"; // <--- PEGA TU ENLACE AQUÍ
const numeroWhatsapp = "5350000000"; // <--- TU NÚMERO AQUÍ

let productos = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Cargar productos al iniciar
async function cargarProductos() {
    try {
        const res = await fetch(`${urlBase}&v=${Date.now()}`);
        const data = await res.text();
        const filas = data.split('\n').slice(1);

        productos = filas.map(fila => {
            const col = fila.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if (col.length >= 2 && col[0].trim()) {
                return {
                    nombre: col[0].replace(/"/g, "").trim(),
                    precio: parseFloat(col[1].replace(/"/g, "").trim()),
                    imagen: col[2] ? col[2].replace(/"/g, "").trim() : "https://via.placeholder.com/150",
                    categoria: col[3] ? col[3].replace(/"/g, "").trim() : "General"
                };
            }
        }).filter(Boolean);

        mostrarProductos(productos);
        actualizarCarritoUI();
    } catch (error) {
        console.error(error);
        document.getElementById('contenedor-productos').innerHTML = "<p>Error de conexión.</p>";
    }
}

// Renderizar Productos en el HTML
function mostrarProductos(lista) {
    const contenedor = document.getElementById('contenedor-productos');
    contenedor.innerHTML = lista.map(p => `
        <div class="card">
            <img src="${p.imagen}" alt="${p.nombre}" loading="lazy">
            <div class="info">
                <h3>${p.nombre}</h3>
                <p class="precio">${p.precio} CUP</p>
                <button class="btn-add" onclick="agregarAlCarrito('${p.nombre}')">
                    <i class="fas fa-plus"></i> Agregar
                </button>
            </div>
        </div>
    `).join('');
}

// Función para filtrar
function filtrarProductos(cat, event) {
    document.querySelectorAll('.btn-filtro').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    
    const filtrados = cat === 'todos' 
        ? productos 
        : productos.filter(p => p.categoria.toLowerCase() === cat.toLowerCase());
    mostrarProductos(filtrados);
}

// --- LÓGICA DEL CARRITO ---

function agregarAlCarrito(nombre) {
    const producto = productos.find(p => p.nombre === nombre);
    const itemEnCarrito = carrito.find(item => item.nombre === nombre);

    if (itemEnCarrito) {
        itemEnCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarritoUI();
    mostrarToast(`Agregado: ${nombre}`);
}

function cambiarCantidad(nombre, cambio) {
    const item = carrito.find(i => i.nombre === nombre);
    item.cantidad += cambio;

    if (item.cantidad <= 0) {
        carrito = carrito.filter(i => i.nombre !== nombre);
    }

    actualizarCarritoUI();
}

function actualizarCarritoUI() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar contador del icono
    const totalItems = carrito.reduce((sum, i) => sum + i.cantidad, 0);
    document.getElementById('cart-count').innerText = totalItems;

    // Renderizar lista en el modal
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPrecio = carrito.reduce((sum, i) => sum + (i.precio * i.cantidad), 0);

    if (carrito.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-msg">Tu carrito está vacío 😔</p>';
    } else {
        cartItemsContainer.innerHTML = carrito.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>${item.precio} CUP x ${item.cantidad}</small>
                </div>
                <div class="cart-controls">
                    <button onclick="cambiarCantidad('${item.nombre}', -1)">-</button>
                    <span>${item.cantidad}</span>
                    <button onclick="cambiarCantidad('${item.nombre}', 1)">+</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('cart-total').innerText = `${totalPrecio} CUP`;
}

// Abrir/Cerrar Modal
function toggleCart() {
    document.getElementById('cart-modal').classList.toggle('open');
    document.getElementById('overlay').classList.toggle('open');
}

// Generar mensaje para WhatsApp
function enviarPedido() {
    if (carrito.length === 0) return;

    let mensaje = "Hola, me gustaría hacer el siguiente pedido:%0A%0A";
    let total = 0;

    carrito.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        mensaje += `▪️ ${item.cantidad}x ${item.nombre} - $${subtotal}%0A`;
        total += subtotal;
    });

    mensaje += `%0A*Total a Pagar: ${total} CUP*`;
    mensaje += "%0A%0A📍 Dirección de entrega: ";

    window.open(`https://wa.me/${numeroWhatsapp}?text=${mensaje}`, '_blank');
}

// Mostrar notificación flotante
function mostrarToast(texto) {
    const toast = document.getElementById("toast");
    toast.innerText = texto;
    toast.className = "show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

// Iniciar
cargarProductos();