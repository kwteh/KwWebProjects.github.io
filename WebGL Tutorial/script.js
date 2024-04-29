let gl;
let canvas;

var _position;
var _color;
var _Pmatrix;
var _Vmatrix;
var _Mmatrix;
var THETA;
var PHI;
var AMORTIZATION = 0.97;
var dX = 0, dY = 0;

var drag = false;

function main() {
    canvas = document.getElementById('glCanvas');
	
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	
	initGL();
	initShaders();
	drawCube();
	setupMouse();
}

function initGL() {
	try {
		gl = canvas.getContext("webgl", {antialias: true});
	} catch (e) {
		alert("WebGL context cannot be initialized");
		return false;
	}
}

function initShaders() {
	const vertexShaderSource=`
		attribute vec3 position;
		uniform mat4 Pmatrix;
		uniform mat4 Vmatrix;
		uniform mat4 Mmatrix;
		attribute vec3 color;
		varying vec3 vColor;
		void main(void) {
			gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
			vColor = color;
		}
	`;

	const fragmentShaderSource=`
		precision mediump float;
		varying vec3 vColor;
		void main(void) {
			gl_FragColor = vec4(vColor, 1.0);
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

	_Pmatrix = gl.getUniformLocation(shaderProgram, "Pmatrix");
	_Vmatrix = gl.getUniformLocation(shaderProgram, "Vmatrix");
	_Mmatrix = gl.getUniformLocation(shaderProgram, "Mmatrix");
	_color = gl.getAttribLocation(shaderProgram, "color");
	_position = gl.getAttribLocation(shaderProgram, "position");
	
	gl.enableVertexAttribArray(_color);
	gl.enableVertexAttribArray(_position);

    gl.useProgram(shaderProgram);
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

function drawCube() {
	var cubeVertex = [
    -1, -1, -1,
    0, 0, 0,
    1, -1, -1,
    1, 0, 0,
    1, 1, -1,
    1, 1, 0,
    -1, 1, -1,
    0, 1, 0,
    -1, -1, 1,
    0, 0, 1,
    1, -1, 1,
    1, 0, 1,
    1, 1, 1,
    1, 1, 1,
    -1, 1, 1,
    0, 1, 1
	];
	
	const cubeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertex), gl.STATIC_DRAW);
	
	var cubeFaces = [
    0, 1, 2,
    0, 2, 3,

    4, 5, 6,
    4, 6, 7,

    0, 3, 7,
    0, 4, 7,

    1, 2, 6,
    1, 5, 6,

    2, 3, 6,
    3, 7, 6,

    0, 1, 5,
    0, 4, 5
	];
	
	const cubeFacesBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeFacesBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeFaces), gl.STATIC_DRAW);
	
	var PROJMATRIX = LIBS.get_projection(40, canvas.width/canvas.height, 1, 100);
	var MOVEMATRIX = LIBS.get_I4();
	var VIEWMATRIX = LIBS.get_I4();
	
	LIBS.translateZ(VIEWMATRIX, -6);
	THETA = 0;
	PHI = 0;

	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clearDepth(1.0);
	
	var time_prev = 0;
    var animate = function(time) {
		var dt=time-time_prev;
		if (!drag) {
			dX *= AMORTIZATION, dY *= AMORTIZATION;
			THETA += dX, PHI += dY;
		}
		LIBS.set_I4(MOVEMATRIX);
		LIBS.rotateY(MOVEMATRIX, THETA);
		LIBS.rotateX(MOVEMATRIX, PHI);
		time_prev = time;

        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.uniformMatrix4fv(_Pmatrix, false, PROJMATRIX);
		gl.uniformMatrix4fv(_Vmatrix, false, VIEWMATRIX);
		gl.uniformMatrix4fv(_Mmatrix, false, MOVEMATRIX);
        gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
        gl.vertexAttribPointer(_position, 3, gl.FLOAT, false, 4*(3+3), 0);
        gl.vertexAttribPointer(_color, 3, gl.FLOAT, false, 4*(3+3), 3*4);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeFacesBuffer);
        gl.drawElements(gl.TRIANGLES, 6*2*3, gl.UNSIGNED_SHORT, 0);
        
        gl.flush();

        window.requestAnimationFrame(animate);
    };

  animate(0);
}

function setupMouse() {
	var x_prev, y_prev;

	var mouseDown = function(e) {
		drag = true;
		x_prev = e.pageX, y_prev = e.pageY;
		e.preventDefault();
		return false;
	};

	var mouseUp = function(e){
		drag = false;
	};

	var mouseMove = function(e) {
		if (!drag) return false;
		dX = (e.pageX-x_prev) * 2 * Math.PI / canvas.width,
		dY = (e.pageY-y_prev) * 2 * Math.PI / canvas.height;
		THETA += dX;
		PHI += dY;
		x_prev = e.pageX, y_prev = e.pageY;
		e.preventDefault();
	};

	canvas.addEventListener("mousedown", mouseDown, false);
	canvas.addEventListener("mouseup", mouseUp, false);
	canvas.addEventListener("mouseout", mouseUp, false);
	canvas.addEventListener("mousemove", mouseMove, false);
}

window.addEventListener('load', main);