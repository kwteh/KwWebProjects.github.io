const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext("webgl");

function initGL() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
    
    if (!gl) {
        console.error('Unable to initialize WebGL. Your browser may not support it.');
        return null;
    }

    return gl;
}

function getShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Error compiling shader: ', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function initShader(vertexShaderSource, fragmentShaderSource) {
    const vertexShader = getShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = getShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Error linking shader program: ', gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    gl.useProgram(shaderProgram);
    gl.viewport(0, 0, canvas.width, canvas.height);

    return shaderProgram;
}