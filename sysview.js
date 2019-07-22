
let $$ = go.GraphObject.make
let database = null
let sysViewDiagram

function init() {
    
    /* Firebase */
    let firebaseConfig = {
        apiKey: "AIzaSyDgvBneVxbbSoGjFly4--5PXMDhiBzCToI",
        authDomain: "systemviewer-7c0e6.firebaseapp.com",
        databaseURL: "https://systemviewer-7c0e6.firebaseio.com",
        projectId: "systemviewer-7c0e6",
        storageBucket: "",
        messagingSenderId: "749942536427",
        appId: "1:749942536427:web:2241c22f1ba44cbc"
    }
    firebase.initializeApp(firebaseConfig)
  
    database = firebase.database()
    
    /* Go.js */
    sysViewDiagram =
        $$(go.Diagram, "sysViewDiv",
            {
                "undoManager.isEnabled": true,
                "animationManager.isEnabled": false,
            })

    sysViewDiagram.nodeTemplateMap.add("",
        $$(go.Node, "Auto",
            { 
                fromSpot: go.Spot.Right, 
                toSpot: go.Spot.Left
            },
            $$(go.Shape, "Rectangle",
                new go.Binding("stroke", "stroke"),
                new go.Binding("fill", "fill"),
                new go.Binding("width", "width"),
                new go.Binding("height", "height")
            ),
            new go.Binding("location", "loc", function (loc) { return new go.Point(loc.x, loc.y) })
        )
    )
    
    // TODO: replace this eventually
    // seedData()
    
    loadContainersAndConnectionsFromDB()
    
    
}

function loadDataIntoGraphModel(containersAndConnections) {
    
    sysViewDiagram.clear()
    sysViewDiagram.model = new go.GraphLinksModel(containersAndConnections.containers, containersAndConnections.connections)
}

function loadContainersAndConnectionsFromDB() {
    
    let containersAndConnections = []
    containersAndConnections.containers = []
    containersAndConnections.connections = []
    
    // FIXME: this is awkward, maybe use rethinkdb? How do we load containers and connections at the same time?
    let containerArray = []
    let containersRef = database.ref('containers')
    containersRef.on('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var containerKey = childSnapshot.key;
            var containerData = childSnapshot.val();
            console.log(containerData)
            
            containersAndConnections.containers.push({
                x: containerData.position.x,
                y: containerData.position.y,
                width: containerData.size.width,
                height: containerData.size.height,
                fill: 'rgba(200, 80, 0, 1)',
                stroke: 'rgba(200, 80, 0, 1)',
            })
            
        })
        
        loadDataIntoGraphModel(containersAndConnections)
    })
}

function seedData() {
    let serverToAdd = {
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
    addServer(serverToAdd)
}

function addServer (serverInfo) {
    // FIXME: create new containerId!
    let containerId = 1
    firebase.database().ref('containers/' + containerId).set({
        identifier: serverInfo.identifier,
        name: serverInfo.name,
        type: 'Server',
        position: serverInfo.position,
        size: serverInfo.size
    })    
}

