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
    
    if (interaction.percentageIsoMetric === 0) {
        let scaledWorldPosition = scalePosition(interaction.viewScale, worldPosition)
        screenPosition = addOffsetToPosition(interaction.viewOffset, scaledWorldPosition)
    }
    else {
        // TODO: currently we let the canvas itself do the translation, scaling and rotating
        //       so we ONLY do the translate in world-space here!
        //       so screenPosition isn't realy filled with a screen-coordinate here
        
        // Rotate
        let angleToRotate = currentIsoMetricSettings.rotate * Math.PI / 180
        screenPosition.x = worldPosition.x * Math.cos(angleToRotate) - worldPosition.y * Math.sin(angleToRotate);
        screenPosition.y = worldPosition.y * Math.cos(angleToRotate) + worldPosition.x * Math.sin(angleToRotate);
        
        // Scale vertically
        screenPosition.y = screenPosition.y * currentIsoMetricSettings.scale
        
        // Translate (in screen-space)
        screenPosition.y = screenPosition.y + currentIsoMetricSettings.translate * canvasElement.height
        
        let scaledWorldPosition = scalePosition(interaction.viewScale, screenPosition)
        screenPosition = addOffsetToPosition(interaction.viewOffset, scaledWorldPosition)
        
    }
    
    return screenPosition
}

function distanceBetweenTwoPoints (firstPosition, secondPosition) {
    let xDistance = firstPosition.x - secondPosition.x
    let yDistance = firstPosition.y - secondPosition.y
    let distance = Math.sqrt( xDistance * xDistance + yDistance * yDistance )
    return distance
}

function middleOfTwoPoints (firstPosition, secondPosition) {
    let middlePoint = {x : 0, y : 0}
    
    middlePoint.x = (firstPosition.x - secondPosition.x) / 2 + firstPosition.x
    middlePoint.y = (firstPosition.y - secondPosition.y) / 2 + firstPosition.y
    
    return middlePoint
}

function lerpPositionBetweenTwoPoints (firstPosition, secondPosition, fraction) {
    let middlePoint = {x : 0, y : 0}
    
    middlePoint.x = (secondPosition.x - firstPosition.x) * fraction + firstPosition.x
    middlePoint.y = (secondPosition.y - firstPosition.y) * fraction + firstPosition.y
    
    return middlePoint
}

function addSizeToPosition(size, position) {
    let addedPosition = { x: 0, y: 0}
    addedPosition.x = position.x + size.width
    addedPosition.y = position.y + size.height
    return addedPosition
}

function addOffsetToPosition(offset, position) {
    let addedPosition = { x: 0, y: 0}
    addedPosition.x = position.x + offset.x
    addedPosition.y = position.y + offset.y
    return addedPosition
}

function scalePosition (scale, position) {
    let scaledPosition = { x: 0, y: 0}
    scaledPosition.x = position.x * scale
    scaledPosition.y = position.y * scale
    return scaledPosition
}

function scaleSize(scale, size) {
    let scaledSize = { width: 0, height: 0}
    scaledSize.width = size.width * scale
    scaledSize.height = size.height * scale
    return scaledSize
}

function fromScreenPositionToWorldPosition(screenPosition) {
    
    let worldPosition = {}
    
    if (interaction.percentageIsoMetric === 0) {
        let scaledWorldPosition = substractOffsetFromPosition(interaction.viewOffset, screenPosition)
        worldPosition = unscalePosition(interaction.viewScale, scaledWorldPosition)
    }
    else {
        let scaledWorldPosition = substractOffsetFromPosition(interaction.viewOffset, screenPosition)
        worldPosition = unscalePosition(interaction.viewScale, scaledWorldPosition)
        
        // Translate (in screen-space)
        worldPosition.y = worldPosition.y - currentIsoMetricSettings.translate * canvasElement.height
        
        // Scale vertically
        worldPosition.y = worldPosition.y / currentIsoMetricSettings.scale
        
        // Rotate
        let angleToRotate = - currentIsoMetricSettings.rotate * Math.PI / 180
        let oldPosition = { x: worldPosition.x, y: worldPosition.y}
        worldPosition.x = oldPosition.x * Math.cos(angleToRotate) - oldPosition.y * Math.sin(angleToRotate);
        worldPosition.y = oldPosition.y * Math.cos(angleToRotate) + oldPosition.x * Math.sin(angleToRotate);
    }
    
    return worldPosition
}

function substractOffsetFromPosition(offset, position) {
    let substractedPosition = { x: 0, y: 0}
    substractedPosition.x = position.x - offset.x
    substractedPosition.y = position.y - offset.y
    return substractedPosition
}

function unscalePosition (scale, position) {
    let unscaledPosition = { x: 0, y: 0}
    unscaledPosition.x = position.x / scale
    unscaledPosition.y = position.y / scale
    return unscaledPosition
}

function unscaleSize(scale, size) {
    let unscaledSize = { width: 0, height: 0}
    unscaledSize.width = size.width / scale
    unscaledSize.height = size.height / scale
    return unscaledSize
}

function getCenterPositonOfContainer(container) {
    let centerPosition = { x: 0, y: 0 }
    centerPosition.x = container.worldPosition.x + container.worldSize.width / 2
    centerPosition.y = container.worldPosition.y + container.worldSize.height / 2
    return centerPosition
}

function getAngleBetweenPoints(fromPosition, toPosition) {
    return Math.atan2(toPosition.y - fromPosition.y, toPosition.x - fromPosition.x);
}

function getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, container, reverseAngle, centerPoint = null) {
    
    if (reverseAngle) {
        angleBetweenPoints += Math.PI
        if (angleBetweenPoints > Math.PI) {
            angleBetweenPoints -= Math.PI*2
        }
    }
    
    if (centerPoint == null) {
        centerPoint = {x: container.worldSize.width / 2, y: container.worldSize.height / 2}
        centerPoint.x += container.worldPosition.x
        centerPoint.y += container.worldPosition.y
    }
    
    let leftTop =     {x: container.worldPosition.x,                                          y: container.worldPosition.y }
    let rightTop =    {x: container.worldPosition.x + container.worldSize.width, y: container.worldPosition.y }
    let leftBottom =  {x: container.worldPosition.x,                                          y: container.worldPosition.y + container.worldSize.height }
    let rightBottom = {x: container.worldPosition.x + container.worldSize.width, y: container.worldPosition.y + container.worldSize.height }
    
    let angleWidthLeftTop  = Math.atan2(leftTop.y - centerPoint.y, leftTop.x - centerPoint.x);
    let angleWidthRightTop = Math.atan2(rightTop.y - centerPoint.y, rightTop.x - centerPoint.x);
    let angleWidthLeftBottom  = Math.atan2(leftBottom.y - centerPoint.y, leftBottom.x - centerPoint.x);
    let angleWidthRightBottom = Math.atan2(rightBottom.y - centerPoint.y, rightBottom.x - centerPoint.x);
    
    let side = null
    if ((angleBetweenPoints > angleWidthRightTop) && (angleBetweenPoints <= angleWidthRightBottom)) {
        side = 'right'
    } else if ((angleBetweenPoints > angleWidthLeftTop) && (angleBetweenPoints <= angleWidthRightTop)) {
        side = 'top'
    } else if ((angleBetweenPoints > angleWidthRightBottom) && (angleBetweenPoints <= angleWidthLeftBottom)) {
        side = 'bottom'
    } else {
        side = 'left'
    }
    
    let edgePoint = {x: centerPoint.x, y: centerPoint.y}
  
    let tanAngleBetweenPoints = Math.tan(angleBetweenPoints)
    
    if (side === 'right') {
        edgePoint.x = rightTop.x
        edgePoint.y = centerPoint.y + (rightTop.x - centerPoint.x) * tanAngleBetweenPoints
    }
    else if (side === 'top') {
        edgePoint.x = centerPoint.x + (rightTop.y - centerPoint.y) / tanAngleBetweenPoints
        edgePoint.y = leftTop.y
    }
    else if (side === 'left') {
        edgePoint.x = leftTop.x
        edgePoint.y = centerPoint.y + (leftBottom.x - centerPoint.x) * tanAngleBetweenPoints
    }
    else if (side === 'bottom') {
        edgePoint.x = centerPoint.x + (leftBottom.y - centerPoint.y) / tanAngleBetweenPoints
        edgePoint.y = leftBottom.y
    }
  
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

function getCenterPointOfRectangle (rectangle) {
    let middleX = rectangle.position.x + rectangle.size.width / 2
    let middleY = rectangle.position.y + rectangle.size.height / 2
    return { x: middleX, y: middleY }
}

function getRectangleAroundWorld() {

    let rootContainer = containersAndConnections.containers['root']
        
    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    
    for (let containerIndex = 0; containerIndex < rootContainer.children.length; containerIndex++) {
        let childContainerIdentifier = rootContainer.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerIdentifier]
        
        if (childContainer.worldPosition.x < minX) {
            minX = childContainer.worldPosition.x
        }
        if (childContainer.worldPosition.x + childContainer.worldSize.width > maxX) {
            maxX = childContainer.worldPosition.x + childContainer.worldSize.width
        }
        if (childContainer.worldPosition.y < minY) {
            minY = childContainer.worldPosition.y
        }
        if (childContainer.worldPosition.y + childContainer.worldSize.height > maxY) {
            maxY = childContainer.worldPosition.y + childContainer.worldSize.height
        }
    }
    
    let rectangleAroundWorld = {
        position : {
            x : minX,
            y : minY
        },
        size : {
            width : maxX - minX,
            height :  maxY - minY
        }
    }
    
    return rectangleAroundWorld
}

function recalculateWorldPoints(container) {
    
    // FIXME: should we remove all worldPoints and worldConnectionPoints each time? Or maybe check which dont exist anymore, and remove them afterwatrds?
    // container.worldPoints = {}
    // container.worldConnectionPoints = {}
    
    // First create 4 default points
    container.worldPoints['left-top'] = { x: container.worldPosition.x, y: container.worldPosition.y } 
    container.worldPoints['right-top'] = { x: container.worldPosition.x + container.worldSize.width, y: container.worldPosition.y } 
    container.worldPoints['right-bottom'] = { x: container.worldPosition.x + container.worldSize.width, y: container.worldPosition.y + container.worldSize.height } 
    container.worldPoints['left-bottom'] = { x: container.worldPosition.x, y: container.worldPosition.y + container.worldSize.height } 

    // TODO: check if type exists!
    let containerShape = containerShapes[container.shapeType]
    
    
    // TODO: for now we are ordering points alphabetically, instead of determining their dependence
    for (let pointIdentifier of Object.keys(containerShape.points).sort()) {
    // FIXME: remove this: for (let pointIdentifier in containerShape.points) {
        let point = containerShape.points[pointIdentifier]
        
        let worldPoint = null
        
        if (point.positioning === 'relative') {
            if (container.worldPoints.hasOwnProperty(point.fromPoint) &&
                container.worldPoints.hasOwnProperty(point.toPoint)) {
                
                worldPoint = lerpPositionBetweenTwoPoints(container.worldPoints[point.fromPoint],
                                                                 container.worldPoints[point.toPoint], 
                                                                 point.fraction)
            }
            else {
                console.log('ERROR: either from-point: ' + point.fromPoint + ' or to-point:' + point.toPoint + 'doesnt exists (yet)!')
            }
        }
        else if (point.positioning === 'absolute') {
            if (container.worldPoints.hasOwnProperty(point.fromPoint)) {
                let fromPoint = container.worldPoints[point.fromPoint]
                let offset = { x: point.offset.x * container.worldScale, y: point.offset.y * container.worldScale }
                worldPoint = addOffsetToPosition(offset, fromPoint)
            }
            else {
                console.log('ERROR: from-point: ' + point.fromPoint + 'doesnt exists (yet)!')
            }
        }
        else {
            console.log('ERROR: unsupported point positioning')
        }
        
        if (worldPoint != null) {
            container.worldPoints[pointIdentifier] = worldPoint
            
            if (point.isConnectionPoint) {
                container.worldConnectionPoints[pointIdentifier] = {
                    position : worldPoint,
                    rightAngle : point.rightAngle
                }
            }
        }
        else {
            console.log('ERROR: couldnt create world-point!')
        }
    }
    
}

function getPositionFromAnglePointAndDistance(position, angle, distance) {
    let newPosition = {}
    newPosition.x = position.x + distance * Math.cos(angle)
    newPosition.y = position.y + distance * Math.sin(angle)
    return newPosition
}

function recalculateWorldPositionsAndSizes(container = null) {

    if (container == null) {
        container = containersAndConnections.containers['root'] // = root container
        container.worldScale = container.localScale
    }
    else {
        parentContainer = containersAndConnections.containers[container.parentContainerIdentifier]
        
        let scaledLocalPosition = scalePosition(parentContainer.worldScale, container.localPosition)
        container.worldPosition = addOffsetToPosition(scaledLocalPosition, parentContainer.worldPosition)
        container.worldSize = scaleSize(parentContainer.worldScale, container.localSize)
        container.worldScale = parentContainer.worldScale * container.localScale
        
        recalculateWorldPoints(container)
    }
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerIdentifier = container.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerIdentifier]
        
        recalculateWorldPositionsAndSizes(childContainer)
    }
}

function findContainerEncompassingWorldRectangle(worldRectangle, container = null) {
    
    if (container == null) {
        // start with the root container, if no starting container has been supplied
        container = containersAndConnections.containers['root'] 
    }
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerIdentifier = container.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerIdentifier]
        let containerEncompassingWorldRectangle = findContainerEncompassingWorldRectangle(worldRectangle, childContainer)
        if (containerEncompassingWorldRectangle != null) {
            return containerEncompassingWorldRectangle
        }
    }
    
    // Then check the parent itself (but not if it's the root container)
    if (container.identifier !== 'root' && worldRectangleIsInsideContainer(worldRectangle, container)) {
        return container
    }
    
    return null
}

function findContainerAtWorldPosition(worldPosition, container = null, excludeSelectedContainers = false) {
    
    if (container == null) {
        container = containersAndConnections.containers['root'] // = root container
    }
    
    // TODO: for performance, we probably want to check if the mousepointer is above the parent, and only
    //       then check its children (note: this assumes the children are always within the bounds of the parent!)
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerIdentifier = container.children[containerIndex]
        let childContainer = containersAndConnections.containers[childContainerIdentifier]
        
        let containerAtWorldPosition = findContainerAtWorldPosition(worldPosition, childContainer, excludeSelectedContainers)
        if (containerAtWorldPosition != null) {
            return containerAtWorldPosition
        }
    }
    
    if (excludeSelectedContainers && interaction.currentlySelectedContainerIdentifiers.hasOwnProperty(container.identifier)) {
        return null
    }
    
    // Then check the parent itself (but not if it's the root container)
    if (container.identifier !== 'root' && worldPositionIsInsideContainer(worldPosition, container)) {
        return container
    }
    
    return null
}

function whichSideIsPositionFromContainer(worldPosition, container) {
    
    let side = { x: 0, y: 0, isNearContainer: true }
    
    if (container == null) {
        return side
    }
    
    // FIXME: maybe if container is (very) small, we should make the margin smaller?
    // TODO: what we really should be doing is measure the margin in *screen* space instead
    let margin = 10 / interaction.viewScale
    
    if (worldPosition.x < container.worldPosition.x + margin) {
        side.x = -1
        if (worldPosition.x < container.worldPosition.x - margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.y < container.worldPosition.y + margin) {
        side.y = -1
        if (worldPosition.y < container.worldPosition.y - margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.x > container.worldPosition.x + container.worldSize.width - margin) {
        side.x = 1
        if (worldPosition.x > container.worldPosition.x + container.worldSize.width + margin) {
            side.isNearContainer = false
        }
    }
    if (worldPosition.y > container.worldPosition.y + container.worldSize.height - margin) {
        side.y = 1
        if (worldPosition.y > container.worldPosition.y + container.worldSize.height + margin) {
            side.isNearContainer = false
        }
    }
    return side
}

function worldRectangleIsInsideContainer(worldRectangle, container) {
    if (worldRectangle.position.x <= container.worldPosition.x ||
        worldRectangle.position.y <= container.worldPosition.y ||
        worldRectangle.position.x + worldRectangle.size.width >= container.worldPosition.x + container.worldSize.width ||
        worldRectangle.position.y + worldRectangle.size.height >= container.worldPosition.y + container.worldSize.height) {
            
        return false
    }
    else {
        return true
    }
}

function worldPositionIsInsideContainer(worldPosition, container) {
    if (worldPosition.x <= container.worldPosition.x ||
        worldPosition.y <= container.worldPosition.y ||
        worldPosition.x >= container.worldPosition.x + container.worldSize.width ||
        worldPosition.y >= container.worldPosition.y + container.worldSize.height) {
            
        return false
    }
    else {
        return true
    }
}

function lerp (start, end, fraction) {
    return start + (end - start) * fraction
}