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
 
ZUI.interaction = {
    centerViewOnWorldCenter : false,
    centerViewOnWorldCenterWithPanning : false,
    centerViewOnFirstSelectedContainer :  false,
    centerViewOnSelectedConnection : false,
    viewScale : 1,
	levelOfDetailToAlwaysShow : 0.0,
    viewOffset : { x: 0, y: 0},
    viewIsBeingDraggedByMouse : false,
    viewIsBeingDraggedByTouch : false,
    viewAsIsoMetric : false,
    percentageIsoMetric : 0,
    showGrid : false,
    isoMetricAnimationRunning : false,
    highlightHoveredContainer : false,
    
    panningAnimationIsActive : false,
    startPanningViewOffset: null,
    startPanningViewScale : null,
    targetPanningViewOffset: null,
    targetPanningViewScale : null,
    timePanned : 0, // seconds
    totalPanningTime : 1.0, // seconds
   
    currentlyHoveredMenuButton : null,
    currentlySelectedMode : 'view',
    
    // TODO: we should probably keep record of where things (like the view or a container) is being selected/dragged BY
    //       sometimes its the mouse, sometimes its a touch. We might want to keep a record of that.
    
    closestConnectionDistance : null, // distance from mouse pointer
    closestConnectionIdentifier : null,
    
    currentlyHoveredConnectionIdentifier : null,
    currentlySelectedConnectionIdentifier : null,
    

    currentlyHoveredContainerIdentifier : null,
    currentlySelectedContainerIdentifiers : [],
    
    selectedContainersAreBeingDragged : false,
    emcompassingContainerIdentifier : null,
    
    selectedContainerIsBeingResized : false,
    selectedContainerResizeSide : null,
    mouseIsNearSelectedContainerBorder : false,
    
    newConnectionBeingAddedIdentifier : null,
    newConnectionBeingAddedData : null,

    // TODO: should we only edit a model? And then change the container/connection text accordingly (and save to the backend)?
    currentlyEditingContainerText : null, // TODO: maybe edit container attribute? Using some kind of Id?
    currentlyEditingConnectionText : null, // TODO: maybe edit connection attribute? Using some kind of Id?
    currentlyEditingDataText : null, // TODO: how do we refer to a point in the data structure? Using some kind of Id?
    
    mousePointerStyle: 'default'  // Possible mouse styles: http://www.javascripter.net/faq/stylesc.htm
}

// FIXME: put this somewhere else! (and finetune it)
ZUI.minimumDistanceFromConnectionToDetectMouseHover = 8

function handleInputStateChange () {
    
    let containerAtMousePosition = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, false)
    let menuButtonAtMousePosition = findMenuButtonAtScreenPosition(ZUI.mouseState.position)
    
    if (menuButtonAtMousePosition != null) {
        ZUI.interaction.currentlyHoveredContainerIdentifier = null
        ZUI.interaction.currentlyHoveredMenuButton = menuButtonAtMousePosition
    }
    else {
        if (ZUI.interaction.currentlySelectedMode === 'connect') {
            if (ZUI.interaction.closestConnectionIdentifier != null && ZUI.interaction.closestConnectionDistance < ZUI.minimumDistanceFromConnectionToDetectMouseHover) {
                ZUI.interaction.currentlyHoveredConnectionIdentifier = ZUI.interaction.closestConnectionIdentifier
            }
            else {
                ZUI.interaction.currentlyHoveredConnectionIdentifier = null
            }
            
/*            
            let connectionAtMousePosition = findConnectionAtWorldPosition(ZUI.mouseState.worldPosition)
            // FIXME: put this in a separate function (hoverconnectionbymouse or selectconnection by mouse)
            if (connectionAtMousePosition != null) {
                ZUI.interaction.currentlyHoveredConnectionIdentifier = connectionAtMousePosition.identifier
            }
            else {
                ZUI.interaction.currentlyHoveredConnectionIdentifier = null
            }
*/
            ZUI.interaction.currentlyHoveredMenuButton = null
        }
        else {
            
            // FIXME: put this in a separate function (hovercontainerbymouse or selectcontainer by mouse)
            if (containerAtMousePosition != null) {
                ZUI.interaction.currentlyHoveredContainerIdentifier = containerAtMousePosition.identifier
                ZUI.interaction.currentlyHoveredConnectionIdentifier = null
            }
            else {
                ZUI.interaction.currentlyHoveredContainerIdentifier = null
            }

            // We prefer container hovering over connection hovering, so only check hovering connections if no container is hovered
            if (ZUI.interaction.currentlyHoveredContainerIdentifier == null) {
                // FIXME: put this in a separate function (hoverconnectionbymouse or something)
                if (ZUI.interaction.closestConnectionIdentifier != null && ZUI.interaction.closestConnectionDistance < ZUI.minimumDistanceFromConnectionToDetectMouseHover) {
                    ZUI.interaction.currentlyHoveredConnectionIdentifier = ZUI.interaction.closestConnectionIdentifier
                }
                else {
                    ZUI.interaction.currentlyHoveredConnectionIdentifier = null
                    
                }
            }
            
            ZUI.interaction.currentlyHoveredMenuButton = null
        }
    }
    
    // TODO: maybe we do not always want to disable dragging/editing/etc if we happen to move the mouse over a menu item?
    if (ZUI.interaction.currentlyHoveredMenuButton == null) { 
        if (ZUI.interaction.currentlySelectedMode === 'connect') {
            doAddNewConnection()
            
            doDeleteConnectionByKeyboard()
            doChangeContainerDataTypeSelectedConnectionByKeyboard()
            
            if (ZUI.interaction.newConnectionBeingAddedIdentifier == null) {
                doConnectionSelectionByMouse()
            }
            // FIXME: check if no connections are selected!
            if (ZUI.interaction.newConnectionBeingAddedIdentifier == null) {
                doViewDraggingByMouse()
            }
            doViewZoomingByMouse()
        }
        else if (ZUI.interaction.currentlySelectedMode === 'move') {
            doAddNewContainer()  // TODO: this should become a multi-step process, so we should check if its on-going after calling this function
            if (true) {  
                doEditContainerText()
                if (ZUI.interaction.currentlyEditingContainerText == null) {
                    
                    doDeleteContainerByKeyboard()
                    doSelectChildContainersByKeyboard()
                    // TODO: this may change the hovered-over (part of the) container, so the functions below might not be accurate. Maybe skip them when re-scale has happened?
                    doReScaleSelectedContainersByKeyboard() 
                    doChangeFontSizeSelectedContainersByKeyboard()
                    doChangeContainerTypeSelectedContainersByKeyboard()
                    doChangeContainerDataTypeSelectedContainersByKeyboard()
                    
                    if (!ZUI.interaction.mouseIsNearSelectedContainerBorder && 
                        !ZUI.interaction.selectedContainerIsBeingResized &&
                        !ZUI.interaction.selectedContainersAreBeingDragged &&
                        !ZUI.interaction.viewIsBeingDraggedByMouse) {
                        let containerWasClicked = doContainerSelectionByMouse()
                    }
                    
                    if (!ZUI.interaction.mouseIsNearSelectedContainerBorder && 
                        !ZUI.interaction.selectedContainerIsBeingResized &&
                        !ZUI.interaction.viewIsBeingDraggedByMouse) {
                        doContainerDraggingByMouse()
                    }
                    
                    if (!ZUI.interaction.selectedContainersAreBeingDragged && 
                        !ZUI.interaction.viewIsBeingDraggedByMouse) {
                        doContainerResizingByMouse()
                    }
                    
                    
                    if (ZUI.interaction.currentlySelectedContainerIdentifiers.length == 0) {
                        doViewDraggingByMouse()
                    }
                    
                }
            }
            
            doViewZoomingByMouse()
        }
        else if (ZUI.interaction.currentlySelectedMode === 'view') {
// FIXME
doChangeConnectionPointSelectedConnectionByKeyboard()            
            let containerWasClicked = doContainerSelectionByMouse()
            doConnectionSelectionByMouse(containerWasClicked)
            doViewDraggingByMouse()
            doViewZoomingByMouse()
        }
    }
    else {
        // If we hover a menu button, we want to see a default mouse pointer
        ZUI.interaction.mousePointerStyle = 'default'
        
        doMenuButtonModeSelect()
        doMenuButtonIsoMetricToggle()
        doMenuButtonGridToggle()
    }
    
    // Always do view dragging and zooming by touch
    doViewDraggingAndZoomingByTouch()
    
}


// ====== MENU ======

function doMenuButtonModeSelect() {
    if (ZUI.mouseState.leftButtonHasGoneDown && ZUI.interaction.currentlyHoveredMenuButton.mode) {
        // If its a menu button with a 'mode', then we select that mode
        ZUI.interaction.currentlySelectedMode = ZUI.interaction.currentlyHoveredMenuButton.mode
        
        if (ZUI.interaction.currentlySelectedMode === 'view') {
            // TODO: we currently do not allow containers to be selected in view-mode, so we de-select
            //       all selected containers here. But we might want to allow selecting of containers in
            //       view-mode
            ZUI.interaction.currentlySelectedContainerIdentifiers = []
            // We also disable all these states
            ZUI.interaction.selectedContainerIsBeingResized = false
            ZUI.interaction.selectedContainersAreBeingDragged = false
            ZUI.interaction.mouseIsNearSelectedContainerBorder = false
        }
    }
}

function doMenuButtonIsoMetricToggle() {
    if (ZUI.mouseState.leftButtonHasGoneDown && ZUI.interaction.currentlyHoveredMenuButton.toggle === 'isoMetric') {
        if (ZUI.interaction.viewAsIsoMetric) {
            ZUI.interaction.viewAsIsoMetric = false
            ZUI.interaction.isoMetricAnimationRunning = true
        }
        else {
            ZUI.interaction.viewAsIsoMetric = true
            ZUI.interaction.isoMetricAnimationRunning = true
        }
    }
}

function doMenuButtonGridToggle() {
    if (ZUI.mouseState.leftButtonHasGoneDown && ZUI.interaction.currentlyHoveredMenuButton.toggle === 'grid') {
        ZUI.interaction.showGrid = !ZUI.interaction.showGrid
    }
}

// ====== CONNECTION ======

function doConnectionSelectionByMouse(containerWasClicked) {
    
    // If escape is pressed, de-select the selected connection
    if (hasKeyGoneDown('ESCAPE')) {
        ZUI.interaction.currentlySelectedConnectionIdentifier = null
    }
    
    if (!ZUI.mouseState.leftButtonHasGoneDownTwice &&
         ZUI.mouseState.leftButtonHasGoneDown) { // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)

        // TODO: right now we do not allow selecting multiple connections so we do not check the ctrl-key here. We now always deselect the connection when a container was clicked.
        if (containerWasClicked) {
            ZUI.interaction.currentlySelectedConnectionIdentifier = null
            return
        }

        if (ZUI.interaction.closestConnectionIdentifier != null && ZUI.interaction.closestConnectionDistance < ZUI.minimumDistanceFromConnectionToDetectMouseHover) {
            ZUI.interaction.currentlySelectedConnectionIdentifier = ZUI.interaction.closestConnectionIdentifier
        }
        else {
            ZUI.interaction.currentlySelectedConnectionIdentifier = null
        }
        /*
        let connectionAtMousePosition = findConnectionAtWorldPosition(ZUI.mouseState.worldPosition)
        
        if (connectionAtMousePosition != null) {
            // When we click on a connection it becomes the selected connection
            ZUI.interaction.currentlySelectedConnectionIdentifier = connectionAtMousePosition.identifier
        }
        else {
            // When we click in the background, de-select the selected connection
            ZUI.interaction.currentlySelectedConnectionIdentifier = null
        }
        */
    }
}

function doAddNewConnection() {
    
    let containerAtMousePosition = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, false)
    
    // TODO: is this always correct?
    ZUI.interaction.mousePointerStyle = 'default'
        
    if (!ZUI.mouseState.rightButtonHasGoneDownTwice &&
         ZUI.mouseState.rightButtonHasGoneDown) {  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
        
        let currentDateTime = new Date()
        
        if (containerAtMousePosition != null) {
            ZUI.interaction.newConnectionBeingAddedData = {
                identifier: containerAtMousePosition.identifier + '->' + currentDateTime.getTime(), // Since we dont known the to-identifier yet, we put in a "random" number for now
                name: 'Added connection',
                fromContainerIdentifier: containerAtMousePosition.identifier,
                toContainerIdentifier: null,
                type: 'API2API' // FIXME: we need a better default connection type
            }
            let newConnection = createConnection(ZUI.interaction.newConnectionBeingAddedData)
            ZUI.interaction.newConnectionBeingAddedIdentifier = newConnection.identifier
        }
    }
    
    // TODO: add a real connection if we are above a container! (or if the newConnectionBeingAdded.toContainerIdentifier is not null)
    if (ZUI.interaction.newConnectionBeingAddedIdentifier != null) {
        let newConnectionBeingAdded = getConnectionByIdentifier(ZUI.interaction.newConnectionBeingAddedIdentifier)
        if (containerAtMousePosition != null &&
            containerAtMousePosition.identifier !== newConnectionBeingAdded.fromContainerIdentifier) {
            // We are hovering over a different container than we started the connection from, so we should connect with it
            // TODO: we shouldn't do this twice, right?
            newConnectionBeingAdded.toContainerIdentifier = containerAtMousePosition.identifier
            ZUI.interaction.newConnectionBeingAddedData.toContainerIdentifier = containerAtMousePosition.identifier

            // TODO: this is not really what we want, we have to remove the connection, since we are changing its identifier
            removeConnection(newConnectionBeingAdded.identifier)
            // TODO: we shouldn't do this triple, right?
            let connectionIdentifier = newConnectionBeingAdded.fromContainerIdentifier + "->" + newConnectionBeingAdded.toContainerIdentifier
            newConnectionBeingAdded.identifier = connectionIdentifier
            ZUI.interaction.newConnectionBeingAddedData.identifier = connectionIdentifier
            ZUI.interaction.newConnectionBeingAddedIdentifier = connectionIdentifier
            
            // TODO: this is not really what we want, we have to rre-create the connection, since we are changing its identifier
            newConnectionBeingAdded = createConnection(ZUI.interaction.newConnectionBeingAddedData)
            ZUI.interaction.newConnectionBeingAddedIdentifier = newConnectionBeingAdded.identifier
            
        }
        else {
            // TODO: we shouldn't do this twice, right?
            newConnectionBeingAdded.toContainerIdentifier = null
            ZUI.interaction.newConnectionBeingAddedData.toContainerIdentifier = null
        }
        
        if (ZUI.mouseState.rightButtonHasGoneUp) {
            if (ZUI.interaction.newConnectionBeingAddedData.toContainerIdentifier != null) {
                storeConnectionData(ZUI.interaction.newConnectionBeingAddedData)
            }
            ZUI.interaction.newConnectionBeingAddedIdentifier = null
            ZUI.interaction.newConnectionBeingAddedData = null
        }
    }
    
}

function doDeleteConnectionByKeyboard() {
    
    // If delete is pressed, we delete the  selected connection
    if (hasKeyGoneDown('DELETE')) {
        
        if (ZUI.interaction.currentlySelectedConnectionIdentifier != null) {
            deleteConnectionData(ZUI.interaction.currentlySelectedConnectionIdentifier)
        }
        ZUI.interaction.currentlySelectedConnectionIdentifier = null
        ZUI.interaction.currentlyHoveredConnectionIdentifier = null // TODO: we might only want to do this if the hovered container is the deleted container
    }
    
}

function doSelectChildContainersByKeyboard() {
    
    // If 'C' is pressed, we select all its child containers
    if (hasKeyGoneDown('C')) {
        // For now, we only allow selecting children only when a single container has been selected
        if (ZUI.interaction.currentlySelectedContainerIdentifiers.length > 1) {
            return
        }
        
        let currentlySelectedContainerIdentifier = 'root' // If nothing is selected, we do as-if the root container has been selected (when selecting all children)
        if (ZUI.interaction.currentlySelectedContainerIdentifiers.length !== 0) {
            currentlySelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
        }
        
        let currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)
        
        ZUI.interaction.currentlySelectedContainerIdentifiers = []
        for (let childContainerIdentifierIndex = 0; childContainerIdentifierIndex < currentlySelectedContainer.children.length; childContainerIdentifierIndex++) {
            let childContainerIdentifier = currentlySelectedContainer.children[childContainerIdentifierIndex]
            if (!ZUI.interaction.currentlySelectedContainerIdentifiers.includes(childContainerIdentifier)) {
                ZUI.interaction.currentlySelectedContainerIdentifiers.push(childContainerIdentifier)
            }
        }
        
    }
    
}

function doDeleteContainerByKeyboard() {
    
    // If delete is pressed, we delete all selected containers
    if (hasKeyGoneDown('DELETE')) {
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            deleteContainerData(selectedContainerIdentifier)
            // FIXME: if a container is fully delete (that is: it exists only in the visual-data, not in the source)
            //        AND it has connections from/to it, we should ALSO delete thos connections OR disallow it
            // FIXME: also take into account that containers that are fully delete can have children, for which its parent
            //        also has to be changed/reverted to the source
        }
        ZUI.interaction.currentlySelectedContainerIdentifiers = []
        ZUI.interaction.selectedContainerIsBeingResized = false
        ZUI.interaction.selectedContainersAreBeingDragged = false
        ZUI.interaction.mouseIsNearSelectedContainerBorder = false
        ZUI.interaction.currentlyHoveredContainerIdentifier = null // TODO: we might only want to do this if the hovered container is the deleted container
    }
    
}

function doReScaleSelectedContainersByKeyboard() {
    
    // If "[" or "]" is pressed, we scale down or up all selected containers
    if (hasKeyGoneDown('OPEN_BRACKET')) {
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
            selectedContainer.localScale /= 2
            recalculateWorldPositionsAndSizes(selectedContainer)
            storeContainerLocalScale(selectedContainer.identifier, selectedContainer.localScale)
        }
    }
    if (hasKeyGoneDown('CLOSE_BRACKET')) {
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
            selectedContainer.localScale *= 2
            recalculateWorldPositionsAndSizes(selectedContainer)
            storeContainerLocalScale(selectedContainer.identifier, selectedContainer.localScale)
        }
    }
    
}

function doChangeContainerTypeSelectedContainersByKeyboard() {

    if (ZUI.colorAndShapeMappings == null) {
        return
    }
    let containerTypeToContainerShapeAndColor = ZUI.colorAndShapeMappings.containerTypeToContainerShapeAndColor
    
    // For now, we only allow changing container type only when a single container has been selected
    if (ZUI.interaction.currentlySelectedContainerIdentifiers.length !== 1) {
        return
    }
    let currentlySelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
    let currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)

    let possibleContainerTypes = Object.keys(containerTypeToContainerShapeAndColor)
    possibleContainerTypes.unshift(null) // Note: the first item is null (meaning: no containerType)
    let nrOfpossibleContainerTypes = possibleContainerTypes.length
    
    let containerTypeIndex = 0
    if (currentlySelectedContainer.type != null) { // so, if type == null, containerTypeIndex will be 0
        for (containerTypeIndex = 1; containerTypeIndex < nrOfpossibleContainerTypes; containerTypeIndex++) {
            let possibleContainerType = possibleContainerTypes[containerTypeIndex]
            if (currentlySelectedContainer.type === possibleContainerType) {
                // We found the container type in the list of possible container types, so we keep containerTypeIndex
                break;
            }
        }
    }

    // If "," or "." is pressed, we change the container type of the selected container
    let hasChanged = false
    if (hasKeyGoneDown('PERIOD')) {
        containerTypeIndex++
        hasChanged = true
    }
    if (hasKeyGoneDown('COMMA')) {
        containerTypeIndex--
        hasChanged = true
    }
    
    if (hasChanged) {
        containerTypeIndex = containerTypeIndex % nrOfpossibleContainerTypes
        storeContainerType(currentlySelectedContainer.identifier, possibleContainerTypes[containerTypeIndex])
    }
 
}

function doChangeContainerDataTypeSelectedContainersByKeyboard() {

    if (ZUI.colorAndShapeMappings == null) {
        return
    }
    let dataTypeToColor = ZUI.colorAndShapeMappings.dataTypeToColor
    
    // For now, we only allow changing data type only when a single container has been selected
    if (ZUI.interaction.currentlySelectedContainerIdentifiers.length !== 1) {
        return
    }
    let currentlySelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
    let currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)

    let possibleDataTypes = Object.keys(dataTypeToColor)
    possibleDataTypes.unshift(null) // Note: the first item is null (meaning: no dataType)
    let nrOfpossibleDataTypes = possibleDataTypes.length
    
    let dataTypeIndex = 0
    if (currentlySelectedContainer.dataType != null) { // so, if dataType == null, dataTypeIndex will be 0
        for (dataTypeIndex = 1; dataTypeIndex < nrOfpossibleDataTypes; dataTypeIndex++) {
            let possibleDataType = possibleDataTypes[dataTypeIndex]
            if (currentlySelectedContainer.dataType === possibleDataType) {
                // We found the container type in the list of possible container types, so we keep dataTypeIndex
                break;
            }
        }
    }

    // If "-" or "=" is pressed, we change the data type of the selected container
    let hasChanged = false
    if (hasKeyGoneDown('EQUALS')) {
        dataTypeIndex++
        hasChanged = true
    }
    if (hasKeyGoneDown('MINUS')) {
        dataTypeIndex--
        hasChanged = true
    }
    
    if (hasChanged) {
        dataTypeIndex = dataTypeIndex % nrOfpossibleDataTypes
        storeContainerDataType(currentlySelectedContainer.identifier, possibleDataTypes[dataTypeIndex])
    }
 
}


function doChangeContainerDataTypeSelectedConnectionByKeyboard() {

    if (ZUI.colorAndShapeMappings == null) {
        return
    }
    let dataTypeToColor = ZUI.colorAndShapeMappings.dataTypeToColor
    
    if (ZUI.interaction.currentlySelectedConnectionIdentifier == null) {
        return
    }
    let currentlySelectedConnection = getConnectionByIdentifier(ZUI.interaction.currentlySelectedConnectionIdentifier)

    let possibleDataTypes = Object.keys(dataTypeToColor)
    possibleDataTypes.unshift(null) // Note: the first item is null (meaning: no dataType)
    let nrOfpossibleDataTypes = possibleDataTypes.length
    
    let dataTypeIndex = 0
    if (currentlySelectedConnection.dataType != null) { // so, if dataType == null, dataTypeIndex will be 0
        for (dataTypeIndex = 1; dataTypeIndex < nrOfpossibleDataTypes; dataTypeIndex++) {
            let possibleDataType = possibleDataTypes[dataTypeIndex]
            if (currentlySelectedConnection.dataType === possibleDataType) {
                // We found the container type in the list of possible container types, so we keep dataTypeIndex
                break;
            }
        }
    }
    // If "-" or "=" is pressed, we change the data type of the selected container
    let hasChanged = false
    if (hasKeyGoneDown('EQUALS')) {
        dataTypeIndex++
        hasChanged = true
    }
    if (hasKeyGoneDown('MINUS')) {
        dataTypeIndex--
        hasChanged = true
    }
    
    if (hasChanged) {
        dataTypeIndex = dataTypeIndex % nrOfpossibleDataTypes
        storeConnectionDataType(currentlySelectedConnection.identifier, possibleDataTypes[dataTypeIndex])
    }
 
}

function doChangeConnectionPointSelectedConnectionByKeyboard() {

    if (ZUI.containerShapes == null) {
        return
    }
    
    if (ZUI.interaction.currentlySelectedConnectionIdentifier == null) {
        return
    }
    let currentlySelectedConnection = getConnectionByIdentifier(ZUI.interaction.currentlySelectedConnectionIdentifier)

    // From
    let fromContainerIdentifier = currentlySelectedConnection.fromContainerIdentifier
    let fromContainer = getContainerByIdentifier(fromContainerIdentifier)
    if (fromContainer == null) {
        return
    }
    let fromContainerShape = ZUI.containerShapes[fromContainer.shapeType]
    if (!fromContainerShape) {
        return
    }
    
    // To
    let toContainerIdentifier = currentlySelectedConnection.toContainerIdentifier
    let toContainer = getContainerByIdentifier(toContainerIdentifier)
    if (toContainer == null) {
        return
    }
    let toContainerShape = ZUI.containerShapes[toContainer.shapeType]
    if (!toContainerShape) {
        return
    }
    
    // From
    let possibleConnectionPointsFrom = []
    let sortedPointIdentifiersFrom = Object.keys(fromContainerShape.points).sort()
    for (let pointIdentifierIndex = 0; pointIdentifierIndex < sortedPointIdentifiersFrom.length; pointIdentifierIndex++)  {
        let pointIdentifier = sortedPointIdentifiersFrom[pointIdentifierIndex]
        let point = fromContainerShape.points[pointIdentifier]
    
        if (point.isConnectionPoint) {
            possibleConnectionPointsFrom.push(pointIdentifier)
        }
    }
    possibleConnectionPointsFrom.unshift(null) // Note: the first item is null (meaning: no pointIdentifier)
    let nrOfpossibleConnectionPointsFrom = possibleConnectionPointsFrom.length
    
    let fromConnectionPointIndex = 0
    if (currentlySelectedConnection.fromConnectionPointIdentifier != null) { // so, if fromConnectionPointIdentifier == null, fromConnectionPointIndex will be 0
        for (fromConnectionPointIndex = 1; fromConnectionPointIndex < nrOfpossibleConnectionPointsFrom; fromConnectionPointIndex++) {
            let possibleconnectionPointIdentifier = possibleConnectionPointsFrom[fromConnectionPointIndex]
            if (currentlySelectedConnection.fromConnectionPointIdentifier === possibleconnectionPointIdentifier) {
                // We found the connection point in the list of possible connection points, so we keep fromConnectionPointIndex
                break;
            }
        }
    }

    // To
    let possibleConnectionPointsTo = []
    let sortedPointIdentifiersTo = Object.keys(toContainerShape.points).sort()
    for (let pointIdentifierIndex = 0; pointIdentifierIndex < sortedPointIdentifiersTo.length; pointIdentifierIndex++)  {
        let pointIdentifier = sortedPointIdentifiersTo[pointIdentifierIndex]
        let point = toContainerShape.points[pointIdentifier]
    
        if (point.isConnectionPoint) {
            possibleConnectionPointsTo.push(pointIdentifier)
        }
    }
    possibleConnectionPointsTo.unshift(null) // Note: the first item is null (meaning: no pointIdentifier)
    let nrOfpossibleConnectionPointsTo = possibleConnectionPointsTo.length
    
    let toConnectionPointIndex = 0
    if (currentlySelectedConnection.toConnectionPointIdentifier != null) { // so, if toConnectionPointIdentifier == null, toConnectionPointIndex will be 0
        for (toConnectionPointIndex = 1; toConnectionPointIndex < nrOfpossibleConnectionPointsTo; toConnectionPointIndex++) {
            let possibleconnectionPointIdentifier = possibleConnectionPointsTo[toConnectionPointIndex]
            if (currentlySelectedConnection.toConnectionPointIdentifier === possibleconnectionPointIdentifier) {
                // We found the connection point in the list of possible connection points, so we keep toConnectionPointIndex
                break;
            }
        }
    }
    
    // If "1" or "2" is pressed, we change the connection points of the from container
    let fromHasChanged = false
    if (hasKeyGoneDown('2')) {
        fromConnectionPointIndex++
        fromHasChanged = true
    }
    if (hasKeyGoneDown('1')) {
        fromConnectionPointIndex--
        fromHasChanged = true
    }
    
    if (fromHasChanged) {
        fromConnectionPointIndex = fromConnectionPointIndex % nrOfpossibleConnectionPointsFrom
        
        // FIXME: we should INSTEAD check the BOUNDARIES of the possibleConnectionPointsFrom array (and loop around)!
        let fromConnectionPointIdentifier = possibleConnectionPointsFrom[fromConnectionPointIndex]
        if (fromConnectionPointIdentifier === undefined) {
            fromConnectionPointIdentifier = null
        }
        storeConnectionConnectionPoint(currentlySelectedConnection.identifier, 'from', fromConnectionPointIdentifier)
    }
 
    // If "3" or "4" is pressed, we change the connection points of the from container
    let toHasChanged = false
    if (hasKeyGoneDown('4')) {
        toConnectionPointIndex++
        toHasChanged = true
    }
    if (hasKeyGoneDown('3')) {
        toConnectionPointIndex--
        toHasChanged = true
    }
    
    if (toHasChanged) {
        toConnectionPointIndex = toConnectionPointIndex % nrOfpossibleConnectionPointsTo

        // FIXME: we should INSTEAD check the BOUNDARIES of the possibleConnectionPointsFrom array (and loop around)!
        let toConnectionPointIdentifier = possibleConnectionPointsTo[toConnectionPointIndex]
        if (toConnectionPointIdentifier === undefined) {
            toConnectionPointIdentifier = null
        }
        storeConnectionConnectionPoint(currentlySelectedConnection.identifier, 'to', toConnectionPointIdentifier)
    }
}


function doChangeFontSizeSelectedContainersByKeyboard() {
    
    // If "9" or "0" is pressed, we scale down or up the font size of all selected containers
    if (hasKeyGoneDown('0')) {
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
            if (selectedContainer.localFontSize == null) {
                // FIXME: hardcoded default fontsize!
                selectedContainer.localFontSize = 14
            }
            selectedContainer.localFontSize += 2
            storeContainerLocalFontSize(selectedContainer.identifier, selectedContainer.localFontSize)
        }
    }
    if (hasKeyGoneDown('9')) {
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
            if (selectedContainer.localFontSize == null) {
                // FIXME: hardcoded default fontsize!
                selectedContainer.localFontSize = 14
            }
            selectedContainer.localFontSize -= 2
            storeContainerLocalFontSize(selectedContainer.identifier, selectedContainer.localFontSize)
        }
    }
    
}

function doContainerSelectionByMouse() {
    
    let containerWasClicked = false
    
    let containerAtMousePosition = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, false)
    
    // If escape is pressed, de-select all containers    
    if (hasKeyGoneDown('ESCAPE')) {
        ZUI.interaction.currentlySelectedContainerIdentifiers = []
    }
    
    if (!ZUI.mouseState.leftButtonHasGoneDownTwice &&
         ZUI.mouseState.leftButtonHasGoneDown) { // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
         
        if (ZUI.keyboardState.ctrlIsDown) {
            if (containerAtMousePosition != null) {
                containerWasClicked = true
                
                if (ZUI.interaction.currentlySelectedContainerIdentifiers.includes(containerAtMousePosition.identifier)) {
                    // If a container was already selected and clicked again (with ctrl down), its de-selected
                    let selectedContainerIdentifierIndex = ZUI.interaction.currentlySelectedContainerIdentifiers.indexOf(containerAtMousePosition.identifier)
                    if (selectedContainerIdentifierIndex !== -1) {
                        ZUI.interaction.currentlySelectedContainerIdentifiers.splice(selectedContainerIdentifierIndex, 1)
                    }
                }
                else {
                    if (ZUI.interaction.currentlySelectedContainerIdentifiers.length > 0) {
                        let firstSelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
                        let firstSelectedContainer = getContainerByIdentifier(firstSelectedContainerIdentifier)
                        
                        // Note that it is only allowed to select mutliple containers if they have *same* parent
                        if (firstSelectedContainer.parentContainerIdentifier === containerAtMousePosition.parentContainerIdentifier) {
                            // If a container was not selected yet and clicked (with ctrl down), its also selected
                            if (!ZUI.interaction.currentlySelectedContainerIdentifiers.includes(containerAtMousePosition.identifier)) {
                                ZUI.interaction.currentlySelectedContainerIdentifiers.push(containerAtMousePosition.identifier)
                            }
                        }
                        else {
                            // When a container is clicked (with ctrl down) and it doesnt have the same parent as the container(s)
                            // already selected, we do not add it to the selection
                        }
                    }
                    else {
                        // If a container was not selected yet and clicked (with ctrl down), its also selected
                        if (!ZUI.interaction.currentlySelectedContainerIdentifiers.includes(containerAtMousePosition.identifier)) {
                            ZUI.interaction.currentlySelectedContainerIdentifiers.push(containerAtMousePosition.identifier)
                        }
                    }
                }
            }
            else {
                // When the background is clicked (while holding ctrl), we do nothing to the selection
            }
        }
        else {
            if (containerAtMousePosition != null) {
                containerWasClicked = true
                if (ZUI.interaction.currentlySelectedContainerIdentifiers.includes(containerAtMousePosition.identifier)) {
                    // if a container is clicked and was selected already (when ctrl is not down) we do not de-select it, 
                    // we do nothing (the selected contains need to be kept selected and are about to be dragged)
                }
                else {
                    // if a container is clicked and wasn't selected already (when ctrl is not down) it becomes the (only) selected container
                    ZUI.interaction.currentlySelectedContainerIdentifiers = [containerAtMousePosition.identifier]
                }
            }
            else {
                // When we click in the background, de-select all selected containers (when ctrl is not down)
                ZUI.interaction.currentlySelectedContainerIdentifiers = []
            }
        }
    }
    
    return containerWasClicked
}

function doContainerDraggingByMouse() {
  
    // Note: we can assume then all selected containers have the *same* parent
    
    if (ZUI.interaction.currentlyHoveredContainerIdentifier != null) {
        ZUI.interaction.mousePointerStyle = 'move'
    }
    else {
        ZUI.interaction.mousePointerStyle = 'default'
    }
    
    if (ZUI.interaction.selectedContainersAreBeingDragged) {
        if (ZUI.mouseState.hasMoved) {

            for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
                let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
                
                let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
                let parentWorldScale = selectedContainer.worldScale / selectedContainer.localScale
                
                selectedContainer.localPosition.x += (ZUI.mouseState.worldPosition.x - ZUI.mouseState.previousWorldPosition.x) / parentWorldScale
                selectedContainer.localPosition.y += (ZUI.mouseState.worldPosition.y - ZUI.mouseState.previousWorldPosition.y) / parentWorldScale
                recalculateWorldPositionsAndSizes(selectedContainer)
            }
        }
        
        let firstSelectedContainer = null
        for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
            let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
            firstSelectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
        }
        
        if (firstSelectedContainer == null) {
            console.log('ERROR: there is no first selected container even though selectedContainersAreBeingDragged is true!')
            return;
        }

        /*
        if (containerAtMousePosition == null) {
            console.log('ERROR: there is not container at the mouse position, even though we are dragging container(s)!')
            return
        }
        */

        // TODO: rename emcompassingContainer to hoveringParentContainer?
        let excludeSelectedContainers = true
        // TODO: we now take the left-top position of the first selected container (over which our mouse-pointer is hovering, which is one of the containers we are dragging)
        //       we do NOT use the mouse pointer since we might be dragging a container at its right-bottom position and dropping
        //       this container inside another container can be very confusing: its size might get much smaller, but its position is at the same
        //       world position, meaning it is going to be dropped far outside the new parent container.
        // let encompassingContainer = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, excludeSelectedContainers)
        let encompassingContainer = findContainerAtWorldPosition(firstSelectedContainer.worldPosition, null, excludeSelectedContainers)
        if (encompassingContainer != null) {
            ZUI.interaction.emcompassingContainerIdentifier = encompassingContainer.identifier
        }
        else {
            // TODO: We set parent to 'root' if emcompassingContainerIdentifier == null, but shouldnt findContainerEncompassingWorldRectangle already return 'root'?
            ZUI.interaction.emcompassingContainerIdentifier = 'root'
        }
        
        // FIXME: since we draw depth-first it can occur the when we drag a container over another parent, the parent is draw *over* the container we try to drag on top of it!
        //        A possible solution would be to draw a dragged container (and its children) in a *second pass* and not draw it in the first pass.
        
        if (ZUI.mouseState.leftButtonHasGoneUp) {
            
            for (let selectedContainerIdentifierIndex = 0;  selectedContainerIdentifierIndex < ZUI.interaction.currentlySelectedContainerIdentifiers.length; selectedContainerIdentifierIndex++) {
                let selectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[selectedContainerIdentifierIndex]
                
                let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
                
                // We are checking if we are landing on a (different) encompassingContainer, if so make it the parent 
                // We also check the if the selectedContainer isnt somehow the parent of the emcompassingContainer!
                if (containerIsSomeParentOfChild(selectedContainer, encompassingContainer)) {
                    // FIXME: this only seems to happen when multi-selecting now
                    // TODO: we probably want to *restore* the positions in this case! Better to prevent this from ever happening though
                    console.log('WARNING: Somehow the selectedContainer is the parent of the emcompassingContainer!')
                }
                if (selectedContainer.parentContainerIdentifier != ZUI.interaction.emcompassingContainerIdentifier &&
                    !containerIsSomeParentOfChild(selectedContainer, encompassingContainer)) {

                    // Get the worldPosition of the current container
                    let currentContainerWorldPosition = selectedContainer.worldPosition
                    
                     // Get the worldPosition of the encompassingContainer (the new parent)
                    let newParentContainer = getContainerByIdentifier(ZUI.interaction.emcompassingContainerIdentifier)
                    let newParentContainerWorldPosition = newParentContainer.worldPosition
                    
                    // Substract these two worldPositions: take into account the (world and local)scale of the parent
                    // this is now the new local position of the current container.
                    selectedContainer.localPosition.x = (currentContainerWorldPosition.x - newParentContainerWorldPosition.x) / newParentContainer.worldScale
                    selectedContainer.localPosition.y = (currentContainerWorldPosition.y - newParentContainerWorldPosition.y) / newParentContainer.worldScale
                    recalculateWorldPositionsAndSizes(selectedContainer)
                    
                    selectedContainer.parentContainerIdentifier = ZUI.interaction.emcompassingContainerIdentifier
                    
                    // TODO: implicitly (and indirectly) this will call integrateContainerAndConnectionData, which removes the child from the old parent
                    //       and adds the child to the new parent. Can we do this more explicitly?
                    
                    // IMPORTANT: we FIRST store the position and THEN move it to a new PARENT
                    //            we do this because by moving it to a new parent, its identifier will effectively change
                    //            so our selectedContainer.identifier will not be valid after storing the new parent.
                    storeContainerLocalPosition(selectedContainer.identifier, selectedContainer.localPosition)
                    storeContainerParent(selectedContainer.identifier, selectedContainer.parentContainerIdentifier)
                }
                else {
                    // We stopped dragging the selected container (without re-parenting it), so we only store its position and size
                    storeContainerLocalPosition(selectedContainer.identifier, selectedContainer.localPosition)
                }
            }
            ZUI.interaction.selectedContainersAreBeingDragged = false
        }
    }

    if (!ZUI.mouseState.leftButtonHasGoneDownTwice &&
         ZUI.mouseState.leftButtonHasGoneDown) { // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
         
        let containerAtMousePosition = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, false)
        if (containerAtMousePosition != null/* && currentlySelectedContainerIdentifier != null &&
            containerAtMousePosition.identifier === currentlySelectedContainerIdentifier */) {
// FIXME: what should be the logic here?
            ZUI.interaction.selectedContainersAreBeingDragged = true
        }
        else {
            ZUI.interaction.selectedContainersAreBeingDragged = false
        }
    }
    
}

function doContainerResizingByMouse() {

    let currentlySelectedContainer = null
    if (ZUI.interaction.currentlySelectedContainerIdentifiers.length === 1) {
        // For now, we only allow resizing when a single container has been selected
        // if not, we assume no containers are selected (for resizing)
        let currentlySelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
        currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)
    }
    
    if (ZUI.interaction.selectedContainerIsBeingResized) {
        if (ZUI.mouseState.hasMoved) {
            
            let mouseWorldMovement = {}
            mouseWorldMovement.x = ZUI.mouseState.worldPosition.x - ZUI.mouseState.previousWorldPosition.x
            mouseWorldMovement.y = ZUI.mouseState.worldPosition.y - ZUI.mouseState.previousWorldPosition.y
            
            let parentWorldScale = currentlySelectedContainer.worldScale / currentlySelectedContainer.localScale
            if (ZUI.interaction.selectedContainerResizeSide.x > 0) { // right side
                currentlySelectedContainer.localSize.width += mouseWorldMovement.x / currentlySelectedContainer.worldScale
                recalculateWorldPositionsAndSizes(currentlySelectedContainer)
            }
            if (ZUI.interaction.selectedContainerResizeSide.y > 0) { // bottom side
                currentlySelectedContainer.localSize.height += mouseWorldMovement.y / currentlySelectedContainer.worldScale
                recalculateWorldPositionsAndSizes(currentlySelectedContainer)
            }
            if (ZUI.interaction.selectedContainerResizeSide.x < 0) { // left side
                currentlySelectedContainer.localSize.width -= mouseWorldMovement.x / currentlySelectedContainer.worldScale
                currentlySelectedContainer.localPosition.x += mouseWorldMovement.x / parentWorldScale
                recalculateWorldPositionsAndSizes(currentlySelectedContainer)
            }
            if (ZUI.interaction.selectedContainerResizeSide.y < 0) { // top side
                currentlySelectedContainer.localSize.height -= mouseWorldMovement.y / currentlySelectedContainer.worldScale
                currentlySelectedContainer.localPosition.y += mouseWorldMovement.y / parentWorldScale
                recalculateWorldPositionsAndSizes(currentlySelectedContainer)
            }
        }
        
        if (ZUI.mouseState.leftButtonHasGoneUp) {
            // We stopped resizing the selected container, so we store its position and size
            storeContainerLocalPosition(currentlySelectedContainer.identifier, currentlySelectedContainer.localPosition)
            storeContainerLocalSize(currentlySelectedContainer.identifier, currentlySelectedContainer.localSize)
            ZUI.interaction.selectedContainerIsBeingResized = false
            ZUI.interaction.selectedContainerResizeSide = null
        }
    }
    
    
    // Check if we are near the border of a container (and if it is clicked)
    
    let selectedContainerNearness = whichSideIsPositionFromContainer(ZUI.mouseState.worldPosition, currentlySelectedContainer)
    
    if (currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
        ZUI.interaction.mouseIsNearSelectedContainerBorder = false
        
        if (selectedContainerNearness.x === 0 && selectedContainerNearness.y === 0) {
            ZUI.interaction.mousePointerStyle = 'move'
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y > 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y < 0))
        {
            if (ZUI.interaction.viewAsIsoMetric) {
                ZUI.interaction.mousePointerStyle = 'e-resize'
            }
            else {
                ZUI.interaction.mousePointerStyle = 'nw-resize'
            }
            ZUI.interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y < 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y > 0))
        {
            if (ZUI.interaction.viewAsIsoMetric) {
                ZUI.interaction.mousePointerStyle = 'n-resize'
            }
            else {
                ZUI.interaction.mousePointerStyle = 'ne-resize'
            }
            ZUI.interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.x !== 0) {
            if (ZUI.interaction.viewAsIsoMetric) {
                ZUI.interaction.mousePointerStyle = 'ne-resize'
            }
            else {
                ZUI.interaction.mousePointerStyle = 'e-resize'
            }
            ZUI.interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.y !== 0) {
            if (ZUI.interaction.viewAsIsoMetric) {
                ZUI.interaction.mousePointerStyle = 'nw-resize'
            }
            else {
                ZUI.interaction.mousePointerStyle = 'n-resize'
            }
            ZUI.interaction.mouseIsNearSelectedContainerBorder = true
        }
        
        if (!ZUI.mouseState.leftButtonHasGoneDownTwice &&
             ZUI.mouseState.leftButtonHasGoneDown &&  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
            ZUI.interaction.mouseIsNearSelectedContainerBorder) {
                
            ZUI.interaction.selectedContainerIsBeingResized = true
            ZUI.interaction.selectedContainerResizeSide = { x: selectedContainerNearness.x, y: selectedContainerNearness.y }
        }
        
    }
    else {
        // If the mouse is outside the selected container (or if there is no selected container), 
        // we set mouseIsNearSelectedContainerBorder to false
        ZUI.interaction.mouseIsNearSelectedContainerBorder = false
    }
    
}

function doAddNewContainer() {
    
    // TODO: we should add new containers in a multi-step way (first choose its type, then draw a rectangle with the mouse (mouse down, move, up)
    
    if (ZUI.mouseState.rightButtonHasGoneDown) {
        
        let parentContainerIdentifier = 'root'
        if (ZUI.interaction.currentlyHoveredContainerIdentifier != null) {
            parentContainerIdentifier = ZUI.interaction.currentlyHoveredContainerIdentifier
        }
        let parentContainer = getContainerByIdentifier(parentContainerIdentifier)
        
        let localPosition = {
            x: ZUI.mouseState.worldPosition.x - parentContainer.worldPosition.x,
            y: ZUI.mouseState.worldPosition.y - parentContainer.worldPosition.y
        }
        
        // FIXME: we might want to do this differently (maybe add localScale? maybe other values?) 
        storeNewContainer(localPosition, parentContainerIdentifier)
    }
}

function doEditContainerText() {
    
    let containerAtMousePosition = findContainerAtWorldPosition(ZUI.mouseState.worldPosition, null, false)
    
    if (ZUI.mouseState.leftButtonHasGoneDownTwice) {
        // TODO: we might want to check if the container is selected and/or hovered
        if (containerAtMousePosition != null) {
            ZUI.interaction.currentlyEditingContainerText = containerAtMousePosition
        }
    }
    
    if (ZUI.interaction.currentlyEditingContainerText != null) {
        
        if (ZUI.keyboardState.sequenceKeysUpDown.length) {
        
            // TODO: create function: let resultingText = applyKeyboardEventToString(ZUI.interaction.currentlyEditingContainerText.identifier)
            let textToEdit = ZUI.interaction.currentlyEditingContainerText.name
            for (let sequenceIndex = 0; sequenceIndex < ZUI.keyboardState.sequenceKeysUpDown.length; sequenceIndex++) {
                let keyUpDown = ZUI.keyboardState.sequenceKeysUpDown[sequenceIndex]
                let keyName = keyCodeMap[keyUpDown.keyCode]
                if (keyUpDown.isDown) {
                    
                    // Checking if shift (or CAPS-LOCK) is down/active
                    let shiftIsDown = ZUI.keyboardState.shiftIsDown
                    if (ZUI.keyboardState.capsLockIsActive) {
                        shiftIsDown = !shiftIsDown // TODO: now putting the effective shift-ness in shiftIsDown.
                    }
                    
                    // FIXME: allow for more keys!
                    if (keyUpDown.keyCode >= 65 && keyUpDown.keyCode <= 90) {  // A through Z
                        if (shiftIsDown) {
                            textToEdit += keyName
                        }
                        else {
                            textToEdit += keyName.toLowerCase()
                        }
                    }
                    else if (keyUpDown.keyCode >= 48 && keyUpDown.keyCode <= 59) {  // 0 through 9
                        textToEdit += "" + keyUpDown.keyCode - 48
                    }
                    else if (keyName === 'SPACE') {
                        textToEdit += " "
                    }
                    else {
                        // TODO: keep a record of the CURSOR!!
                        if (keyName === 'BACK_SPACE') {
                            textToEdit = textToEdit.substring(0, textToEdit.length - 1);
                        }
                        else if (keyName === 'ENTER') {
                            storeContainerName(ZUI.interaction.currentlyEditingContainerText.identifier, textToEdit)
                            ZUI.interaction.currentlyEditingContainerText = null
                        }
                        else if (keyName === 'ESCAPE') {
                            // FIXME: undo the editing and dont store
                            ZUI.interaction.currentlyEditingContainerText = null
                        }
                        else {
                            console.log(keyName)
                        }
                    }
                }
            }

            if (ZUI.interaction.currentlyEditingContainerText != null) {
                ZUI.interaction.currentlyEditingContainerText.name = textToEdit
            }
            
            // FIXME: save text each character?! or when we leave the edit of the text? Or when we press enter?
        }
        
    }
    
}

// ====== VIEW ======

function doViewDraggingAndZoomingByTouch () {
    
    let singleTouch = null
    let firstOfDoubleTouch = null
    let secondOfDoubleTouch = null
    
    // TODO: when a touch has just ended, this number is not the nrOfActiveTouches (should we count those instead?)
    let nrOfTouches = Object.keys(ZUI.touchesState).length
    if (nrOfTouches === 1) {
        singleTouch = ZUI.touchesState[Object.keys(ZUI.touchesState)[0]]
    }
    else if (nrOfTouches === 2) {
        firstOfDoubleTouch = ZUI.touchesState[Object.keys(ZUI.touchesState)[0]]
        secondOfDoubleTouch = ZUI.touchesState[Object.keys(ZUI.touchesState)[1]]
    }
    
    
    // Dragging by a single touch
    if (singleTouch != null && singleTouch.hasStarted) {
        // TODO: for simplicity we are ignoring the position of this touch! (so we always draw the view if we start a single touch!)
        ZUI.interaction.viewIsBeingDraggedByTouch = true
    }
    
    if (ZUI.interaction.viewIsBeingDraggedByTouch) {
        if (singleTouch == null || singleTouch.hasEnded) {
            // The touch has ended
            ZUI.interaction.viewIsBeingDraggedByTouch = false
        }
        else {
            // The touch is active (and hasn't ended)
            
            if (singleTouch.hasMoved) {
                // The touch has moved
                ZUI.interaction.viewOffset.x += singleTouch.position.x - singleTouch.previousPosition.x
                ZUI.interaction.viewOffset.y += singleTouch.position.y - singleTouch.previousPosition.y
            }
            else {
                // The single (active) touch hasn't moved
            }
        }
    }
    
    // Zooming by 2 touches
    if (firstOfDoubleTouch != null && secondOfDoubleTouch != null &&
        firstOfDoubleTouch.isActive && secondOfDoubleTouch.isActive) {
            
        if (firstOfDoubleTouch.hasMoved || secondOfDoubleTouch.hasMoved) {

            let previousDistanceBetweenTouches = distanceBetweenTwoPoints(firstOfDoubleTouch.previousPosition, secondOfDoubleTouch.previousPosition)
            let currentDistanceBetweenTouches = distanceBetweenTwoPoints(firstOfDoubleTouch.position, secondOfDoubleTouch.position)
            
            let relativeZoomChange = currentDistanceBetweenTouches / previousDistanceBetweenTouches
            ZUI.interaction.viewScale = ZUI.interaction.viewScale * relativeZoomChange
         
            // We want the position below (one of) the two touches to stay still (or in the middle of them, if they both moved).
            // This means the touch-zoom-point in world position has to stay on the same touch-zoom-point screen position.
            // We changed the viewScale, so we have to adjust the viewOffset to make this the case.
            
            let fraction = 0.0
            let firstTouchDistanceMoved = distanceBetweenTwoPoints(firstOfDoubleTouch.position, firstOfDoubleTouch.previousPosition)
            let secondTouchDistanceMoved = distanceBetweenTwoPoints(secondOfDoubleTouch.position, secondOfDoubleTouch.previousPosition)
            
            if (firstTouchDistanceMoved > secondTouchDistanceMoved) {
                fraction = firstTouchDistanceMoved * 1.0 / (firstTouchDistanceMoved + secondTouchDistanceMoved)
            }
            else {
                fraction = 1 - (secondTouchDistanceMoved * 1.0 / (firstTouchDistanceMoved + secondTouchDistanceMoved))
            }
            
            let touchZoomPointScreenPosition = lerpPositionBetweenTwoPoints(firstOfDoubleTouch.position, secondOfDoubleTouch.position, fraction)
            let touchZoomPointWorldPosition = lerpPositionBetweenTwoPoints(firstOfDoubleTouch.worldPosition, secondOfDoubleTouch.worldPosition, fraction)
            
            // We first determine the screen position of the touch-zoom-point if we don't change the viewOffset
            let touchZoomPointScreenPositionAfterScale = fromWorldPositionToScreenPosition(touchZoomPointWorldPosition)
            
            // Take the difference between the zoom-point position (after just the scale) and the real zoom-point position and 
            // adjust the viewOffset accordingly
            ZUI.interaction.viewOffset.x += touchZoomPointScreenPosition.x - touchZoomPointScreenPositionAfterScale.x
            ZUI.interaction.viewOffset.y += touchZoomPointScreenPosition.y - touchZoomPointScreenPositionAfterScale.y
            
            firstOfDoubleTouch.worldPosition = fromScreenPositionToWorldPosition(firstOfDoubleTouch.position)
            secondOfDoubleTouch.worldPosition = fromScreenPositionToWorldPosition(secondOfDoubleTouch.position)
            
        }
    }

}

function doViewDraggingByMouse () {
    
    // View dragging by mouse
    if (ZUI.interaction.viewIsBeingDraggedByMouse) {
        if (ZUI.mouseState.hasMoved) {
            ZUI.interaction.viewOffset.x += ZUI.mouseState.position.x - ZUI.mouseState.previousPosition.x
            ZUI.interaction.viewOffset.y += ZUI.mouseState.position.y - ZUI.mouseState.previousPosition.y
        }
        if (ZUI.mouseState.leftButtonHasGoneUp) {
            ZUI.interaction.viewIsBeingDraggedByMouse = false
        }
    }
    
    if (!ZUI.mouseState.leftButtonHasGoneDownTwice &&  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
         ZUI.mouseState.leftButtonHasGoneDown) {
            ZUI.interaction.viewIsBeingDraggedByMouse = true
    }
}

function doViewZoomingByMouse () {
    
    // View zooming by mouse
    if (ZUI.mouseState.mouseWheelHasMoved) {
        let scrollSensitivity = 0.1
        let relativeZoomChange = 1 + Math.abs(ZUI.mouseState.mouseWheelDelta) * scrollSensitivity
        if (ZUI.mouseState.mouseWheelDelta < 0) {
            relativeZoomChange = 1 / relativeZoomChange
        }
        ZUI.interaction.viewScale = ZUI.interaction.viewScale * relativeZoomChange
        
        // We want the position below the mouse pointer to stay still.
        // This means the mouse-point in world position has to stay on the same mouse screen position.
        // We changed the viewScale, so we have to adjust the viewOffset to make this the case.
        
        // We first determine the screen position of the mouse pointer if we don't change the viewOffset
        let mouseScreenPositionAfterScale = fromWorldPositionToScreenPosition(ZUI.mouseState.worldPosition)
        
        // Take the difference between the mouse position (after just the scale) and the real mouse position and 
        // adjust the viewOffset accordingly
        ZUI.interaction.viewOffset.x += ZUI.mouseState.position.x - mouseScreenPositionAfterScale.x
        ZUI.interaction.viewOffset.y += ZUI.mouseState.position.y - mouseScreenPositionAfterScale.y
        
        ZUI.mouseState.worldPosition = fromScreenPositionToWorldPosition(ZUI.mouseState.position)
        
    }

}

function animatePanning(timeElapsed) {
    if (ZUI.interaction.panningAnimationIsActive) {
        ZUI.interaction.timePanned += timeElapsed
        if (ZUI.interaction.timePanned >= ZUI.interaction.totalPanningTime) {
            ZUI.interaction.viewScale = ZUI.interaction.targetPanningViewScale
            ZUI.interaction.viewOffset = {
                x: ZUI.interaction.targetPanningViewOffset.x,
                y: ZUI.interaction.targetPanningViewOffset.y
            }
            ZUI.interaction.panningAnimationIsActive = false
            ZUI.interaction.timePanned = 0
            // TODO: maybe reset all other variables too? (like startScrollTop, targetScrollTop, timePanned, divToBeScrolledTo)
        }
        else {
            let sineMultiplier = Math.sin((ZUI.interaction.timePanned / ZUI.interaction.totalPanningTime) * (Math.PI / 2))
            ZUI.interaction.viewScale = ZUI.interaction.startPanningViewScale + (ZUI.interaction.targetPanningViewScale - ZUI.interaction.startPanningViewScale) * sineMultiplier
            ZUI.interaction.startScrollTop + (ZUI.interaction.targetScrollTop - ZUI.interaction.startScrollTop) * sineMultiplier
            ZUI.interaction.viewOffset = {
                x: ZUI.interaction.startPanningViewOffset.x + (ZUI.interaction.targetPanningViewOffset.x - ZUI.interaction.startPanningViewOffset.x) * sineMultiplier,
                y: ZUI.interaction.startPanningViewOffset.y + (ZUI.interaction.targetPanningViewOffset.y - ZUI.interaction.startPanningViewOffset.y) * sineMultiplier
            }
        }
    }
}


function updateWorld(timeElapsed) {
    
    if (ZUI.interaction.centerViewOnWorldCenter || ZUI.interaction.centerViewOnWorldCenterWithPanning) {

        let ignoreDimmedContainers = true
        let rectangleAroundWorld = getRectangleAroundWorld(ignoreDimmedContainers)
        // If we can't find a rectangle using non-dimmed containers, we try all containers
        if (rectangleAroundWorld.position.x == null) { // FIXME: this is a bit ugly
            rectangleAroundWorld = getRectangleAroundWorld(false)
        }
        // If we can't find a rectangle using all containers, we just use a hardcoded rectangle
        if (rectangleAroundWorld.position.x == null) { // FIXME: this is a bit ugly
            rectangleAroundWorld = {
                "position" : { "x": 0, "y": 0},
                "size" : { "width": 1000, "height": 1000}
            }
        }
        
        // TODO: put this in a function that centers the view on a world-rectangle
        {
            if (ZUI.interaction.centerViewOnWorldCenterWithPanning) {
                // FIXME: since fromWorldPositionToScreenPosition uses ZUI.interaction.viewScale and ZUI.interaction.viewOffset, we first have to copy the originals
                // We then calculate our target viewScale and viewOffset and restore them. After that we can animate towards them!
                var originalViewScale = ZUI.interaction.viewScale
                var originalViewOffset = {
                    x: ZUI.interaction.viewOffset.x,
                    y: ZUI.interaction.viewOffset.y
                }
            }

            // We calculate everything and set it, as-if there is not animation
            {
                let middlePointOfWorld = getCenterPointOfRectangle(rectangleAroundWorld)
                
                // For now we are resetting to the default
                ZUI.interaction.viewScale = 1
                ZUI.interaction.viewOffset = { x: 0, y: 0 }
                
                // We first set the viewScale
                let leftTopOfWorldOnScreen = fromWorldPositionToScreenPosition(rectangleAroundWorld.position)
                let rightBottomOfWorldOnScreen = fromWorldPositionToScreenPosition(addSizeToPosition(rectangleAroundWorld.size, rectangleAroundWorld.position))
                let worldWidthOnScreen = rightBottomOfWorldOnScreen.x - leftTopOfWorldOnScreen.x
                let worldHeightOnScreen = rightBottomOfWorldOnScreen.y - leftTopOfWorldOnScreen.y
                
                // We check if the height or the width is the constraint and choose that one
                let scaleToFitWidth = ZUI.canvasElement.width * 0.8 / worldWidthOnScreen
                let scaleToFitHeight = ZUI.canvasElement.height * 0.8 / worldHeightOnScreen
                if (scaleToFitWidth < scaleToFitHeight) {
                    ZUI.interaction.viewScale = scaleToFitWidth
                }
                else {
                    ZUI.interaction.viewScale = scaleToFitHeight
                }
                
                // After setting the scale we can calculate the viewOffset
                let middleOfWorldOnScreen = fromWorldPositionToScreenPosition(middlePointOfWorld)
                let middleOfScreen = { x: ZUI.canvasElement.width / 2, y: ZUI.canvasElement.height / 2 }
                ZUI.interaction.viewOffset = { x: middleOfScreen.x - middleOfWorldOnScreen.x, y: middleOfScreen.y - middleOfWorldOnScreen.y } 
            }
            
            if (ZUI.interaction.centerViewOnWorldCenterWithPanning) {
                // We use the result as our target
                let targetViewScale = ZUI.interaction.viewScale
                let targetViewOffset = { x: ZUI.interaction.viewOffset.x, y: ZUI.interaction.viewOffset.y }
                
                // FIXME: here we restore them
                ZUI.interaction.viewOffset = {
                    x: originalViewOffset.x, 
                    y: originalViewOffset.y 
                }
                ZUI.interaction.viewScale = originalViewScale
                
                ZUI.interaction.timeScrolled = 0
                ZUI.interaction.panningAnimationIsActive = true
        
                ZUI.interaction.startPanningViewOffset = {
                    x: ZUI.interaction.viewOffset.x,
                    y: ZUI.interaction.viewOffset.y
                }
                ZUI.interaction.startPanningViewScale = ZUI.interaction.viewScale
                ZUI.interaction.targetPanningViewOffset = targetViewOffset
                ZUI.interaction.targetPanningViewScale = targetViewScale
            }
            
        }
        
        ZUI.interaction.centerViewOnWorldCenter = false
        ZUI.interaction.centerViewOnWorldCenterWithPanning = false
    }
    else if (ZUI.interaction.centerViewOnFirstSelectedContainer)  {
        if (ZUI.interaction.currentlySelectedContainerIdentifiers.length !== 0) {
            let currentlySelectedContainerIdentifier = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
            let currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)
            
            if (currentlySelectedContainer != null) {

                // FIXME: since fromWorldPositionToScreenPosition uses ZUI.interaction.viewScale and ZUI.interaction.viewOffset, we first have to copy the originals
                // We then calculate our target viewScale and viewOffset and restore them. After that we can animate towards them!
                let originalViewScale = ZUI.interaction.viewScale
                let originalViewOffset = {
                    x: ZUI.interaction.viewOffset.x,
                    y: ZUI.interaction.viewOffset.y
                }
                
                // We calculate everything and set it, as-if there is not animation
                {
                    
                    let containerRectangle = {
                        "position" : currentlySelectedContainer.worldPosition,
                        "size" : currentlySelectedContainer.localSize,
                    }
                    let middlePointOfContainer = getCenterPointOfRectangle(containerRectangle)
                    
                    // For now we are resetting to the default
                    ZUI.interaction.viewScale = 1
                    ZUI.interaction.viewOffset = { x: 0, y: 0 }
                    
                    // We first set the viewScale
                    let containerWidthOnScreen = currentlySelectedContainer.localSize.width  // Since we have a viewScale of 1, localSize is equal to screenSize
                    let containerHeightOnScreen = currentlySelectedContainer.localSize.height
                    
                    // We check if the height or the width is the constraint and choose that one
                    let scaleToFitWidth = ZUI.canvasElement.width * 0.8 / containerWidthOnScreen
                    let scaleToFitHeight = ZUI.canvasElement.height * 0.8 / containerHeightOnScreen
                    if (scaleToFitWidth < scaleToFitHeight) {
                        ZUI.interaction.viewScale = scaleToFitWidth
                    }
                    else {
                        ZUI.interaction.viewScale = scaleToFitHeight
                    }
                    
                    // After setting the scale we can calculate the viewOffset
                    let middleOfContainerOnScreen = fromWorldPositionToScreenPosition(middlePointOfContainer)
                    let middleOfScreen = { x: ZUI.canvasElement.width / 2, y: ZUI.canvasElement.height / 2 }
                    ZUI.interaction.viewOffset = { x: middleOfScreen.x - middleOfContainerOnScreen.x, y: middleOfScreen.y - middleOfContainerOnScreen.y } 
                }
                
                {
                    // We use the result as our target
                    let targetViewScale = ZUI.interaction.viewScale
                    let targetViewOffset = { x: ZUI.interaction.viewOffset.x, y: ZUI.interaction.viewOffset.y }
                    
                    // FIXME: here we restore them
                    ZUI.interaction.viewOffset = {
                        x: originalViewOffset.x, 
                        y: originalViewOffset.y 
                    }
                    ZUI.interaction.viewScale = originalViewScale
                    
                    ZUI.interaction.timeScrolled = 0
                    ZUI.interaction.panningAnimationIsActive = true
            
                    ZUI.interaction.startPanningViewOffset = {
                        x: ZUI.interaction.viewOffset.x,
                        y: ZUI.interaction.viewOffset.y
                    }
                    ZUI.interaction.startPanningViewScale = ZUI.interaction.viewScale
                    ZUI.interaction.targetPanningViewOffset = targetViewOffset
                    ZUI.interaction.targetPanningViewScale = targetViewScale
                }
                
            }
            else {
                console.log("WARNING: trying to center on a container that does not exist!")
            }
            
        }
        
        ZUI.interaction.centerViewOnFirstSelectedContainer = false
    }
    else if (ZUI.interaction.centerViewOnSelectedConnection)  {
        if (ZUI.interaction.currentlySelectedConnectionIdentifier != null) {
            let currentlySelectedConnection = getConnectionByIdentifier(ZUI.interaction.currentlySelectedConnectionIdentifier)
            
            if (currentlySelectedConnection != null) {
                let fromContainer = getContainerByIdentifier(currentlySelectedConnection.fromContainerIdentifier)
                let toContainer = getContainerByIdentifier(currentlySelectedConnection.toContainerIdentifier)
                
                if (fromContainer != null && toContainer != null) {
                    // For now we are resetting to the default
                    let targetViewScale = 0.8 // FIXME: hardcoded!
                    let targetViewOffset = { x: 0, y: 0 }

                    // FIXME: since fromWorldPositionToScreenPosition uses ZUI.interaction.viewScale and ZUI.interaction.viewOffset, we first have to copy the originals
                    // We then calculate our target viewScale and viewOffset and restore them. After that we can animate towards them!
                    let originalViewScale = ZUI.interaction.viewScale
                    let originalViewOffset = {
                        x: ZUI.interaction.viewOffset.x,
                        y: ZUI.interaction.viewOffset.y
                    }
                    ZUI.interaction.viewScale = targetViewScale
                    ZUI.interaction.viewOffset = {
                        x: targetViewOffset.x, 
                        y: targetViewOffset.y 
                    }
                    
                    // FIXME: this is not accurate at all! We should store the end-points of the connection itself and take the middle of THAT (not of the centers/positions of the containers!)
                    let middleWorldPointBetweenContainers = middleOfTwoPoints(fromContainer.worldPosition, toContainer.worldPosition)
                    // After setting the scale we can calculate the viewOffset
                    let middlePointBetweenContainersOnScreen = fromWorldPositionToScreenPosition(middleWorldPointBetweenContainers)
                    
                    let middleOfScreen = { x: ZUI.canvasElement.width / 2, y: ZUI.canvasElement.height / 2 }
                    targetViewOffset = { x: middleOfScreen.x - middlePointBetweenContainersOnScreen.x, 
                                         y: middleOfScreen.y - middlePointBetweenContainersOnScreen.y} 
                                               
                    // FIXME: here we restore them
                    ZUI.interaction.viewOffset = {
                        x: originalViewOffset.x, 
                        y: originalViewOffset.y 
                    }
                    ZUI.interaction.viewScale = originalViewScale
                    
                    ZUI.interaction.timeScrolled = 0
                    ZUI.interaction.panningAnimationIsActive = true
            
                    ZUI.interaction.startPanningViewOffset = {
                        x: ZUI.interaction.viewOffset.x,
                        y: ZUI.interaction.viewOffset.y
                    }
                    ZUI.interaction.startPanningViewScale = ZUI.interaction.viewScale
                    ZUI.interaction.targetPanningViewOffset = targetViewOffset
                    ZUI.interaction.targetPanningViewScale = targetViewScale
                }
            }
            else {
                console.log("WARNING: trying to center on a connection that does not exist!")
            }
        }
        
        ZUI.interaction.centerViewOnSelectedConnection = false
    }
    
    animatePanning(timeElapsed)
    
    if (ZUI.interaction.viewAsIsoMetric) {
        if (ZUI.interaction.percentageIsoMetric < 1) {
            ZUI.interaction.percentageIsoMetric += 0.03
        }
        else {
            ZUI.interaction.percentageIsoMetric = 1
            if (ZUI.interaction.isoMetricAnimationRunning) {
                ZUI.interaction.isoMetricAnimationRunning = false
            }
        }
    }
    else {
        if (ZUI.interaction.percentageIsoMetric > 0) {
            ZUI.interaction.percentageIsoMetric -= 0.03
        }
        else {
            ZUI.interaction.percentageIsoMetric = 0
            if (ZUI.interaction.isoMetricAnimationRunning) {
                ZUI.interaction.isoMetricAnimationRunning = false
            }
        }
    }

    ZUI.currentIsoMetricSettings.translate = lerp(ZUI.nonIsoMetricSettings.translate, ZUI.isoMetricSettings.translate, ZUI.interaction.percentageIsoMetric)
    ZUI.currentIsoMetricSettings.scale     = lerp(ZUI.nonIsoMetricSettings.scale, ZUI.isoMetricSettings.scale, ZUI.interaction.percentageIsoMetric)
    ZUI.currentIsoMetricSettings.rotate    = lerp(ZUI.nonIsoMetricSettings.rotate, ZUI.isoMetricSettings.rotate, ZUI.interaction.percentageIsoMetric)
}
