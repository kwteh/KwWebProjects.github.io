let gl;
let canvas;
let centerX = -0.7;
let centerY = 0.0;
let scale = 1;

function initGL() {
    canvas = document.getElementById('glCanvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (!gl) {
        alert('Unable to initialize WebGL. Your browser may not support it.');
        return;
    }
}

function getShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShaders() {
    const vertexShaderSource = `
        attribute vec2 a_position;
        void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    const fragmentShaderSource = `
		precision highp float;
		uniform vec2 u_resolution;
		uniform vec2 u_center;
		uniform float u_scale;
		const int maxIter = 300;

		void main() {
			vec2 c = u_center;
			vec2 z = (gl_FragCoord.xy - u_resolution * 0.5) / u_scale;
			int n = 0;

			for (int i = 0; i < maxIter; i++) {
				z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
				if (length(z) >= 2.0) {
					break;
				}
				n++;
			}

			float intensity = float(n) / float(maxIter);

			// Generate grayscale color based on iteration count
			vec3 color = vec3(intensity);

			gl_FragColor = vec4(color, 1.0);
		}
	`;

    const vertexShader = getShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = getShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function drawJuliaSet(centerX, centerY) {
    const vertices = new Float32Array([
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0
    ]);

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const a_position = gl.getAttribLocation(gl.program, 'a_position');
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_position);

    const resolutionLocation = gl.getUniformLocation(gl.program, 'u_resolution');
    const centerLocation = gl.getUniformLocation(gl.program, 'u_center');
    const scaleLocation = gl.getUniformLocation(gl.program, 'u_scale');

    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

    gl.uniform2f(centerLocation, centerX, centerY);
    gl.uniform1f(scaleLocation, scale * 400.0 * Math.min(canvas.width, canvas.height) / 720.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL error:', error);
    }
}

function main() {
    initGL();
    
    if (!gl) {
        console.error('WebGL context initialization failed.');
        return;
    } else {
        console.log('WebGL context initialized successfully.');
    }

    const shaderProgram = initShaders();
    gl.program = shaderProgram;
    gl.viewport(0, 0, canvas.width, canvas.height);

    drawJuliaSet(centerX, centerY, scale);

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        centerX = (x / canvas.width) * 2 - 1;
        centerY = 1 - (y / canvas.height) * 2;

        document.getElementById('centerX').value = centerX.toFixed(2);
        document.getElementById('centerY').value = centerY.toFixed(2);

        drawJuliaSet(centerX, centerY, scale);
    });

    canvas.addEventListener('wheel', function(event) {

        if (event.deltaY < 0) {
            scale *= 1.1;
        } else {
            scale *= 0.9;
        }

        scale = Math.max(0.1, Math.min(scale, 10.0));

        document.getElementById('scale').value = scale.toFixed(2);
        drawJuliaSet(centerX, centerY, scale);
    });

    document.getElementById('scale').addEventListener('input', function(event) {
        scale = event.target.value;
        document.getElementById('scale').value = scale;
        drawJuliaSet(centerX, centerY, scale);
    });

    document.getElementById('centerX').addEventListener('input', function(event) {
        centerX = parseFloat(event.target.value);
        document.getElementById('centerX').value = centerX.toFixed(2);
        drawJuliaSet(centerX, centerY, scale);
    });

    document.getElementById('centerY').addEventListener('input', function(event) {
        centerY = parseFloat(event.target.value);
        document.getElementById('centerY').value = centerY.toFixed(2);
        drawJuliaSet(centerX, centerY, scale);
    });

    const a_position = gl.getAttribLocation(gl.program, 'a_position');
    console.log('Attribute location:', a_position);

    const resolutionLocation = gl.getUniformLocation(gl.program, 'u_resolution');
    console.log('Resolution location:', resolutionLocation);

    const centerLocation = gl.getUniformLocation(gl.program, 'u_center');
    console.log('Center location:', centerLocation);

    const scaleLocation = gl.getUniformLocation(gl.program, 'u_scale');
    console.log('Scale location:', scaleLocation);
}

main();
