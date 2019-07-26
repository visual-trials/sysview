
function init() {
   
    // let graphContainerDiv = document.getElementById('sysViewDiv')
    
    // initMxGraph(graphContainerDiv);
        
    
    // TODO: replace this eventually
    let containersAndConnections = getExampleData()
    
    initSelfMade(containersAndConnections)
    
}


function getExampleData() {
    
    let containersAndConnections = []
    containersAndConnections.containers = []
    containersAndConnections.connections = []
    
    let firstServer = {
        type: 'server',
        identifier: 'FirstServer',
        name: 'My First Server',
        position: {
            x: 50,
            y: 200
        },
        size: {
            width: 200,
            height: 250
        }
    }
    
    let firstServerIdentifier = addContainer(firstServer, "", containersAndConnections)
    
    let firstAPI = {
        type: 'API',
        identifier: 'API1',
        name: 'First API',
        position: {
            x: 70,
            y: 230
        },
        size: {
            width: 70,
            height: 50
        }
    }
    
    let firstAPIIdentifier = addContainer(firstAPI, firstServerIdentifier, containersAndConnections)
    
    let secondServer = {
        type: 'server',
        identifier: 'SecondServer',
        name: 'My Second Server',
        position: {
            x: 350,
            y: 200
        },
        size: {
            width: 150,
            height: 150
        }
    }
    
    let secondServerIdentifier = addContainer(secondServer, "", containersAndConnections)
    
    let secondAPI = {
        type: 'API',
        identifier: 'API2',
        name: 'Second API',
        position: {
            x: 380,
            y: 210
        },
        size: {
            width: 70,
            height: 50
        }
    }
    
    let secondAPIIdentifier = addContainer(secondAPI, secondServerIdentifier, containersAndConnections)
    
    return containersAndConnections
}

function addContainer(containerData, parentContainerIdentifier, containersAndConnections) {
    
    let containerIdentifier = containerData.identifier
    
    let fill = 'rgba(0, 0, 0, 1)'
    let stroke = 'rgba(0, 0, 0, 1)'
    
    if (containerData.type === 'server') {
        fill = 'rgba(200, 180, 0, 1)'
        stroke = 'rgba(200, 80, 0, 1)'
    }
    else if (containerData.type === 'API') {
        fill = 'rgba(0, 180, 200, 1)'
        stroke = 'rgba(0, 80, 200, 1)'
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    // TODO: determine absolute postiion based on absolute position of parent (we need a hashmap of containers (of the parent itself) for that)
    containersAndConnections.containers.push({
        identifier: containerIdentifier,
        name: containerData.name,
        position: {
            x: containerData.position.x,
            y: containerData.position.y,
        },
        size: { 
            width: containerData.size.width,
            height: containerData.size.height,
        },
        isGroup: true,
        group: parentContainerIdentifier,
        fill: fill,
        stroke: stroke,
    })
    return containerIdentifier
}

/* mxGraph */

function initMxGraph(containerDiv)
{
    // Checks if the browser is supported
    if (!mxClient.isBrowserSupported())
    {
        // Displays an error message if the browser is not supported.
        mxUtils.error('Browser is not supported!', 200, false)
    }
    else
    {
        // Disables the built-in context menu
        mxEvent.disableContextMenu(containerDiv);
        
        // Creates the graph inside the given container
        let graph = new mxGraph(containerDiv)

        // Enables rubberband selection
        new mxRubberband(graph)
        
        // Gets the default parent for inserting new cells. This
        // is normally the first child of the root (ie. layer 0).
        let parent = graph.getDefaultParent()
                        
        // Adds cells to the model in a single step
        graph.getModel().beginUpdate()
        try
        {
            let v1 = graph.insertVertex(parent, null, 'Hello,', 20, 20, 80, 30)
            let v2 = graph.insertVertex(parent, null, 'World!', 200, 150, 80, 30)
            let e1 = graph.insertEdge(parent, null, '', v1, v2)
        }
        finally
        {
            // Updates the display
            graph.getModel().endUpdate()
        }
    }
}

/* Self made */

let currentlySelectedContainer = null
let canvasElement = document.getElementById('canvas')

function initSelfMade(containersAndConnections) {
    
    let ctx = canvasElement.getContext("2d")
    addInputListeners()
    
    for (let containerIndex = 0; containerIndex < containersAndConnections.containers.length; containerIndex++) {
        let container = containersAndConnections.containers[containerIndex]
        
        drawContainer(ctx, container)
    }
}

function drawContainer(ctx, container) {
    {
        // Draw rectangle 
        ctx.lineWidth = 2
        ctx.strokeStyle = container.stroke
        ctx.fillStyle = container.fill
        ctx.fillRect(container.position.x, container.position.y, container.size.width, container.size.height)
    }
    
    let textColor = "#000000"
    {
        // Draw text
        let textToDraw = container.identifier
        
        // Get text size
        let textSize = {}
        let fontSize = 12
        ctx.font = fontSize + "px Arial"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize

        // Determine text position
        let textPosition = {}
        textPosition.x = container.position.x + (container.size.width / 2) - (textSize.width / 2)
        textPosition.y = container.position.y + (container.size.height / 2) + (textSize.height / 2) 
        
        // Draw the text at the text positions
        ctx.fillStyle = textColor
        ctx.fillText(textToDraw, textPosition.x, textPosition.y)
    }
    
}

function handleMouseStateChange () {
    
    console.log(mouseState)
    
    // Reset mouse(event) data
    mouseState.previousPosition.x = mouseState.position.x
    mouseState.previousPosition.y = mouseState.position.y
    mouseState.hasMoved = false
    mouseState.leftButtonHasGoneDown = false
    mouseState.leftButtonHasGoneUp = false
    mouseState.rightButtonHasGoneDown = false
    mouseState.rightButtonHasGoneUp = false
}

let mouseState = {
    position : { x: 0, y: 0 },
    previousPosition : { x: 0, y: 0 },
    hasMoved : false,
    leftButtonHasGoneDown : false,
    leftButtonIsDown : false,
    leftButtonHasGoneUp : false,
    rightButtonHasGoneDown : false,
    rightButtonIsDown : false,
    rightButtonHasGoneUp : false,
}

function updateMousePosition(x, y) {
    mouseState.position.x = x
    mouseState.position.y = y
    mouseState.hasMoved = mouseState.previousPosition.x != mouseState.position.x || 
                          mouseState.previousPosition.y != mouseState.position.y
}

function mouseButtonDown (e) {
        
    if (e.button == 0) {
        // left mouse button down
        mouseState.leftButtonHasGoneDown = true
        mouseState.leftButtonIsDown = true
        handleMouseStateChange()
    }
    else if (e.button == 2) {
        // right mouse button down
        mouseState.rightButtonHasGoneDown = true
        mouseState.rightButtonIsDown = true
        handleMouseStateChange()
    }

    e.preventDefault()
}

function mouseButtonUp (e) {
    if (e.button == 0) {
        // left mouse button up
        mouseState.leftButtonHasGoneUp = true
        mouseState.leftButtonIsDown = false
        handleMouseStateChange()
    }
    else if (e.button == 2) {
        // right mouse button up
        mouseState.rightButtonHasGoneUp = true
        mouseState.rightButtonIsDown = false
        handleMouseStateChange()
    }

    e.preventDefault()
}

function mouseEntered (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseMoved (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseExited (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseWheelMoved (e) {
    // TODO
}
    
function addInputListeners () {
    canvasElement.addEventListener("mousedown", mouseButtonDown, false)
    // We want to know if the mouse goes up OUTSIDE the canvas, so we attach the eventlistener to the 'window' instead
    window.addEventListener("mouseup", mouseButtonUp, false)
    canvasElement.addEventListener("mousemove", mouseMoved, false)
    // TODO: the mouseenter is not triggered on *page load* for Chrome. It is for FF.
    //       See this link *why* we want to use it: 
    //       https://stackoverflow.com/questions/2601097/how-to-get-the-mouse-position-without-events-without-moving-the-mouse
    canvasElement.addEventListener("mouseenter", mouseEntered, false)
    canvasElement.addEventListener("mouseleave", mouseExited, false)
    // IE9, Chrome, Safari, Opera
    canvasElement.addEventListener("mousewheel", mouseWheelMoved, false)
    // Firefox
    canvasElement.addEventListener("DOMMouseScroll", mouseWheelMoved, false)
    
    // TODO: for now preventing the context-menu this way
    canvasElement.addEventListener('contextmenu', event => event.preventDefault());
}


/* Go.js */

// let $$ = go.GraphObject.make

function initGoJS() {    
    
    let sysViewDiagram =
        $$(go.Diagram, "sysViewDiv",
            {
                "undoManager.isEnabled": true,
                "animationManager.isEnabled": false,
            })

    sysViewDiagram.groupTemplateMap.add("",
        $$(go.Group, "Auto",
            { 
                fromSpot: go.Spot.Right, 
                toSpot: go.Spot.Left,
            },
            { 
                // TODO: we are using "PH" here. But does this exactly work?
                selectionObjectName: "PH",
                locationObjectName: "PH",
                resizable: true,
                resizeObjectName: "PH" 
            },
            { 
                portId: "", 
                fromLinkable: true, 
                toLinkable: true, 
                cursor: "pointer"
            },
            $$(go.Shape, "Rectangle",
                { name: "PH" },
                new go.Binding("stroke", "stroke"),
                new go.Binding("fill", "fill"),
                new go.Binding("desiredSize", "size", 
                            function (size) { 
                                return new go.Size(size.width, size.height) 
                            }
                        )
                        .makeTwoWay(
                            function (desiredSize) { 
                                return { width: desiredSize.width, height: desiredSize.height }
                            }
                        ),
            ),
            new go.Binding("location", "position", 
                            function (position) { 
                                return new go.Point(position.x, position.y) 
                            }
                        )
                        .makeTwoWay(
                            function (location) { 
                                return { x: location.x, y: location.y }
                            }
                        ),
            $$(go.TextBlock,
                { stroke: "white", margin: 3 },
                new go.Binding("text", "key")
            )
        )
    )
    
    /*
    sysViewDiagram.toolManager.linkingTool.temporaryLink =
        $$(go.Link,
            { layerName: "Tool" },
            $$(go.Shape,
                { stroke: "red", strokeWidth: 2, strokeDashArray: [4, 2] })
        )
    
    let tempFromNode =
        $$(go.Node,
            { layerName: "Tool" },
            $$(go.Shape, "RoundedRectangle",
                { stroke: "chartreuse", strokeWidth: 3, fill: null, portId: "", width: 1, height: 1 }
            )
        )
    sysViewDiagram.toolManager.linkingTool.temporaryFromNode = tempFromNode;
    sysViewDiagram.toolManager.linkingTool.temporaryFromPort = tempFromNode.port;
    
    let tempToNode =
        $$(go.Node,
            { layerName: "Tool" },
            $$(go.Shape, "RoundedRectangle",
                { stroke: "cyan", strokeWidth: 3, fill: null, portId: "", width: 1, height: 1 }
            )
        )
    sysViewDiagram.toolManager.linkingTool.temporaryToNode = tempToNode
    sysViewDiagram.toolManager.linkingTool.temporaryToPort = tempToNode.port
    */
    
    
    /*
    sysViewDiagram.nodeTemplateMap.add("",
        $$(go.Node, "Auto",
            { 
                fromSpot: go.Spot.Right, 
                toSpot: go.Spot.Left
            },
            $$(go.Shape, "Rectangle",
                new go.Binding("stroke", "stroke"),
                new go.Binding("fill", "fill"),
                // FIXME: this is old:
                new go.Binding("width", "width"),
                new go.Binding("height", "height")
            ),
            new go.Binding("location", "loc", function (loc) { return new go.Point(loc.x, loc.y) })
        )
    )
    */
    
    // notice whenever a transaction or undo/redo has occurred
    sysViewDiagram.addModelChangedListener(function(evt) {
        if (evt.isTransactionFinished) {
            console.log(evt.model.nodeDataArray)
            // TODO: implement this: saveModel(evt.model)
        }
    })
    
    // TODO: replace this eventually
    let containersAndConnections = getExampleData()
    loadDataIntoGraphModel(sysViewDiagram, containersAndConnections)
    
}

function loadDataIntoGraphModel(sysViewDiagram, containersAndConnections) {
    sysViewDiagram.clear()
    sysViewDiagram.model = new go.GraphLinksModel(containersAndConnections.containers, containersAndConnections.connections)
}
