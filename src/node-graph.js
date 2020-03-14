// Let's avoid the class syntactic sugar for now
// https://www.toptal.com/javascript/es6-class-chaos-keeps-js-developer-up

function nodeGraph() {

    let currentId = 0;
    const nodes = {};

    const registerNode = (node) => {
        if (node.id == undefined){
            throw new Error("A node must have an id!");
        }
        nodes[node.id] = node;
    }

    const getNodeElement = (node, elementId) => {
        if (node.id == undefined){
            throw new Error("A node must have an id!");
        }
        return nodes[node.id]._objects[elementId];
    }

    const generateId = () => {
        return ++currentId;
    }

    return {
        nodes,
        registerNode,
        getNodeElement,
        generateId
    }
}

FlowPipe.nodeGraph = nodeGraph();