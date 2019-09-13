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
let containerIdentifiersToBeStored = {}
let connectionIdentifiersToBeStored = {}
let databaseDataHasChanged = false
let viewWasDrawnOnce = false
let centerViewOnWorldCenter = false

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
    
    // NOTE: this is loaded async!!
    loadContainerAndConnectionData()
    
    mainLoop()
}

function mainLoop () {
    
    if (keyboardState.keyboardStateHasChanged || mouseState.mouseStateHasChanged || touchesStateHasChanged || 
        interaction.isoMetricAnimationRunning || databaseDataHasChanged || !viewWasDrawnOnce) {
            
        // Handle input 
        if (keyboardState.keyboardStateHasChanged || mouseState.mouseStateHasChanged || touchesStateHasChanged) {
            handleInputStateChange()
        }

        if (databaseDataHasChanged) {
            if (Object.keys(containerIdentifiersToBeStored).length > 0 || 
                Object.keys(connectionIdentifiersToBeStored).length > 0) {
                    
                storeVisualData()
            }
            
            integrateContainerAndConnectionData()
            databaseDataHasChanged = false
        }
        
        // Update world
        updateWorld()
        
        // Render world
        drawCanvas()
        viewWasDrawnOnce = true
    }
    
    // Reset input
    resetMouseEventData()
    resetTouchEventData()
    resetKeyboardEventData()
    
    window.requestAnimationFrame(mainLoop)
}

function integrateContainerAndConnectionData () {
    
    // TODO: should we also reset the interaction-info? Or at least check if its still valid?
    //       note that we should use identifiers in there INSTEAD of actual containers/connections!!
    
    if (databaseData.visual == null && databaseData.source == null) {
        return
    }
    
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
    recalculateWorldPositionsAndSizes()
    
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
    
}

function loadContainerAndConnectionData() {
    
    let url = 'index.php?action=get_project_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let projectData = JSON.parse(xmlhttp.responseText)

            databaseData.visual = projectData.visual
            databaseData.source = projectData.source
            databaseDataHasChanged = true
            
            centerViewOnWorldCenter = true
            containerIdentifiersToBeStored = {}
            connectionIdentifiersToBeStored = {}
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}


function deleteContainerData(containerIdentifier) {
    delete databaseData.visual.containers[containerIdentifier]
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentifier] = true
}

function deleteConnectionData(connectionIdentifier) {
    delete databaseData.visual.connections[connectionIdentifier]
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[connectionIdentifier] = true
}

function storeContainerData(containerData) {
    databaseData.visual.containers[containerData.identifier] = containerData
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerData.identifier] = true
}

function storeConnectionData(connectionData) {
    databaseData.visual.connections[connectionData.identifier] = connectionData
    databaseDataHasChanged = true
    
    connectionIdentifiersToBeStored[connectionData.identifier] = true
}

// TODO: dont pass the whole container, only the containerIdentifier and the parentContainerIdentifier
function storeContainerParent(container) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(container.identifier)) {
        databaseData.visual.containers[container.identifier] = { 'identifier': container.identifier }
    }
    let visualContainerData = databaseData.visual.containers[container.identifier]
    visualContainerData.parentContainerIdentifier = container.parentContainerIdentifier
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[container.identifier] = true
}

// TODO: dont pass the whole container, only the containerIdentifier and the position and size
function storeContainerPositionAndSize(container) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(container.identifier)) {
        databaseData.visual.containers[container.identifier] = { 'identifier': container.identifier }
    }
    let visualContainerData = databaseData.visual.containers[container.identifier]
    visualContainerData.localPosition = container.localPosition
    visualContainerData.localSize = container.localSize
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[container.identifier] = true
}

function storeVisualData() {
    let url = 'index.php?action=set_visual_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    
    let visualData = { 'containers' : {}, 'connections' : {} }
    
    for (let containerIdentifier in containerIdentifiersToBeStored) {
        if (!databaseData.visual.containers.hasOwnProperty(containerIdentifier)) {
            // We have to store the visual data of this container, but its key has been deleted
            // this means we have to delete it in the backend too
            visualData['containers'][containerIdentifier] = { remove : true }
        }
        else {
            let visualContainerData = databaseData.visual.containers[containerIdentifier]
            visualData['containers'][containerIdentifier] = visualContainerData
        }
    }
    for (let connectionIdentifier in connectionIdentifiersToBeStored) {
        if (!databaseData.visual.connections.hasOwnProperty(connectionIdentifier)) {
            // We have to store the visual data of this connections, but its key has been deleted
            // this means we have to delete it in the backend too
            visualData['connections'][connectionIdentifier] = { remove : true }
        }
        else {
            let visualConnectionData = databaseData.visual.connections[connectionIdentifier]
            visualData['connections'][connectionIdentifier] = visualConnectionData
        }
    }
    
    xmlhttp.send(JSON.stringify(visualData))
    
    containerIdentifiersToBeStored = {}
    connectionIdentifiersToBeStored = {}
}
