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

// FIXME: hardcoded!
let project = 'ClientLive'
//let project = 'ExampleProject'
 
function init() {
    
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

function integrateContainerAndConnectionData () {
    
    // TODO: should we also reset the interaction-info? Or at least check if its still valid?
    //       note that we should use identifiers in there INSTEAD of actual containers/connections!!
    
    // Removing all connections and containers
    initContainersAndConnections()
    
    // We then recreate all containers and connections using the databaseData
    
    // First all visual containers in the visual data set
    for (let containerIdentifier in databaseData.visual.containers) {
        let visualContainerData = databaseData.visual.containers[containerIdentifier]
        let sourceContainerData = null
        if (databaseData.source.containers.hasOwnProperty(containerIdentifier)) {
            sourceContainerData = databaseData.source.containers[containerIdentifier]
        }
        let containerData = mergeSourceAndVisualContainerData(sourceContainerData, visualContainerData)
        createContainer(containerData)
    }
    
    // Then source containers that are *not* in the visual data set
    for (let containerIdentifier in databaseData.source.containers) {
        let visualContainerData = null
        if (!databaseData.visual.containers.hasOwnProperty(containerIdentifier)) {
            let sourceContainerData = databaseData.source.containers[containerIdentifier]
            let containerData = mergeSourceAndVisualContainerData(sourceContainerData, visualContainerData)
            createContainer(containerData)
        }
    }
    
    setContainerChildren()
    recalculateAbsolutePositions()
    
    // First all visual connections in the visual data set
    for (let connectionIdentifier in databaseData.visual.connections) {
        let visualConnectionData = databaseData.visual.connections[connectionIdentifier]
        let sourceConnectionData = null
        if (databaseData.source.connections.hasOwnProperty(connectionIdentifier)) {
            sourceConnectionData = databaseData.source.connections[connectionIdentifier]
        }
        let connectionData = mergeSourceAndVisualConnectionData(sourceConnectionData, visualConnectionData)
        
        createConnection(connectionData)
    }
    
    // Then source connections that are *not* in the visual data set
    for (let connectionIdentifier in databaseData.source.connections) {
        let visualConnectionData = null
        if (!databaseData.visual.connections.hasOwnProperty(connectionIdentifier)) {
            let sourceConnectionData = databaseData.source.connections[connectionIdentifier]
            let connectionData = mergeSourceAndVisualConnectionData(sourceConnectionData, visualConnectionData)
            createConnection(connectionData)
        }
    }
    
    drawCanvas()
}

function loadContainerAndConnectionData() {
    
    let url = 'index.php?action=get_project_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let projectData = JSON.parse(xmlhttp.responseText)

            // FIXME: also load the other data! (apart from visual)
            
            databaseData.visual = projectData.visual
            databaseData.source = projectData.source
            integrateContainerAndConnectionData()
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function storeContainerPositionAndSize(container) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(container.identifier)) {
        databaseData.visual.containers[container.identifier] = { 'identifier': container.identifier }
    }
    let visualContainerData = databaseData.visual.containers[container.identifier]
    visualContainerData.relativePosition = container.relativePosition
    visualContainerData.size = container.size
    storeVisualContainerData(visualContainerData) // async call!
}

function storeVisualContainerData(visualContainerData) {
    
    let url = 'index.php?action=set_visual_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    let visualData = { 'containers' : {} }
    visualData['containers'][visualContainerData.identifier] = visualContainerData
    xmlhttp.send(JSON.stringify(visualData))
    
    databaseData.visual.containers[visualContainerData.identifier] = visualContainerData
    integrateContainerAndConnectionData()
}

function storeConnectionData(visualConnectionData) {
    
    let url = 'index.php?action=set_visual_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    let visualData = { 'connections' : {} }
    visualData['connections'][visualConnectionData.identifier] = visualConnectionData
    xmlhttp.send(JSON.stringify(visualData))
    
    databaseData.visual.connections[visualConnectionData.identifier] = visualConnectionData
    integrateContainerAndConnectionData()
}