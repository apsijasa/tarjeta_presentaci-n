// Script para aplicar el header unificado en todas las páginas de template

/**
 * Función para aplicar el header unificado a la página actual
 * Esta función identifica el header existente y aplica los estilos unificados
 */
function applyUnifiedHeader() {
    // Buscar el elemento header existente
    // Posibles selectores basados en las plantillas vistas
    const headerSelectors = [
        'header', 
        '.header', 
        '.project-hero', 
        '.hero-section', 
        '.hero'
    ];
    
    let headerElement = null;
    for (const selector of headerSelectors) {
        const element = document.querySelector(selector);
        if (element) {
            headerElement = element;
            break;
        }
    }
    
    // Si no se encontró un header, salir
    if (!headerElement) {
        console.warn('No se encontró un elemento header para unificar');
        return;
    }
    
    // Aplicar clase unificada al header encontrado
    headerElement.classList.add('unified-header');
    
    // Verificar si ya tiene un div para el patrón
    let patternElement = headerElement.querySelector('.header-pattern, .header-bg, .header-overlay');
    
    // Si no existe, crearlo
    if (!patternElement) {
        patternElement = document.createElement('div');
        patternElement.className = 'unified-header-pattern';
        headerElement.prepend(patternElement);
    } else {
        // Si existe, asegurar que tenga la clase correcta
        patternElement.className = 'unified-header-pattern';
    }
    
    // Buscar el contenido principal del header
    let contentElement = headerElement.querySelector('.header-content, .hero-content, .project-hero-content');
    
    // Si no existe un contenedor específico, envolver el contenido en uno nuevo
    if (!contentElement) {
        // Crear contenedor
        contentElement = document.createElement('div');
        contentElement.className = 'unified-header-content';
        
        // Mover todos los elementos hijos (excepto el patrón) al nuevo contenedor
        const children = Array.from(headerElement.children);
        children.forEach(child => {
            if (child !== patternElement) {
                contentElement.appendChild(child);
            }
        });
        
        // Añadir el contenedor al header
        headerElement.appendChild(contentElement);
    } else {
        // Si existe, asegurar que tenga la clase correcta
        contentElement.classList.add('unified-header-content');
    }
    
    // Opcional: Añadir animación al gradiente
    // headerElement.classList.add('animated-bg');
    
    console.log('Header unificado aplicado correctamente');
}

/**
 * Función para asegurar que el botón de volver al portafolio tenga estilo unificado
 */
function styleBackButton() {
    const backBtn = document.querySelector('a[href="/index.html"].back-btn');
    if (backBtn) {
        backBtn.classList.add('unified-back-btn');
    }
}

/**
 * Función para cargar el CSS unificado
 */
function loadUnifiedStyles() {
    // Verificar si los estilos ya están cargados
    if (document.getElementById('unified-header-styles')) {
        return;
    }
    
    // Crear elemento de estilo
    const styleElement = document.createElement('style');
    styleElement.id = 'unified-header-styles';
    styleElement.textContent = `
    /* Estilos unificados para headers de todas las páginas de template */

    /* Variables globales */
    :root {
        --header-primary: #34495e;
        --header-secondary: #2c3e50;
        --header-text: #ffffff;
        --header-accent: #3498db;
        --header-pattern-opacity: 0.1;
        --border-radius: 0px;
        --transition: all 0.3s ease;
    }

    /* Estilos base del header unificado */
    .unified-header {
        background: linear-gradient(135deg, var(--header-primary), var(--header-secondary));
        color: var(--header-text);
        padding: 60px 20px;
        position: relative;
        overflow: hidden;
        text-align: center;
    }

    /* Patrón de fondo para todos los headers */
    .unified-header-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url('data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05" fill-rule="evenodd"%3E%3Ccircle cx="10" cy="10" r="3"/%3E%3C/g%3E%3C/svg%3E');
        opacity: var(--header-pattern-opacity);
        z-index: 0;
    }

    /* Animación de gradiente opcional */
    .unified-header.animated-bg {
        background-size: 400% 400%;
        animation: gradientAnimation 15s ease infinite;
    }

    @keyframes gradientAnimation {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }

    /* Contenido del header */
    .unified-header-content {
        position: relative;
        z-index: 1;
        max-width: 900px;
        margin: 0 auto;
    }

    /* Títulos */
    .unified-header h1 {
        font-size: 2.5rem;
        font-weight: 700;
        margin-bottom: 15px;
    }

    .unified-header p {
        font-size: 1.2rem;
        opacity: 0.9;
        max-width: 700px;
        margin: 0 auto 20px;
    }

    /* Badges o etiquetas */
    .unified-header-badge {
        display: inline-block;
        background-color: rgba(255, 255, 255, 0.15);
        padding: 5px 15px;
        border-radius: 30px;
        margin-top: 10px;
        font-size: 0.9rem;
    }

    .unified-header-badge i {
        margin-right: 5px;
    }

    /* Botón de navegación hacia atrás común */
    .unified-back-btn {
        display: inline-flex;
        align-items: center;
        color: var(--header-primary);
        text-decoration: none;
        font-weight: 600;
        transition: var(--transition);
        margin-bottom: 20px;
    }

    .unified-back-btn i {
        margin-right: 10px;
    }

    .unified-back-btn:hover {
        transform: translateX(-5px);
    }

    /* Media queries para responsive */
    @media (max-width: 768px) {
        .unified-header h1 {
            font-size: 2rem;
        }
        
        .unified-header p {
            font-size: 1rem;
        }
    }
    `;
    
    // Añadir al head
    document.head.appendChild(styleElement);
}

/**
 * Función principal para implementar todo
 */
function implementUnifiedHeader() {
    // Cargar estilos
    loadUnifiedStyles();
    
    // Aplicar header unificado
    applyUnifiedHeader();
    
    // Asegurar estilo del botón de volver
    styleBackButton();
}

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', implementUnifiedHeader);

// También podemos ejecutarlo inmediatamente si el DOM ya está cargado
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    implementUnifiedHeader();
}   