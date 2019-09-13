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
    viewIsBeingDraggedByMouse : false,
    viewIsBeingDraggedByTouch : false,
    viewAsIsoMetric : false,
    percentageIsoMetric : 0,
    showGrid : true,
    isoMetricAnimationRunning : false,
   
    currentlyHoveredMenuButton : null,
    currentlySelectedMode : 'view',
    
    // TODO: we should probably keep record of where things (like the view or a container) is being selected/dragged BY
    //       sometimes its the mouse, sometimes its a touch. We might want to keep a record of that.
    currentlyHoveredContainerIdentifier : null,
    currentlySelectedContainerIdentifiers : {},
    
    selectedContainersAreBeingDragged : false,
    emcompassingContainerIdentifier : null,
    
    selectedContainerIsBeingResized : false,
    selectedContainerResizeSide : null,
    mouseIsNearSelectedContainerBorder : false,
    
    newConnectionBeingAdded : null,

    // TODO: should we only edit a model? And then change the container/connection text accordingly (and save to the backend)?
    currentlyEditingContainerText : null, // TODO: maybe edit container attribute? Using some kind of Id?
    currentlyEditingConnectionText : null, // TODO: maybe edit connection attribute? Using some kind of Id?
    currentlyEditingDataText : null, // TODO: how do we refer to a point in the data structure? Using some kind of Id?
    
    mousePointerStyle: 'default'  // Possible mouse styles: http://www.javascripter.net/faq/stylesc.htm
}

function handleInputStateChange () {
    
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
    
    // TODO: maybe we do not always want to disable dragging/editing/etc if we happen to move the mouse over a menu item?
    if (interaction.currentlyHoveredMenuButton == null) { 
        if (interaction.currentlySelectedMode === 'connect') {
            doAddNewConnection()
            if (interaction.newConnectionBeingAdded == null) {
                doViewDraggingByMouse()
            }
            doViewZoomingByMouse()
        }
        else if (interaction.currentlySelectedMode === 'move') {
            doAddNewContainer()  // TODO: this should become a multi-step process, so we should check if its on-going after calling this function
            if (true) {  
                doEditContainerText()
                if (interaction.currentlyEditingContainerText == null) {
                    
                    if (!interaction.mouseIsNearSelectedContainerBorder && 
                        !interaction.selectedContainerIsBeingResized &&
                        !interaction.selectedContainersAreBeingDragged &&
                        !interaction.viewIsBeingDraggedByMouse) {
                        doContainerSelectionByMouse()
                    }
                    
                    if (!interaction.mouseIsNearSelectedContainerBorder && 
                        !interaction.selectedContainerIsBeingResized &&
                        !interaction.viewIsBeingDraggedByMouse) {
                        doContainerDraggingByMouse()
                    }
                    
                    if (!interaction.selectedContainersAreBeingDragged && 
                        !interaction.viewIsBeingDraggedByMouse) {
                        doContainerResizingByMouse()
                    }
                    
                    
                    if (Object.keys(interaction.currentlySelectedContainerIdentifiers).length == 0) {
                        doViewDraggingByMouse()
                    }
                    
                }
            }
            
            doViewZoomingByMouse()
        }
        else if (interaction.currentlySelectedMode === 'view') {
            doViewDraggingByMouse()
            doViewZoomingByMouse()
        }
    }
    else {
        // If we hover a menu button, we want to see a default mouse pointer
        interaction.mousePointerStyle = 'default'
        
        doMenuButtonModeSelect()
        doMenuButtonIsoMetricToggle()
        doMenuButtonGridToggle()
    }
    
    // Always do view dragging and zooming by touch
    doViewDraggingAndZoomingByTouch()
    
}

function doMenuButtonModeSelect() {
    if (mouseState.leftButtonHasGoneDown && interaction.currentlyHoveredMenuButton.mode) {
        // If its a menu button with a 'mode', then we select that mode
        interaction.currentlySelectedMode = interaction.currentlyHoveredMenuButton.mode
    }
}

function doMenuButtonIsoMetricToggle() {
    if (mouseState.leftButtonHasGoneDown && interaction.currentlyHoveredMenuButton.toggle === 'isoMetric') {
        if (interaction.viewAsIsoMetric) {
            interaction.viewAsIsoMetric = false
            interaction.isoMetricAnimationRunning = true
        }
        else {
            interaction.viewAsIsoMetric = true
            interaction.isoMetricAnimationRunning = true
        }
    }
}

function doMenuButtonGridToggle() {
    if (mouseState.leftButtonHasGoneDown && interaction.currentlyHoveredMenuButton.toggle === 'grid') {
        interaction.showGrid = !interaction.showGrid
    }
}


function doContainerSelectionByMouse() {
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    
    // If ESCAPE is pressed, de-select all containers    
    if (hasKeyGoneDown('ESCAPE')) {
        interaction.currentlySelectedContainerIdentifiers = {}
    }
    
    if (!mouseState.leftButtonHasGoneDownTwice &&
         mouseState.leftButtonHasGoneDown) { // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
         
        if (keyboardState.ctrlIsDown) {
            if (containerAtMousePosition != null) {
                if (interaction.currentlySelectedContainerIdentifiers.hasOwnProperty(containerAtMousePosition.identifier)) {
                    // If a container was already selected and clicked again (with ctrl down), its de-selected
                    delete interaction.currentlySelectedContainerIdentifiers[containerAtMousePosition.identifier]
                }
                else {
                    if (Object.keys(interaction.currentlySelectedContainerIdentifiers).length > 0) {
                        let firstSelectedContainerIdentifier = Object.keys(interaction.currentlySelectedContainerIdentifiers)[0]
                        let firstSelectedContainer = getContainerByIdentifier(firstSelectedContainerIdentifier)
                        
                        // Note that it is only allowed to select mutliple containers if they have *same* parent
                        if (firstSelectedContainer.parentContainerIdentifier === containerAtMousePosition.parentContainerIdentifier) {
                            // If a container was not selected yet and clicked (with ctrl down), its also selected
                            interaction.currentlySelectedContainerIdentifiers[containerAtMousePosition.identifier] = true
                        }
                        else {
                            // When a container is clicked (with ctrl down) and it doesnt have the same parent as the container(s)
                            // already selected, we do not add it to the selection
                        }
                    }
                    else {
                        // If a container was not selected yet and clicked (with ctrl down), its also selected
                        interaction.currentlySelectedContainerIdentifiers[containerAtMousePosition.identifier] = true
                    }
                }
            }
            else {
                // When the background is clicked (while holding ctrl), we do nothing to the selection
            }
        }
        else {
            if (containerAtMousePosition != null) {
                if (interaction.currentlySelectedContainerIdentifiers.hasOwnProperty(containerAtMousePosition.identifier)) {
                    // if a container is clicked and was selected already (when ctrl is not down) we do not de-select it, 
                    // we do nothing (the selected contains need to be kept selected and are about to be dragged)
                }
                else {
                    // if a container is clicked and wasn't selected already (when ctrl is not down) it becomes the (only) selected container
                    interaction.currentlySelectedContainerIdentifiers = {}
                    interaction.currentlySelectedContainerIdentifiers[containerAtMousePosition.identifier] = true
                }
            }
            else {
                // When we click in the background, de-select all selected containers (when ctrl is not down)
                interaction.currentlySelectedContainerIdentifiers = {}
            }
        }
    }
}

function doContainerDraggingByMouse() {
  
    // Note: we can assume then all selected containers have the *same* parent
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    
    if (interaction.currentlyHoveredContainerIdentifier != null) {
        interaction.mousePointerStyle = 'move'
    }
    else {
        interaction.mousePointerStyle = 'default'
    }
    
    if (interaction.selectedContainersAreBeingDragged) {
        if (mouseState.hasMoved) {

            for (let selectedContainerIdentifier in interaction.currentlySelectedContainerIdentifiers) {
                
                let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
                
                // TODO: its kinda arbritrary to need the parent of the selectedContainer. Can't we do this more nicely?
                let parentOfSelectedContainerContainerIdentifier = 'root'
                if (selectedContainer != null) {
                    parentOfSelectedContainerContainerIdentifier = selectedContainer.parentContainerIdentifier
                }
                let parentOfSelectedContainer = getContainerByIdentifier(parentOfSelectedContainerContainerIdentifier)
                
                // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
                selectedContainer.localPosition.x += (mouseState.worldPosition.x - mouseState.previousWorldPosition.x) / parentOfSelectedContainer.worldScale
                selectedContainer.localPosition.y += (mouseState.worldPosition.y - mouseState.previousWorldPosition.y) / parentOfSelectedContainer.worldScale
                recalculateWorldPositions(selectedContainer)
            }
            
        }
        
        let worldRectangle = {}
        if (containerAtMousePosition == null) {
            console.log('ERROR: there is not container at the mouse position, even though we are dragging container(s)!')
            return
        }
        
        worldRectangle.position = { x: containerAtMousePosition.worldPosition.x, y: containerAtMousePosition.worldPosition.y }
        worldRectangle.size = { width: containerAtMousePosition.worldSize.width, height: containerAtMousePosition.worldSize.height }

// FIXME: it now *somehow* possible to move containers towards the root container even though we hover (a just) de-selected container!        
// FIXME: also, we cannot move containers from root to another container!
        // TODO: rename emcompassingContainer to hoveringParentContainer?
        let encompassingContainer = findContainerEncompassingWorldRectangle(worldRectangle)
        if (encompassingContainer != null) {
            interaction.emcompassingContainerIdentifier = encompassingContainer.identifier
        }
        else {
            // TODO: We set parent to 'root' if emcompassingContainerIdentifier == null, but shouldnt findContainerEncompassingWorldRectangle already return 'root'?
            interaction.emcompassingContainerIdentifier = 'root'
        }
        
        // FIXME: since we draw depth-first it can occur the when we drag a container over another parent, the parent is draw *over* the container we try to drag on top of it!
        //        A possible solution would be to draw a dragged container (and its children) in a *second pass* and not draw it in the first pass.
        
        if (mouseState.leftButtonHasGoneUp) {
            
            for (let selectedContainerIdentifier in interaction.currentlySelectedContainerIdentifiers) {
                
                let selectedContainer = getContainerByIdentifier(selectedContainerIdentifier)
                
                // We are checking if we are landing on a (different) encompassingContainer, if so make it the parent 
                if (selectedContainer.parentContainerIdentifier != interaction.emcompassingContainerIdentifier) {

                    // Get the worldPosition of the current container
                    let currentContainerWorldPosition = selectedContainer.worldPosition
                    
                     // Get the worldPosition of the encompassingContainer (the new parent)
                    let newParentContainer = getContainerByIdentifier(interaction.emcompassingContainerIdentifier)
                    let newParentContainerWorldPosition = newParentContainer.worldPosition
                    
                    // Substract these two worldPositions: take into account the (world and local)scale of the parent
                    // this is now the new local position of the current container.
                    selectedContainer.localPosition.x = (currentContainerWorldPosition.x - newParentContainerWorldPosition.x) / newParentContainer.worldScale
                    selectedContainer.localPosition.y = (currentContainerWorldPosition.y - newParentContainerWorldPosition.y) / newParentContainer.worldScale
                    recalculateWorldPositions(selectedContainer)
                    
                    // TODO: the current container is (for 1 frame) still a child of a different container,
                    //       so its new relative position will be relative to the old parent (for 1 frame)
                    
                    selectedContainer.parentContainerIdentifier = interaction.emcompassingContainerIdentifier
                    
// FIXME: we need to do storing more efficiently!                    
                    // TODO: implicitly (and indirectly) this will call integrateContainerAndConnectionData, which removes the child from the old parent
                    //       and adds the child to the new parent. Can we do this more explicitly?
                    storeContainerParent(selectedContainer)
                    storeContainerPositionAndSize(selectedContainer) // async call!
                }
                // FIXME: we probably want to combine BOTH stores by adding an 'else' here!
            
                // We stopped dragging the selected container, so we store its (visual) data
                storeContainerPositionAndSize(selectedContainer) // async call!
            }
            interaction.selectedContainersAreBeingDragged = false
        }
    }

    if (!mouseState.leftButtonHasGoneDownTwice &&
         mouseState.leftButtonHasGoneDown) { // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
        if (containerAtMousePosition != null/* && currentlySelectedContainerIdentifier != null &&
            containerAtMousePosition.identifier === currentlySelectedContainerIdentifier */) {
// FIXME: what should be the logic here?
            interaction.selectedContainersAreBeingDragged = true
        }
        else {
            interaction.selectedContainersAreBeingDragged = false
        }
    }
    
}

function doContainerResizingByMouse() {

    let currentlySelectedContainer = null
    if (Object.keys(interaction.currentlySelectedContainerIdentifiers).length === 1) {
        // For now, we only allow resizing when a single container has been selected
        // if not, we assume no containers are selected (for resizing)
        let currentlySelectedContainerIdentifier = Object.keys(interaction.currentlySelectedContainerIdentifiers)[0]
        currentlySelectedContainer = getContainerByIdentifier(currentlySelectedContainerIdentifier)
    }
    
    // TODO: its kinda arbritrary to need the parent of the selectedContainer. Can't we do this more nicely?
    let parentOfSelectedContainerContainerIdentifier = 'root'
    if (currentlySelectedContainer != null) {
        parentOfSelectedContainerContainerIdentifier = currentlySelectedContainer.parentContainerIdentifier
    }
    let parentOfSelectedContainer = getContainerByIdentifier(parentOfSelectedContainerContainerIdentifier)
    
    if (interaction.selectedContainerIsBeingResized) {
        if (mouseState.hasMoved) {
            
            let mouseWorldMovement = {}
            mouseWorldMovement.x = mouseState.worldPosition.x - mouseState.previousWorldPosition.x
            mouseWorldMovement.y = mouseState.worldPosition.y - mouseState.previousWorldPosition.y
            
            if (interaction.selectedContainerResizeSide.x > 0) { // right side
                currentlySelectedContainer.localSize.width += mouseWorldMovement.x / currentlySelectedContainer.worldScale
            }
            if (interaction.selectedContainerResizeSide.y > 0) { // bottom side
                currentlySelectedContainer.localSize.height += mouseWorldMovement.y / currentlySelectedContainer.worldScale
            }
            if (interaction.selectedContainerResizeSide.x < 0) { // left side
                currentlySelectedContainer.localSize.width -= mouseWorldMovement.x / currentlySelectedContainer.worldScale
                
                // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
                currentlySelectedContainer.localPosition.x += mouseWorldMovement.x / parentOfSelectedContainer.worldScale
                recalculateWorldPositions(currentlySelectedContainer)
            }
            if (interaction.selectedContainerResizeSide.y < 0) { // top side
                currentlySelectedContainer.localSize.height -= mouseWorldMovement.y / currentlySelectedContainer.worldScale
                
                // TODO: we use parentOfSelectedContainer here! (which looks kinda arbritrary, even though it isnt)
                currentlySelectedContainer.localPosition.y += mouseWorldMovement.y / parentOfSelectedContainer.worldScale
                recalculateWorldPositions(currentlySelectedContainer)
            }
        }
        
        if (mouseState.leftButtonHasGoneUp) {
            // We stopped resizing the selected container, so we store its (visual) data
            storeContainerPositionAndSize(currentlySelectedContainer) // async call!
            interaction.selectedContainerIsBeingResized = false
            interaction.selectedContainerResizeSide = null
        }
    }
    
    
    // Check if we are near the border of a container (and if it is clicked)
    
    let selectedContainerNearness = whichSideIsPositionFromContainer(mouseState.worldPosition, currentlySelectedContainer)
    
    if (currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
        interaction.mouseIsNearSelectedContainerBorder = false
        
        if (selectedContainerNearness.x === 0 && selectedContainerNearness.y === 0) {
            interaction.mousePointerStyle = 'move'
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y > 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y < 0))
        {
            if (interaction.viewAsIsoMetric) {
                interaction.mousePointerStyle = 'e-resize'
            }
            else {
                interaction.mousePointerStyle = 'nw-resize'
            }
            interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y < 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y > 0))
        {
            if (interaction.viewAsIsoMetric) {
                interaction.mousePointerStyle = 'n-resize'
            }
            else {
                interaction.mousePointerStyle = 'ne-resize'
            }
            interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.x !== 0) {
            if (interaction.viewAsIsoMetric) {
                interaction.mousePointerStyle = 'ne-resize'
            }
            else {
                interaction.mousePointerStyle = 'e-resize'
            }
            interaction.mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.y !== 0) {
            if (interaction.viewAsIsoMetric) {
                interaction.mousePointerStyle = 'nw-resize'
            }
            else {
                interaction.mousePointerStyle = 'n-resize'
            }
            interaction.mouseIsNearSelectedContainerBorder = true
        }
        
        if (!mouseState.leftButtonHasGoneDownTwice &&
             mouseState.leftButtonHasGoneDown &&  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
            interaction.mouseIsNearSelectedContainerBorder) {
                
            interaction.selectedContainerIsBeingResized = true
            interaction.selectedContainerResizeSide = { x: selectedContainerNearness.x, y: selectedContainerNearness.y }
        }
        
    }
    else {
        // If the mouse is outside the selected container (or if there is no selected container), 
        // we set mouseIsNearSelectedContainerBorder to false
        interaction.mouseIsNearSelectedContainerBorder = false
    }
    
}

function doAddNewConnection() {
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    
    // TODO: is this always correct?
    interaction.mousePointerStyle = 'default'
        
    if (!mouseState.leftButtonHasGoneDownTwice &&
         mouseState.leftButtonHasGoneDown) {  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
        
        let currentDateTime = new Date()
        
        if (containerAtMousePosition != null) {
            interaction.newConnectionBeingAdded = {
                type: 'new',
                identifier: 'NewConnection_' + currentDateTime.getTime(),
                name: 'New connection',
                fromContainerIdentifier: containerAtMousePosition.identifier,
                toContainerIdentifier: null,
                stroke: { r:0, g:180, b:200, a:1 }, // TODO: we should use connection-types and choose a default one when we add a new one (or choose a type)
            }
        }
    }
    
    // TODO: add a real connection if we are above a container! (or if the newConnectionBeingAdded.toContainerIdentifier is not null)
    if (interaction.newConnectionBeingAdded != null) {
        
        if (interaction.currentlyHoveredContainerIdentifier != null &&
            interaction.currentlyHoveredContainerIdentifier !== interaction.newConnectionBeingAdded.fromContainerIdentifier) {
            // We are hovering over a different container than we started the connection from, so we should connect with it
            interaction.newConnectionBeingAdded.toContainerIdentifier = interaction.currentlyHoveredContainerIdentifier
        }
        else {
            interaction.newConnectionBeingAdded.toContainerIdentifier = null
        }
        
        if (mouseState.leftButtonHasGoneUp) {
            if (interaction.newConnectionBeingAdded.toContainerIdentifier != null) {
                // TODO: we should give this connection the correct properties (like type, color etc)
                interaction.newConnectionBeingAdded.type = 'API2API'
                storeConnectionData(interaction.newConnectionBeingAdded)
            }
            interaction.newConnectionBeingAdded = null
        }
    }
    
}

function doAddNewContainer() {
    
    // TODO: we should add new containers in a multi-step way (first choose its type, then draw a rectangle with the mouse (mouse down, move, up)
    
    if (mouseState.rightButtonHasGoneDown) {
        
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
            localPosition: {
                x: mouseState.worldPosition.x - parentContainer.worldPosition.x,
                y: mouseState.worldPosition.y - parentContainer.worldPosition.y
            },
            localScale: 1,
            localSize: {
                width: 200,
                height: 250
            }
        }
        storeVisualContainerData(extraServer) // async call!
    }
}

function doEditContainerText() {
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    
    if (mouseState.leftButtonHasGoneDownTwice) {
        // TODO: we might want to check if the container is selected and/or hovered
        if (containerAtMousePosition != null) {
            interaction.currentlyEditingContainerText = containerAtMousePosition
        }
    }
    
    if (interaction.currentlyEditingContainerText != null) {
        
        if (keyboardState.sequenceKeysUpDown.length) {
        
            // TODO: create function: let resultingText = applyKeyboardEventToString(interaction.currentlyEditingContainerText.identifier)
            let textToEdit = interaction.currentlyEditingContainerText.name
            for (let sequenceIndex = 0; sequenceIndex < keyboardState.sequenceKeysUpDown.length; sequenceIndex++) {
                let keyUpDown = keyboardState.sequenceKeysUpDown[sequenceIndex]
                let keyName = keyCodeMap[keyUpDown.keyCode]
                if (keyUpDown.isDown) {
                    
                    // Checking if shift (or CAPS-LOCK) is down/active
                    let shiftIsDown = keyboardState.shiftIsDown
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
                        else if (keyName === 'ENTER') {
                            // FIXME: store the text!
                            interaction.currentlyEditingContainerText = null
                        }
                        else if (keyName === 'ESCAPE') {
                            // FIXME: undo the editing and dont store
                            interaction.currentlyEditingContainerText = null
                        }
                        else {
                            console.log(keyName)
                        }
                    }
                }
            }

            if (interaction.currentlyEditingContainerText != null) {
                interaction.currentlyEditingContainerText.name = textToEdit
            }
            
            // FIXME: save text each character?! or when we leave the edit of the text? Or when we press enter?
        }
        
    }
    
}

function doViewDraggingAndZoomingByTouch () {
    
    let singleTouch = null
    let firstOfDoubleTouch = null
    let secondOfDoubleTouch = null
    
    // TODO: when a touch has just ended, this number is not the nrOfActiveTouches (should we count those instead?)
    let nrOfTouches = Object.keys(touchesState).length
    if (nrOfTouches === 1) {
        singleTouch = touchesState[Object.keys(touchesState)[0]]
    }
    else if (nrOfTouches === 2) {
        firstOfDoubleTouch = touchesState[Object.keys(touchesState)[0]]
        secondOfDoubleTouch = touchesState[Object.keys(touchesState)[1]]
    }
    
    
    // Dragging by a single touch
    if (singleTouch != null && singleTouch.hasStarted) {
        // TODO: for simplicity we are ignoring the position of this touch! (so we always draw the view if we start a single touch!)
        interaction.viewIsBeingDraggedByTouch = true
    }
    
    if (interaction.viewIsBeingDraggedByTouch) {
        if (singleTouch == null || singleTouch.hasEnded) {
            // The touch has ended
            interaction.viewIsBeingDraggedByTouch = false
        }
        else {
            // The touch is active (and hasn't ended)
            
            if (singleTouch.hasMoved) {
                // The touch has moved
                interaction.viewOffset.x += singleTouch.position.x - singleTouch.previousPosition.x
                interaction.viewOffset.y += singleTouch.position.y - singleTouch.previousPosition.y
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
            interaction.viewScale = interaction.viewScale * relativeZoomChange
         
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
            interaction.viewOffset.x += touchZoomPointScreenPosition.x - touchZoomPointScreenPositionAfterScale.x
            interaction.viewOffset.y += touchZoomPointScreenPosition.y - touchZoomPointScreenPositionAfterScale.y
            
            firstOfDoubleTouch.worldPosition = fromScreenPositionToWorldPosition(firstOfDoubleTouch.position)
            secondOfDoubleTouch.worldPosition = fromScreenPositionToWorldPosition(secondOfDoubleTouch.position)
            
        }
    }

}

function doViewDraggingByMouse () {
    
    // View dragging by mouse
    if (interaction.viewIsBeingDraggedByMouse) {
        if (mouseState.hasMoved) {
            interaction.viewOffset.x += mouseState.position.x - mouseState.previousPosition.x
            interaction.viewOffset.y += mouseState.position.y - mouseState.previousPosition.y
        }
        if (mouseState.leftButtonHasGoneUp) {
            interaction.viewIsBeingDraggedByMouse = false
        }
    }
    
    if (!mouseState.leftButtonHasGoneDownTwice &&  // TODO: we regard double-clicking as overruling single clicking, which might not be desired (for example: quick clicking on menu buttons!)
         mouseState.leftButtonHasGoneDown) {
            interaction.viewIsBeingDraggedByMouse = true
    }
}

function doViewZoomingByMouse () {
    
    // View zooming by mouse
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
        
    }

}

function updateWorld() {
    
    if (centerViewOnWorldCenter) {
        
        let rectangleAroundWorld = getRectangleAroundWorld()
        
        // TODO: put this in a function that centers the view on a world-rectangle
        {
            let middlePointOfWorld = getCenterPointOfRectangle(rectangleAroundWorld)
            
            // For now we are resetting to the default
            interaction.viewScale = 1
            interaction.viewOffset = { x: 0, y: 0 }
            
            // We first set the viewScale
            let leftTopOfWorldOnScreen = fromWorldPositionToScreenPosition(rectangleAroundWorld.position)
            let rightBottomOfWorldOnScreen = fromWorldPositionToScreenPosition(addSizeToPosition(rectangleAroundWorld.size, rectangleAroundWorld.position))
            let worldWidthOnScreen = rightBottomOfWorldOnScreen.x - leftTopOfWorldOnScreen.x
            let worldHeightOnScreen = rightBottomOfWorldOnScreen.y - leftTopOfWorldOnScreen.y
            
            // We check if the height or the width is the constraint and choose that one
            let scaleToFitWidth = canvasElement.width * 0.8 / worldWidthOnScreen
            let scaleToFitHeight = canvasElement.height * 0.8 / worldHeightOnScreen
            if (scaleToFitWidth < scaleToFitHeight) {
                interaction.viewScale = scaleToFitWidth
            }
            else {
                interaction.viewScale = scaleToFitHeight
            }
            
            // After setting the scale we can calculate the viewOffset
            let middleOfWorldOnScreen = fromWorldPositionToScreenPosition(middlePointOfWorld)
            let middleOfScreen = { x: canvasElement.width / 2, y: canvasElement.height / 2 }
            interaction.viewOffset = { x: middleOfScreen.x - middleOfWorldOnScreen.x, y: middleOfScreen.y - middleOfWorldOnScreen.y } 
        }
        
        centerViewOnWorldCenter = false
    }
    
    if (interaction.viewAsIsoMetric) {
        if (interaction.percentageIsoMetric < 1) {
            interaction.percentageIsoMetric += 0.03
        }
        else {
            interaction.percentageIsoMetric = 1
            if (interaction.isoMetricAnimationRunning) {
                interaction.isoMetricAnimationRunning = false
            }
        }
    }
    else {
        if (interaction.percentageIsoMetric > 0) {
            interaction.percentageIsoMetric -= 0.03
        }
        else {
            interaction.percentageIsoMetric = 0
            if (interaction.isoMetricAnimationRunning) {
                interaction.isoMetricAnimationRunning = false
            }
        }
    }

    currentIsoMetricSettings.translate = lerp(nonIsoMetricSettings.translate, isoMetricSettings.translate, interaction.percentageIsoMetric)
    currentIsoMetricSettings.scale     = lerp(nonIsoMetricSettings.scale, isoMetricSettings.scale, interaction.percentageIsoMetric)
    currentIsoMetricSettings.rotate    = lerp(nonIsoMetricSettings.rotate, isoMetricSettings.rotate, interaction.percentageIsoMetric)
}

