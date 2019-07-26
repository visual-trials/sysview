
function init() {
   
    /* mxGraph */
    
    let graphContainerDiv = document.getElementById('sysViewDiv')
    
    initMxGraph(graphContainerDiv);
        
    
    // TODO: replace this eventually
    // let containersAndConnections = getExampleData()
    
}


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




/* Go.js */

// let $$ = go.GraphObject.make
// let sysViewDiagram

function initGoJS() {    
    
    sysViewDiagram =
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
    loadDataIntoGraphModel(containersAndConnections)
    
}

function loadDataIntoGraphModel(containersAndConnections) {
    sysViewDiagram.clear()
    sysViewDiagram.model = new go.GraphLinksModel(containersAndConnections.containers, containersAndConnections.connections)
}
