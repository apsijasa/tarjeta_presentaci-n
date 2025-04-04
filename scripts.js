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

// Generar código QR
window.addEventListener('load', () => {
    const qrcode = new QRCode(document.getElementById("qrcode"), {
        text: "BEGIN:VCARD\nVERSION:3.0\nN:Apellido;Nombre\nFN:Tu Nombre\nTITLE:Desarrollador Web & Diseñador UX/UI\nEMAIL:correo@ejemplo.com\nTEL:(123) 456-7890\nURL:https://www.tusitio.com\nEND:VCARD",
        width: 200,
        height: 200,
        colorDark: "#4361ee",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
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

// Verificar preferencia guardada de modo oscuro
window.addEventListener('load', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        body.classList.add('dark-mode');
        const icon = darkModeToggle.querySelector('i');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

// Animación suave al scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Inicializar la animación de hilos en el encabezado
window.addEventListener('load', () => {
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
});

// Hacer que la información del perfil sea editable
document.addEventListener('DOMContentLoaded', () => {
    const editableElements = document.querySelectorAll('.name, .title, .contact-info li');
    
    editableElements.forEach(element => {
        // No hacemos editable el ícono
        if (element.tagName.toLowerCase() === 'li') {
            const text = element.childNodes[1]; // El texto después del ícono
            if (text) {
                text.nodeValue = text.nodeValue.trim();
                makeLiEditable(element);
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
            const icon = item.querySelector('i').cloneNode(true);
            item.innerHTML = '';
            item.appendChild(icon);
            item.appendChild(document.createTextNode(' ' + savedValue));
        }
    });
});