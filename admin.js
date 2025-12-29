// admin.js - Sistema de Administración de Marcaciones FIAS

// Variables globales
let funcionarios = [];
let proyectos = [];
let funcionariosFiltrados = [];
let paginaActual = 1;
const itemsPorPagina = 20;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatosAdministracion();
    configurarEventListenersAdmin();
});

// Cargar datos para administración
async function cargarDatosAdministracion() {
    try {
        // Cargar funcionarios
        const funcResponse = await fetch('funcionarios.json');
        const funcData = await funcResponse.json();
        funcionarios = Array.isArray(funcData) ? funcData : funcData.funcionarios || [];
        
        // Cargar proyectos
        const projResponse = await fetch('proyectos.json');
        const projData = await projResponse.json();
        proyectos = Array.isArray(projData) ? projData : projData.proyectos || [];
        
        // Cargar configuración
        const configResponse = await fetch('config.json');
        const configData = await configResponse.json();
        
        // Inicializar
        funcionariosFiltrados = [...funcionarios];
        actualizarTablaFuncionarios();
        actualizarFiltrosAdmin();
        cargarProyectosAdmin();
        
        console.log('Datos de administración cargados:', {
            funcionarios: funcionarios.length,
            proyectos: proyectos.length
        });
        
    } catch (error) {
        console.error('Error cargando datos de administración:', error);
        mostrarNotificacionAdmin('Error cargando datos del sistema', 'error');
    }
}

// Configurar event listeners
function configurarEventListenersAdmin() {
    // Buscador de funcionarios
    const searchFunc = document.getElementById('searchFunc');
    if (searchFunc) {
        searchFunc.addEventListener('input', filtrarFuncionarios);
    }
    
    // Filtro por proyecto
    const filterProyectoFunc = document.getElementById('filterProyectoFunc');
    if (filterProyectoFunc) {
        filterProyectoFunc.addEventListener('change', filtrarFuncionarios);
    }
    
    // Filtro por estado
    const filterEstadoFunc = document.getElementById('filterEstadoFunc');
    if (filterEstadoFunc) {
        filterEstadoFunc.addEventListener('change', filtrarFuncionarios);
    }
    
    // Botón exportar
    const btnExport = document.querySelector('.btn-export-func');
    if (btnExport) {
        btnExport.addEventListener('click', exportarFuncionarios);
    }
}

// Actualizar tabla de funcionarios
function actualizarTablaFuncionarios() {
    const tbody = document.getElementById('funcionariosBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // Calcular índices para paginación
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    const itemsPagina = funcionariosFiltrados.slice(inicio, fin);
    
    if (itemsPagina.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>No se encontraron funcionarios</p>
                </td>
            </tr>
        `;
        return;
    }
    
    itemsPagina.forEach((funcionario, index) => {
        const row = document.createElement('tr');
        row.className = funcionario.activo ? 'activo' : 'inactivo';
        row.innerHTML = `
            <td>${funcionario.id || ''}</td>
            <td>
                <span class="badge-id ${funcionario.proyecto?.toLowerCase()}">
                    ${funcionario.codigo || 'SIN-COD'}
                </span>
            </td>
            <td>
                <div class="func-info">
                    <strong>${funcionario.nombreCompleto || 'Nombre no disponible'}</strong>
                    <small>${funcionario.cargo || 'Sin cargo'}</small>
                </div>
            </td>
            <td>
                <span class="badge-proyecto" style="background: ${getColorProyecto(funcionario.proyecto)}">
                    ${funcionario.proyecto || 'SIN-PROY'}
                </span>
            </td>
            <td>${funcionario.cargo || ''}</td>
            <td>
                ${funcionario.email ? `
                    <a href="mailto:${funcionario.email}" class="email-link">
                        <i class="fas fa-envelope"></i> ${funcionario.email}
                    </a>
                ` : '<span class="no-email">No tiene</span>'}
            </td>
            <td>
                <span class="estado-badge ${funcionario.activo ? 'activo' : 'inactivo'}">
                    <i class="fas fa-${funcionario.activo ? 'check-circle' : 'times-circle'}"></i>
                    ${funcionario.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit" onclick="editarFuncionario(${funcionario.id})" 
                            title="Editar funcionario">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action ${funcionario.activo ? 'deactivate' : 'activate'}" 
                            onclick="${funcionario.activo ? 'desactivarFuncionario' : 'activarFuncionario'}(${funcionario.id})"
                            title="${funcionario.activo ? 'Desactivar' : 'Activar'}">
                        <i class="fas fa-${funcionario.activo ? 'user-slash' : 'user-check'}"></i>
                    </button>
                    <button class="btn-action delete" onclick="eliminarFuncionario(${funcionario.id})" 
                            title="Eliminar funcionario">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-action view" onclick="verDetallesFuncionario(${funcionario.id})" 
                            title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Actualizar estadísticas de paginación
    actualizarEstadisticasPaginacion();
}

// Filtrar funcionarios
function filtrarFuncionarios() {
    const searchTerm = document.getElementById('searchFunc').value.toLowerCase();
    const proyectoFilter = document.getElementById('filterProyectoFunc').value;
    const estadoFilter = document.getElementById('filterEstadoFunc').value;
    
    funcionariosFiltrados = funcionarios.filter(func => {
        // Filtro por búsqueda
        const matchesSearch = !searchTerm || 
            (func.nombreCompleto && func.nombreCompleto.toLowerCase().includes(searchTerm)) ||
            (func.codigo && func.codigo.toLowerCase().includes(searchTerm)) ||
            (func.cargo && func.cargo.toLowerCase().includes(searchTerm)) ||
            (func.email && func.email.toLowerCase().includes(searchTerm));
        
        // Filtro por proyecto
        const matchesProyecto = !proyectoFilter || func.proyecto === proyectoFilter;
        
        // Filtro por estado
        let matchesEstado = true;
        if (estadoFilter === 'activo') {
            matchesEstado = func.activo === true;
        } else if (estadoFilter === 'inactivo') {
            matchesEstado = func.activo === false;
        }
        
        return matchesSearch && matchesProyecto && matchesEstado;
    });
    
    paginaActual = 1; // Resetear a primera página
    actualizarTablaFuncionarios();
}

// Actualizar filtros en admin
function actualizarFiltrosAdmin() {
    const selectProyecto = document.getElementById('filterProyectoFunc');
    if (!selectProyecto) return;
    
    // Limpiar opciones excepto la primera
    while (selectProyecto.options.length > 1) {
        selectProyecto.remove(1);
    }
    
    // Agregar proyectos únicos
    const proyectosUnicos = [...new Set(funcionarios.map(f => f.proyecto).filter(Boolean))];
    proyectosUnicos.sort().forEach(proyecto => {
        const option = document.createElement('option');
        option.value = proyecto;
        option.textContent = proyecto;
        selectProyecto.appendChild(option);
    });
}

// Cargar proyectos en panel de administración
function cargarProyectosAdmin() {
    const container = document.querySelector('.projects-grid-admin');
    if (!container) return;
    
    container.innerHTML = '';
    
    proyectos.forEach(proyecto => {
        const funcionariosProyecto = funcionarios.filter(f => f.proyecto === proyecto.id);
        const activos = funcionariosProyecto.filter(f => f.activo).length;
        
        const card = document.createElement('div');
        card.className = `project-card-admin ${proyecto.activo ? 'activo' : 'inactivo'}`;
        card.style.borderLeft = `5px solid ${proyecto.codigoColor || '#95a5a6'}`;
        card.innerHTML = `
            <div class="project-header-admin">
                <div class="project-title-admin">
                    <h4>${proyecto.nombre}</h4>
                    <span class="project-code-admin" style="background: ${proyecto.codigoColor || '#95a5a6'}">
                        ${proyecto.id}
                    </span>
                </div>
                <span class="project-status-admin ${proyecto.activo ? 'activo' : 'inactivo'}">
                    ${proyecto.activo ? 'Activo' : 'Inactivo'}
                </span>
            </div>
            
            <p class="project-desc-admin">${proyecto.descripcion || 'Sin descripción'}</p>
            
            <div class="project-stats-admin">
                <div class="project-stat">
                    <i class="fas fa-users"></i>
                    <span class="stat-value">${funcionariosProyecto.length}</span>
                    <span class="stat-label">Funcionarios</span>
                </div>
                <div class="project-stat">
                    <i class="fas fa-user-check"></i>
                    <span class="stat-value">${activos}</span>
                    <span class="stat-label">Activos</span>
                </div>
                <div class="project-stat">
                    <i class="fas fa-calendar-alt"></i>
                    <span class="stat-value">${proyecto.fechaFin ? new Date(proyecto.fechaFin).getFullYear() : 'N/A'}</span>
                    <span class="stat-label">Fin</span>
                </div>
            </div>
            
            <div class="project-actions-admin">
                <button class="btn-action edit" onclick="editarProyecto('${proyecto.id}')">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action ${proyecto.activo ? 'deactivate' : 'activate'}" 
                        onclick="${proyecto.activo ? 'desactivarProyecto' : 'activarProyecto'}('${proyecto.id}')">
                    <i class="fas fa-${proyecto.activo ? 'toggle-on' : 'toggle-off'}"></i>
                    ${proyecto.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button class="btn-action delete" onclick="eliminarProyecto('${proyecto.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Cambiar página
function cambiarPaginaFunc(direccion) {
    const totalPaginas = Math.ceil(funcionariosFiltrados.length / itemsPorPagina);
    
    if (direccion === -1 && paginaActual > 1) {
        paginaActual--;
    } else if (direccion === 1 && paginaActual < totalPaginas) {
        paginaActual++;
    }
    
    actualizarTablaFuncionarios();
}

// Actualizar estadísticas de paginación
function actualizarEstadisticasPaginacion() {
    const total = funcionariosFiltrados.length;
    const inicio = (paginaActual - 1) * itemsPorPagina + 1;
    const fin = Math.min(paginaActual * itemsPorPagina, total);
    
    document.getElementById('mostrandoFunc').textContent = `${inicio}-${fin}`;
    document.getElementById('totalFunc').textContent = total;
    document.getElementById('paginaActual').textContent = paginaActual;
}

// NUEVO FUNCIONARIO
function nuevoFuncionario() {
    const modal = document.getElementById('funcionarioModal');
    const modalContent = document.querySelector('#funcionarioModal .modal-content');
    
    const proyectosOptions = proyectos
        .filter(p => p.activo)
        .map(p => `<option value="${p.id}">${p.id} - ${p.nombre}</option>`)
        .join('');
    
    const nuevoId = Math.max(...funcionarios.map(f => parseInt(f.id) || 0), 0) + 1;
    const nuevoCodigo = generarCodigoFuncionario();
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> Nuevo Funcionario</h3>
            <span class="close" onclick="cerrarModal('funcionarioModal')">&times;</span>
        </div>
        
        <div class="modal-body">
            <form id="formFuncionario" onsubmit="guardarFuncionario(event)">
                <input type="hidden" id="funcId" value="${nuevoId}">
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcCodigo"><i class="fas fa-id-card"></i> Código *</label>
                        <input type="text" id="funcCodigo" value="${nuevoCodigo}" required>
                        <small>Identificador único del funcionario</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="funcProyecto"><i class="fas fa-project-diagram"></i> Proyecto *</label>
                        <select id="funcProyecto" required>
                            <option value="">Seleccionar proyecto...</option>
                            ${proyectosOptions}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcNombreCompleto"><i class="fas fa-user"></i> Nombre Completo *</label>
                    <input type="text" id="funcNombreCompleto" required 
                           placeholder="Apellidos y Nombres">
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcNombre"><i class="fas fa-signature"></i> Nombre *</label>
                        <input type="text" id="funcNombre" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="funcApellido"><i class="fas fa-signature"></i> Apellido *</label>
                        <input type="text" id="funcApellido" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcCargo"><i class="fas fa-briefcase"></i> Cargo *</label>
                    <input type="text" id="funcCargo" required>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcEmail"><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" id="funcEmail" placeholder="ejemplo@fias.org">
                    </div>
                    
                    <div class="form-group">
                        <label for="funcTelefono"><i class="fas fa-phone"></i> Teléfono</label>
                        <input type="tel" id="funcTelefono">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcActivo"><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="funcActivo" checked>
                        <label for="funcActivo">Activo en el sistema</label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="cerrarModal('funcionarioModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-save">
                        <i class="fas fa-save"></i> Guardar Funcionario
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// EDITAR FUNCIONARIO
function editarFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id === id);
    if (!funcionario) {
        mostrarNotificacionAdmin('Funcionario no encontrado', 'error');
        return;
    }
    
    const modal = document.getElementById('funcionarioModal');
    const modalContent = document.querySelector('#funcionarioModal .modal-content');
    
    const proyectosOptions = proyectos
        .map(p => `<option value="${p.id}" ${p.id === funcionario.proyecto ? 'selected' : ''}>
                    ${p.id} - ${p.nombre}
                   </option>`)
        .join('');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-user-edit"></i> Editar Funcionario</h3>
            <span class="close" onclick="cerrarModal('funcionarioModal')">&times;</span>
        </div>
        
        <div class="modal-body">
            <form id="formFuncionario" onsubmit="actualizarFuncionario(event, ${id})">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcCodigo"><i class="fas fa-id-card"></i> Código</label>
                        <input type="text" id="funcCodigo" value="${funcionario.codigo || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="funcProyecto"><i class="fas fa-project-diagram"></i> Proyecto</label>
                        <select id="funcProyecto" required>
                            <option value="">Seleccionar proyecto...</option>
                            ${proyectosOptions}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcNombreCompleto"><i class="fas fa-user"></i> Nombre Completo</label>
                    <input type="text" id="funcNombreCompleto" value="${funcionario.nombreCompleto || ''}" required>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcNombre"><i class="fas fa-signature"></i> Nombre</label>
                        <input type="text" id="funcNombre" value="${funcionario.nombre || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="funcApellido"><i class="fas fa-signature"></i> Apellido</label>
                        <input type="text" id="funcApellido" value="${funcionario.apellido || ''}" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcCargo"><i class="fas fa-briefcase"></i> Cargo</label>
                    <input type="text" id="funcCargo" value="${funcionario.cargo || ''}" required>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="funcEmail"><i class="fas fa-envelope"></i> Email</label>
                        <input type="email" id="funcEmail" value="${funcionario.email || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="funcTelefono"><i class="fas fa-phone"></i> Teléfono</label>
                        <input type="tel" id="funcTelefono" value="${funcionario.telefono || ''}">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="funcActivo"><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="funcActivo" ${funcionario.activo ? 'checked' : ''}>
                        <label for="funcActivo">Activo en el sistema</label>
                    </div>
                </div>
                
                <div class="form-section">
                    <h4><i class="fas fa-history"></i> Información del Sistema</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">ID:</span>
                            <span class="info-value">${funcionario.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Registrado:</span>
                            <span class="info-value">${formatearFecha(funcionario.fechaRegistro)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Actualizado:</span>
                            <span class="info-value">${formatearFecha(funcionario.fechaActualizacion)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="cerrarModal('funcionarioModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-save">
                        <i class="fas fa-save"></i> Actualizar Funcionario
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// GUARDAR NUEVO FUNCIONARIO
function guardarFuncionario(event) {
    event.preventDefault();
    
    const nuevoFuncionario = {
        id: parseInt(document.getElementById('funcId').value),
        codigo: document.getElementById('funcCodigo').value.trim(),
        proyecto: document.getElementById('funcProyecto').value,
        nombreCompleto: document.getElementById('funcNombreCompleto').value.trim(),
        nombre: document.getElementById('funcNombre').value.trim(),
        apellido: document.getElementById('funcApellido').value.trim(),
        cargo: document.getElementById('funcCargo').value.trim(),
        email: document.getElementById('funcEmail').value.trim() || null,
        telefono: document.getElementById('funcTelefono').value.trim() || null,
        activo: document.getElementById('funcActivo').checked,
        fechaRegistro: new Date().toISOString().split('T')[0],
        fechaActualizacion: new Date().toISOString().split('T')[0],
        usuarioRegistro: 'admin'
    };
    
    // Validar
    if (!validarFuncionario(nuevoFuncionario)) {
        return;
    }
    
    // Verificar que no exista el código
    if (funcionarios.some(f => f.codigo === nuevoFuncionario.codigo)) {
        mostrarNotificacionAdmin('Ya existe un funcionario con ese código', 'error');
        return;
    }
    
    // Agregar a la lista
    funcionarios.push(nuevoFuncionario);
    funcionariosFiltrados.push(nuevoFuncionario);
    
    // Guardar en archivo
    guardarFuncionariosEnArchivo();
    
    // Actualizar UI
    actualizarTablaFuncionarios();
    cerrarModal('funcionarioModal');
    
    mostrarNotificacionAdmin('Funcionario creado exitosamente', 'success');
}

// ACTUALIZAR FUNCIONARIO
function actualizarFuncionario(event, id) {
    event.preventDefault();
    
    const index = funcionarios.findIndex(f => f.id === id);
    if (index === -1) {
        mostrarNotificacionAdmin('Funcionario no encontrado', 'error');
        return;
    }
    
    const funcionarioActualizado = {
        ...funcionarios[index],
        codigo: document.getElementById('funcCodigo').value.trim(),
        proyecto: document.getElementById('funcProyecto').value,
        nombreCompleto: document.getElementById('funcNombreCompleto').value.trim(),
        nombre: document.getElementById('funcNombre').value.trim(),
        apellido: document.getElementById('funcApellido').value.trim(),
        cargo: document.getElementById('funcCargo').value.trim(),
        email: document.getElementById('funcEmail').value.trim() || null,
        telefono: document.getElementById('funcTelefono').value.trim() || null,
        activo: document.getElementById('funcActivo').checked,
        fechaActualizacion: new Date().toISOString().split('T')[0]
    };
    
    // Validar
    if (!validarFuncionario(funcionarioActualizado)) {
        return;
    }
    
    // Actualizar
    funcionarios[index] = funcionarioActualizado;
    
    // Actualizar en lista filtrada
    const indexFiltrado = funcionariosFiltrados.findIndex(f => f.id === id);
    if (indexFiltrado !== -1) {
        funcionariosFiltrados[indexFiltrado] = funcionarioActualizado;
    }
    
    // Guardar en archivo
    guardarFuncionariosEnArchivo();
    
    // Actualizar UI
    actualizarTablaFuncionarios();
    cerrarModal('funcionarioModal');
    
    mostrarNotificacionAdmin('Funcionario actualizado exitosamente', 'success');
}

// VALIDAR FUNCIONARIO
function validarFuncionario(funcionario) {
    const errores = [];
    
    if (!funcionario.codigo) errores.push('El código es requerido');
    if (!funcionario.proyecto) errores.push('El proyecto es requerido');
    if (!funcionario.nombreCompleto) errores.push('El nombre completo es requerido');
    if (!funcionario.nombre) errores.push('El nombre es requerido');
    if (!funcionario.apellido) errores.push('El apellido es requerido');
    if (!funcionario.cargo) errores.push('El cargo es requerido');
    
    if (funcionario.email && !validarEmail(funcionario.email)) {
        errores.push('El email no es válido');
    }
    
    if (errores.length > 0) {
        mostrarNotificacionAdmin(errores.join('<br>'), 'error');
        return false;
    }
    
    return true;
}

// ACTIVAR/DESACTIVAR FUNCIONARIO
async function activarFuncionario(id) {
    if (!confirm('¿Activar este funcionario?')) return;
    
    const index = funcionarios.findIndex(f => f.id === id);
    if (index !== -1) {
        funcionarios[index].activo = true;
        funcionarios[index].fechaActualizacion = new Date().toISOString().split('T')[0];
        
        // Actualizar en lista filtrada
        const indexFiltrado = funcionariosFiltrados.findIndex(f => f.id === id);
        if (indexFiltrado !== -1) {
            funcionariosFiltrados[indexFiltrado] = funcionarios[index];
        }
        
        await guardarFuncionariosEnArchivo();
        actualizarTablaFuncionarios();
        mostrarNotificacionAdmin('Funcionario activado', 'success');
    }
}

async function desactivarFuncionario(id) {
    if (!confirm('¿Desactivar este funcionario?')) return;
    
    const index = funcionarios.findIndex(f => f.id === id);
    if (index !== -1) {
        funcionarios[index].activo = false;
        funcionarios[index].fechaActualizacion = new Date().toISOString().split('T')[0];
        
        // Actualizar en lista filtrada
        const indexFiltrado = funcionariosFiltrados.findIndex(f => f.id === id);
        if (indexFiltrado !== -1) {
            funcionariosFiltrados[indexFiltrado] = funcionarios[index];
        }
        
        await guardarFuncionariosEnArchivo();
        actualizarTablaFuncionarios();
        mostrarNotificacionAdmin('Funcionario desactivado', 'warning');
    }
}

// ELIMINAR FUNCIONARIO
async function eliminarFuncionario(id) {
    if (!confirm('¿Eliminar permanentemente este funcionario?\nEsta acción no se puede deshacer.')) {
        return;
    }
    
    const index = funcionarios.findIndex(f => f.id === id);
    if (index !== -1) {
        // Eliminar de ambas listas
        funcionarios.splice(index, 1);
        funcionariosFiltrados = funcionariosFiltrados.filter(f => f.id !== id);
        
        await guardarFuncionariosEnArchivo();
        actualizarTablaFuncionarios();
        mostrarNotificacionAdmin('Funcionario eliminado', 'success');
    }
}

// VER DETALLES FUNCIONARIO
function verDetallesFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id === id);
    if (!funcionario) return;
    
    const proyecto = proyectos.find(p => p.id === funcionario.proyecto);
    
    const modal = document.getElementById('funcionarioModal');
    const modalContent = document.querySelector('#funcionarioModal .modal-content');
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-user-circle"></i> Detalles del Funcionario</h3>
            <span class="close" onclick="cerrarModal('funcionarioModal')">&times;</span>
        </div>
        
        <div class="modal-body">
            <div class="funcionario-detail-header">
                <div class="func-avatar">
                    <i class="fas fa-user-tie"></i>
                </div>
                <div class="func-info-detail">
                    <h2>${funcionario.nombreCompleto}</h2>
                    <p class="func-cargo">${funcionario.cargo}</p>
                    <div class="func-badges">
                        <span class="badge-proyecto" style="background: ${getColorProyecto(funcionario.proyecto)}">
                            ${funcionario.proyecto}
                        </span>
                        <span class="estado-badge ${funcionario.activo ? 'activo' : 'inactivo'}">
                            ${funcionario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="detail-sections">
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Información Personal</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">ID:</span>
                            <span class="info-value">${funcionario.id}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Código:</span>
                            <span class="info-value">${funcionario.codigo || 'N/A'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Nombre:</span>
                            <span class="info-value">${funcionario.nombre}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Apellido:</span>
                            <span class="info-value">${funcionario.apellido}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-building"></i> Información Laboral</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Proyecto:</span>
                            <span class="info-value">${proyecto ? proyecto.nombre : funcionario.proyecto}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Cargo:</span>
                            <span class="info-value">${funcionario.cargo}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Email:</span>
                            <span class="info-value">
                                ${funcionario.email ? 
                                    `<a href="mailto:${funcionario.email}">${funcionario.email}</a>` : 
                                    'No registrado'}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Teléfono:</span>
                            <span class="info-value">${funcionario.telefono || 'No registrado'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h4><i class="fas fa-cog"></i> Información del Sistema</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Estado:</span>
                            <span class="info-value ${funcionario.activo ? 'activo' : 'inactivo'}">
                                ${funcionario.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Registro:</span>
                            <span class="info-value">${formatearFecha(funcionario.fechaRegistro)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Última Actualización:</span>
                            <span class="info-value">${formatearFecha(funcionario.fechaActualizacion)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Registrado por:</span>
                            <span class="info-value">${funcionario.usuarioRegistro || 'Sistema'}</span>
                        </div>
                    </div>
                </div>
                
                ${proyecto ? `
                <div class="detail-section">
                    <h4><i class="fas fa-project-diagram"></i> Información del Proyecto</h4>
                    <div class="info-grid">
                        <div class="info-item">
                            <span class="info-label">Nombre Proyecto:</span>
                            <span class="info-value">${proyecto.nombre}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Descripción:</span>
                            <span class="info-value">${proyecto.descripcion || 'Sin descripción'}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Inicio:</span>
                            <span class="info-value">${formatearFecha(proyecto.fechaInicio)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Fecha Fin:</span>
                            <span class="info-value">${formatearFecha(proyecto.fechaFin)}</span>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            
            <div class="detail-actions">
                <button class="btn-action edit" onclick="editarFuncionario(${id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn-action ${funcionario.activo ? 'deactivate' : 'activate'}" 
                        onclick="${funcionario.activo ? 'desactivarFuncionario' : 'activarFuncionario'}(${id})">
                    <i class="fas fa-${funcionario.activo ? 'toggle-on' : 'toggle-off'}"></i>
                    ${funcionario.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button class="btn-action export" onclick="exportarHistorialFuncionario(${id})">
                    <i class="fas fa-file-export"></i> Exportar Historial
                </button>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

// EXPORTAR FUNCIONARIOS
function exportarFuncionarios() {
    const data = funcionariosFiltrados.map(f => ({
        ID: f.id,
        Código: f.codigo,
        'Nombre Completo': f.nombreCompleto,
        Nombre: f.nombre,
        Apellido: f.apellido,
        Proyecto: f.proyecto,
        Cargo: f.cargo,
        Email: f.email || '',
        Teléfono: f.telefono || '',
        Estado: f.activo ? 'Activo' : 'Inactivo',
        'Fecha Registro': f.fechaRegistro,
        'Última Actualización': f.fechaActualizacion
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Funcionarios");
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `funcionarios_${fecha}.xlsx`);
    
    mostrarNotificacionAdmin('Lista de funcionarios exportada', 'success');
}

// EXPORTAR HISTORIAL DE FUNCIONARIO
function exportarHistorialFuncionario(id) {
    const funcionario = funcionarios.find(f => f.id === id);
    if (!funcionario) return;
    
    // Aquí podrías cargar el historial de marcaciones del funcionario
    const historial = []; // Cargar desde localStorage o archivo
    
    const data = historial.length > 0 ? historial : [{
        Mensaje: 'No hay historial de marcaciones disponible para este funcionario'
    }];
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Historial_${funcionario.codigo}`);
    
    XLSX.writeFile(wb, `historial_${funcionario.codigo}.xlsx`);
}

// GUARDAR FUNCIONARIOS EN ARCHIVO
async function guardarFuncionariosEnArchivo() {
    try {
        // En un sistema real, aquí harías una petición a un servidor
        // Para este ejemplo, guardamos en localStorage
        
        const data = {
            version: "1.0",
            lastUpdate: new Date().toISOString(),
            funcionarios: funcionarios
        };
        
        localStorage.setItem('funcionariosData', JSON.stringify(data, null, 2));
        
        // En un entorno de producción, podrías usar:
        // await fetch('/api/funcionarios', { method: 'PUT', body: JSON.stringify(data) });
        
        console.log('Funcionarios guardados localmente');
        
    } catch (error) {
        console.error('Error guardando funcionarios:', error);
        mostrarNotificacionAdmin('Error guardando datos', 'error');
    }
}

// PROYECTOS - NUEVO PROYECTO
function nuevoProyecto() {
    const modal = document.getElementById('proyectoModal');
    const modalContent = document.querySelector('#proyectoModal .modal-content');
    
    const nuevoId = generarIdProyecto();
    
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3><i class="fas fa-project-diagram"></i> Nuevo Proyecto</h3>
            <span class="close" onclick="cerrarModal('proyectoModal')">&times;</span>
        </div>
        
        <div class="modal-body">
            <form id="formProyecto" onsubmit="guardarProyecto(event)">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="projId"><i class="fas fa-hashtag"></i> ID del Proyecto *</label>
                        <input type="text" id="projId" value="${nuevoId}" required 
                               pattern="[A-Z0-9_-]+" title="Solo mayúsculas, números, guiones y guiones bajos">
                        <small>Identificador único (ej: NUEVO_PROY)</small>
                    </div>
                    
                    <div class="form-group">
                        <label for="projColor"><i class="fas fa-palette"></i> Color *</label>
                        <input type="color" id="projColor" value="#3498db" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="projNombre"><i class="fas fa-signature"></i> Nombre del Proyecto *</label>
                    <input type="text" id="projNombre" required placeholder="Nombre completo del proyecto">
                </div>
                
                <div class="form-group">
                    <label for="projDescripcion"><i class="fas fa-align-left"></i> Descripción</label>
                    <textarea id="projDescripcion" rows="3" placeholder="Descripción detallada del proyecto..."></textarea>
                </div>
                
                <div class="form-grid">
                    <div class="form-group">
                        <label for="projFechaInicio"><i class="fas fa-calendar-plus"></i> Fecha Inicio</label>
                        <input type="date" id="projFechaInicio">
                    </div>
                    
                    <div class="form-group">
                        <label for="projFechaFin"><i class="fas fa-calendar-minus"></i> Fecha Fin</label>
                        <input type="date" id="projFechaFin">
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="projPresupuesto"><i class="fas fa-money-bill-wave"></i> Presupuesto (USD)</label>
                    <input type="number" id="projPresupuesto" min="0" step="1000">
                </div>
                
                <div class="form-group">
                    <label for="projCoordinador"><i class="fas fa-user-tie"></i> Coordinador</label>
                    <input type="text" id="projCoordinador" placeholder="Nombre del coordinador">
                </div>
                
                <div class="form-group">
                    <label for="projActivo"><i class="fas fa-toggle-on"></i> Estado</label>
                    <div class="checkbox-group">
                        <input type="checkbox" id="projActivo" checked>
                        <label for="projActivo">Proyecto activo</label>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-cancel" onclick="cerrarModal('proyectoModal')">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-save">
                        <i class="fas fa-save"></i> Guardar Proyecto
                    </button>
                </div>
            </form>
        </div>
    `;
    
    modal.style.display = 'block';
}

// GENERAR ID DE PROYECTO
function generarIdProyecto() {
    const proyectosExistentes = proyectos.map(p => p.id);
    let nuevoId = 'PROY_NUEVO';
    let contador = 1;
    
    while (proyectosExistentes.includes(nuevoId)) {
        nuevoId = `PROY_NUEVO_${contador}`;
        contador++;
    }
    
    return nuevoId;
}

// GENERAR CÓDIGO DE FUNCIONARIO
function generarCodigoFuncionario() {
    const funcionariosConCodigo = funcionarios.filter(f => f.codigo);
    const ultimoCodigo = funcionariosConCodigo[funcionariosConCodigo.length - 1]?.codigo;
    
    if (!ultimoCodigo) return 'FIAS-001';
    
    // Extraer número del último código
    const match = ultimoCodigo.match(/(\d+)$/);
    if (match) {
        const numero = parseInt(match[1]) + 1;
        const prefijo = ultimoCodigo.replace(match[1], '');
        return `${prefijo}${numero.toString().padStart(3, '0')}`;
    }
    
    return `${ultimoCodigo}-001`;
}

// FUNCIONES AUXILIARES
function mostrarNotificacionAdmin(mensaje, tipo = 'info') {
    // Implementar sistema de notificaciones similar al principal
    alert(`${tipo.toUpperCase()}: ${mensaje}`);
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function formatearFecha(fecha) {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-EC');
}

function getColorProyecto(proyectoId) {
    const proyecto = proyectos.find(p => p.id === proyectoId);
    return proyecto?.codigoColor || '#95a5a6';
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Mostrar pestaña de administración
function mostrarAdminTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(`${tabId}Tab`).classList.add('active');
    
    // Actualizar botones de pestaña
    document.querySelectorAll('.admin-tab').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Inicializar cuando se carga la página admin
if (document.querySelector('.admin-container')) {
    console.log('Panel de administración inicializado');
}
