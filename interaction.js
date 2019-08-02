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
    viewOffset : { x: 0, y: 0},
    viewIsBeingDragged : false,
    viewAsIsometric : false,
    showGrid : true,
   
    currentlyHoveredMenuButton : null,
    currentlySelectedMode : 'view',
    
    currentlyHoveredContainer : null,
    currentlySelectedContainer : null,
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

function handleMouseStateChange () {
    
    let containerAtMousePosition = findContainerAtWorldPosition(mouseState.worldPosition)
    let menuButtonAtMousePosition = findMenuButtonAtScreenPosition(mouseState.position)
    
    if (menuButtonAtMousePosition != null) {
        interaction.currentlyHoveredContainer = null
        interaction.currentlyHoveredMenuButton = menuButtonAtMousePosition
    }
    else {
        interaction.currentlyHoveredContainer = containerAtMousePosition
        interaction.currentlyHoveredMenuButton = null
    }
    
// FIXME: we should use .id instead of .identifier everywhere now!
    
    // Check mouse position
    
    let selectedContainerNearness = whichSideIsPositionFromContainer(mouseState.worldPosition, interaction.currentlySelectedContainer)
    
    let mouseIsNearSelectedContainerBorder = false
    
    if (interaction.currentlyHoveredMenuButton != null) {
        // If we hover a menu button, we want to see a default mouse pointer
        interaction.mousePointerStyle = 'default'
    }
    else if (interaction.currentlySelectedMode === 'connect') {
        // TODO: is this always correct?
        interaction.mousePointerStyle = 'default'
        
        if (interaction.newConnectionBeingAdded != null) {
            if (interaction.currentlyHoveredContainer != null &&
                interaction.currentlyHoveredContainer.identifier !== interaction.newConnectionBeingAdded.from) {
                // We are hovering over a different container than we started the connection from, so we should connect with it
                interaction.newConnectionBeingAdded.to = interaction.currentlyHoveredContainer.identifier
            }
            else {
                interaction.newConnectionBeingAdded.to = null
            }
        }
    }
    else if (interaction.currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
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
    else if (interaction.currentlyHoveredContainer != null) {
        interaction.mousePointerStyle = 'move'
    }
    else {
        interaction.mousePointerStyle = 'default'
    }
    
    // Handle mouse clicking

    if (mouseState.rightButtonHasGoneDown && interaction.currentlyHoveredMenuButton == null) {
        
        let parentIdentifier = null
        if (interaction.currentlyHoveredContainer != null) {
            parentIdentifier = interaction.currentlyHoveredContainer.identifier
        }
        let parentContainer = getContainerByIdentifier(parentIdentifier)
        
        // TODO: we need some kind of (incremental) id here!
        let extraServer = {
            type: 'server',  // TODO: allow adding different kinds of containers
            parentIdentifier: parentIdentifier,
// FIXME: what should we use as identifier here??
// FIXME: what should we use as identifier here??
// FIXME: what should we use as identifier here??
            identifier: 'ExtraServer',
            name: 'My Extra Server',
            relativePosition: {
                x: mouseState.worldPosition.x - parentContainer.position.x,
                y: mouseState.worldPosition.y - parentContainer.position.y
            },
            size: {
                width: 200,
                height: 250
            }
        }
// FIXME: console.log(extraServer)
        let extraServerIdentifier = createContainer(extraServer)
    }

    if (mouseState.leftButtonHasGoneDown) {
        
        if (interaction.currentlyHoveredMenuButton != null) {
            // Menu-click has higher priority than container-click, we check it first
            
            if (interaction.currentlyHoveredMenuButton.mode) {
                // If its a menu button with a 'mode', then we select that mode
                interaction.currentlySelectedMode = interaction.currentlyHoveredMenuButton.mode
            }
            
            if (interaction.currentlyHoveredMenuButton.toggle === 'isoMetric') {
                interaction.viewAsIsometric = !interaction.viewAsIsometric
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
            interaction.currentlySelectedContainer = containerAtMousePosition
            interaction.selectedContainerIsBeingDragged = true
            
            interaction.selectedContainerIsBeingResized = false
            interaction.viewIsBeingDragged = false
        }
        else {
            // we did not click on a container, so we clicked on the background
            interaction.viewIsBeingDragged = true
            
            interaction.currentlySelectedContainer = null
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
        interaction.currentlySelectedContainer.relativePosition.x += mouseState.worldPosition.x - mouseState.previousWorldPosition.x 
        interaction.currentlySelectedContainer.relativePosition.y += mouseState.worldPosition.y - mouseState.previousWorldPosition.y
        recalculateAbsolutePositions(interaction.currentlySelectedContainer)
    }
    
    if (mouseState.hasMoved && interaction.selectedContainerIsBeingResized) {
        if (interaction.selectedContainerResizeSide.x > 0) { // right side
            interaction.currentlySelectedContainer.size.width += mouseState.worldPosition.x - mouseState.previousWorldPosition.x 
        }
        if (interaction.selectedContainerResizeSide.y > 0) { // bottom side
            interaction.currentlySelectedContainer.size.height += mouseState.worldPosition.y - mouseState.previousWorldPosition.y
        }
        if (interaction.selectedContainerResizeSide.x < 0) { // left side
            interaction.currentlySelectedContainer.relativePosition.x += mouseState.worldPosition.x - mouseState.previousWorldPosition.x
            interaction.currentlySelectedContainer.size.width -= mouseState.worldPosition.x - mouseState.previousWorldPosition.x
            recalculateAbsolutePositions(interaction.currentlySelectedContainer)
        }
        if (interaction.selectedContainerResizeSide.y < 0) { // top side
            interaction.currentlySelectedContainer.relativePosition.y += mouseState.worldPosition.y - mouseState.previousWorldPosition.y
            interaction.currentlySelectedContainer.size.height -= mouseState.worldPosition.y - mouseState.previousWorldPosition.y
            recalculateAbsolutePositions(interaction.currentlySelectedContainer)
        }
    }
    
    if (mouseState.hasMoved && interaction.viewIsBeingDragged) {
        interaction.viewOffset.x += mouseState.worldPosition.x - mouseState.previousWorldPosition.x
        interaction.viewOffset.y += mouseState.worldPosition.y - mouseState.previousWorldPosition.y
    }

    drawCanvas()
    
    // Reset mouse(event) data
    mouseState.previousPosition.x = mouseState.position.x
    mouseState.previousPosition.y = mouseState.position.y
    mouseState.previousWorldPosition = fromScreenPositionToWorldPosition(mouseState.previousPosition)
    
    mouseState.hasMoved = false
    mouseState.leftButtonHasGoneDown = false
    mouseState.leftButtonHasGoneDownTwice = false
    mouseState.leftButtonHasGoneUp = false
    mouseState.rightButtonHasGoneDown = false
    mouseState.rightButtonHasGoneDownTwice = false
    mouseState.rightButtonHasGoneUp = false
}
