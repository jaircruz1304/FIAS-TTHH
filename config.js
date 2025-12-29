// config.js - Sistema de Configuración FIAS Marcaciones

class ConfiguracionSistema {
    constructor() {
        this.config = {
            version: "2.0.0",
            sistema: {
                nombre: "Sistema de Marcaciones FIAS",
                siglas: "SMF",
                organizacion: "Fondo de Inversión Ambiental Sostenible",
                descripcion: "Sistema para procesamiento automático de marcaciones biométricas y de Microsoft Teams",
                desarrollador: "Departamento de Tecnología FIAS",
                contacto: "tecnologia@fias.org",
                anioFundacion: 2024
            },
            
            procesamiento: {
                formatoFechaEntrada: "YYYY-MM-DD",
                formatoHoraEntrada: "HH:mm:ss",
                formatoFechaSalida: "DD/MM/YYYY",
                formatoHoraSalida: "hh:mm A",
                separadorDecimal: ".",
                separadorMiles: ",",
                zonaHoraria: "America/Guayaquil",
                idioma: "es-EC",
                
                horarios: {
                    horaEntradaEstandar: "08:30:00",
                    horaSalidaEstandar: "17:30:00",
                    horaInicioAlmuerzo: "13:00:00",
                    horaFinAlmuerzo: "14:00:00",
                    toleranciaEntrada: 15,
                    toleranciaSalida: 15,
                    minutosAlmuerzo: 60
                },
                
                diasLaborables: [1, 2, 3, 4, 5],
                feriados: [
                    "2024-01-01", "2024-02-12", "2024-02-13",
                    "2024-03-28", "2024-03-29", "2024-05-01",
                    "2024-05-24", "2024-08-10", "2024-10-09",
                    "2024-11-02", "2024-11-03", "2024-12-06",
                    "2024-12-25"
                ],
                
                validaciones: {
                    validarHorarios: true,
                    validarDuplicados: true,
                    validarFeriados: true,
                    validarFinSemana: true,
                    marcarTardanzas: true,
                    marcarHorasExtra: true
                }
            },
            
            archivos: {
                teams: {
                    nombreArchivo: "Reporte_Teams_{fecha}.xlsx",
                    formatoPermitido: [".xlsx", ".xls", ".csv"],
                    tamanoMaximoMB: 10,
                    columnasRequeridas: [
                        "Usuario",
                        "Hora de entrada", 
                        "Hora de salida",
                        "Hora de inicio del descanso",
                        "Hora de finalización del descanso"
                    ],
                    delimitadorCSV: ";"
                },
                
                biometrico: {
                    nombreArchivo: "Reporte_Biometrico_{fecha}.xlsx",
                    formatoPermitido: [".xlsx", ".xls", ".csv"],
                    tamanoMaximoMB: 10,
                    columnasRequeridas: [
                        "ID de Usuario",
                        "Tiempo",
                        "Nombre",
                        "Evento", 
                        "Estado"
                    ],
                    delimitadorCSV: ","
                },
                
                exportacion: {
                    nombreBase: "Marcaciones_Consolidadas",
                    formatos: [".xlsx", ".csv", ".pdf"],
                    incluirCabecera: true,
                    incluirResumen: true,
                    incluirErrores: true,
                    separadorCSV: ";",
                    comprimirZip: false
                }
            },
            
            seguridad: {
                modo: "local",
                requiereAutenticacion: false,
                roles: [
                    {
                        id: "admin",
                        nombre: "Administrador",
                        permisos: ["all"]
                    },
                    {
                        id: "supervisor",
                        nombre: "Supervisor",
                        permisos: ["read", "export", "process"]
                    },
                    {
                        id: "usuario",
                        nombre: "Usuario",
                        permisos: ["read", "export"]
                    }
                ],
                
                backup: {
                    automatico: true,
                    frecuencia: "diario",
                    mantenerDias: 30,
                    ubicacion: "local",
                    encriptar: false
                }
            },
            
            notificaciones: {
                email: {
                    activo: false,
                    servidor: "smtp.gmail.com",
                    puerto: 587,
                    seguridad: "tls",
                    usuario: "notificaciones@fias.org",
                    notificarErrores: true,
                    notificarProcesos: true
                },
                
                sistema: {
                    mostrarNotificaciones: true,
                    tiempoVisible: 5000,
                    sonido: true,
                    vibrar: false
                }
            },
            
            reportes: {
                generarAutomatico: true,
                formatoPredeterminado: "excel",
                incluirGraficos: true,
                enviarEmail: false,
                
                periodos: {
                    diario: true,
                    semanal: true,
                    mensual: true,
                    personalizado: true
                },
                
                metricas: {
                    asistencia: true,
                    puntualidad: true,
                    horasTrabajadas: true,
                    horasExtra: true,
                    tardanzas: true,
                    ausencias: true
                }
            },
            
            proyectos: {
                activos: [
                    "FIAS", "FEIG", "FAP", "BIOECONOMIA",
                    "CONSERVA_AVES", "PASNAP-INABIO", "PASF"
                ],
                
                colores: {
                    FIAS: "#2c3e50",
                    FEIG: "#27ae60",
                    FAP: "#3498db",
                    BIOECONOMIA: "#9b59b6",
                    CONSERVA_AVES: "#e74c3c",
                    PASNAP-INABIO: "#f39c12",
                    PASF: "#1abc9c",
                    DEFAULT: "#95a5a6"
                },
                
                configuracion: {
                    permitirNuevos: true,
                    autoIncrementarId: true,
                    formatoIdProyecto: "PROY-{siglas}-{secuencia}"
                }
            },
            
            ui: {
                tema: "claro",
                colores: {
                    primario: "#2c3e50",
                    secundario: "#3498db",
                    exito: "#27ae60",
                    peligro: "#e74c3c",
                    advertencia: "#f39c12",
                    info: "#9b59b6"
                },
                
                idioma: "es",
                formatoMoneda: "USD",
                mostrarAyuda: true,
                animaciones: true
            },
            
            integraciones: {
                teams: {
                    api: false,
                    webhook: false,
                    frecuenciaSincronizacion: "diaria"
                },
                
                biometrico: {
                    tipo: "archivo",
                    marca: "ZKTeco",
                    modelo: "iClock 880",
                    protocolo: "TCP/IP"
                },
                
                nube: {
                    drive: false,
                    dropbox: false,
                    onedrive: false,
                    googleSheets: false
                }
            },
            
            depuracion: {
                nivelLog: "info",
                guardarLogs: true,
                mostrarConsola: false,
                reportarErrores: true
            },
            
            actualizacion: {
                automatica: false,
                urlActualizaciones: "https://api.fias.org/sistema-marcaciones/version",
                frecuenciaVerificacion: "semanal"
            }
        };
        
        this.cargarConfiguracionGuardada();
    }
    
    // Cargar configuración guardada
    cargarConfiguracionGuardada() {
        try {
            const guardada = localStorage.getItem('configFIAS');
            if (guardada) {
                const configGuardada = JSON.parse(guardada);
                this.config = this.mergeConfiguraciones(this.config, configGuardada);
                console.log('Configuración cargada desde almacenamiento local');
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
        }
    }
    
    // Guardar configuración
    guardarConfiguracion() {
        try {
            localStorage.setItem('configFIAS', JSON.stringify(this.config, null, 2));
            console.log('Configuración guardada correctamente');
            return true;
        } catch (error) {
            console.error('Error guardando configuración:', error);
            return false;
        }
    }
    
    // Combinar configuraciones
    mergeConfiguraciones(base, personalizada) {
        const resultado = { ...base };
        
        for (const key in personalizada) {
            if (personalizada[key] && typeof personalizada[key] === 'object' && !Array.isArray(personalizada[key])) {
                resultado[key] = this.mergeConfiguraciones(base[key] || {}, personalizada[key]);
            } else {
                resultado[key] = personalizada[key];
            }
        }
        
        return resultado;
    }
    
    // Obtener valor de configuración
    obtener(key) {
        const keys = key.split('.');
        let valor = this.config;
        
        for (const k of keys) {
            if (valor[k] === undefined) {
                console.warn(`Clave de configuración no encontrada: ${key}`);
                return null;
            }
            valor = valor[k];
        }
        
        return valor;
    }
    
    // Establecer valor de configuración
    establecer(key, valor) {
        const keys = key.split('.');
        let config = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!config[keys[i]] || typeof config[keys[i]] !== 'object') {
                config[keys[i]] = {};
            }
            config = config[keys[i]];
        }
        
        config[keys[keys.length - 1]] = valor;
        this.guardarConfiguracion();
    }
    
    // Restaurar configuración por defecto
    restaurarPorDefecto() {
        localStorage.removeItem('configFIAS');
        location.reload();
    }
    
    // Exportar configuración
    exportar() {
        const dataStr = JSON.stringify(this.config, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const fecha = new Date().toISOString().split('T')[0];
        const nombreArchivo = `configuracion_fias_${fecha}.json`;
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = nombreArchivo;
        link.click();
    }
    
    // Importar configuración
    importar(archivo) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const configImportada = JSON.parse(e.target.result);
                    this.config = this.mergeConfiguraciones(this.config, configImportada);
                    this.guardarConfiguracion();
                    resolve(true);
                } catch (error) {
                    reject(new Error('Error al parsear el archivo de configuración'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(archivo);
        });
    }
    
    // Obtener configuración para UI
    obtenerParaUI() {
        return {
            horarios: {
                entrada: this.config.procesamiento.horarios.horaEntradaEstandar,
                salida: this.config.procesamiento.horarios.horaSalidaEstandar,
                toleranciaEntrada: this.config.procesamiento.horarios.toleranciaEntrada,
                toleranciaSalida: this.config.procesamiento.horarios.toleranciaSalida
            },
            
            validaciones: this.config.procesamiento.validaciones,
            
            exportacion: {
                formato: this.config.archivos.exportacion.formatos[0],
                separador: this.config.archivos.exportacion.separadorCSV,
                incluirResumen: this.config.archivos.exportacion.incluirResumen
            },
            
            ui: this.config.ui,
            
            proyectos: this.config.proyectos
        };
    }
    
    // Guardar desde UI
    guardarDesdeUI(formData) {
        try {
            // Actualizar horarios
            this.config.procesamiento.horarios.horaEntradaEstandar = formData.horaEntrada;
            this.config.procesamiento.horarios.horaSalidaEstandar = formData.horaSalida;
            this.config.procesamiento.horarios.toleranciaEntrada = parseInt(formData.toleranciaEntrada);
            this.config.procesamiento.horarios.toleranciaSalida = parseInt(formData.toleranciaSalida);
            
            // Actualizar validaciones
            this.config.procesamiento.validaciones = {
                ...this.config.procesamiento.validaciones,
                ...formData.validaciones
            };
            
            // Actualizar exportación
            this.config.archivos.exportacion = {
                ...this.config.archivos.exportacion,
                ...formData.exportacion
            };
            
            // Actualizar UI
            this.config.ui = {
                ...this.config.ui,
                ...formData.ui
            };
            
            // Guardar
            this.guardarConfiguracion();
            
            return { success: true, message: 'Configuración actualizada correctamente' };
            
        } catch (error) {
            return { success: false, message: `Error: ${error.message}` };
        }
    }
}

// Instancia global de configuración
const configSistema = new ConfiguracionSistema();

// Funciones de utilidad para configuración
function formatHoraParaInput(horaStr) {
    if (!horaStr) return '08:30';
    return horaStr.substring(0, 5);
}

function parseHoraDesdeInput(horaInput) {
    return `${horaInput}:00`;
}

// Inicializar configuración en páginas que la necesiten
if (document.getElementById('configForm')) {
    inicializarConfiguracionUI();
}

function inicializarConfiguracionUI() {
    const config = configSistema.obtenerParaUI();
    
    // Llenar formulario con valores actuales
    document.getElementById('horaEntrada').value = formatHoraParaInput(config.horarios.entrada);
    document.getElementById('horaSalida').value = formatHoraParaInput(config.horarios.salida);
    document.getElementById('toleranciaEntrada').value = config.horarios.toleranciaEntrada;
    document.getElementById('toleranciaSalida').value = config.horarios.toleranciaSalida;
    
    // Checkboxes de validaciones
    Object.keys(config.validaciones).forEach(key => {
        const checkbox = document.getElementById(`val_${key}`);
        if (checkbox) {
            checkbox.checked = config.validaciones[key];
        }
    });
    
    // Select de formato exportación
    const selectFormato = document.getElementById('formatoExportacion');
    if (selectFormato) {
        selectFormato.value = config.exportacion.formato.replace('.', '');
    }
    
    // Select de separador CSV
    const selectSeparador = document.getElementById('separadorCSV');
    if (selectSeparador) {
        selectSeparador.value = config.exportacion.separador;
    }
    
    // Checkbox de resumen
    const chkResumen = document.getElementById('incluirResumen');
    if (chkResumen) {
        chkResumen.checked = config.exportacion.incluirResumen;
    }
    
    // Configuración de UI
    const selectTema = document.getElementById('temaUI');
    if (selectTema) {
        selectTema.value = config.ui.tema;
    }
    
    const selectIdioma = document.getElementById('idiomaUI');
    if (selectIdioma) {
        selectIdioma.value = config.ui.idioma;
    }
    
    const chkAyuda = document.getElementById('mostrarAyuda');
    if (chkAyuda) {
        chkAyuda.checked = config.ui.mostrarAyuda;
    }
    
    const chkAnimaciones = document.getElementById('animacionesUI');
    if (chkAnimaciones) {
        chkAnimaciones.checked = config.ui.animaciones;
    }
}

// Manejar envío del formulario de configuración
function guardarConfiguracionUI(event) {
    event.preventDefault();
    
    const formData = {
        horaEntrada: parseHoraDesdeInput(document.getElementById('horaEntrada').value),
        horaSalida: parseHoraDesdeInput(document.getElementById('horaSalida').value),
        toleranciaEntrada: parseInt(document.getElementById('toleranciaEntrada').value),
        toleranciaSalida: parseInt(document.getElementById('toleranciaSalida').value),
        
        validaciones: {
            validarHorarios: document.getElementById('val_validarHorarios').checked,
            validarDuplicados: document.getElementById('val_validarDuplicados').checked,
            validarFeriados: document.getElementById('val_validarFeriados').checked,
            validarFinSemana: document.getElementById('val_validarFinSemana').checked,
            marcarTardanzas: document.getElementById('val_marcarTardanzas').checked,
            marcarHorasExtra: document.getElementById('val_marcarHorasExtra').checked
        },
        
        exportacion: {
            formato: `.${document.getElementById('formatoExportacion').value}`,
            separadorCSV: document.getElementById('separadorCSV').value,
            incluirResumen: document.getElementById('incluirResumen').checked
        },
        
        ui: {
            tema: document.getElementById('temaUI').value,
            idioma: document.getElementById('idiomaUI').value,
            mostrarAyuda: document.getElementById('mostrarAyuda').checked,
            animaciones: document.getElementById('animacionesUI').checked
        }
    };
    
    const resultado = configSistema.guardarDesdeUI(formData);
    
    if (resultado.success) {
        mostrarMensajeConfig('✅ ' + resultado.message, 'success');
        
        // Recargar después de 2 segundos para aplicar cambios
        setTimeout(() => {
            location.reload();
        }, 2000);
        
    } else {
        mostrarMensajeConfig('❌ ' + resultado.message, 'error');
    }
}

// Mostrar mensajes en la interfaz de configuración
function mostrarMensajeConfig(mensaje, tipo) {
    const contenedor = document.getElementById('mensajesConfig');
    if (!contenedor) return;
    
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-config ${tipo}`;
    mensajeDiv.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${mensaje}</span>
        <button onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    contenedor.appendChild(mensajeDiv);
    
    setTimeout(() => {
        if (mensajeDiv.parentElement) {
            mensajeDiv.remove();
        }
    }, 5000);
}

// Exportar configuración
function exportarConfiguracion() {
    configSistema.exportar();
}

// Importar configuración
function importarConfiguracion(event) {
    const archivo = event.target.files[0];
    if (!archivo) return;
    
    configSistema.importar(archivo)
        .then(() => {
            mostrarMensajeConfig('✅ Configuración importada correctamente', 'success');
            setTimeout(() => location.reload(), 2000);
        })
        .catch(error => {
            mostrarMensajeConfig(`❌ ${error.message}`, 'error');
        });
    
    // Resetear input
    event.target.value = '';
}

// Restaurar configuración por defecto
function restaurarConfiguracion() {
    if (confirm('¿Estás seguro de restaurar la configuración por defecto?\nSe perderán todas las personalizaciones.')) {
        configSistema.restaurarPorDefecto();
    }
}

// Mostrar información del sistema
function mostrarInfoSistema() {
    const info = configSistema.config;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3><i class="fas fa-info-circle"></i> Información del Sistema</h3>
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            </div>
            <div class="modal-body">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">Sistema:</span>
                        <span class="info-value">${info.sistema.nombre}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Versión:</span>
                        <span class="info-value">${info.version}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Organización:</span>
                        <span class="info-value">${info.sistema.organizacion}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Desarrollador:</span>
                        <span class="info-value">${info.sistema.desarrollador}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Contacto:</span>
                        <span class="info-value">${info.sistema.contacto}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Descripción:</span>
                        <span class="info-value">${info.sistema.descripcion}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.style.display = 'flex';
}

// Inicializar al cargar la página de configuración
document.addEventListener('DOMContentLoaded', function() {
    // Configurar event listeners si estamos en la página de configuración
    const formConfig = document.getElementById('configForm');
    if (formConfig) {
        formConfig.addEventListener('submit', guardarConfiguracionUI);
        
        document.getElementById('btnExportConfig').addEventListener('click', exportarConfiguracion);
        document.getElementById('btnImportConfig').addEventListener('change', importarConfiguracion);
        document.getElementById('btnRestaurarConfig').addEventListener('click', restaurarConfiguracion);
        document.getElementById('btnInfoSistema').addEventListener('click', mostrarInfoSistema);
    }
});

// Exportar para uso global
window.configSistema = configSistema;