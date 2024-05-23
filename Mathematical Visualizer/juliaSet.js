const jsVertexShaderSource = `
    attribute vec2 aVertexPosition;
    void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

const jsFragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float scale;
    const int maxIter = 100;

    vec3 getColor(float t) {
        float r = 0.5 + 0.5 * cos(6.28318 * (t + 0.00));
        float g = 0.5 + 0.5 * cos(6.28318 * (t + 0.33));
        float b = 0.5 + 0.5 * cos(6.28318 * (t + 0.67));
        return vec3(r, g, b);
    }

    void main() {
        vec2 c = center;
        vec2 z = (gl_FragCoord.xy - resolution * 0.5) / scale;
        int n = 0;

        for (int i = 0; i < maxIter; i++) {
            z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
            if (length(z) >= 2.0) {
                break;
            }
            n++;
        }

        float t = float(n) / float(maxIter);
        vec3 color = getColor(t);
        gl_FragColor = vec4(color, 1.0);
    }
`;

function drawJuliaSet(centerX, centerY, scale) {
    const shaderProgram = initShader(jsVertexShaderSource, jsFragmentShaderSource);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        -1.0, -1.0,
         1.0, -1.0,
        -1.0,  1.0,
         1.0,  1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const centerUniform = gl.getUniformLocation(shaderProgram, 'center');
    const scaleUniform = gl.getUniformLocation(shaderProgram, 'scale');
    const resolutionUniform = gl.getUniformLocation(shaderProgram, 'resolution');

    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.uniform2f(centerUniform, centerX, centerY);
    gl.uniform1f(scaleUniform, scale * 400 * Math.min(canvas.width, canvas.height) / 720.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    let error = gl.getError();
    if (error !== gl.NO_ERROR) {
        console.error('WebGL error:', error);
    }
}