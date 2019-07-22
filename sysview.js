
let $$ = go.GraphObject.make
let database = null

function init() {
    
    /* Firebase */
    let firebaseConfig = {
        apiKey: "AIzaSyACyPbWFBPmWKHRVPRDco87duPe0_jV1VY",
        authDomain: "sysview-5bc3f.firebaseapp.com",
        databaseURL: "https://sysview-5bc3f.firebaseio.com",
        projectId: "sysview-5bc3f",
        storageBucket: "",
        messagingSenderId: "407368916533",
        appId: "1:407368916533:web:5a8f7778d60fc28a"
    }
    firebase.initializeApp(firebaseConfig)
  
    database = firebase.database()
    
    /* Go.js */
    let sysViewDiagram =
        $$(go.Diagram, "sysViewDiv",
            {
                "undoManager.isEnabled": true,
                "animationManager.isEnabled": false,
            })

    let sysViewModel = $$(go.Model)
    
    sysViewModel.nodeDataArray = [
      { key: "Alpha" },
      { key: "Beta" },
      { key: "Gamma" }
    ]
    sysViewDiagram.model = sysViewModel
    
    // TODO: replace this eventually
    seedData()
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

