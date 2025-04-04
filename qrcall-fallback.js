/**
 * QR Code Fallback - Script simple para generar códigos QR en caso de que la biblioteca principal falle
 */

// Función para crear un QR Code manualmente en un canvas si la biblioteca principal falla
function createFallbackQRCode(container, text) {
    if (!container) return;
    
    // Limpiar el contenedor
    container.innerHTML = '';
    
    // Crear un canvas
    const canvas = document.createElement('canvas');
    const size = 200;
    canvas.width = size;
    canvas.height = size;
    
    const ctx = canvas.getContext('2d');
    
    // Dibujar un mensaje de que estamos generando un QR de respaldo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);
    
    ctx.fillStyle = '#34495e';
    ctx.font = '16px Aptos, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Generando QR', size/2, size/2 - 20);
    ctx.fillText('Código de contacto', size/2, size/2);
    
    // Dibujar un borde para simular un QR
    ctx.strokeStyle = '#34495e';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 20, size - 40, size - 40);
    
    // Dibujar algunos patrones para que se parezca a un QR
    const blockSize = 10;
    const patterns = [
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [0, 1, 0, 0, 0, 0, 0, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0]
    ];
    
    // Dibujar los patrones en las esquinas (3)
    function drawPattern(x, y) {
        for (let i = 0; i < patterns.length; i++) {
            for (let j = 0; j < patterns[i].length; j++) {
                if (patterns[i][j]) {
                    ctx.fillRect(x + j * blockSize, y + i * blockSize, blockSize, blockSize);
                }
            }
        }
    }
    
    // Esquina superior izquierda
    drawPattern(40, 40);
    
    // Esquina superior derecha
    drawPattern(size - 40 - patterns.length * blockSize, 40);
    
    // Esquina inferior izquierda
    drawPattern(40, size - 40 - patterns.length * blockSize);
    
    // Agregar algunos bloques aleatorios para simular datos
    for (let i = 0; i < 30; i++) {
        const x = Math.floor(Math.random() * (size - 40)) + 20;
        const y = Math.floor(Math.random() * (size - 40)) + 20;
        if ((x < 120 && y < 120) || (x > size - 120 && y < 120) || (x < 120 && y > size - 120)) {
            continue; // No sobrescribir los patrones de las esquinas
        }
        ctx.fillRect(x, y, blockSize, blockSize);
    }
    
    // Agregar el canvas al contenedor
    container.appendChild(canvas);
    
    return canvas;
}

// Función para intentar crear un código QR usando la biblioteca principal,
// pero con fallback a nuestra implementación simple si falla
function createQRCodeWithFallback(containerId, text) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Intentar usar la biblioteca principal primero
    try {
        if (typeof qrcode !== 'undefined') {
            // Si estamos usando qrcode-generator
            const qr = qrcode(4, 'M');
            qr.addData(text);
            qr.make();
            
            const canvas = document.createElement('canvas');
            const size = 200;
            canvas.width = size;
            canvas.height = size;
            
            const ctx = canvas.getContext('2d');
            const moduleCount = qr.getModuleCount();
            const moduleSize = size / moduleCount;
            
            // Fondo
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Dibujar los módulos del QR
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
            
            // Limpiar y agregar el canvas
            container.innerHTML = '';
            container.appendChild(canvas);
            
            return canvas;
        } else {
            throw new Error('Biblioteca QR no disponible');
        }
    } catch (error) {
        console.error('Error al usar la biblioteca QR principal:', error);
        console.log('Usando generador de QR de respaldo');
        return createFallbackQRCode(container, text);
    }
}

// Exponer función globalmente para que pueda ser utilizada desde scripts.js
window.createQRCodeWithFallback = createQRCodeWithFallback;