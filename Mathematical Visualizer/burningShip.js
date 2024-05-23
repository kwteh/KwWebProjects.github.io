const bsVertexShaderSource = `
    attribute vec2 aVertexPosition;
    void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

const bsFragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float scale;
    const int maxIter = 100;

    void main() {
        vec2 c = vec2(gl_FragCoord.x / scale - center.x, gl_FragCoord.y / scale - center.y);
        vec2 z = (gl_FragCoord.xy - resolution * 0.5) / scale;
        int n = 0;
        for (int i = 0; i < maxIter; i++) {
            z = vec2(z.x * z.x - z.y * z.y + c.x, 2.0 * abs(z.x * z.y) + c.y);
            if (length(z) >= 2.0) break;
            n++;
        }
        float t = float(n) / float(maxIter);
        float r = 0.9 + 0.1 * cos(t * 3.14159);
        float g = 0.5 * sin(t * 3.14159 * 2.0);
        float b = 0.1 * sin(t * 3.14159);
        vec3 color = vec3(r, g, b);
        gl_FragColor = vec4(color, 1.0);
    }
`;

function drawBurningShip(centerX, centerY, scale) {
    const adjustedCenterX = (centerX + 0.95) * 2;
    const adjustedCenterY = (centerY + 0.75) * 2;

    const shaderProgram = initShader(bsVertexShaderSource, bsFragmentShaderSource);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0,  1.0,
         1.0,  1.0,
        -1.0, -1.0,
         1.0, -1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const centerUniform = gl.getUniformLocation(shaderProgram, 'center');
    const scaleUniform = gl.getUniformLocation(shaderProgram, 'scale');
    const resolutionUniform = gl.getUniformLocation(shaderProgram, 'resolution');

    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.uniform2f(centerUniform, adjustedCenterX, adjustedCenterY);
    gl.uniform1f(scaleUniform, scale * 400 * Math.min(canvas.width, canvas.height) / 720.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL error:', error);
    }
}

