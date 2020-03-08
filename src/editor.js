let canvas = new fabric.Canvas('c');
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);

let mainFontName = 'Inconsolata';
let inconsolataFont = new FontFaceObserver(mainFontName);
inconsolataFont.load()
    .then(() => {
        console.log(`${mainFontName} font loaded`)
    }).catch(function(e) {
        console.error(`font loading failed ${e}`);
    });


// Add the event callbacks
document.addEventListener('keydown', onKeyDown);

function onKeyDown(event) {
    // console.log(event.code);
    console.log(event);

    switch (event.code) {
        case 'KeyN': {
            createNode('Blur', ['radius', 'amount', 'filterSize'], canvas);
            break;
        };
    }

    switch (event.code) {
        case 'Backspace': {
            // TODO: override the main browser backspace event
            canvas.getActiveObjects().forEach(element => {
                canvas.remove(element);
            });
            break;
        };
    }
}

function createNode(nodeClass, signature, c) {

    let nodeWidth = 256;
    let nodeHeight = 40;
    let labelHeight = 16;
    let circleRadius = 5;

    let nodeText = new fabric.Text(nodeClass, {
        fontSize: labelHeight,
        fill: '#111',
        fontFamily: mainFontName,
        top: labelHeight
    });
    console.log(nodeText.width);
    nodeText.set('left', (nodeWidth - nodeText.width) / 2.0);

    let outlineRect = new fabric.Rect({
        fill: '#fff',
        width: nodeWidth,
        height: nodeHeight + nodeHeight * 0.25,
        strokeWidth: 2,
        stroke: 'rgba(10)',
        opacity: 0.5,
        selectable: true,
        hasControls: false,
        lockRotation: true,
        rx: 10,
        ry: 10
    });

    let inputPlugs = [];
    let inputLabels = [];


    let vOffset;

    for (let i = 1; i < signature.length + 1; i++) {

        vOffset = i * circleRadius * 4;
        let currentSignatureArgument = signature[i - 1];
        console.log(currentSignatureArgument);

        inputPlugs.push(new fabric.Circle({
            radius: circleRadius,
            fill: '#ddd',
            stroke: '#000',
            left: 0 - circleRadius,
            top: 0 + vOffset,
        }));

        inputLabels.push(new fabric.Text(currentSignatureArgument, {
            fontSize: 8,
            left: 0 + circleRadius * 2,
            top: 0 + vOffset,
            fontFamily: mainFontName
        }));
    }

    if (vOffset >= nodeHeight) {
        console.log(`resizing height because there are too many plugs: ${vOffset} > ${nodeHeight}`);
        outlineRect.set('height', vOffset + (circleRadius * 6));
    }

    let mainGroup = new fabric.Group([outlineRect, nodeText, ...inputPlugs, ...inputLabels]);

    c.add(mainGroup);
    mainGroup.center();
}