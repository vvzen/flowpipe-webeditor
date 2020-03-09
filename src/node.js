// TODO: add a prototype for the node

function createNode(nodeClass, inputArgs, outputs, c) {

    let nodeWidth = 256;
    let nodeHeight = 40;
    let labelHeight = 16;
    let circleRadius = 5;
    let textColor = '#fff';

    let nodeText = new fabric.Text(nodeClass, {
        fontSize: labelHeight,
        fill: textColor,
        fontFamily: mainFontName,
        top: labelHeight
    });
    nodeText.set('left', (nodeWidth - nodeText.width) / 2.0);

    let outlineRect = new fabric.Rect({
        fill: '#222',
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
    let inputPlugsTotalHeight;

    // Create inputs
    for (let i = 1; i < inputArgs.length + 1; i++) {

        inputPlugsTotalHeight = i * circleRadius * 4;
        let currentInputArg = inputArgs[i - 1];

        inputPlugs.push(new fabric.Circle({
            radius: circleRadius,
            fill: '#ddd',
            stroke: '#000',
            left: 0 - circleRadius,
            top: 0 + inputPlugsTotalHeight,
        }));
        inputLabels.push(new fabric.Text(currentInputArg, {
            fontSize: circleRadius * 2,
            fill: textColor,
            left: 0 + circleRadius * 2,
            top: 0 + inputPlugsTotalHeight,
            fontFamily: mainFontName
        }));
    }

    let outputPlugs = [];
    let outputLabels = [];
    let outputPlugsTotalHeight = 0;

    for (let i = 1; i < outputs.length + 1; i++) {

        outputPlugsTotalHeight = i * circleRadius * 4;
        let currentOutput = inputArgs[i - 1];

        outputPlugs.push(new fabric.Circle({
            radius: circleRadius,
            fill: '#ddd',
            stroke: '#000',
            left: nodeWidth - circleRadius,
            top: 0 + outputPlugsTotalHeight,
        }));

        let currentOutLabel = new fabric.Text(currentOutput, {
            fontSize: circleRadius * 2,
            fill: textColor,
            top: 0 + outputPlugsTotalHeight,
            fontFamily: mainFontName
        })

        currentOutLabel.set('left', nodeWidth - currentOutLabel.width - circleRadius * 2);

        outputLabels.push(currentOutLabel);
    }

    if (inputPlugsTotalHeight >= nodeHeight) {
        console.log('resizing height because there are too many input plugs');
        outlineRect.set('height', inputPlugsTotalHeight + (circleRadius * 6));
    } else if (outputPlugsTotalHeight >= nodeHeight) {
        console.log('resizing height because there are too many output plugs');
        outlineRect.set('height', outputPlugsTotalHeight + (circleRadius * 6));
    }

    let mainGroup = new fabric.Group([outlineRect, nodeText, ...inputPlugs, ...inputLabels, ...outputPlugs, ...outputLabels]);

    c.add(mainGroup);
    mainGroup.center();
}