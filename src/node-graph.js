// Let's avoid the class syntactic sugar for now
// https://www.toptal.com/javascript/es6-class-chaos-keeps-js-developer-up

function nodeGraph() {

    let currentId = 0;
    const nodes = {};

    const addNode = (node) => {
        if (node.id == undefined) {
            throw new Error("Cannot register node: a node must have an id!");
        }
        nodes[node.id] = node;
        canvas.add(node);
    }

    const removeNode = (node) => {
        if (node.id == undefined) {
            throw new Error("Cannot unregister node: a node must have an id!");
        }
        canvas.remove(node);
    }

    const getNodeElement = (node, elementId) => {
        if (node.id == undefined) {
            throw new Error("A node must have an id!");
        }
        return nodes[node.id]._objects[elementId];
    }

    const generateId = () => {
        return ++currentId;
    }

    return {
        nodes,
        addNode,
        removeNode,
        getNodeElement,
        generateId
    }
}

FlowPipe.nodeGraph = nodeGraph();