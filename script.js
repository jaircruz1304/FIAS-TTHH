// Sistema de Marcaciones FIAS - Script Principal

// Variables globales
let funcionarios = [];
let proyectos = [];
let processedData = [];
let errors = [];
let activityLog = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    cargarDatos();
    configurarDragAndDrop();
    configurarEventListeners();
    actualizarDashboard();
});

// Cargar datos desde archivos JSON
async function cargarDatos() {
    try {
        // Cargar funcionarios
        const funcResponse = await fetch('data/funcionarios.json');
        const funcData = await funcResponse.json();
        funcionarios = funcData.funcionarios || funcData;
        
        // Cargar proyectos
        const projResponse = await fetch('data/proyectos.json');
        const projData = await projResponse.json();
        proyectos = projData.proyectos || projData;
        
        // Actualizar UI
        actualizarDashboard();
        actualizarFiltrosProyectos();
        cargarActividadReciente();
        
        console.log('Datos cargados correctamente');
    } catch (error) {
        console.error('Error cargando datos:', error);
        mostrarNotificacion('Error cargando datos del sistema', 'error');
    }
}

// Configurar drag and drop
function configurarDragAndDrop() {
    ['teamsDropArea', 'bioDropArea'].forEach(id => {
        const dropArea = document.getElementById(id);
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        dropArea.addEventListener('drop', handleDrop, false);
    });
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    const dropArea = e.target.closest('.file-drop-area');
    
    if (dropArea.id === 'teamsDropArea') {
        manejarArchivo(files[0], 'teams');
    } else {
        manejarArchivo(files[0], 'bio');
    }
    
    dropArea.classList.remove('dragover');
}

// Manejar selección de archivos
function configurarEventListeners() {
    // Teams file input
    document.getElementById('teamsFile').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            manejarArchivo(e.target.files[0], 'teams');
        }
    });
    
    // Bio file input
    document.getElementById('bioFile').addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            manejarArchivo(e.target.files[0], 'bio');
        }
    });
    
    // Process button
    document.getElementById('processBtn').addEventListener('click', procesarArchivos);
    
    // Search
    document.getElementById('searchData').addEventListener('input', filtrarDatos);
}

// Manejar archivo subido
function manejarArchivo(file, tipo) {
    if (!file) return;
    
    const detalles = document.getElementById(`${tipo}Details`);
    const nombre = document.querySelector(`#${tipo}Details .file-name`);
    const tamano = document.querySelector(`#${tipo}Details .file-size`);
    
    nombre.textContent = file.name;
    tamano.textContent = formatFileSize(file.size);
    
    detalles.style.display = 'flex';
    
    // Habilitar botón de procesar si ambos archivos están listos
    verificarArchivosListos();
    
    mostrarNotificacion(`Archivo ${tipo} cargado: ${file.name}`, 'success');
    
    // Registrar actividad
    registrarActividad(`Archivo ${tipo} cargado: ${file.name}`);
}

// Limpiar archivo
function limpiarArchivo(tipo) {
    const input = document.getElementById(`${tipo}File`);
    const detalles = document.getElementById(`${tipo}Details`);
    
    input.value = '';
    detalles.style.display = 'none';
    
    verificarArchivosListos();
}

// Verificar si ambos archivos están listos
function verificarArchivosListos() {
    const teamsFile = document.getElementById('teamsFile').files.length > 0;
    const bioFile = document.getElementById('bioFile').files.length > 0;
    const btnProcesar = document.getElementById('processBtn');
    
    btnProcesar.disabled = !(teamsFile || bioFile);
}

// Procesar archivos
async function procesarArchivos() {
    const btnProcesar = document.getElementById('processBtn');
    const spinner = document.getElementById('processSpinner');
    
    btnProcesar.disabled = true;
    spinner.style.display = 'block';
    
    try {
        // Resetear datos
        processedData = [];
        errors = [];
        
        // Procesar Teams si existe
        const teamsFile = document.getElementById('teamsFile').files[0];
        if (teamsFile) {
            await procesarTeams(teamsFile);
        }
        
        // Procesar Biométrico si existe
        const bioFile = document.getElementById('bioFile').files[0];
        if (bioFile) {
            await procesarBiometrico(bioFile);
        }
        
        // Mostrar resultados
        mostrarResultados();
        
        // Generar estadísticas
        generarEstadisticas();
        
        // Mostrar sección de resultados
        document.getElementById('resultsSection').style.display = 'block';
        
        mostrarNotificacion('Procesamiento completado exitosamente', 'success');
        registrarActividad('Procesamiento de archivos completado');
        
    } catch (error) {
        console.error('Error en procesamiento:', error);
        mostrarNotificacion(`Error en procesamiento: ${error.message}`, 'error');
        registrarActividad(`Error en procesamiento: ${error.message}`, 'error');
    } finally {
        btnProcesar.disabled = false;
        spinner.style.display = 'none';
    }
}

// Procesar archivo de Teams
async function procesarTeams(file) {
    const data = await leerArchivoExcel(file);
    
    data.forEach((row, index) => {
        try {
            // Buscar funcionario por nombre
            const nombre = row['Usuario'] || row['Nombre'] || row['Nombre Completo'] || '';
            const funcionario = buscarFuncionarioPorNombre(nombre);
            
            if (!funcionario) {
                errors.push({
                    tipo: 'Teams',
                    linea: index + 2,
                    mensaje: `Funcionario no encontrado: ${nombre}`,
                    datos: row
                });
                return;
            }
            
            // Procesar hora de entrada
            if (row['Hora de entrada']) {
                const entrada = parsearFechaHora(row['Hora de entrada']);
                if (entrada) {
                    processedData.push({
                        id: funcionario.id,
                        codigo: funcionario.codigo,
                        nombreCompleto: funcionario.nombreCompleto,
                        proyecto: funcionario.proyecto,
                        fecha: entrada.fecha,
                        hora: entrada.hora,
                        tipo: 'Entrada',
                        fuente: 'Teams',
                        estado: 'Procesado',
                        rawData: row
                    });
                }
            }
            
            // Procesar hora de salida
            if (row['Hora de salida']) {
                const salida = parsearFechaHora(row['Hora de salida']);
                if (salida) {
                    processedData.push({
                        id: funcionario.id,
                        codigo: funcionario.codigo,
                        nombreCompleto: funcionario.nombreCompleto,
                        proyecto: funcionario.proyecto,
                        fecha: salida.fecha,
                        hora: salida.hora,
                        tipo: 'Salida',
                        fuente: 'Teams',
                        estado: 'Procesado',
                        rawData: row
                    });
                }
            }
            
        } catch (error) {
            errors.push({
                tipo: 'Teams',
                linea: index + 2,
                mensaje: `Error procesando línea: ${error.message}`,
                datos: row
            });
        }
    });
}

// Procesar archivo biométrico
async function procesarBiometrico(file) {
    const data = await leerArchivoExcel(file);
    
    data.forEach((row, index) => {
        try {
            const idUsuario = parseInt(row['ID de Usuario']) || row['ID'];
            const funcionario = buscarFuncionarioPorId(idUsuario);
            
            if (!funcionario) {
                errors.push({
                    tipo: 'Biométrico',
                    linea: index + 2,
                    mensaje: `ID de usuario no encontrado: ${idUsuario}`,
                    datos: row
                });
                return;
            }
            
            const tiempo = row['Tiempo'] || row['Fecha'] || row['FechaHora'];
            const evento = parsearFechaHora(tiempo);
            
            if (evento) {
                processedData.push({
                    id: funcionario.id,
                    codigo: funcionario.codigo,
                    nombreCompleto: funcionario.nombreCompleto,
                    proyecto: funcionario.proyecto,
                    fecha: evento.fecha,
                    hora: evento.hora,
                    tipo: row['Evento'] || row['Estado'] || 'Marcación',
                    fuente: 'Biométrico',
                    estado: 'Procesado',
                    rawData: row
                });
            }
            
        } catch (error) {
            errors.push({
                tipo: 'Biométrico',
                linea: index + 2,
                mensaje: `Error procesando línea: ${error.message}`,
                datos: row
            });
        }
    });
}

// Buscar funcionario por ID
function buscarFuncionarioPorId(id) {
    return funcionarios.find(f => f.id === parseInt(id) && f.activo);
}

// Buscar funcionario por nombre (búsqueda inteligente)
function buscarFuncionarioPorNombre(nombre) {
    if (!nombre || nombre.trim() === '') return null;
    
    const nombreLimpio = nombre.toLowerCase().trim();
    
    // Primero buscar coincidencia exacta
    let funcionario = funcionarios.find(f => 
        f.nombreCompleto.toLowerCase() === nombreLimpio && f.activo
    );
    
    if (funcionario) return funcionario;
    
    // Buscar por partes del nombre
    const partesNombre = nombreLimpio.split(' ');
    
    for (const parte of partesNombre) {
        if (parte.length > 2) { // Ignorar palabras muy cortas
            funcionario = funcionarios.find(f => 
                f.nombreCompleto.toLowerCase().includes(parte) && f.activo
            );
            if (funcionario) return funcionario;
        }
    }
    
    // Buscar por nombre o apellido
    for (const func of funcionarios) {
        if (!func.activo) continue;
        
        const nombreFunc = func.nombre.toLowerCase();
        const apellidoFunc = func.apellido.toLowerCase();
        
        if (nombreLimpio.includes(nombreFunc) || 
            nombreLimpio.includes(apellidoFunc) ||
            nombreFunc.includes(partesNombre[0]) ||
            apellidoFunc.includes(partesNombre[0])) {
            return func;
        }
    }
    
    return null;
}

// Mostrar resultados en tabla
function mostrarResultados() {
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    // Ordenar datos
    processedData.sort((a, b) => {
        if (a.proyecto !== b.proyecto) {
            return a.proyecto.localeCompare(b.proyecto);
        }
        if (a.nombreCompleto !== b.nombreCompleto) {
            return a.nombreCompleto.localeCompare(b.nombreCompleto);
        }
        if (a.fecha !== b.fecha) {
            return new Date(a.fecha) - new Date(b.fecha);
        }
        return a.hora.localeCompare(b.hora);
    });
    
    // Agrupar por proyecto para colores
    const coloresProyectos = {};
    proyectos.forEach((proj, index) => {
        coloresProyectos[proj.id] = proj.codigoColor || getColorForIndex(index);
    });
    
    // Renderizar filas
    processedData.forEach((item, index) => {
        const colorProyecto = coloresProyectos[item.proyecto] || '#cccccc';
        
        const row = document.createElement('tr');
        row.style.borderLeft = `4px solid ${colorProyecto}`;
        row.innerHTML = `
            <td><input type="checkbox" class="row-select" data-index="${index}"></td>
            <td><span class="badge-id">${item.codigo || item.id}</span></td>
            <td>
                <div class="funcionario-info">
                    <strong>${item.nombreCompleto}</strong>
                    <small>${item.proyecto}</small>
                </div>
            </td>
            <td>
                <span class="badge-proyecto" style="background: ${colorProyecto}">
                    ${item.proyecto}
                </span>
            </td>
            <td>${formatearFecha(item.fecha)}</td>
            <td><strong>${item.hora}</strong></td>
            <td>
                <span class="badge-tipo ${item.tipo.toLowerCase()}">
                    ${item.tipo}
                </span>
            </td>
            <td>
                <span class="badge-fuente ${item.fuente.toLowerCase()}">
                    ${item.fuente}
                </span>
            </td>
            <td>
                <span class="badge-estado success">
                    ${item.estado}
                </span>
            </td>
            <td>
                <button class="btn-action" onclick="verDetalles(${index})" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-action" onclick="corregirRegistro(${index})" title="Corregir">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Actualizar estadísticas
    document.getElementById('totalRegistros').textContent = processedData.length;
    document.getElementById('statsSuccess').textContent = `${processedData.length} exitosos`;
    document.getElementById('statsError').textContent = `${errors.length} errores`;
}

// Generar estadísticas y gráficos
function generarEstadisticas() {
    // Estadísticas por proyecto
    const statsPorProyecto = {};
    processedData.forEach(item => {
        if (!statsPorProyecto[item.proyecto]) {
            statsPorProyecto[item.proyecto] = 0;
        }
        statsPorProyecto[item.proyecto]++;
    });
    
    // Crear gráfico de proyectos
    const ctxProjects = document.getElementById('chartProjects');
    new Chart(ctxProjects, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statsPorProyecto),
            datasets: [{
                data: Object.values(statsPorProyecto),
                backgroundColor: Object.keys(statsPorProyecto).map(projId => {
                    const proyecto = proyectos.find(p => p.id === projId);
                    return proyecto?.codigoColor || getRandomColor();
                })
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Estadísticas por fuente
    const statsPorFuente = {};
    processedData.forEach(item => {
        if (!statsPorFuente[item.fuente]) {
            statsPorFuente[item.fuente] = 0;
        }
        statsPorFuente[item.fuente]++;
    });
    
    // Crear gráfico de fuentes
    const ctxSources = document.getElementById('chartSources');
    new Chart(ctxSources, {
        type: 'pie',
        data: {
            labels: Object.keys(statsPorFuente),
            datasets: [{
                data: Object.values(statsPorFuente),
                backgroundColor: ['#3498db', '#27ae60', '#9b59b6']
            }]
        }
    });
}

// Actualizar dashboard
function actualizarDashboard() {
    const funcActivos = funcionarios.filter(f => f.activo).length;
    const projActivos = proyectos.filter(p => p.activo).length;
    
    document.getElementById('totalFuncActivos').textContent = funcActivos;
    document.getElementById('totalProyectos').textContent = projActivos;
    document.getElementById('totalMarcaciones').textContent = processedData.length;
    
    // Actualizar proyectos en filtros
    actualizarFiltrosProyectos();
}

// Actualizar filtros de proyectos
function actualizarFiltrosProyectos() {
    const select = document.getElementById('filterProject');
    select.innerHTML = '<option value="">Todos los proyectos</option>';
    
    proyectos
        .filter(p => p.activo)
        .forEach(proj => {
            const option = document.createElement('option');
            option.value = proj.id;
            option.textContent = `${proj.id} - ${proj.nombre}`;
            select.appendChild(option);
        });
}

// Filtrar datos por proyecto
function filtrarPorProyecto() {
    const proyecto = document.getElementById('filterProject').value;
    const filas = document.querySelectorAll('#resultsBody tr');
    
    filas.forEach(fila => {
        const proyectoFila = fila.cells[3].textContent.trim();
        
        if (!proyecto || proyectoFila === proyecto) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
}

// Filtrar datos
function filtrarDatos() {
    const termino = document.getElementById('searchData').value.toLowerCase();
    const filas = document.querySelectorAll('#resultsBody tr');
    
    filas.forEach(fila => {
        const texto = fila.textContent.toLowerCase();
        fila.style.display = texto.includes(termino) ? '' : 'none';
    });
}

// Exportar a Excel
function exportarExcel() {
    const ws = XLSX.utils.json_to_sheet(processedData.map(item => ({
        'Código': item.codigo,
        'Funcionario': item.nombreCompleto,
        'Proyecto': item.proyecto,
        'Fecha': item.fecha,
        'Hora': item.hora,
        'Tipo': item.tipo,
        'Fuente': item.fuente,
        'Estado': item.estado
    })));
    
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Marcaciones");
    
    // Agregar hoja de resumen
    const wsResumen = XLSX.utils.json_to_sheet(generarResumenExport());
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen");
    
    // Agregar hoja de errores
    if (errors.length > 0) {
        const wsErrores = XLSX.utils.json_to_sheet(errors);
        XLSX.utils.book_append_sheet(wb, wsErrores, "Errores");
    }
    
    const fecha = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `marcaciones_${fecha}.xlsx`);
    
    mostrarNotificacion('Archivo Excel exportado exitosamente', 'success');
    registrarActividad('Exportación a Excel realizada');
}

// Generar resumen para exportación
function generarResumenExport() {
    const resumen = [];
    
    // Resumen por proyecto
    const porProyecto = {};
    processedData.forEach(item => {
        if (!porProyecto[item.proyecto]) {
            porProyecto[item.proyecto] = {
                proyecto: item.proyecto,
                total: 0,
                entrada: 0,
                salida: 0,
                teams: 0,
                biometrico: 0
            };
        }
        
        const stats = porProyecto[item.proyecto];
        stats.total++;
        
        if (item.tipo.toLowerCase().includes('entrada')) stats.entrada++;
        if (item.tipo.toLowerCase().includes('salida')) stats.salida++;
        if (item.fuente === 'Teams') stats.teams++;
        if (item.fuente === 'Biométrico') stats.biometrico++;
    });
    
    // Convertir a array
    Object.values(porProyecto).forEach(stats => {
        resumen.push({
            'Categoría': 'Por Proyecto',
            'Proyecto': stats.proyecto,
            'Total Registros': stats.total,
            'Entradas': stats.entrada,
            'Salidas': stats.salida,
            'Desde Teams': stats.teams,
            'Desde Biométrico': stats.biometrico
        });
    });
    
    // Totales generales
    resumen.push({
        'Categoría': 'Totales',
        'Proyecto': 'TODOS',
        'Total Registros': processedData.length,
        'Entradas': processedData.filter(d => d.tipo.toLowerCase().includes('entrada')).length,
        'Salidas': processedData.filter(d => d.tipo.toLowerCase().includes('salida')).length,
        'Desde Teams': processedData.filter(d => d.fuente === 'Teams').length,
        'Desde Biométrico': processedData.filter(d => d.fuente === 'Biométrico').length
    });
    
    return resumen;
}

// Mostrar notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const container = document.getElementById('notificationContainer');
    const notificacion = document.createElement('div');
    notificacion.className = `notification ${tipo}`;
    notificacion.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 
                         tipo === 'error' ? 'exclamation-circle' : 
                         'info-circle'}"></i>
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    container.appendChild(notificacion);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notificacion.parentElement) {
            notificacion.remove();
        }
    }, 5000);
}

// Registrar actividad
function registrarActividad(mensaje, tipo = 'info') {
    const actividad = {
        fecha: new Date().toISOString(),
        mensaje: mensaje,
        tipo: tipo,
        usuario: 'Sistema'
    };
    
    activityLog.unshift(actividad); // Agregar al inicio
    
    // Mantener solo las últimas 50 actividades
    if (activityLog.length > 50) {
        activityLog.pop();
    }
    
    cargarActividadReciente();
}

// Cargar actividad reciente
function cargarActividadReciente() {
    const container = document.getElementById('activityList');
    if (!container) return;
    
    container.innerHTML = '';
    
    activityLog.slice(0, 10).forEach(act => {
        const item = document.createElement('div');
        item.className = `activity-item ${act.tipo}`;
        item.innerHTML = `
            <i class="fas fa-${act.tipo === 'error' ? 'exclamation-triangle' : 
                               act.tipo === 'success' ? 'check-circle' : 
                               'info-circle'}"></i>
            <div class="activity-details">
                <p>${act.mensaje}</p>
                <small>${formatearFechaHora(act.fecha)}</small>
            </div>
        `;
        container.appendChild(item);
    });
}

// Funciones auxiliares
function leerArchivoExcel(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

function parsearFechaHora(fechaHora) {
    if (!fechaHora) return null;
    
    try {
        const fecha = new Date(fechaHora);
        if (isNaN(fecha.getTime())) return null;
        
        return {
            fecha: fecha.toISOString().split('T')[0],
            hora: fecha.toTimeString().split(' ')[0].substring(0, 8)
        };
    } catch (error) {
        return null;
    }
}

function formatearFecha(fecha) {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES');
}

function formatearFechaHora(fechaHora) {
    if (!fechaHora) return '';
    const fecha = new Date(fechaHora);
    return fecha.toLocaleString('es-ES');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getColorForIndex(index) {
    const colors = [
        '#2c3e50', '#3498db', '#27ae60', '#9b59b6',
        '#f39c12', '#e74c3c', '#1abc9c', '#d35400'
    ];
    return colors[index % colors.length];
}

function getRandomColor() {
    return '#' + Math.floor(Math.random()*16777215).toString(16);
}

// Funciones de interfaz
function mostrarTab(tabId) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Mostrar la pestaña seleccionada
    document.getElementById(tabId).classList.add('active');
    
    // Actualizar botones de pestaña
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function verDetalles(index) {
    const item = processedData[index];
    const modal = document.getElementById('detailModal');
    const modalContent = document.getElementById('modalContent');
    
    modalContent.innerHTML = `
        <div class="detail-container">
            <div class="detail-section">
                <h4>Información del Funcionario</h4>
                <p><strong>Código:</strong> ${item.codigo || item.id}</p>
                <p><strong>Nombre:</strong> ${item.nombreCompleto}</p>
                <p><strong>Proyecto:</strong> ${item.proyecto}</p>
            </div>
            
            <div class="detail-section">
                <h4>Detalles de Marcación</h4>
                <p><strong>Fecha:</strong> ${formatearFecha(item.fecha)}</p>
                <p><strong>Hora:</strong> ${item.hora}</p>
                <p><strong>Tipo:</strong> ${item.tipo}</p>
                <p><strong>Fuente:</strong> ${item.fuente}</p>
                <p><strong>Estado:</strong> ${item.estado}</p>
            </div>
            
            <div class="detail-section">
                <h4>Datos Originales</h4>
                <pre>${JSON.stringify(item.rawData, null, 2)}</pre>
            </div>
        </div>
    `;
    
    modal.style.display = 'block';
}

function corregirRegistro(index) {
    // Implementar lógica de corrección
    mostrarNotificacion('Función de corrección en desarrollo', 'info');
}

function cerrarModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// Inicializar sistema
console.log('Sistema de Marcaciones FIAS inicializado');