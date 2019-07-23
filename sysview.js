
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
                // TODO: we are using "PH" here. But does this exactly work?
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
        )
    )
    
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
    
    let parentContainerIdentifier = ""
    let containerIdentifier = ""
    
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
    
    containerToAdd.type = 'API'
    containerToAdd.identifier = 'API1'
    containerToAdd.position.x = 70
    containerToAdd.position.y = 230
    containerToAdd.size.width = 70
    containerToAdd.size.height = 50
    
    parentContainerIdentifier = containerIdentifier
    containerIdentifier = addContainer(containerToAdd, parentContainerIdentifier, containersAndConnections)
    
    return containersAndConnections
}

function addContainer(containerData, parentContainerIdentifier, containersAndConnections) {
    
    let containerIdentifier = containerData.identifier
    
    let fill = 'rgba(0, 0, 0, 1)'
    let stroke = 'rgba(0, 0, 0, 1)'
    
    if (containerData.type === 'server') {
        fill = 'rgba(200, 80, 0, 1)'
        stroke = 'rgba(200, 80, 0, 1)'
    }
    else if (containerData.type === 'API') {
        fill = 'rgba(0, 80, 200, 1)'
        stroke = 'rgba(0, 80, 200, 1)'
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    // TODO: determine absolute postiion based on absolute position of parent (we need a hashmap of containers (of the parent itself) for that)
    containersAndConnections.containers.push({
        key: containerIdentifier,
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
