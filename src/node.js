let FlowPipeNode = fabric.util.createClass(fabric.Group, {

    initialize: function(nodeClass, options) {

        console.log(nodeClass);
        console.log(options);

        options || (options = {});

        this.width = 256;
        this.height = 40;

        let labelHeight = 16;
        let circleRadius = 5;
        let textColor = '#fff';

        let inputArgs = options.inputs;
        let outputs = options.outputs;

        let nodeText = new fabric.Text(nodeClass, {
            fontSize: labelHeight,
            fill: textColor,
            fontFamily: MAIN_FONT_NAME,
            top: labelHeight
        });

        // Resize the node horizontally if the node label is very long
        console.log(`label width: ${nodeText.width}, node width: ${this.width}`)
        if (this.width < nodeText.width * 2.5) {
            this.width = nodeText.width * 2.5;
        }

        nodeText.set('left', (this.width - nodeText.width) * 0.5);

        let outlineRect = new fabric.Rect({
            fill: '#222',
            width: this.width,
            height: this.height + this.height * 0.25,
            strokeWidth: 2,
            stroke: 'rgb(255,127,80)',
            opacity: 1.0,
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
                left: 0 - circleRadius,
                top: 0 + inputPlugsTotalHeight,
            }));
            inputLabels.push(new fabric.Text(currentInputArg, {
                fontSize: circleRadius * 2,
                fill: textColor,
                left: 0 + circleRadius * 2,
                top: 0 + inputPlugsTotalHeight,
                fontFamily: MAIN_FONT_NAME
            }));
        }

        // Create outputs
        let outputPlugs = [];
        let outputLabels = [];
        let outputPlugsTotalHeight = 0;

        for (let i = 1; i < outputs.length + 1; i++) {

            outputPlugsTotalHeight = i * circleRadius * 4;
            let currentOutput = outputs[i - 1];

            outputPlugs.push(new fabric.Circle({
                radius: circleRadius,
                fill: '#ddd',
                left: this.width - circleRadius,
                top: 0 + outputPlugsTotalHeight,
            }));

            let currentOutLabel = new fabric.Text(currentOutput, {
                fontSize: circleRadius * 2,
                fill: textColor,
                top: 0 + outputPlugsTotalHeight,
                fontFamily: MAIN_FONT_NAME
            })

            currentOutLabel.set('left', this.width - currentOutLabel.width - circleRadius * 2);

            outputLabels.push(currentOutLabel);
        }

        // Resize node horizontally or vertically if needed
        if (inputPlugsTotalHeight >= this.height) {
            console.log('resizing height because there are too many input plugs');
            outlineRect.set('height', inputPlugsTotalHeight + (circleRadius * 6));
        } else if (outputPlugsTotalHeight >= this.height) {
            console.log('resizing height because there are too many output plugs');
            outlineRect.set('height', outputPlugsTotalHeight + (circleRadius * 6));
        }

        // Add callbacks for connecting the plugs
        outputPlugs.forEach(plug => {

            plug.on('mouseover', () => {
                canvas.hoverCursor = 'pointer';
            });

            plug.on('mouseout', () => {
                canvas.hoverCursor = 'move';
            });

            plug.on('mousedown', event => {
                console.log('mouse down')
                console.log(event.target);
                this.lockMovementX = true;
                this.lockMovementY = true;
                canvas.hoverCursor = 'pointer';

            });

            plug.on('mouseup', event => {
                console.log('mouse up')
                console.log(event.target);
                this.lockMovementX = false;
                this.lockMovementY = false;
                canvas.hoverCursor = 'move';

                console.log(`target left: ${event.target.left}`)
                console.log(`group  left: ${plug.group.left}`)
                console.log(`plug   left: ${plug.left}`)
                // console.log(`plug coords  : ${plug.getCoords()}`)

                let startPoint = {
                    x: plug.group.left + plug.left + (plug.group.width / 2) + circleRadius / 2,
                    y: plug.group.top + plug.top + (plug.group.height / 2) + circleRadius / 2
                };

                let endPoint = canvas.getPointer(event);

                console.log(plug);

                currentLine = new fabric.Line([startPoint.x, startPoint.y, endPoint.x, endPoint.y], {
                    fill: '#f00',
                    stroke: 'red',
                    strokeWidth: 4,
                    selectable: false,
                    evented: false
                })
                canvas.add(currentLine);

            });
        });

        inputPlugs.forEach(plug => {

            plug.on('mouseover', () => {
                if (!currentLine) {
                    return;
                }
                canPlugLine = true;

                currentInputPlugCoords = {
                    x: plug.group.left + plug.left + plug.group.width / 2 + circleRadius / 2,
                    y: plug.group.top + plug.top + plug.group.height / 2 + circleRadius / 2
                };

                console.log('mouse over input plug');

                currentLine.set({
                    x2: currentInputPlugCoords.x,
                    y2: currentInputPlugCoords.y
                });
                canvas.renderAll();
            });

            plug.on('mouseout', () => {
                if (!currentLine) {
                    return;
                }
                canPlugLine = false;

                console.log('mouse out input plug');
            });
        });

        let objects = [
            outlineRect, nodeText,
            ...inputPlugs, ...inputLabels,
            ...outputPlugs, ...outputLabels
        ];

        this.callSuper('initialize', objects, {
            subTargetCheck: true,
            selectable: true,
            hasControls: false,
            lockRotation: true
        }, false);
    },

    _render: function(ctx) {
        console.log('rendering')
        this.callSuper('_render', ctx);
    },
});