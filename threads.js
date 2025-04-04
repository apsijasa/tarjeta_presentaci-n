// WebGL Threads Animation
class ThreadsAnimation {
    constructor(container, options = {}) {
        this.container = container;
        this.options = Object.assign({
            color: [0.9, 0.9, 1], // Color de las líneas (RGB)
            amplitude: 0.8,       // Intensidad de la animación
            distance: 0.2,        // Distancia entre líneas
            enableMouseInteraction: true // Interacción con el mouse
        }, options);

        this.animationFrameId = null;
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'threads-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.container.appendChild(this.canvas);

        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (!this.gl) {
            console.error('WebGL no está disponible en este navegador.');
            return;
        }

        this.setup();
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));

        if (this.options.enableMouseInteraction) {
            this.currentMouse = [0.5, 0.5];
            this.targetMouse = [0.5, 0.5];
            this.container.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.container.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        }

        this.start();
    }

    // Configuración de WebGL
    setup() {
        const gl = this.gl;

        // Shaders
        const vertexShaderSource = `
            attribute vec2 position;
            void main() {
                gl_Position = vec4(position, 0.0, 1.0);
            }
        `;

                    const fragmentShaderSource = `
            precision highp float;

            uniform float iTime;
            uniform vec2 iResolution;
            uniform vec3 uColor;
            uniform float uAmplitude;
            uniform float uDistance;
            uniform vec2 uMouse;

            #define PI 3.1415926538

            const int u_line_count = 35;
            const float u_line_width = 6.0;
            const float u_line_blur = 10.0;

            // Función de ruido Perlin simplificada
            float noise(vec2 p) {
                vec2 i = floor(p);
                vec2 f = fract(p);
                vec2 u = f * f * (3.0 - 2.0 * f);
                
                float a = sin(i.x + i.y * 13.0) * 43758.5453;
                float b = sin((i.x + 1.0) + i.y * 13.0) * 43758.5453;
                float c = sin(i.x + (i.y + 1.0) * 13.0) * 43758.5453;
                float d = sin((i.x + 1.0) + (i.y + 1.0) * 13.0) * 43758.5453;
                
                return mix(mix(fract(a), fract(b), u.x),
                           mix(fract(c), fract(d), u.x), u.y);
            }

            float pixel(float count) {
                return (1.0 / max(iResolution.x, iResolution.y)) * count;
            }

            float lineFn(vec2 st, float width, float perc, float time, vec2 mouse) {
                float amplitude_normal = smoothstep(0.1, 0.7, st.x);
                float finalAmplitude = amplitude_normal * 1.2 * uAmplitude * (1.0 + (mouse.y - 0.5) * 0.4);
                
                float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
                float blur = smoothstep(0.2, 0.25, st.x) * perc;
                
                float xnoise = noise(vec2(time_scaled, st.x + perc) * 3.5);
                
                float y = 0.5 + (perc - 0.5) * uDistance + xnoise / 2.0 * finalAmplitude;
                
                float line_start = smoothstep(
                    y + (width / 2.0) + (u_line_blur * pixel(1.0) * blur),
                    y,
                    st.y
                );
                
                float line_end = smoothstep(
                    y,
                    y - (width / 2.0) - (u_line_blur * pixel(1.0) * blur),
                    st.y
                );
                
                return clamp(
                    (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
                    0.0,
                    1.0
                );
            }

            void main() {
                vec2 uv = gl_FragCoord.xy / iResolution;
                
                float line_strength = 1.0;
                for (int i = 0; i < u_line_count; i++) {
                    float p = float(i) / float(u_line_count);
                    line_strength *= (1.0 - lineFn(
                        uv,
                        u_line_width * pixel(1.0) * (1.0 - p),
                        p,
                        iTime,
                        uMouse
                    ));
                }
                
                float colorVal = 1.0 - line_strength;
                gl_FragColor = vec4(uColor * colorVal, colorVal);
            }
        `;

        // Crear y compilar shaders
        const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Crear programa
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);

        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            console.error('Error al enlazar programa:', gl.getProgramInfoLog(this.program));
            return;
        }

        gl.useProgram(this.program);

        // Crear buffer para el triángulo que cubre toda la pantalla
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            3, -1,
            -1, 3
        ]), gl.STATIC_DRAW);

        // Obtener ubicaciones de atributos y uniformes
        this.positionLocation = gl.getAttribLocation(this.program, 'position');
        this.timeLocation = gl.getUniformLocation(this.program, 'iTime');
        this.resolutionLocation = gl.getUniformLocation(this.program, 'iResolution');
        this.colorLocation = gl.getUniformLocation(this.program, 'uColor');
        this.amplitudeLocation = gl.getUniformLocation(this.program, 'uAmplitude');
        this.distanceLocation = gl.getUniformLocation(this.program, 'uDistance');
        this.mouseLocation = gl.getUniformLocation(this.program, 'uMouse');

        // Configurar mezcla para transparencia
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        // Establecer valores uniformes iniciales
        gl.uniform3fv(this.colorLocation, this.options.color);
        gl.uniform1f(this.amplitudeLocation, this.options.amplitude);
        gl.uniform1f(this.distanceLocation, this.options.distance);
        gl.uniform2f(this.mouseLocation, 0.5, 0.5);
    }

    createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error al compilar shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    resize() {
        const { offsetWidth, offsetHeight } = this.container;
        this.canvas.width = offsetWidth;
        this.canvas.height = offsetHeight;
        this.gl.viewport(0, 0, offsetWidth, offsetHeight);
        this.gl.uniform2f(this.resolutionLocation, offsetWidth, offsetHeight);
    }

    handleMouseMove(e) {
        const rect = this.container.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height;
        this.targetMouse = [x, y];
    }

    handleMouseLeave() {
        this.targetMouse = [0.5, 0.5];
    }

    update(time) {
        const gl = this.gl;

        if (this.options.enableMouseInteraction) {
            const smoothing = 0.05;
            this.currentMouse[0] += smoothing * (this.targetMouse[0] - this.currentMouse[0]);
            this.currentMouse[1] += smoothing * (this.targetMouse[1] - this.currentMouse[1]);
            gl.uniform2f(this.mouseLocation, this.currentMouse[0], this.currentMouse[1]);
        }

        // Actualizar tiempo
        gl.uniform1f(this.timeLocation, time * 0.001);

        // Dibujar
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionLocation);
        gl.vertexAttribPointer(this.positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        this.animationFrameId = requestAnimationFrame(this.update.bind(this));
    }

    start() {
        if (!this.animationFrameId) {
            this.animationFrameId = requestAnimationFrame(this.update.bind(this));
        }
    }

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resize.bind(this));
        
        if (this.options.enableMouseInteraction) {
            this.container.removeEventListener('mousemove', this.handleMouseMove.bind(this));
            this.container.removeEventListener('mouseleave', this.handleMouseLeave.bind(this));
        }
        
        if (this.container.contains(this.canvas)) {
            this.container.removeChild(this.canvas);
        }
        
        // Limpiar recursos WebGL
        const gl = this.gl;
        gl.deleteBuffer(this.positionBuffer);
        gl.deleteProgram(this.program);
    }
}