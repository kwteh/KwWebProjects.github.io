let formula = document.getElementById('formula').value;
let centerX = parseFloat(document.getElementById('centerX').value);
let centerY = parseFloat(document.getElementById('centerY').value);
let scale = parseFloat(document.getElementById('scale').value);

function renderSelectedFractal() {

    switch (formula) {
        case 'burningShip':
            drawBurningShip(centerX, centerY, scale);
            break;
        case 'julia':
            drawJuliaSet(centerX, centerY, scale);
            break;
        case 'lyapunov':
            drawLyapunov(centerX, centerY, scale);
            break;
        default:
            console.error('Unknown formula selected');
    }
}