// ------------------------------------
// Globals
// ------------------------------------
// Namespace
const FlowPipe = {};

// TODO: Make a UI Controller Object that handles
// these different states in which we can be
FlowPipe.currentIText = null;
FlowPipe.currentLine = null;
let currentLine = null;
FlowPipe.currentInputPlugCoords = null;
FlowPipe.canPlugLine = false;

FlowPipe.availableNodes = {};

let canvas = new fabric.Canvas('c');
canvas.setWidth(window.innerWidth);
canvas.setHeight(window.innerHeight);
canvas.backgroundColor = '#333';


// ------------------------------------
// Asset loading
// ------------------------------------

// Load the nodes definitions
fetch("example_nodes.json")
    .then(response => response.json())
    .then(json => {
        addParsedNodes(json)
    })
    .catch(err => {
        console.error(err)
    });

// Check the loading of the font
// TODO: progress bar
FlowPipe.MAIN_FONT_NAME = 'Inconsolata';
FlowPipe.inconsolataFont = new FontFaceObserver(FlowPipe.MAIN_FONT_NAME);
FlowPipe.inconsolataFont.load()
    .then(() => {
        console.log(`${FlowPipe.MAIN_FONT_NAME} font loaded`)
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

canvas.on('mouse:move', function(event) {
    if (!FlowPipe.currentLine) {
        return;
    }

    // If the mouse is over a object
    // then the object itself will handle it
    if (event.target) {
        return;
    }

    let mousePos = canvas.getPointer(event);
    FlowPipe.currentLine.set({
        x2: mousePos.x,
        y2: mousePos.y
    });
    canvas.renderAll();
});

canvas.on('object:moving', function(e) {
    let node = e.target;
    // console.log(node);
    // console.log('object moved');
    // console.log(`node id: ${node.id}`);

    // console.log(`input   of node: ${node._inputId}`);
    // console.log(`outputs of node: ${node._outputIds}`);

    // let plug = nodeMap[currentLine._inputId];
});

function addParsedNodes(json) {

    // Register the nodes contained in the json
    Object.keys(json).forEach(node => {
        console.log(`registering ${node}`);
        FlowPipe.availableNodes[node] = json[node];
    });
    // Update the UI
    let nodesAvailableEl = document.getElementById("current-avail-nodes");
    nodesAvailableEl.textContent = Object.keys(FlowPipe.availableNodes).join(", ");

    document.addEventListener('keydown', (event) => {
        console.log(event.code);

        switch (event.code) {

            // TODO: Add nodes with tab and autocompletion
            case 'Tab': {
                event.preventDefault();

                FlowPipe.currentIText = new fabric.IText('a', {
                    backgroundColor: '#fff',
                    fontSize: 16,
                    fontFamily: FlowPipe.MAIN_FONT_NAME,
                    opacity: 0.9
                });
                canvas.add(FlowPipe.currentIText);
                FlowPipe.currentIText.center();
                FlowPipe.currentIText.selectAll();
                FlowPipe.currentIText.enterEditing();
                console.log('entering edit');
                break;
            }

            case 'Enter': {

                // If the user was typing a node
                if (FlowPipe.currentIText) {

                    console.log('exiting edit');
                    let enteredName = FlowPipe.currentIText.text;
                    console.log(`node name: ${enteredName}`)

                    let matchingNode = FlowPipe.availableNodes[enteredName];
                    FlowPipe.currentIText.exitEditing();

                    // Add the node
                    if (matchingNode) {
                        let newNode = new FlowPipe.Node(enteredName, {
                            inputs: matchingNode.inputs,
                            outputs: matchingNode.outputs,
                        });
                        canvas.add(newNode);
                        newNode.center();
                    }
                    canvas.remove(FlowPipe.currentIText);
                    canvas.renderAll();
                    FlowPipe.currentIText = null;
                }

                // If the user is plugging an output
                else if (FlowPipe.currentLine) {

                    // Plug the line
                    if (FlowPipe.canPlugLine && FlowPipe.currentInputPlugCoords) {
                        FlowPipe.currentLine.set({
                            x2: FlowPipe.currentInputPlugCoords.x,
                            y2: FlowPipe.currentInputPlugCoords.y
                        });
                        canvas.renderAll();

                        FlowPipe.currentLine = null;
                        FlowPipe.canPlugLine = false;
                    }
                    // Delete the line
                    else {
                        canvas.remove(FlowPipe.currentLine);
                        canvas.renderAll();
                        FlowPipe.currentLine = null;
                    }
                }


                break;
            }

            // Focus
            case 'KeyF': {
                let ao = canvas.getActiveObject();
                if (!ao) {
                    break;
                }

                canvas.viewportCenterObject(ao);
                break;
            }

            // Home
            case 'KeyH': {
                canvas.zoomToPoint({
                    x: canvas.width * 0.5,
                    y: canvas.height * 0.5
                }, 1.0);
                break;
            }

            // Delete
            case 'Backspace': {

                // If we are not in edit mode,
                // we want to override the default behaviour of tab
                if (!FlowPipe.currentIText) {
                    event.preventDefault();
                }

                canvas.getActiveObjects().forEach(element => {
                    canvas.remove(element);
                });
                break;
            };
        }
    });
}