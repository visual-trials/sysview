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
 
let interaction = {
    viewScale : 1,
    viewOffset : { x: 0, y: 0},
    viewIsBeingDragged : false,
    viewAsIsoMetric : false,
    percentageIsoMetric : 0,
    showGrid : true,
   
    currentlyHoveredMenuButton : null,
    currentlySelectedMode : 'view',
    
    currentlyHoveredContainerIdentifier : null,
    currentlySelectedContainerIdentifier : null,
    selectedContainerIsBeingDragged : false,
    selectedContainerIsBeingResized : false,
    selectedContainerResizeSide : null,
    
    newConnectionBeingAdded : null,

    // TODO: should we only edit a model? And then change the container/connection text accordingly (and save to the backend)?
    currentlyEditingContainerText : null, // TODO: maybe edit container attribute? Using some kind of Id?
    currentlyEditingConnectionText : null, // TODO: maybe edit connection attribute? Using some kind of Id?
    currentlyEditingDataText : null, // TODO: how do we refer to a point in the data structure? Using some kind of Id?
    
    mousePointerStyle: 'default'  // Possible mouse styles: http://www.javascripter.net/faq/stylesc.htm
}

function handleInputStateChange () {
    
    if (mouseState.mouseWheelHasMoved) {
        let scrollSensitivity = 0.1
        let relativeZoomChange = 1 + Math.abs(mouseState.mouseWheelDelta) * scrollSensitivity
        if (mouseState.mouseWheelDelta < 0) {
            relativeZoomChange = 1 / relativeZoomChange
        }
        interaction.viewScale = interaction.viewScale * relativeZoomChange
        
        // We want the position below the mouse pointer to stay still.
        // This means the mouse-point in world position has to stay on the same mouse screen position.
        // We changed the viewScale, so we have to adjust the viewOffset to make this the case.
        
        // We first determine the screen position of the mouse pointer if we don't change the viewOffset
        let mouseScreenPositionAfterScale = fromWorldPositionToScreenPosition(mouseState.worldPosition)
        
        // Take the difference between the mouse position (after just the scale) and the real mouse position and 
        // adjust the viewOffset accordingly
        interaction.viewOffset.x += mouseState.position.x - mouseScreenPositionAfterScale.x
        interaction.viewOffset.y += mouseState.position.y - mouseScreenPositionAfterScale.y
        
        mouseState.worldPosition = fromScreenPositionToWorldPosition(mouseState.position)
        
        // FIXME: shouldnt we update all absolute positions? Since we changed viewScale and viewOffset!
    }
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    let menuButtonAtMousePosition = findMenuButtonAtScreenPosition(mouseState.position)
    
    if (menuButtonAtMousePosition != null) {
        interaction.currentlyHoveredContainerIdentifier = null
        interaction.currentlyHoveredMenuButton = menuButtonAtMousePosition
    }
    else {
        if (containerAtMousePosition != null) {
            interaction.currentlyHoveredContainerIdentifier = containerAtMousePosition.identifier
        }
        else {
            interaction.currentlyHoveredContainerIdentifier = null
        }
        interaction.currentlyHoveredMenuButton = null
    }
    
    // Check mouse position
    
    let currentlySelectedContainer = getContainerByIdentifier(interaction.currentlySelectedContainerIdentifier)
    let selectedContainerNearness = whichSideIsPositionFromContainer(mouseState.worldPosition, currentlySelectedContainer)
    
    // TODO: its kinda arbritrary to need the parent of the selectedContainer. Can't we do this more nicely?
    let parentOfSelectedContainerContainerIdentifier = 'root'
    if (currentlySelectedContainer != null) {
        parentOfSelectedContainerContainerIdentifier = currentlySelectedContainer.parentContainerIdentifier
    }
    let parentOfSelectedContainer = getContainerByIdentifier(parentOfSelectedContainerContainerIdentifier)
    
    let mouseIsNearSelectedContainerBorder = false
    
    if (interaction.currentlyHoveredMenuButton != null) {
        // If we hover a menu button, we want to see a default mouse pointer
        interaction.mousePointerStyle = 'default'
    }
    else if (interaction.currentlySelectedMode === 'connect') {
        // TODO: is this always correct?
        interaction.mousePointerStyle = 'default'
        
        if (interaction.newConnectionBeingAdded != null) {
            if (interaction.currentlyHoveredContainerIdentifier != null &&
                interaction.currentlyHoveredContainerIdentifier !== interaction.newConnectionBeingAdded.from) {
                // We are hovering over a different container than we started the connection from, so we should connect with it
                interaction.newConnectionBeingAdded.to = interaction.currentlyHoveredContainerIdentifier
            }
            else {
                interaction.newConnectionBeingAdded.to = null
            }
        }
    }
    else if (currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
        if (selectedContainerNearness.x === 0 && selectedContainerNearness.y === 0) {
            interaction.mousePointerStyle = 'move'
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y > 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y < 0))
        {
            interaction.mousePointerStyle = 'nw-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y < 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y > 0))
        {
            interaction.mousePointerStyle = 'ne-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.x !== 0) {
            interaction.mousePointerStyle = 'e-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.y !== 0) {
            interaction.mousePointerStyle = 'n-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        
    }
    else if (interaction.currentlyHoveredContainerIdentifier != null) {
        interaction.mousePointerStyle = 'move'
    }
    else {
        interaction.mousePointerStyle = 'default'
    }
    
    // Handle mouse clicking

    if (mouseState.rightButtonHasGoneDown && interaction.currentlyHoveredMenuButton == null) {
        
        let parentContainerIdentifier = 'root'
        if (interaction.currentlyHoveredContainerIdentifier != null) {
            parentContainerIdentifier = interaction.currentlyHoveredContainerIdentifier
        }
        let parentContainer = getContainerByIdentifier(parentContainerIdentifier)
        
        let currentDateTime = new Date()
        
        // TODO: we need some kind of (incremental) id here!
        // TODO: what should we use as identifier here??
        let extraServer = {
            type: 'server',  // TODO: allow adding different kinds of containers
            parentContainerIdentifier: parentContainerIdentifier,
            identifier: 'ExtraServer_' + currentDateTime.getTime(),
            name: 'My Extra Server',
            relativePosition: {
                x: mouseState.worldPosition.x - parentContainer.position.x,
                y: mouseState.worldPosition.y - parentContainer.position.y
            },
            relativeScale: 1,
            size: {
                width: 200,
                height: 250
            }
        }
        storeContainerData(extraServer)
        // let extraServerIdentifier = createContainer(extraServer)
    }

    
    if (mouseState.leftButtonHasGoneDownTwice) {
        
        if (interaction.currentlyHoveredMenuButton == null) {
            // TODO: we might want to check if the container is selected and/or hovered
            if (containerAtMousePosition != null) {
                interaction.currentlyEditingContainerText = containerAtMousePosition
                console.log(containerAtMousePosition)
            }
        }
    }
    // FIXME: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
    else if (mouseState.leftButtonHasGoneDown) {
        
        if (interaction.currentlyHoveredMenuButton != null) {
            // Menu-click has higher priority than container-click, we check it first
            
            if (interaction.currentlyHoveredMenuButton.mode) {
                // If its a menu button with a 'mode', then we select that mode
                interaction.currentlySelectedMode = interaction.currentlyHoveredMenuButton.mode
            }
            
            if (interaction.currentlyHoveredMenuButton.toggle === 'isoMetric') {
                if (interaction.viewAsIsoMetric) {
                    interaction.viewAsIsoMetric = false
                }
                else {
                    interaction.viewAsIsoMetric = true
                }
            }
            
            if (interaction.currentlyHoveredMenuButton.toggle === 'grid') {
                interaction.showGrid = !interaction.showGrid
            }
            
        }
        else if (interaction.currentlySelectedMode === 'connect') {
            if (containerAtMousePosition != null) {
                interaction.newConnectionBeingAdded = {
                    type: 'new',
                    identifier: '???', // FIXME:???
                    name: 'New connection',
                    from: containerAtMousePosition.identifier,
                    to: null,
                    stroke: { r:0, g:180, b:200, a:1 }, // FIXME: HACK!
                }
            }
        }
        else if (mouseIsNearSelectedContainerBorder) {
            interaction.selectedContainerIsBeingResized = true
            interaction.selectedContainerResizeSide = { x: selectedContainerNearness.x, y: selectedContainerNearness.y }
            
            interaction.selectedContainerIsBeingDragged = false
            interaction.viewIsBeingDragged = false
        }
        else if (containerAtMousePosition != null) {
            interaction.currentlySelectedContainerIdentifier = containerAtMousePosition.identifier
            interaction.selectedContainerIsBeingDragged = true
            
            interaction.selectedContainerIsBeingResized = false
            interaction.viewIsBeingDragged = false
        }
        else {
            // we did not click on a container, so we clicked on the background
            interaction.viewIsBeingDragged = true
            
            interaction.currentlySelectedContainerIdentifier = null
            interaction.selectedContainerIsBeingDragged = false
            interaction.selectedContainerIsBeingResized = false
        }
    }
    
    if (mouseState.leftButtonHasGoneUp) {
        
        if (interaction.currentlyHoveredMenuButton == null && interaction.currentlySelectedMode === 'connect') {
            // TODO: add a real connection if we are above a container! (or if the newConnectionBeingAdded.to is not null)
            if (interaction.newConnectionBeingAdded != null && interaction.newConnectionBeingAdded.to != null) {
                // FIXME: we should give this connection the correct properties (like type, color etc)
                interaction.newConnectionBeingAdded.type = 'API2API'
                createConnection(interaction.newConnectionBeingAdded)
            }
            
            interaction.newConnectionBeingAdded = null
        }
        
    }
    
    if (mouseState.leftButtonHasGoneUp) {
        interaction.selectedContainerIsBeingDragged = false
        interaction.selectedContainerIsBeingResized = false
        interaction.selectedContainerResizeSide = null
        interaction.viewIsBeingDragged = false
    }
    
    // Hande mouse movement
    
    if (mouseState.hasMoved && interaction.selectedContainerIsBeingDragged) {
        let relativePosition = {}
        // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
        relativePosition.x = currentlySelectedContainer.relativePosition.x + (mouseState.worldPosition.x - mouseState.previousWorldPosition.x) / parentOfSelectedContainer.scale
        relativePosition.y = currentlySelectedContainer.relativePosition.y + (mouseState.worldPosition.y - mouseState.previousWorldPosition.y) / parentOfSelectedContainer.scale
        changeContainerRelativePosition(currentlySelectedContainer, relativePosition)
        recalculateAbsolutePositions(currentlySelectedContainer)
    }
    
    if (mouseState.hasMoved && interaction.selectedContainerIsBeingResized) {
        
        let mouseWorldMovement = {}
        mouseWorldMovement.x = mouseState.worldPosition.x - mouseState.previousWorldPosition.x
        mouseWorldMovement.y = mouseState.worldPosition.y - mouseState.previousWorldPosition.y
        
        if (interaction.selectedContainerResizeSide.x > 0) { // right side
            let size = {}
            size.width = currentlySelectedContainer.size.width + mouseWorldMovement.x / currentlySelectedContainer.scale
            size.height = currentlySelectedContainer.size.height
            changeContainerSize(currentlySelectedContainer, size)
        }
        if (interaction.selectedContainerResizeSide.y > 0) { // bottom side
            let size = {}
            size.width = currentlySelectedContainer.size.width
            size.height = currentlySelectedContainer.size.height + mouseWorldMovement.y / currentlySelectedContainer.scale
            changeContainerSize(currentlySelectedContainer, size)
        }
        if (interaction.selectedContainerResizeSide.x < 0) { // left side
            let size = {}
            size.width = currentlySelectedContainer.size.width - mouseWorldMovement.x / currentlySelectedContainer.scale
            size.height = currentlySelectedContainer.size.height
            changeContainerSize(currentlySelectedContainer, size)
            
            let relativePosition = {}
            // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
            relativePosition.x = currentlySelectedContainer.relativePosition.x + mouseWorldMovement.x / parentOfSelectedContainer.scale
            relativePosition.y = currentlySelectedContainer.relativePosition.y
            changeContainerRelativePosition(currentlySelectedContainer, relativePosition)
            recalculateAbsolutePositions(currentlySelectedContainer)
        }
        if (interaction.selectedContainerResizeSide.y < 0) { // top side
            let size = {}
            size.width = currentlySelectedContainer.size.width
            size.height = currentlySelectedContainer.size.height - mouseWorldMovement.y / currentlySelectedContainer.scale
            changeContainerSize(currentlySelectedContainer, size)
            
            let relativePosition = {}
            relativePosition.x = currentlySelectedContainer.relativePosition.x
            // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
            relativePosition.y = currentlySelectedContainer.relativePosition.y + mouseWorldMovement.y / parentOfSelectedContainer.scale
            changeContainerRelativePosition(currentlySelectedContainer, relativePosition)
            recalculateAbsolutePositions(currentlySelectedContainer)
        }
    }
    
    if (mouseState.hasMoved && interaction.viewIsBeingDragged) {
        interaction.viewOffset.x += mouseState.position.x - mouseState.previousPosition.x
        interaction.viewOffset.y += mouseState.position.y - mouseState.previousPosition.y
    }

    if (keyboardState.sequenceKeysUpDown.length) {
        
        
        if (interaction.currentlyEditingContainerText != null) {
        
            // TODO: create function: let resultingText = applyKeyboardEventToString(interaction.currentlyEditingContainerText.identifier)
            let textToEdit = interaction.currentlyEditingContainerText.identifier
            for (let sequenceIndex = 0; sequenceIndex < keyboardState.sequenceKeysUpDown.length; sequenceIndex++) {
                let keyUpDown = keyboardState.sequenceKeysUpDown[sequenceIndex]
                let keyName = keyCodeMap[keyUpDown.keyCode]
                if (keyUpDown.isDown) {
                    
                    // Checking if shift (or CAPS-LOCK) is down/active
                    let shiftIsDown = keyboardState.keysThatAreDown[16] // FIXME: hardcoded code for SHIFT!
                    if (keyboardState.capsLockIsActive) {
                        shiftIsDown = !shiftIsDown // TODO: now putting the effective shift-ness in shiftIsDown.
                    }
                    
                    if (keyUpDown.keyCode >= 65 && keyUpDown.keyCode <= 90) {  // A through Z
                        if (shiftIsDown) {
                            textToEdit += keyName
                        }
                        else {
                            textToEdit += keyName.toLowerCase()
                        }
                    }
                    else {
                        // TODO: keep a record of the CURSOR!!
                        if (keyName === 'BACK_SPACE') {
                            textToEdit = textToEdit.substring(0, textToEdit.length - 1);
                        }
                        else {
                            console.log(keyName)
                        }
                    }
                }
            }

            interaction.currentlyEditingContainerText.identifier = textToEdit
        }
        
    }
    
    // Update world
    
    if (interaction.viewAsIsoMetric) {
        if (interaction.percentageIsoMetric < 1) {
            interaction.percentageIsoMetric += 0.03
        }
        else {
            interaction.percentageIsoMetric = 1
        }
    }
    else {
        if (interaction.percentageIsoMetric > 0) {
            interaction.percentageIsoMetric -= 0.03
        }
        else {
            interaction.percentageIsoMetric = 0
        }
    }

    currentIsoMetricSettings.translate = lerp(nonIsoMetricSettings.translate, isoMetricSettings.translate, interaction.percentageIsoMetric)
    currentIsoMetricSettings.scale     = lerp(nonIsoMetricSettings.scale, isoMetricSettings.scale, interaction.percentageIsoMetric)
    currentIsoMetricSettings.rotate    = lerp(nonIsoMetricSettings.rotate, isoMetricSettings.rotate, interaction.percentageIsoMetric)
    
    // Draw world
    drawCanvas()
    
    resetMouseEventData()
    resetKeyboardEventData()
}

