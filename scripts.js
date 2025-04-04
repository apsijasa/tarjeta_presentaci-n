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
});

// Actualizar el QR con la información correcta
function updateQRCode() {
    // Obtener el número de teléfono actual (sin paréntesis ni espacios)
    const phoneElement = document.getElementById('phoneNumber');
    if (!phoneElement) return;
    
    const phoneNumber = phoneElement.textContent.replace(/[()'\s-]/g, '');
    
    // Actualizar los enlaces de acción de teléfono
    const phoneActions = document.querySelectorAll('.phone-action');
    if (phoneActions.length >= 2) {
        // Llamada telefónica - primer enlace
        phoneActions[0].href = `tel:+${phoneNumber}`;
        
        // WhatsApp - segundo enlace
        phoneActions[1].href = `https://wa.me/${phoneNumber}`;
    }
    
    // Crear o actualizar el código QR
    if (document.getElementById('qrcode')) {
        // Limpiar el contenedor antes de crear un nuevo QR
        document.getElementById('qrcode').innerHTML = '';
        
        // Crear un nuevo código QR con la información actualizada
        new QRCode(document.getElementById("qrcode"), {
            text: `BEGIN:VCARD\nVERSION:3.0\nN:Apellido;Nombre\nFN:${document.querySelector('.name').textContent}\nTITLE:${document.querySelector('.title').textContent}\nEMAIL:${document.querySelector('.contact-info li:first-child').textContent.trim()}\nTEL:${phoneNumber}\nURL:${document.querySelector('.contact-info li:last-child').textContent.trim()}\nEND:VCARD`,
            width: 200,
            height: 200,
            colorDark: getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim(),
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// Animación suave al scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Hacer que la información del perfil sea editable
document.addEventListener('DOMContentLoaded', () => {
    const editableElements = document.querySelectorAll('.name, .title, .contact-info li');
    
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
                            span.textContent = ' ' + this.value;
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
                            span.textContent = ' ' + text;
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
                            span.textContent = ' ' + text;
                            element.appendChild(span);
                            
                            if (actionsDiv) {
                                element.appendChild(actionsDiv);
                            }
                        }
                    });
                }
                return;
            }
            
            const icon = this.querySelector('i').cloneNode(true);
            const text = this.childNodes[1].nodeValue.trim();
            
            const input = document.createElement('input');
            input.value = text;
            input.style.width = 'calc(100% - 30px)';
            input.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            input.style.border = 'none';
            input.style.borderBottom = '1px solid white';
            input.style.outline = 'none';
            input.style.color = 'white';
            input.style.marginLeft = '10px';
            
            this.innerHTML = '';
            this.appendChild(icon);
            this.appendChild(input);
            input.focus();
            
            input.addEventListener('blur', function() {
                if (this.value.trim() !== '') {
                    element.innerHTML = '';
                    element.appendChild(icon);
                    element.appendChild(document.createTextNode(' ' + this.value));
                    
                    // Guardar en localStorage con un identificador único para cada elemento
                    const identifier = 'contact-' + Array.from(element.parentNode.children).indexOf(element);
                    localStorage.setItem(identifier, this.value);
                    
                    // Actualizar el QR con la nueva información
                    updateQRCode();
                } else {
                    element.innerHTML = '';
                    element.appendChild(icon);
                    element.appendChild(document.createTextNode(' ' + text));
                }
            });
            
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    this.blur();
                } else if (e.key === 'Escape') {
                    element.innerHTML = '';
                    element.appendChild(icon);
                    element.appendChild(document.createTextNode(' ' + text));
                }
            });
        });
    }
});

// Inicializar la animación de hilos y otras funciones al cargar la página
window.addEventListener('load', () => {
    // Inicializar animación de threads
    const threadsContainer = document.getElementById('threadsAnimation');
    if (threadsContainer) {
        // Color de las líneas: blanco #fbfcfc en formato RGB normalizado
        const lineColor = [0.98, 0.99, 0.99]; // Equivalente a #fbfcfc
        
        new ThreadsAnimation(threadsContainer, {
            color: lineColor,
            amplitude: 3.0, // Mayor amplitud para las ondas (3)
            distance: 0.5,  // Mayor separación entre líneas (0.3 + 0.2 = 0.5)
            enableMouseInteraction: true
        });
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
                    phoneElement.textContent = ' ' + savedValue;
                }
            } else {
                const icon = item.querySelector('i').cloneNode(true);
                item.innerHTML = '';
                item.appendChild(icon);
                item.appendChild(document.createTextNode(' ' + savedValue));
            }
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
    updateQRCode();
});