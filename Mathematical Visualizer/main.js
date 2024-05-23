function main() {
    initGL();
    gl.viewport(0, 0, canvas.width, canvas.height);

    renderSelectedFractal();

    canvas.addEventListener('mousemove', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        centerX = (x / canvas.width) * 2 - 1;
        centerY = 1 - (y / canvas.height) * 2;

        document.getElementById('centerX').value = centerX.toFixed(2);
        document.getElementById('centerY').value = centerY.toFixed(2);

        renderSelectedFractal();
    });

    canvas.addEventListener('wheel', function(event) {

        if (event.deltaY < 0) {
            scale *= 1.1;
        } else {
            scale *= 0.9;
        }

        scale = Math.max(0.1, Math.min(scale, 10.0));

        document.getElementById('scale').value = scale.toFixed(2);
        renderSelectedFractal();
    });

    document.getElementById('formula').addEventListener('change', function() {
        formula = this.value;
        renderSelectedFractal();
    });
}

window.addEventListener('load', main);