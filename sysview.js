/*

   Copyright 2019 Jeffrey Hullekes

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */
 
 
let databaseData = { visual: null, source: null }

 
function init() {
    
    initFirebase()
    
    initIcons()
    initMenu()
    
    initContainersAndConnections()
    
    // TODO: replace this eventually
    // initExampleData()
    
    addInputListeners()
    drawCanvas()
    
    // NOTE: this is loaded async!!
    loadContainerAndConnectionData()
}

function initFirebase () {
    let firebaseConfig = {
        apiKey: "AIzaSyD3aPCuIf856k1-_yzsK-YH1gD8USe-6RU",
        authDomain: "sysview-8c913.firebaseapp.com",
        databaseURL: "https://sysview-8c913.firebaseio.com",
        projectId: "sysview-8c913",
        storageBucket: "",
        messagingSenderId: "741358324352",
        appId: "1:741358324352:web:e249d5539c781a94"
    }

    firebase.initializeApp(firebaseConfig)
}

function loadContainerAndConnectionData() {
    console.log('starting to load data' + Date())
    
    // TODO: also load and store the source data (probably together?)
        
    firebase.database().ref('visual/').on('value', function(snapshot) {
        console.log('data was changed (or loaded)' + Date())
        
        // Store visual data in the databaseData
        databaseData.visual = snapshot.val()
        
        integrateContainerAndConnectionData()
    })
}

function integrateContainerAndConnectionData () {
    
    // TODO: should we also reset the interaction-info? Or at least check if its still valid?
    //       note that we should use identifiers in there INSTEAD of actual containers/connections!!
    
    // Removing all connections and containers
    initContainersAndConnections()
    
    // We then recreate all containers and connections using the databaseData
    let containers = databaseData.visual.containers
    for (let containerIdentifier in containers) {
        createContainer(containers[containerIdentifier])
    }
    setContainerChildren()
    recalculateAbsolutePositions()
    
    let connections = databaseData.visual.connections
    for (let connectionIdentifier in connections) {
        createConnection(connections[connectionIdentifier])
    }
    
    drawCanvas()
}

function storeContainerData(containerData) {
    firebase.database().ref('visual/containers/' + containerData.identifier).set({
        // TODO: couldn't we simply use the whole of containerData here?
        identifier: containerData.identifier,
        type: containerData.type,
        name: containerData.name,
        parentContainerIdentifier: containerData.parentContainerIdentifier,
        relativePosition: containerData.relativePosition,
        relativeScale: containerData.relativeScale,
        size: containerData.size
    })
}

function storeConnectionData(connectionData) {
    firebase.database().ref('visual/connections/' + connectionData.identifier).set({
        // TODO: couldn't we simply use the whole of connectionData here?
        identifier: connectionData.identifier,
        type: connectionData.type,
        name: connectionData.name,
        from: connectionData.from,
        to: connectionData.to,
    })
}