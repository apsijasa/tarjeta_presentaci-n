// Cambiar entre pestañas
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remover clase active de todos los botones y contenidos
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Agregar clase active al botón clickeado y su contenido
        btn.classList.add('active');
        const tabId = btn.getAttribute('data-tab');
        document.getElementById(tabId).classList.add('active');
    });
});

// Descargar código QR
document.getElementById('downloadQR').addEventListener('click', () => {
    const canvas = document.querySelector('#qrcode canvas');
    if (canvas) {
        const link = document.createElement('a');
        link.download = 'mi-codigo-qr.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } else {
        console.error('No se pudo encontrar el canvas del código QR');
    }
});

// Modo oscuro
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    
    // Cambiar icono del botón
    const icon = darkModeToggle.querySelector('i');
    if (body.classList.contains('dark-mode')) {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    } else {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    }
    
    // Guardar preferencia en localStorage
    localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
    
    // Actualizar código QR con el nuevo color del tema
    updateQRCode();
});

// Crear o actualizar el código QR
function generateQRCode(text) {
    try {
        // Acortar el texto si es demasiado largo para evitar el error de overflow
        let finalText = text;
        if (text.length > 500) {
            console.warn('Texto del QR demasiado largo, se acortará para evitar overflow');
            // Simplificamos la vCard para reducir su tamaño
            const lines = text.split('\n');
            const simplifiedLines = [];
            
            // Mantener solo las líneas esenciales
            for (const line of lines) {
                if (line.startsWith('BEGIN:') || 
                    line.startsWith('END:') || 
                    line.startsWith('VERSION:') ||
                    line.startsWith('FN:') ||
                    line.startsWith('TEL:')) {
                    simplifiedLines.push(line);
                }
            }
            
            finalText = simplifiedLines.join('\n');
        }
        
        // Intentar usar la función de fallback si está disponible
        if (typeof window.createQRCodeWithFallback === 'function') {
            console.log('Usando función de respaldo para generar el código QR');
            window.createQRCodeWithFallback('qrcode', finalText);
            return;
        }
        
        // Si no está disponible la función de fallback, usamos la implementación original
        const qrcodeContainer = document.getElementById('qrcode');
        if (!qrcodeContainer) {
            console.error('Contenedor del código QR no encontrado');
            return;
        }
        
        qrcodeContainer.innerHTML = '';
        
        // Verificar si la biblioteca qrcode está disponible
        if (typeof qrcode === 'undefined') {
            console.error('La biblioteca QR code no está cargada correctamente');
            
            // Crear un mensaje de error visual
            const errorMsg = document.createElement('div');
            errorMsg.textContent = 'No se pudo generar el código QR. Intente recargar la página.';
            errorMsg.style.padding = '20px';
            errorMsg.style.color = 'red';
            qrcodeContainer.appendChild(errorMsg);
            return;
        }
        
        // Crear un nuevo código QR con mayor capacidad 
        // (tipo 8 en lugar de 4, y nivel de corrección L en lugar de M)
        const qr = qrcode(8, 'L');
        qr.addData(finalText);
        qr.make();
        
        // Obtener el HTML del código QR y agregarlo al contenedor
        const colorMode = body.classList.contains('dark-mode') ? 'dark' : 'light';
        const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();
        
        // Crear un canvas para el código QR
        const canvas = document.createElement('canvas');
        const size = 200;
        canvas.width = size;
        canvas.height = size;
        
        const ctx = canvas.getContext('2d');
        const moduleCount = qr.getModuleCount();
        const moduleSize = size / moduleCount;
        
        // Fondo
        ctx.fillStyle = colorMode === 'dark' ? '#2d2d2d' : '#ffffff';
        ctx.fillRect(0, 0, size, size);
        
        // Dibujar los módulos del QR
        ctx.fillStyle = primaryColor || '#34495e';
        
        for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
                if (qr.isDark(row, col)) {
                    ctx.fillRect(
                        col * moduleSize,
                        row * moduleSize,
                        moduleSize,
                        moduleSize
                    );
                }
            }
        }
        
        // Agregar el canvas al contenedor
        qrcodeContainer.appendChild(canvas);
        
    } catch (error) {
        console.error('Error al generar el código QR:', error);
        
        // Capturar específicamente el error de overflow
        if (error.message && error.message.includes('overflow')) {
            console.warn('Error de overflow en el código QR. Intentando con una versión simplificada...');
            
            // Crear un QR simplificado solo con la información básica
            const basicInfo = 'BEGIN:VCARD\nVERSION:3.0\nFN:Mi Contacto\nTEL:123456789\nEND:VCARD';
            
            try {
                // Intentar generar un QR más simple
                const qrcodeContainer = document.getElementById('qrcode');
                if (qrcodeContainer) {
                    qrcodeContainer.innerHTML = '';
                    
                    const qr = qrcode(4, 'L');
                    qr.addData(basicInfo);
                    qr.make();
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = 200;
                    canvas.height = 200;
                    
                    const ctx = canvas.getContext('2d');
                    const moduleCount = qr.getModuleCount();
                    const moduleSize = 200 / moduleCount;
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, 200, 200);
                    
                    ctx.fillStyle = '#34495e';
                    
                    for (let row = 0; row < moduleCount; row++) {
                        for (let col = 0; col < moduleCount; col++) {
                            if (qr.isDark(row, col)) {
                                ctx.fillRect(
                                    col * moduleSize,
                                    row * moduleSize,
                                    moduleSize,
                                    moduleSize
                                );
                            }
                        }
                    }
                    
                    qrcodeContainer.appendChild(canvas);
                    return;
                }
            } catch (fallbackError) {
                console.error('Error al generar QR simplificado:', fallbackError);
            }
        }
        
        // Intentar usar la función de fallback como último recurso
        if (typeof window.createQRCodeWithFallback === 'function') {
            console.log('Usando función de respaldo para generar el código QR después de un error');
            window.createQRCodeWithFallback('qrcode', 'BEGIN:VCARD\nVERSION:3.0\nFN:Contacto\nEND:VCARD');
        } else {
            // Si todo falla, mostramos un mensaje de error
            const qrcodeContainer = document.getElementById('qrcode');
            if (qrcodeContainer) {
                qrcodeContainer.innerHTML = '<div style="padding: 20px; color: red;">Error al generar el código QR. Por favor recargue la página.</div>';
            }
        }
    }
}

// Actualizar el QR con la información correcta
function updateQRCode() {
    try {
        // Obtener el número de teléfono actual (sin paréntesis ni espacios)
        const phoneElement = document.getElementById('phoneNumber');
        if (!phoneElement) {
            console.error('Elemento de teléfono no encontrado');
            return;
        }
        
        const phoneNumber = phoneElement.textContent.replace(/[()'\s-]/g, '');
        
        // Actualizar los enlaces de acción de teléfono
        const phoneActions = document.querySelectorAll('.phone-action');
        if (phoneActions.length >= 2) {
            // Llamada telefónica - primer enlace
            phoneActions[0].href = `tel:+${phoneNumber}`;
            
            // WhatsApp - segundo enlace
            phoneActions[1].href = `https://wa.me/${phoneNumber}`;
        }
        
        // Crear una versión simplificada de vCard para evitar overflow
        const name = document.querySelector('.name').textContent.trim() || 'Tu Nombre';
        // Limitar el nombre a 30 caracteres para evitar overflow
        const shortName = name.length > 30 ? name.substring(0, 30) : name;
        
        const title = document.querySelector('.title').textContent.trim() || 'Desarrollador Web';
        // Limitar el título a 30 caracteres
        const shortTitle = title.length > 30 ? title.substring(0, 30) : title;
        
        const emailElement = document.querySelector('.contact-info li:first-child');
        let email = 'correo@ejemplo.com';
        if (emailElement) {
            const emailText = emailElement.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            // Extraer solo la dirección de correo electrónico
            const emailMatch = emailText.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            email = emailMatch ? emailMatch[0] : 'correo@ejemplo.com';
        }
        
        const websiteElement = document.querySelector('.contact-info li:last-child');
        let website = 'www.tusitio.com';
        if (websiteElement) {
            const websiteText = websiteElement.textContent.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
            // Extraer solo la URL
            const urlMatch = websiteText.match(/([a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/);
            website = urlMatch ? urlMatch[0] : 'www.tusitio.com';
        }

        // Crear texto vCard simplificado
        const vCardText = 
`BEGIN:VCARD
VERSION:3.0
FN:${shortName}
TITLE:${shortTitle}
EMAIL:${email}
TEL:${phoneNumber}
URL:${website}
END:VCARD`;

        // Generar el código QR
        generateQRCode(vCardText);
    } catch (error) {
        console.error('Error al actualizar el código QR:', error);
        // Intentar generar un QR básico en caso de error
        try {
            generateQRCode('BEGIN:VCARD\nVERSION:3.0\nFN:Mi Contacto\nEND:VCARD');
        } catch (e) {
            console.error('No se pudo generar ni siquiera el QR básico:', e);
        }
    }
}

// Animación suave al scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetSelector = this.getAttribute('href');
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Función para convertir texto plano de URL a enlace clickeable
function makeWebsiteClickable(element) {
    // Verificar si el elemento contiene un ícono de globo (fa-globe)
    const icon = element.querySelector('i');
    if (icon && icon.classList.contains('fa-globe')) {
        // Obtener el texto actual (la URL)
        const urlText = element.textContent.trim();
        
        // Crear nuevo contenido con enlace
        element.innerHTML = '';
        element.appendChild(icon.cloneNode(true));
        
        // Crear enlace
        const link = document.createElement('a');
        // Asegurarse de que la URL tenga http:// o https://
        let href = urlText;
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            href = 'http://' + href;
        }
        link.href = href;
        link.target = '_blank'; // Abrir en nueva pestaña
        link.className = 'website-link';
        link.textContent = urlText; // Sin espacio adicional
        
        element.appendChild(link);
    }
}

// Hacer que la información del perfil sea editable
document.addEventListener('DOMContentLoaded', () => {
    const editableElements = document.querySelectorAll('.name, .title, .contact-info li');
    
    // Hacer que el sitio web sea clickeable al inicio
    const websiteElement = document.querySelector('.contact-info li:last-child');
    if (websiteElement) {
        makeWebsiteClickable(websiteElement);
    }
    
    editableElements.forEach(element => {
        // No hacemos editable el ícono
        if (element.tagName.toLowerCase() === 'li') {
            const text = element.classList.contains('phone-item') 
                ? element.querySelector('#phoneNumber') 
                : element.childNodes[1]; // El texto después del ícono
                
            if (text) {
                if (element.classList.contains('phone-item')) {
                    makeLiEditable(element);
                } else {
                    if (typeof text.nodeValue === 'string') {
                        text.nodeValue = text.nodeValue.trim();
                    }
                    makeLiEditable(element);
                }
            }
        } else {
            makeEditable(element);
        }
    });
    
    function makeEditable(element) {
        element.setAttribute('title', 'Haz doble clic para editar');
        
        element.addEventListener('dblclick', function() {
            const value = this.textContent;
            const input = document.createElement('input');
            input.value = value;
            input.className = this.className;
            input.style.width = '100%';
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            input.style.border = 'none';
            input.style.borderBottom = '1px solid white';
            input.style.outline = 'none';
            input.style.color = 'white';
            input.style.fontFamily = window.getComputedStyle(this).fontFamily;
            input.style.fontSize = window.getComputedStyle(this).fontSize;
            input.style.fontWeight = window.getComputedStyle(this).fontWeight;
            
            this.textContent = '';
            this.appendChild(input);
            input.focus();
            
            input.addEventListener('blur', function() {
                if (this.value.trim() !== '') {
                    element.textContent = this.value;
                    localStorage.setItem(element.className, this.value);
                    updateQRCode(); // Actualizar QR con la nueva información
                } else {
                    element.textContent = value; // Restaurar valor original si está vacío
                }
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                } else if (e.key === 'Escape') {
                    element.textContent = value; // Restaurar valor original
                }
            });
        });
    }
    
    function makeLiEditable(element) {
        element.setAttribute('title', 'Haz doble clic para editar');
        
        element.addEventListener('dblclick', function() {
            // Si es el elemento de teléfono, maneja de forma especial
            if (element.classList.contains('phone-item')) {
                const phoneNumberElement = element.querySelector('#phoneNumber');
                if (phoneNumberElement) {
                    const icon = element.querySelector('i').cloneNode(true);
                    const text = phoneNumberElement.textContent.trim();
                    
                    const input = document.createElement('input');
                    input.value = text;
                    input.style.width = 'calc(100% - 30px)';
                    input.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    input.style.border = 'none';
                    input.style.borderBottom = '1px solid white';
                    input.style.outline = 'none';
                    input.style.color = 'white';
                    input.style.marginLeft = '10px';
                    
                    // Guardar los elementos de acción
                    const actionsDiv = element.querySelector('.phone-actions');
                    
                    // Limpiar y reconstruir
                    element.innerHTML = '';
                    element.appendChild(icon);
                    element.appendChild(input);
                    if (actionsDiv) {
                        element.appendChild(actionsDiv);
                    }
                    
                    input.focus();
                    
                    input.addEventListener('blur', function() {
                        if (this.value.trim() !== '') {
                            element.innerHTML = '';
                            element.appendChild(icon);
                            
                            const span = document.createElement('span');
                            span.id = 'phoneNumber';
                            span.textContent = this.value; // Sin espacio adicional
                            element.appendChild(span);
                            
                            if (actionsDiv) {
                                element.appendChild(actionsDiv);
                            }
                            
                            // Guardar en localStorage
                            const identifier = 'contact-' + Array.from(element.parentNode.children).indexOf(element);
                            localStorage.setItem(identifier, this.value);
                            
                            // Actualizar QR y enlaces
                            updateQRCode();
                        } else {
                            element.innerHTML = '';
                            element.appendChild(icon);
                            
                            const span = document.createElement('span');
                            span.id = 'phoneNumber';
                            span.textContent = text; // Sin espacio adicional
                            element.appendChild(span);
                            
                            if (actionsDiv) {
                                element.appendChild(actionsDiv);
                            }
                        }
                    });
                    
                    input.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            this.blur();
                        } else if (e.key === 'Escape') {
                            element.innerHTML = '';
                            element.appendChild(icon);
                            
                            const span = document.createElement('span');
                            span.id = 'phoneNumber';
                            span.textContent = text; // Sin espacio adicional
                            element.appendChild(span);
                            
                            if (actionsDiv) {
                                element.appendChild(actionsDiv);
                            }
                        }
                    });
                }
                return;
            }
            
            // Guardar el estado actual antes de editar
            let isWebsiteLink = false;
            let websiteUrl = '';
            
            // Verificar si es el elemento del sitio web
            const icon = element.querySelector('i');
            if (icon && icon.classList.contains('fa-globe')) {
                isWebsiteLink = true;
                const link = element.querySelector('a');
                if (link) {
                    websiteUrl = link.textContent.trim();
                } else {
                    websiteUrl = element.textContent.trim();
                }
            } else {
                // Para otros elementos, obtener el texto normal
                websiteUrl = element.childNodes[1] ? element.childNodes[1].nodeValue.trim() : '';
            }
            
            // Crear input para edición
            const inputValue = isWebsiteLink ? websiteUrl : (element.childNodes[1] ? element.childNodes[1].nodeValue.trim() : '');
            const iconClone = icon ? icon.cloneNode(true) : null;
            
            const input = document.createElement('input');
            input.value = inputValue;
            input.style.width = 'calc(100% - 30px)';
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            input.style.border = 'none';
            input.style.borderBottom = '1px solid white';
            input.style.outline = 'none';
            input.style.color = 'white';
            input.style.marginLeft = '10px';
            
            // Limpiar y agregar el input
            element.innerHTML = '';
            if (iconClone) element.appendChild(iconClone);
            element.appendChild(input);
            input.focus();
            
            input.addEventListener('blur', function() {
                if (this.value.trim() !== '') {
                    element.innerHTML = '';
                    if (iconClone) element.appendChild(iconClone);
                    
                    // Si es el elemento del sitio web
                    if (isWebsiteLink) {
                        // Crear enlace clickeable
                        const link = document.createElement('a');
                        // Asegurarse de que la URL tenga http:// o https://
                        let href = this.value.trim();
                        if (!href.startsWith('http://') && !href.startsWith('https://')) {
                            href = 'http://' + href;
                        }
                        link.href = href;
                        link.target = '_blank'; // Abrir en nueva pestaña
                        link.className = 'website-link';
                        link.textContent = this.value.trim(); // Sin espacio adicional
                        element.appendChild(link);
                    } else {
                        // Para otros elementos, agregar texto normal
                        const textNode = document.createTextNode(this.value);
                        element.appendChild(textNode);
                    }
                    
                    // Guardar en localStorage con un identificador único para cada elemento
                    const identifier = 'contact-' + Array.from(element.parentNode.children).indexOf(element);
                    localStorage.setItem(identifier, this.value);
                    
                    // Actualizar el QR con la nueva información
                    updateQRCode();
                } else {
                    // Restaurar el contenido original si está vacío
                    element.innerHTML = '';
                    if (iconClone) element.appendChild(iconClone);
                    
                    if (isWebsiteLink) {
                        // Restaurar el enlace
                        const link = document.createElement('a');
                        let href = websiteUrl;
                        if (!href.startsWith('http://') && !href.startsWith('https://')) {
                            href = 'http://' + href;
                        }
                        link.href = href;
                        link.target = '_blank';
                        link.className = 'website-link';
                        link.textContent = websiteUrl; // Sin espacio adicional
                        element.appendChild(link);
                    } else {
                        // Restaurar el texto normal
                        const textNode = document.createTextNode(websiteUrl);
                        element.appendChild(textNode);
                    }
                }
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                } else if (e.key === 'Escape') {
                    // Restaurar el contenido original
                    element.innerHTML = '';
                    if (iconClone) element.appendChild(iconClone);
                    
                    if (isWebsiteLink) {
                        // Restaurar el enlace
                        const link = document.createElement('a');
                        let href = websiteUrl;
                        if (!href.startsWith('http://') && !href.startsWith('https://')) {
                            href = 'http://' + href;
                        }
                        link.href = href;
                        link.target = '_blank';
                        link.className = 'website-link';
                        link.textContent = websiteUrl; // Sin espacio adicional
                        element.appendChild(link);
                    } else {
                        // Restaurar el texto normal
                        const textNode = document.createTextNode(websiteUrl);
                        element.appendChild(textNode);
                    }
                }
            });
        });
    }
});

// Inicializar la animación de hilos y otras funciones al cargar la página
window.addEventListener('load', () => {
    // Verificar si hay errores en la consola con la biblioteca QR Code
    try {
        if (typeof qrcode === 'undefined') {
            console.error('Biblioteca QR Code no encontrada. Intentando cargar una alternativa...');
            // Si hay problemas con la biblioteca, podemos intentar cargar una alternativa
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js';
            script.onload = function() {
                console.log('Biblioteca QR Code alternativa cargada con éxito');
                updateQRCode();
            };
            script.onerror = function() {
                console.error('No se pudo cargar la biblioteca QR Code alternativa');
            };
            document.head.appendChild(script);
        }
    } catch (error) {
        console.error('Error al verificar la biblioteca QR Code:', error);
    }

    // Inicializar animación de threads
    const threadsContainer = document.getElementById('threadsAnimation');
    if (threadsContainer) {
        // Color de las líneas: blanco #fbfcfc en formato RGB normalizado
        const lineColor = [0.98, 0.99, 0.99]; // Equivalente a #fbfcfc
        
        try {
            if (typeof ThreadsAnimation === 'function') {
                new ThreadsAnimation(threadsContainer, {
                    color: lineColor,
                    amplitude: 3.0, // Mayor amplitud para las ondas (3)
                    distance: 0.5,  // Mayor separación entre líneas (0.5)
                    enableMouseInteraction: true
                });
            } else {
                console.error('La clase ThreadsAnimation no está disponible');
            }
        } catch (error) {
            console.error('Error al inicializar la animación de hilos:', error);
        }
    }
    
    // Cargar datos guardados
    if (localStorage.getItem('name')) {
        document.querySelector('.name').textContent = localStorage.getItem('name');
    }
    
    if (localStorage.getItem('title')) {
        document.querySelector('.title').textContent = localStorage.getItem('title');
    }
    
    // Cargar datos de contacto guardados
    const contactItems = document.querySelectorAll('.contact-info li');
    contactItems.forEach((item, index) => {
        const savedValue = localStorage.getItem('contact-' + index);
        if (savedValue) {
            // Si es el elemento del teléfono (índice 1)
            if (index === 1 && item.classList.contains('phone-item')) {
                const phoneElement = item.querySelector('#phoneNumber');
                if (phoneElement) {
                    phoneElement.textContent = savedValue; // Sin espacio adicional
                }
            } else {
                const icon = item.querySelector('i').cloneNode(true);
                item.innerHTML = '';
                item.appendChild(icon);
                
                // Si es el último elemento (sitio web)
                if (index === contactItems.length - 1) {
                    // Crear enlace clickeable
                    const link = document.createElement('a');
                    // Asegurarse de que la URL tenga http:// o https://
                    let href = savedValue.trim();
                    if (!href.startsWith('http://') && !href.startsWith('https://')) {
                        href = 'http://' + href;
                    }
                    link.href = href;
                    link.target = '_blank'; // Abrir en nueva pestaña
                    link.className = 'website-link';
                    link.textContent = savedValue; // Sin espacio adicional
                    item.appendChild(link);
                } else {
                    // Para otros elementos, agregar texto normal
                    const textNode = document.createTextNode(savedValue);
                    item.appendChild(textNode);
                }
            }
        } else if (index === contactItems.length - 1) {
            // Si es el último elemento (sitio web) y no hay datos guardados
            makeWebsiteClickable(item);
        }
    });
    
    // Verificar preferencia guardada de modo oscuro
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const icon = document.querySelector('#darkModeToggle i');
        if (icon) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        }
    }
    
    // Actualizar QR después de cargar datos
    // Esperamos un momento para asegurarnos de que todos los scripts están cargados
    setTimeout(() => {
        try {
            updateQRCode();
        } catch (error) {
            console.error('Error al actualizar el QR en el inicio:', error);
        }
    }, 1000); // Aumentamos el tiempo de espera a 1 segundo para asegurar que todo esté cargado
});