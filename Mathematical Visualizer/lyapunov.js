const lyVertexShaderSource = `
    attribute vec2 aVertexPosition;
    void main() {
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
`;

const lyFragmentShaderSource = `
    precision highp float;
    uniform vec2 resolution;
    uniform vec2 center;
    uniform float scale;
    const int maxIter = 100;
    const float epsilon = 0.0001;

    vec3 calcColor(float h) {
        h /= float(maxIter) * 12.0;
        vec3 col = vec3(0.0);
        if (h < 0.0) {
            h = abs(h);
            col = 0.5 + 0.5 * sin(vec3(0.0, 0.4, 0.7) + 2.5 * h);
            col *= pow(h, 0.25);
        }
        return col;
    }

    void main() {
        vec2 p = (gl_FragCoord.xy - resolution * 0.5) / scale;
        float x = center.x;
        float h = center.y;
        int n = 0;
        
        for (int i = 0; i < maxIter; i++) {
            for (int j = 0; j < 6; j++) {
                x = p.x * x * (1.0 - x);
                h += log2(abs(p.x * (1.0 - 2.0 * x)) + epsilon);
            }
            for (int j = 0; j < 6; j++) {
                x = p.y * x * (1.0 - x);
                h += log2(abs(p.y * (1.0 - 2.0 * x)) + epsilon);
            }
            n++;
        }

        vec3 color = calcColor(h);
        gl_FragColor = vec4(color, 1.0);
    }
`;

function drawLyapunov(centerX, centerY, scale) {
    const adjustedScale = scale / 4;

    const shaderProgram = initShader(lyVertexShaderSource, lyFragmentShaderSource);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(shaderProgram, 'aVertexPosition');
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLocation);

    const centerUniform = gl.getUniformLocation(shaderProgram, 'center');
    const scaleUniform = gl.getUniformLocation(shaderProgram, 'scale');
    const resolutionUniform = gl.getUniformLocation(shaderProgram, 'resolution');

    gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
    gl.uniform2f(centerUniform, centerX, centerY);
    gl.uniform1f(scaleUniform, adjustedScale * 400 * Math.min(canvas.width, canvas.height) / 720.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}