let canvas = new fabric.Canvas('c');
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);
canvas.backgroundColor = '#333';

// Check the loading of the font
// TODO: progress bar
let MAIN_FONT_NAME = 'Inconsolata';
let inconsolataFont = new FontFaceObserver(MAIN_FONT_NAME);
inconsolataFont.load()
    .then(() => {
        console.log(`${MAIN_FONT_NAME} font loaded`)
    }).catch(function(e) {
        console.error(`font loading failed ${e}`);
    });


// ------------------------------------
// Event Callbacks
// ------------------------------------
canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();

    zoom = zoom + delta / 200;

    if (zoom < 0.5) {
        return;
    }

    canvas.zoomToPoint({
        x: opt.e.offsetX,
        y: opt.e.offsetY
    }, zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();

});

// canvas.on('mouse:over', (element) => {
//     // e.target.set('fill', 'red');
//     console.log('on mouse over');
//     console.log(element);
//     if (element){
//         console.log(element.target);
//         if (element.target){
//             console.log(element.target._objects);
//         }
//     }
//     canvas.renderAll();
//   });

document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyN': {
            let inputs = ['radius', 'kernelSize'];
            let outputs = ['image'];

            let node = new FlowPipeNode('Blur', {inputs:inputs, outputs:outputs});
            console.log(node);
            canvas.add(node);
            node.center();
            break;
        };

    case 'KeyF': {
        let ao = canvas.getActiveObject();
        if (!ao) {
            break;
        }

        canvas.viewportCenterObject(ao);
        break;
    }

    case 'KeyH': {
        canvas.zoomToPoint({
            x: canvas.width * 0.5,
            y: canvas.height * 0.5
        }, 1.0);
        break;
    }

    case 'Backspace': {
        // TODO: override the main backspace event
        canvas.getActiveObjects().forEach(element => {
            canvas.remove(element);
        });
        break;
    };
    }
});