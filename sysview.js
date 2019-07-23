
let $$ = go.GraphObject.make
let sysViewDiagram

function init() {
    
    /* Go.js */
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
                selectionObjectName: "PH",
                locationObjectName: "PH",
                resizable: true,
                resizeObjectName: "PH" 
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
            new go.Binding("location", "loc", function (loc) { return new go.Point(loc.x, loc.y) })
        )
    )
    
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
    
    // TODO: replace this eventually
    let containersAndConnections = getExampleData()
    loadDataIntoGraphModel(containersAndConnections)
    
}

function loadDataIntoGraphModel(containersAndConnections) {
    sysViewDiagram.clear()
    sysViewDiagram.model = new go.GraphLinksModel(containersAndConnections.containers, containersAndConnections.connections)
}


function getExampleData() {
    
    let containersAndConnections = []
    containersAndConnections.containers = []
    containersAndConnections.connections = []
    
    let parentContainerIdentifier = null
    let containerIdentifier = null
    
    let containerToAdd = {
        type: 'server',
        identifier: 'FirstServer',
        name: 'My First Server',
        position: {
            x: 50,
            y: 200
        },
        size: {
            width: 100,
            height: 150
        }
    }
    
    containerIdentifier = addContainer(containerToAdd, parentContainerIdentifier, containersAndConnections)
    
    return containersAndConnections
}

function addContainer(containerData, parentContainerIdentifier, containersAndConnections) {
    
    let containerIdentifier = containerData.identifier
    
    if (containerData.type === 'server') {
        // TODO: determine absolute postiion based on absolute position of parent (we need a hashmap of containers (of the parent itself) for that)
        containersAndConnections.containers.push({
            x: containerData.position.x,
            y: containerData.position.y,
            size: { 
                width: containerData.size.width,
                height: containerData.size.height,
            },
            isGroup: true,
            groupIdentifier: parentContainerIdentifier,
            fill: 'rgba(200, 80, 0, 1)',
            stroke: 'rgba(200, 80, 0, 1)',
        })
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    
    }
    
    return containerIdentifier
}
