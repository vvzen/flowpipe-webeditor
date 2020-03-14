FlowPipe.Node = fabric.util.createClass(fabric.Group, {

    initialize: function(nodeClass, options) {

        console.log(nodeClass);
        console.log(options);

        options || (options = {});

        this.width = 256;
        this.height = 40;
        this.id = FlowPipe.nodeGraph.generateId();
        this.path = `/nodegraph/${this.id}`;

        // Each Node has an global id used to keep track of it
        // each element of the Node will hace a local id as well
        this.childrenIdCount = 0;

        this.circleRadius = 5;
        let labelHeight = 16;
        let textColor = '#fff';

        let inputArgs = options.inputs;
        let outputs = options.outputs;

        let nodeText = new fabric.Text(nodeClass, {
            fontSize: labelHeight,
            fill: textColor,
            fontFamily: FlowPipe.MAIN_FONT_NAME,
            top: labelHeight,
            id: this.childrenIdCount++
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
            ry: 10,
            id: this.childrenIdCount++
        });

        this.inputPlugs = [];
        let inputLabels = [];
        let inputPlugsTotalHeight;

        // Create inputs
        for (let i = 1; i < inputArgs.length + 1; i++) {

            inputPlugsTotalHeight = i * this.circleRadius * 4;
            let currentInputArg = inputArgs[i - 1];

            let inputPlug = new FlowPipe.NodePlug(this, false, {
                radius: this.circleRadius,
                fill: '#ddd',
                left: 0 - this.circleRadius,
                top: 0 + inputPlugsTotalHeight
            });
            console.log(`added ${inputPlug}`);
            this.inputPlugs.push(inputPlug);

            let inputPlugText = new fabric.Text(currentInputArg, {
                fontSize: this.circleRadius * 2,
                fill: textColor,
                left: 0 + this.circleRadius * 2,
                top: 0 + inputPlugsTotalHeight,
                fontFamily: FlowPipe.MAIN_FONT_NAME,
                id: this.childrenIdCount++
            });

            inputLabels.push(inputPlugText);
        }

        // Create outputs
        this.outputPlugs = [];
        let outputLabels = [];
        let outputPlugsTotalHeight = 0;

        for (let i = 1; i < outputs.length + 1; i++) {

            outputPlugsTotalHeight = i * this.circleRadius * 4;
            let currentOutput = outputs[i - 1];

            let outputPlug = new FlowPipe.NodePlug(this, true, {
                radius: this.circleRadius,
                fill: '#ddd',
                left: this.width - this.circleRadius,
                top: 0 + outputPlugsTotalHeight,
            });
            this.outputPlugs.push(outputPlug);

            let currentOutLabel = new fabric.Text(currentOutput, {
                fontSize: this.circleRadius * 2,
                fill: textColor,
                top: 0 + outputPlugsTotalHeight,
                fontFamily: FlowPipe.MAIN_FONT_NAME,
                id: this.childrenIdCount++
            });

            currentOutLabel.set('left', this.width - currentOutLabel.width - this.circleRadius * 2);

            outputLabels.push(currentOutLabel);
        }

        // Resize node horizontally or vertically if needed
        if (inputPlugsTotalHeight >= this.height) {
            console.log('resizing height because there are too many input plugs');
            outlineRect.set('height', inputPlugsTotalHeight + (this.circleRadius * 6));
        } else if (outputPlugsTotalHeight >= this.height) {
            console.log('resizing height because there are too many output plugs');
            outlineRect.set('height', outputPlugsTotalHeight + (this.circleRadius * 6));
        }

        let objects = [
            outlineRect, nodeText,
            ...this.inputPlugs, ...inputLabels,
            ...this.outputPlugs, ...outputLabels
        ];

        FlowPipe.nodeGraph.addNode(this);

        this.callSuper('initialize', objects, {
            subTargetCheck: true,
            selectable: true,
            hasControls: false,
            hasBorders: true,
            lockRotation: true
        }, false);
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});


FlowPipe.NodePlug = fabric.util.createClass(fabric.Circle, {

    initialize: function(parent, isOutput = true, options) {
        console.log(options);

        if (parent.id == undefined) {
            throw new Error("Plug parent must be a node with an id")
        }

        this.parent = parent;
        this.lines = [];

        // Add different events depending if it's an input plug or an output plug
        if (isOutput) {

            this.on('mouseover', () => {
                canvas.hoverCursor = 'pointer';
            });

            this.on('mouseout', () => {
                canvas.hoverCursor = 'move';
            });

            this.on('mousedown', event => {
                console.log("mouse down on ouput plug");
                console.log(event.target);
                this.lockMovementX = true;
                this.lockMovementY = true;
                canvas.hoverCursor = 'pointer';

                let startPoint = {
                    x: this.group.left + this.left + (this.group.width / 2) + this.parent.circleRadius / 2,
                    y: this.group.top + this.top + (this.group.height / 2) + this.parent.circleRadius / 2
                };
                let endPoint = canvas.getPointer(event);

                console.log(FlowPipe.currentLine);

                let points = [startPoint.x, startPoint.y, endPoint.x, endPoint.y];

                console.log("creating Line");
                FlowPipe.currentLine = new FlowPipe.NodeConnection(points, {
                    stroke: '#ccc',
                    strokeWidth: 4,
                    selectable: false,
                    evented: false
                })

                // TODO: check if, in terms of performance
                // it's better to use an ID instead of a reference
                FlowPipe.currentLine.set({startPlug: this});
                this.lines.push(FlowPipe.currentLine);

                canvas.add(FlowPipe.currentLine);
            });

            this.on('mouseup', event => {
                console.log('mouse up on output plug')
                // console.log(event.target);
                this.lockMovementX = false;
                this.lockMovementY = false;
                canvas.hoverCursor = 'move';
            });

        } else {
            this.on('mouseover', () => {
                if (!FlowPipe.currentLine) {
                    return;
                }
                FlowPipe.canPlugLine = true;

                FlowPipe.currentInputPlugCoords = {
                    x: this.group.left + this.left + this.group.width / 2 + this.parent.circleRadius / 2,
                    y: this.group.top + this.top + this.group.height / 2 + this.parent.circleRadius / 2
                };
                console.log('mouse over input plug');

                FlowPipe.currentLine.set({
                    x2: FlowPipe.currentInputPlugCoords.x,
                    y2: FlowPipe.currentInputPlugCoords.y
                });
                FlowPipe.currentLine.set({endPlug: this})

                canvas.renderAll();
            });

            this.on('mouseout', () => {
                if (!FlowPipe.currentLine) {
                    return;
                }

                FlowPipe.canPlugLine = false;
                FlowPipe.currentInputPlugCoords = null;

                console.log('mouse out input plug');
            });
        }

        this.id = parent.childrenIdCount++;
        this.path = `/nodegraph/${parent.id}/${this.id}`;

        this.callSuper('initialize', options, false);
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});

FlowPipe.NodeConnection = fabric.util.createClass(fabric.Line, {

    initialize: function(points, options) {
        this.startPlug = null;
        this.endPlug = null;
        this.callSuper('initialize', points, options, false);
    },

    _render: function(ctx) {
        this.callSuper('_render', ctx);
    }
});