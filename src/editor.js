// ------------------------------------
// Globals
// ------------------------------------

// TODO: Make a UI Controller Object that handles
// these different states in which we can be
let currentIText = null;
let currentLine = null;
let currentInputPlugCoords = null;
let canPlugLine = false;

let availableNodes = {};

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

canvas.on('mouse:move', function(event) {
    if (!currentLine){
        return;
    }

    // If the mouse is over a object
    // then the object itself will handle it
    if (event.target){
        return;
    }

    let mousePos = canvas.getPointer(event);
    currentLine.set({x2: mousePos.x, y2: mousePos.y});
    canvas.renderAll();
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

function addParsedNodes(json) {

    // Register the nodes contained in the json
    Object.keys(json).forEach(node => {
        console.log(`registering ${node}`);
        availableNodes[node] = json[node];
    });
    // Update the UI
    let nodesAvailableEl = document.getElementById("current-avail-nodes");
    nodesAvailableEl.textContent = Object.keys(availableNodes).join(", ");

    document.addEventListener('keydown', (event) => {
        console.log(event.code);

        switch (event.code) {

            // TODO: Add nodes with tab and autocompletion
            case 'Tab': {
                event.preventDefault();

                currentIText = new fabric.IText('a', {
                    backgroundColor: '#fff',
                    fontSize: 16,
                    fontFamily: MAIN_FONT_NAME,
                    opacity: 0.9
                });
                canvas.add(currentIText);
                currentIText.center();
                currentIText.selectAll();
                currentIText.enterEditing();
                console.log('entering edit');
                break;
            }

            case 'Enter': {

                // If the user was typing a node
                if (currentIText){

                    console.log('exiting edit');
                    let enteredName = currentIText.text;
                    console.log(`node name: ${enteredName}`)

                    let matchingNode = availableNodes[enteredName];
                    currentIText.exitEditing();

                    // Add the node
                    if (matchingNode){
                        let newNode = new FlowPipeNode(enteredName, {
                            inputs: matchingNode.inputs,
                            outputs: matchingNode.outputs,
                        });
                        canvas.add(newNode);
                        newNode.center();
                    }
                    canvas.remove(currentIText);
                    canvas.renderAll();
                    currentIText = null;
                }

                // If the user is plugging an output
                else if (currentLine){

                    // Plug the line
                    if (canPlugLine && currentInputPlugCoords){
                        currentLine.set({
                            x2: currentInputPlugCoords.x,
                            y2: currentInputPlugCoords.y
                        });
                        canvas.renderAll();
                        currentLine = null;
                        canPlugLine = false;
                    }
                    // Delete the line
                    else {
                        canvas.remove(currentLine);
                        canvas.renderAll();
                        currentLine = null;
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
                if (!currentIText){
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