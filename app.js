const API = 'http://localhost:5144';
let editandoId = null;

function mostrarLoader(v) {
  document.getElementById('loader').style.display = v ? 'block' : 'none';
}

function toast(msg, tipo = 'success') {
  const el = document.getElementById('toast');
  el.textContent = (tipo === 'success' ? '✓ ' : '✗ ') + msg;
  el.className = `show ${tipo}`;
  setTimeout(() => el.className = '', 2500);
}

function formatPrecio(n) {
  return '$' + Number(n).toLocaleString('es-CL');
}

function actualizarStats(productos) {
  document.getElementById('stat-total').textContent = productos.length;
  if (productos.length === 0) {
    document.getElementById('stat-avg').textContent = '—';
    document.getElementById('stat-max').textContent = '—';
    return;
  }
  const avg = productos.reduce((a, p) => a + p.precio, 0) / productos.length;
  const max = Math.max(...productos.map(p => p.precio));
  document.getElementById('stat-avg').textContent = formatPrecio(Math.round(avg));
  document.getElementById('stat-max').textContent = formatPrecio(max);
}

function renderProductos(productos) {
  actualizarStats(productos);
  const list = document.getElementById('productos-list');

  if (productos.length === 0) {
    list.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📦</div>
        <p>No hay productos aún. ¡Agregá el primero!</p>
      </div>`;
    return;
  }

  list.innerHTML = productos.map((p, i) => `
    <div class="producto-card" style="animation-delay:${i * 0.05}s">
      <span class="producto-id">#${p.id}</span>
      <div class="producto-info">
        <div class="producto-nombre">${p.nombre}</div>
        <div class="producto-precio">${formatPrecio(p.precio)}</div>
      </div>
      <div class="producto-actions">
        <button class="btn btn-edit" onclick="abrirModal(${p.id}, '${p.nombre}', ${p.precio})">Editar</button>
        <button class="btn btn-danger" onclick="eliminarProducto(${p.id})">Eliminar</button>
      </div>
    </div>
  `).join('');
}

// Llama a la API y trae todos los productos
async function cargarProductos() {
  mostrarLoader(true);
  try {
    const res = await fetch(`${API}/productos`);
    const data = await res.json();
    renderProductos(data);
  } catch {
    toast('No se pudo conectar a la API', 'error');
    document.getElementById('productos-list').innerHTML = `
      <div class="empty">
        <div class="empty-icon">⚠️</div>
        <p>Error de conexión. ¿Está corriendo dotnet run?</p>
      </div>`;
  }
  mostrarLoader(false);
}

async function crearProducto() {
  const nombre = document.getElementById('input-nombre').value.trim();
  const precio = parseFloat(document.getElementById('input-precio').value);
  if (!nombre || isNaN(precio)) return toast('Completá los dos campos', 'error');

  try {
    const res = await fetch(`${API}/productos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 0, nombre, precio })
    });
    if (!res.ok) throw new Error();
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-precio').value = '';
    toast('Producto creado');
    cargarProductos();
  } catch {
    toast('Error al crear producto', 'error');
  }
}

async function eliminarProducto(id) {
  try {
    await fetch(`${API}/productos/${id}`, { method: 'DELETE' });
    toast('Producto eliminado');
    cargarProductos();
  } catch {
    toast('Error al eliminar', 'error');
  }
}

function abrirModal(id, nombre, precio) {
  editandoId = id;
  document.getElementById('edit-nombre').value = nombre;
  document.getElementById('edit-precio').value = precio;
  document.getElementById('modal').classList.add('open');
}

function cerrarModal() {
  document.getElementById('modal').classList.remove('open');
  editandoId = null;
}

async function guardarEdicion() {
  const nombre = document.getElementById('edit-nombre').value.trim();
  const precio = parseFloat(document.getElementById('edit-precio').value);
  if (!nombre || isNaN(precio)) return toast('Completá los campos', 'error');

  try {
    const res = await fetch(`${API}/productos/${editandoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editandoId, nombre, precio })
    });
    if (!res.ok) throw new Error();
    cerrarModal();
    toast('Producto actualizado');
    cargarProductos();
  } catch {
    toast('Error al actualizar', 'error');
  }
}

document.getElementById('modal').addEventListener('click', function(e) {
  if (e.target === this) cerrarModal();
});

document.getElementById('input-precio').addEventListener('keydown', e => {
  if (e.key === 'Enter') crearProducto();
});

cargarProductos();