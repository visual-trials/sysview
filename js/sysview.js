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

let showTinyDebugDetail = true
let showDebugDetail = true

let project = 'ClientLive'

let urlString = window.location.href
let url = new URL(urlString)
let projectOverrule = url.searchParams.get("project")
if (projectOverrule != null) {
	project = projectOverrule
}
 
function initMenu() {
    ZUI.menuButtons = [
        {
            mode: "view",
        },
        {
            mode: "move",
        },
        {
            mode: "connect",
        },
        {
            toggle: "isoMetric",
        },
        /*
        {
            toggle: "grid",
        }
        */
    ]
    
    let buttonPosition = { x: 20, y: 20 }
    let buttonSize = { width: 32, height: 32 }
    for (let buttonIndex = 0; buttonIndex < ZUI.menuButtons.length; buttonIndex++) {
        let buttonData = ZUI.menuButtons[buttonIndex]
        buttonData.position = {}
        // FIXME: ugly HACK!
        if (buttonIndex == 3) {
            buttonPosition.x = ZUI.canvasElement.width - buttonSize.width - 20
            buttonPosition.y = ZUI.canvasElement.height - buttonSize.height /* *2 */ - 20
        }
        buttonData.position.x = buttonPosition.x
        buttonData.position.y = buttonPosition.y
        buttonData.size = {}
        buttonData.size.width = buttonSize.width
        buttonData.size.height = buttonSize.height
        
        buttonPosition.y += buttonSize.height
    }
}

function deselectContainers() {
    ZUI.interaction.currentlySelectedContainerIdentifiers = {}
}
function init() {
    
    let ourCanvasElement = document.getElementById('canvas')
    setCanvas(ourCanvasElement)

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
    
    if (ZUI.keyboardState.keyboardStateHasChanged ||
        ZUI.mouseState.mouseStateHasChanged || 
        ZUI.windowState.windowStateHasChanged || 
        ZUI.touchesStateHasChanged || 
        ZUI.interaction.isoMetricAnimationRunning || 
        databaseDataHasChanged || 
        !viewWasDrawnOnce) {
            
        // Handle input 
        if (ZUI.keyboardState.keyboardStateHasChanged || ZUI.mouseState.mouseStateHasChanged || ZUI.windowState.windowStateHasChanged || ZUI.touchesStateHasChanged) {
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
        let desiredCanvasSize = { width: window.innerWidth, height: window.innerHeight }
        drawCanvas(desiredCanvasSize, true)
        viewWasDrawnOnce = true
    }
    
    // Reset input
    resetMouseEventData()
    resetTouchEventData()
    resetKeyboardEventData()
    
    window.requestAnimationFrame(mainLoop)
}

function drawCanvas(desiredCanvasSize, doMenu) {
    clearCanvas()
    if (desiredCanvasSize != null) {
        resizeCanvasToDesiredSize(desiredCanvasSize)
    }
    
    // TODO: we want to re-position the button (because the screensize might have just changed), not re-inialize the menu
    if (doMenu) {
        initMenu()
    }

    if (ZUI.interaction.showGrid) {
        drawGrid()
    }
 
    let rootContainer = ZUI.containersAndConnections.containers['root']
    drawContainers(rootContainer.children, null)
    
    // FIXME: clean this up!
    // let doConnectionGrouping = true
    // if (doConnectionGrouping) {
        groupConnections()
        drawConnectionGroups()
    // }
    // else {
    //    drawConnections()
    //}
    drawNewConnection()
    
    // if (ZUI.interaction.currentlySelectedMode !== 'view') {
    if (showDebugDetail) {
        drawDebugDetail(databaseData)
    }
    if (showTinyDebugDetail) {
        drawTinyDebugDetail()
    }
    
    if (doMenu) {
        drawMenu()
    }
    
    // TODO: when the mouse (with button pressed) is moving its style doesn't get changed?
    ZUI.canvasElement.style.cursor = ZUI.interaction.mousePointerStyle
    
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
    recalculateWorldPositionsAndSizes(null)
    
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
    
    let url = 'api.php?action=get_project_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let projectData = JSON.parse(xmlhttp.responseText)

            databaseData.visual = projectData.visual
            databaseData.source = projectData.source
            // FIXME: this should not be a gloval like this (probably put it into a ZUI global)
            ZUI.colorAndShapeMappings = projectData.colorAndShapeMappings
            databaseDataHasChanged = true
            
            ZUI.interaction.centerViewOnWorldCenter = true
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
    
    connectionIdentifiersToBeStored[connectionIdentifier] = true
}

function storeNewContainer(localPosition, parentContainerIdentifier) {
    let currentDateTime = new Date()
    
    let newContainerData = {
        type: 'visualContainer',  // TODO: allow adding different kinds of containers
        parentContainerIdentifier: parentContainerIdentifier,
        identifier: 'AddedContainer_' + currentDateTime.getTime(),
        name: 'My Added Container',
        localPosition: {
            x: localPosition.x,
            y: localPosition.y
        },
        localScale: 1,
        localSize: {
            width: 200,
            height: 250
        }
    }
        // FIXME; remove OLD WAY: storeContainerData(newContainerData)
    databaseData.visual.containers[newContainerData.identifier] = newContainerData
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[newContainerData.identifier] = true
}

function storeConnectionData(connectionData) {
    databaseData.visual.connections[connectionData.identifier] = connectionData
    databaseDataHasChanged = true
    
    connectionIdentifiersToBeStored[connectionData.identifier] = true
}

function storeContainerParent(containerIdentififer, parentContainerIdentifier) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.parentContainerIdentifier = parentContainerIdentifier
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerLocalPosition(containerIdentififer, localPosition) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.localPosition = localPosition
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerLocalSize(containerIdentififer, localSize) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.localSize = localSize
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerLocalScale(containerIdentififer, localScale) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.localScale = localScale
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerLocalFontSize(containerIdentififer, localFontSize) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.localFontSize = localFontSize
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerType(containerIdentififer, containerType) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.type = containerType
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeContainerDataType(containerIdentififer, dataType) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.dataType = dataType
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

function storeConnectionDataType(connectionIdentififer, dataType) {
    // TODO: creating empty visualConnectionData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.connections.hasOwnProperty(connectionIdentififer)) {
        databaseData.visual.connections[connectionIdentififer] = { 'identifier': connectionIdentififer }
    }
    let visualConnectionData = databaseData.visual.connections[connectionIdentififer]
    visualConnectionData.dataType = dataType
    databaseDataHasChanged = true
    
    connectionIdentifiersToBeStored[connectionIdentififer] = true
}

function storeContainerName(containerIdentififer, containerName) {
    // TODO: creating empty visualContainerData inside databaseData.visual. Is this correct?
    if (!databaseData.visual.containers.hasOwnProperty(containerIdentififer)) {
        databaseData.visual.containers[containerIdentififer] = { 'identifier': containerIdentififer }
    }
    let visualContainerData = databaseData.visual.containers[containerIdentififer]
    visualContainerData.name = containerName
    databaseDataHasChanged = true
    
    containerIdentifiersToBeStored[containerIdentififer] = true
}

// TODO: storeContainerType(containerIdentififer, type)
// TODO: storeContainerDataType(containerIdentififer, dataType)

function storeVisualData() {
    let url = 'api.php?action=set_visual_data&project=' + project
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
