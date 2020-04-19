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
    
    if (ZUI.interaction.percentageIsoMetric === 0) {
        let scaledWorldPosition = scalePosition(ZUI.interaction.viewScale, worldPosition)
        screenPosition = addOffsetToPosition(ZUI.interaction.viewOffset, scaledWorldPosition)
    }
    else {
        // TODO: currently we let the canvas itself do the translation, scaling and rotating
        //       so we ONLY do the translate in world-space here!
        //       so screenPosition isn't realy filled with a screen-coordinate here
        
        // Rotate
        let angleToRotate = ZUI.currentIsoMetricSettings.rotate * Math.PI / 180
        screenPosition.x = worldPosition.x * Math.cos(angleToRotate) - worldPosition.y * Math.sin(angleToRotate);
        screenPosition.y = worldPosition.y * Math.cos(angleToRotate) + worldPosition.x * Math.sin(angleToRotate);
        
        // Scale vertically
        screenPosition.y = screenPosition.y * ZUI.currentIsoMetricSettings.scale
        
        // Translate (in screen-space)
        screenPosition.y = screenPosition.y + ZUI.currentIsoMetricSettings.translate * ZUI.canvasElement.height
        
        let scaledWorldPosition = scalePosition(ZUI.interaction.viewScale, screenPosition)
        screenPosition = addOffsetToPosition(ZUI.interaction.viewOffset, scaledWorldPosition)
        
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
    
    middlePoint.x = (secondPosition.x - firstPosition.x) / 2 + firstPosition.x
    middlePoint.y = (secondPosition.y - firstPosition.y) / 2 + firstPosition.y
    
    return middlePoint
}

function getPointOnBezierCurve (percent, C1, C2, C3, C4) {
    function B1(t) { return t * t * t }
    function B2(t) { return 3 * t * t * (1 - t) }
    function B3(t) { return 3 * t * (1 - t) * (1 - t) }
    function B4(t) { return (1 - t) * (1 - t) * (1 - t) }

    let invertedPercent = 1 - percent
    let pos = {};
    pos.x = C1.x * B1(invertedPercent) + C2.x * B2(invertedPercent) + C3.x * B3(invertedPercent) + C4.x * B4(invertedPercent);
    pos.y = C1.y * B1(invertedPercent) + C2.y * B2(invertedPercent) + C3.y * B3(invertedPercent) + C4.y * B4(invertedPercent);
    return pos;
}

function getClosestDistanceFromPointToBezierCurve(pointToFindClosestDistanceTo, fromPosition, fromBendPosition, toBendPosition, toPosition) {
    
    // TODO: we should add a threshhold when we have found a close-enough distance
    // TODO: we should stop when we didnt find a certain closestDistance after the first iteration (for example double that of our threshhold)
    
    // FIXME: hardcoded number (which number works best?)
    let nrOfPoints = 10 // Actually we do + 1 due to '<=' (so its the nr of segments)
    
    let closestPoint = null
    let closestDistance = null
    let bestIndex = null
    let majorStep = 1 / nrOfPoints
    let minorStep = 1 / nrOfPoints / nrOfPoints
    for (let pointIndex = 0; pointIndex <= nrOfPoints; pointIndex++) {
        let fraction = pointIndex * majorStep
        let pointOnCurve = getPointOnBezierCurve(fraction, fromPosition, fromBendPosition, toBendPosition, toPosition)
        let distance = distanceBetweenTwoPoints(pointToFindClosestDistanceTo, pointOnCurve)
        if (closestDistance == null || distance < closestDistance) {
            closestDistance = distance
            bestIndex = pointIndex
            closestPoint = pointOnCurve
        }
    }
    
    for (let pointIndex = 0; pointIndex <= nrOfPoints; pointIndex++) {
        let majorFraction = bestIndex * majorStep
        let fraction = majorFraction - 0.5 * majorStep
        fraction += pointIndex * minorStep
        
        if (fraction < 0) fraction = 0
        if (fraction > 1) fraction = 1
        let pointOnCurve = getPointOnBezierCurve(fraction, fromPosition, fromBendPosition, toBendPosition, toPosition)
        let distance = distanceBetweenTwoPoints(pointToFindClosestDistanceTo, pointOnCurve)
        if (closestDistance == null || distance < closestDistance) {
            closestDistance = distance
            closestPoint = pointOnCurve
        }
    }    
    
    // TODO: alternatively we could (also) return the closestPoint
    
    return closestDistance
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
    
    if (ZUI.interaction.percentageIsoMetric === 0) {
        let scaledWorldPosition = substractOffsetFromPosition(ZUI.interaction.viewOffset, screenPosition)
        worldPosition = unscalePosition(ZUI.interaction.viewScale, scaledWorldPosition)
    }
    else {
        let scaledWorldPosition = substractOffsetFromPosition(ZUI.interaction.viewOffset, screenPosition)
        worldPosition = unscalePosition(ZUI.interaction.viewScale, scaledWorldPosition)
        
        // Translate (in screen-space)
        worldPosition.y = worldPosition.y - ZUI.currentIsoMetricSettings.translate * ZUI.canvasElement.height
        
        // Scale vertically
        worldPosition.y = worldPosition.y / ZUI.currentIsoMetricSettings.scale
        
        // Rotate
        let angleToRotate = - ZUI.currentIsoMetricSettings.rotate * Math.PI / 180
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

function getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, container, reverseAngle, centerPoint) {
    
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
    let buttonFound = findButtonInButtonListAtScreenPosition(screenPosition, ZUI.menuButtons)
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

    let rootContainer = ZUI.containersAndConnections.containers['root']
        
    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    
    for (let containerIndex = 0; containerIndex < rootContainer.children.length; containerIndex++) {
        let childContainerIdentifier = rootContainer.children[containerIndex]
        let childContainer = ZUI.containersAndConnections.containers[childContainerIdentifier]
        
        if (minX == null || childContainer.worldPosition.x < minX) {
            minX = childContainer.worldPosition.x
        }
        if (maxX == null || childContainer.worldPosition.x + childContainer.worldSize.width > maxX) {
            maxX = childContainer.worldPosition.x + childContainer.worldSize.width
        }
        if (minY == null || childContainer.worldPosition.y < minY) {
            minY = childContainer.worldPosition.y
        }
        if (maxY == null || childContainer.worldPosition.y + childContainer.worldSize.height > maxY) {
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

function getRectangleAroundPoints(arrayOfPoints) {

    let minX = null
    let minY = null
    let maxX = null
    let maxY = null
    
    for (let pointIndex = 0; pointIndex < arrayOfPoints.length; pointIndex++) {
        let point = arrayOfPoints[pointIndex]
        
        if (minX == null || point.x < minX) {
            minX = point.x
        }
        if (maxX == null || point.x > maxX) {
            maxX = point.x
        }
        if (minY == null || point.y < minY) {
            minY = point.y
        }
        if (maxY == null || point.y > maxY) {
            maxY = point.y
        }
    }
    
    let rectangleAroundPoints = {
        position : {
            x : minX,
            y : minY
        },
        size : {
            width : maxX - minX,
            height :  maxY - minY
        }
    }
    
    return rectangleAroundPoints
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
    let containerShape = ZUI.containerShapes[container.shapeType]
    
    if (!containerShape) {
        console.log("ERROR: no containershape found for container:")
        console.log(container)
    }
    
    
    // TODO: for now we are ordering points alphabetically, instead of determining their dependence
    let sortedPointIdentifiers = Object.keys(containerShape.points).sort()
    for (let pointIdentifierIndex = 0; pointIdentifierIndex < sortedPointIdentifiers.length; pointIdentifierIndex++)  {
        let pointIdentifier = sortedPointIdentifiers[pointIdentifierIndex]
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
                let parentWorldScale = container.worldScale / container.localScale
                let worldOffset = { x: point.offset.x * parentWorldScale, y: point.offset.y * parentWorldScale}
                worldPoint = addOffsetToPosition(worldOffset, fromPoint)
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

function recalculateWorldPositionsAndSizes(container) {

    if (container == null) {
        container = ZUI.containersAndConnections.containers['root'] // = root container
        container.worldScale = container.localScale
    }
    else {
        parentContainer = ZUI.containersAndConnections.containers[container.parentContainerIdentifier]
        
        let scaledLocalPosition = scalePosition(parentContainer.worldScale, container.localPosition)
        container.worldPosition = addOffsetToPosition(scaledLocalPosition, parentContainer.worldPosition)
        container.worldScale = parentContainer.worldScale * container.localScale
        container.worldSize = scaleSize(container.worldScale, container.localSize)
        
        recalculateWorldPoints(container)
    }
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerIdentifier = container.children[containerIndex]
        let childContainer = ZUI.containersAndConnections.containers[childContainerIdentifier]
        
        recalculateWorldPositionsAndSizes(childContainer)
    }
}

function findContainerEncompassingWorldRectangle(worldRectangle, container) {
    
    if (container == null) {
        // start with the root container, if no starting container has been supplied
        container = ZUI.containersAndConnections.containers['root'] 
    }
    
    // First check the children (since they are 'on-top' of the parent)
    for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
        let childContainerIdentifier = container.children[containerIndex]
        let childContainer = ZUI.containersAndConnections.containers[childContainerIdentifier]
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


// FIXME: shouldnt this also be deprecated like findConnectionAtWorldPosition? Since we can check if the mouse position is inside a container during drawing right?
function findContainerAtWorldPosition(worldPosition, container, excludeSelectedContainers) {
    
    if (container == null) {
        container = ZUI.containersAndConnections.containers['root'] // = root container
    }
    
    // TODO: for performance, we probably want to check if the mousepointer is above the parent, and only
    //       then check its children (note: this assumes the children are always within the bounds of the parent!)

    // Only check the children if they are shown
    if (showContainerChildren(container)) {
        // First check the children (since they are 'on-top' of the parent)
        for (let containerIndex = 0; containerIndex < container.children.length; containerIndex++) {
            let childContainerIdentifier = container.children[containerIndex]
            let childContainer = ZUI.containersAndConnections.containers[childContainerIdentifier]
            
            let containerAtWorldPosition = findContainerAtWorldPosition(worldPosition, childContainer, excludeSelectedContainers)
            if (containerAtWorldPosition != null) {
                return containerAtWorldPosition
            }
        }
    }
    
    if (excludeSelectedContainers && ZUI.interaction.currentlySelectedContainerIdentifiers.hasOwnProperty(container.identifier)) {
        return null
    }
    
    // Then check the parent itself (but not if it's the root container)
    if (container.identifier !== 'root' && worldPositionIsInsideContainer(worldPosition, container)) {
        return container
    }
    
    return null
}

/* 
FIXME: deprecated
function findConnectionAtWorldPosition(worldPosition) {
    // TODO: this is quite expensive! We might want to use spatial partitioning here
     for (let fromFirstVisibleContainerIdentifier in ZUI.groupedConnections) {
        for (let toFirstVisibleContainerIdentifier in ZUI.groupedConnections[fromFirstVisibleContainerIdentifier]) {
            for (let connectionType in ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier]) {
                let connectionGroup = ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]

                let distance = distanceBetweenTwoPoints(worldPosition, connectionGroup.worldMiddlePoint)
                if (distance < 10 / ZUI.interaction.viewScale) {
                    if (connectionGroup.nrOfConnections === 1) {
                        let foundConnection = connectionGroup.connections[Object.keys(connectionGroup.connections)[0]]
                        return foundConnection
                    }
                }
            }
        }
     }
     return null
}
*/

function whichSideIsPositionFromContainer(worldPosition, container) {
    
    let side = { x: 0, y: 0, isNearContainer: true }
    
    if (container == null) {
        return side
    }
    
    // FIXME: maybe if container is (very) small, we should make the margin smaller?
    // TODO: what we really should be doing is measure the margin in *screen* space instead
    let margin = 10 / ZUI.interaction.viewScale
    
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

function positionIsInsideRectangle(position, rectangle) {
    if (position.x <= rectangle.position.x ||
        position.y <= rectangle.position.y ||
        position.x >= rectangle.position.x + rectangle.size.width ||
        position.y >= rectangle.position.y + rectangle.size.height) {
            
        return false
    }
    else {
        return true
    }
}

function rectanglesOverlap (firstRectangle, secondRectangle) {
    if (
        firstRectangle.position.x > secondRectangle.position.x + secondRectangle.size.width ||   // first rect is to the right of the second rect
        firstRectangle.position.x + firstRectangle.size.width < secondRectangle.position.x ||     // first rect is to the left of the second rect
        firstRectangle.position.y > secondRectangle.position.y + secondRectangle.size.height ||  // first rect is below the second rect
        firstRectangle.position.y + firstRectangle.size.height < secondRectangle.position.y      // first rect is above the second rect
    ) {
        // rects don't overlap
        return false
    }
    else {
        return true
    }
}

function addMarginToRectangle(rectangle, margin) {
    let rectangleWithMargin = {
        position : {
            x : rectangle.position.x - margin,
            y : rectangle.position.y - margin
        },
        size : {
            width : rectangle.size.width + margin * 2,
            height : rectangle.size.height + margin * 2
        }
    }
    
    return rectangleWithMargin
}

function lerp (start, end, fraction) {
    return start + (end - start) * fraction
}