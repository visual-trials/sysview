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
 
function fromWorldPositionToScreenPosition(worldPosition) {
    
    let screenPosition = {}
    
    if (!interaction.viewAsIsometric) {
        screenPosition = addOffsetToPosition(interaction.viewOffset, worldPosition)
    }
    else {
        // TODO: currently we let the canvas itself do the translation, scaling and rotating
        //       so we ONLY do the translate in world-space here!
        //       so screenPosition isn't realy filled with a screen-coordinate here
        
        screenPosition = addOffsetToPosition(interaction.viewOffset, worldPosition)
        
        // Rotate
        let lengthFromOrigin = Math.sqrt(screenPosition.x * screenPosition.x + screenPosition.y * screenPosition.y)
        let angleFromOrigin = Math.atan2(screenPosition.x, screenPosition.y)
        let newAngleFromOrigin = angleFromOrigin + isoMetricSettings.rotate * Math.PI / 180
        
        if (newAngleFromOrigin < 0) {
            newAngleFromOrigin += Math.PI * 2
        }
        screenPosition.x = Math.cos(newAngleFromOrigin) * lengthFromOrigin
        screenPosition.y = - Math.sin(newAngleFromOrigin) * lengthFromOrigin
        
        // Scale vertically
        screenPosition.y = screenPosition.y * isoMetricSettings.scale
        
        // Translate (in screen-space)
        screenPosition.y = screenPosition.y + isoMetricSettings.translate * canvasElement.height
    }
    
    return screenPosition
}

function addOffsetToPosition(offset, position) {
    let addedPosition = { x: 0, y: 0}
    addedPosition.x = position.x + offset.x
    addedPosition.y = position.y + offset.y
    return addedPosition
}

function fromScreenPositionToWorldPosition(screenPosition) {
    
    let worldPosition = {}
    
    if (!interaction.viewAsIsometric) {
        worldPosition = substractOffsetFromPosition(interaction.viewOffset, screenPosition)
    }
    else {
        worldPosition.x = screenPosition.x
        worldPosition.y = screenPosition.y
        
        // Translate (in screen-space)
        worldPosition.y = worldPosition.y - isoMetricSettings.translate * canvasElement.height
        
        // Scale vertically
        worldPosition.y = worldPosition.y / isoMetricSettings.scale
        
        // Rotate
        let lengthFromOrigin = Math.sqrt(worldPosition.x * worldPosition.x + worldPosition.y * worldPosition.y)
        let angleFromOrigin = Math.atan2(worldPosition.x, - worldPosition.y)
        let newAngleFromOrigin = angleFromOrigin + isoMetricSettings.rotate * Math.PI / 180
        
        worldPosition.x = Math.cos(newAngleFromOrigin) * lengthFromOrigin
        worldPosition.y = Math.sin(newAngleFromOrigin) * lengthFromOrigin
        
        // substract viewOffset (this is also a translate, but in world-space)
        worldPosition = substractOffsetFromPosition(interaction.viewOffset, worldPosition)
    }
    
    return worldPosition
}

function substractOffsetFromPosition(offset, position) {
    let substractedPosition = { x: 0, y: 0}
    substractedPosition.x = position.x - offset.x
    substractedPosition.y = position.y - offset.y
    return substractedPosition
}

function getCenterPositonOfContainer(container) {
    let centerPosition = { x: 0, y: 0 }
    centerPosition.x = container.position.x + container.size.width / 2
    centerPosition.y = container.position.y + container.size.height / 2
    return centerPosition
}

function getAngleBetweenPoints(fromPosition, toPosition) {
    return Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x);
}

function getAngleOfContainerRect(container) {
    return Math.atan2(container.size.height, container.size.width);
}

function getContainerBorderPointFromAngle(angleBetweenPoints, container, reverseAngle) {
    
    if (reverseAngle) {
        angleBetweenPoints += Math.PI
        if (angleBetweenPoints > Math.PI) {
            angleBetweenPoints -= Math.PI*2
        }
    }
    
    let angleContainerRect = getAngleOfContainerRect(container)
    
    let side = null
    if ((angleBetweenPoints > -angleContainerRect) && (angleBetweenPoints <= angleContainerRect)) {
        side = 1
    } else if ((angleBetweenPoints > angleContainerRect) && (angleBetweenPoints <= (Math.PI - angleContainerRect))) {
        side = 2
    } else if ((angleBetweenPoints > (Math.PI - angleContainerRect)) || (angleBetweenPoints <= -(Math.PI - angleContainerRect))) {
        side = 3
    } else {
        side = 4
    }
    
    let edgePoint = {x: container.size.width / 2, y: container.size.height / 2}
    let xFactor = 1
    let yFactor = 1
  
    if (side === 1) {
        yFactor = -1
    }
    else if (side === 2) {
        yFactor = -1
    }
    else if (side === 3) {
        xFactor = -1
    }
    else if (side === 4) {
        xFactor = -1
    }
  
    let tanAngleBetweenPoints = Math.tan(angleBetweenPoints)
    
    if ((side === 1) || (side === 3)) {
        edgePoint.x += xFactor * (container.size.width / 2.)
        edgePoint.y += -yFactor * (container.size.width / 2.) * tanAngleBetweenPoints
    } else {
        edgePoint.x += xFactor * (container.size.height / (2. * tanAngleBetweenPoints))
        edgePoint.y += -yFactor * (container.size.height /  2.)
    }
  
    edgePoint.x += container.position.x
    edgePoint.y += container.position.y
    return edgePoint
}


function findMenuButtonAtScreenPosition(screenPosition) {
    let buttonFound = findButtonInButtonListAtScreenPosition(screenPosition, menuButtons)
    if (buttonFound != null) {
        return buttonFound
    }
    return null
}

function findButtonInButtonListAtScreenPosition(screenPosition, buttonList) {
    for (let buttonIndex = 0; buttonIndex < buttonList.length; buttonIndex++) {
        let buttonData = buttonList[buttonIndex]
        
        let buttonPosition = buttonData.position
        let buttonSize = buttonData.size
        
        if (screenPosition.x >= buttonPosition.x &&
            screenPosition.x <= buttonPosition.x + buttonSize.width &&
            screenPosition.y >= buttonPosition.y &&
            screenPosition.y <= buttonPosition.y + buttonSize.height) {
            return buttonData
        }
        
    }
    return null
}

function recalculateAbsolutePositions(container = null) {
    
    if (container == null) {
        container = containersAndConnections.containers[0] // = root container
    }
    else {
// FIXME HACK
// FIXME HACK
// FIXME HACK
if (container.parentContainerId != null) {        
        parentContainer = containersAndConnections.containers[container.parentContainerId]
        container.position.x = parentContainer.position.x + container.relativePosition.x
        container.position.y = parentContainer.position.y + container.relativePosition.y
        
}
    }
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerId = container.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerId]
        
        recalculateAbsolutePositions(childContainer)
    }
}

function findContainerAtWorldPosition(worldPosition, container = null) {
    
    if (container == null) {
        container = containersAndConnections.containers[0] // = root container
    }
    
    // TODO: for performance, we probably want to check if the mousepointer is above the parent, and only
    //       then check its children (note: this assumes the children are always within the bounds of the parent!)
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerId = container.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerId]
        
        let containerAtWorldPosition = findContainerAtWorldPosition(worldPosition, childContainer)
        if (containerAtWorldPosition != null) {
            return containerAtWorldPosition
        }
    }
    
    // Then check the parent itself (but not if it's the root container)
    if (container.id !== 0 && worldPositionIsInsideContainer(worldPosition, container)) {
        return container
    }
    
    return null
}

function whichSideIsPositionFromContainer(worldPosition, container) {
    
    // FIXME: maybe if container is (very) small, we should make the margin smaller?
    let margin = 10
    
    let side = { x: 0, y: 0, isNearContainer: true }
    
    if (container == null) {
        return side
    }
    
    if (worldPosition.x < container.position.x + margin) {
        side.x = -1
        if (worldPosition.x < container.position.x - margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.y < container.position.y + margin) {
        side.y = -1
        if (worldPosition.y < container.position.y - margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.x > container.position.x + container.size.width - margin) {
        side.x = 1
        if (worldPosition.x > container.position.x + container.size.width + margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.y > container.position.y + container.size.height - margin) {
        side.y = 1
        if (worldPosition.y > container.position.y + container.size.height + margin) {
            side.isNearContainer = false
        }
    }
    return side
}

function worldPositionIsInsideContainer(worldPosition, container) {
    if (worldPosition.x < container.position.x ||
        worldPosition.y < container.position.y ||
        worldPosition.x > container.position.x + container.size.width ||
        worldPosition.y > container.position.y + container.size.height) {
            
        return false
    }
    else {
        return true
    }
}
