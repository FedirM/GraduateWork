let plate_w = []; // Two dimensional array (w)

const EPS = 1e-8;

let q0 = 1; // Hydrostatic max pressure 
let a = 4; // length
let b = 4; // width
let D = 1.923; //2.4038461538461538461538461538462e-4;

function print(value, label = '') {
    console.log(label, math.format(value, 14));
}

function preshure(x) {
    return (q0 * x) / a;
}

function alpha(m) {
    return ((m * math.pi * b) / (2 * a));
}

function sagging(pos) {
    const multiplier = (q0 * math.pow(a, 4)) / (D * math.pow(math.pi, 4));
    let m = 0;
    let step;
    let res = 0;
    do {
        m++;
        const alph = alpha(m);
        step = math.chain(math.pow(-1, m + 1) / math.pow(m, 5))
            .multiply(2 - (((2 + alph * math.tanh(alph)) / math.cosh(alph)) * math.cosh(m * math.pi * pos.y / a)) + ((1 / math.cosh(alph) * (m * math.pi * pos.y / a) * (math.sinh(m * math.pi * pos.y / a)))))
            .multiply(math.sin(m * math.pi * pos.x / a))
            .done();
        res = math.add(res, step);
        // console.log(`Step #${m}  Res: ${math.format(step, 8)}`);
    } while (math.abs(step) > EPS);

    return (multiplier * res);
}

function calc() {
    var data = new vis.DataSet();

    return new Promise((resolve, reject) => {
        for (var x = 0; x <= a; x+=0.1) {
            for (var y = -b/2; y <= b/2; y+=0.1) {
              x = Math.round(x * 10) / 10;
              y = Math.round(y * 10) / 10;
              let value = sagging({x, y});
              value = ( math.abs(value) <= EPS ) ? 0.0 : -value;
              data.add({
                x: x,
                y: y,
                z: value,
                style: -1 / value
              });
            }
        }

        resolve( data );
    });
}

// ######################### UI Functions ########################

function toggleButton(btnContainer) {
    btnContainer.classList.toggle('menu-view-change');
    document.getElementsByClassName('side-menu')[0].classList.toggle('side-menu-change');
}

function checkAndBuild() {
    var options = {
        width:  '100%',
        height: '100%',
        style: 'surface',
        showPerspective: true,
        showGrid: true,
        showShadow: false,
        keepAspectRatio: true,
        verticalRatio: 0.1
    };

    calc().then( data => {
        let gr = new vis.Graph3d(document.getElementById('graph'), data, options);
    });
}