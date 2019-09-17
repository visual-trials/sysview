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
 
let canvasElement = document.getElementById('canvas')
let ctx = canvasElement.getContext("2d")

// TODO: what we really should be doing is:
// - use target and current translate/scale/rotate settings
// - make sure that screen coordinate 0,0 is at middle of the screen/view
// - make sure that when transitioning from nonIso- to isoMetric view, the middle of the screen keeps pointing at the same world position
// - make viewOffset an viewWorldOffset: we are essentially pointing screen position 0,0 (middle of the screen/view) at a certain worldPosition (this is the viewWorldOffset)
// 
// This means: (for world to screen conversion)
// 1) translate using viewWorldOffset (always)
// 2) scale for zooming (always)
// 3) rotate using (isoMetric.rotate)
// 4) scale vertically for isoMetric view (isoMetric.scale)
// 5) translate towards middle of the screen (always)


let isoMetricSettings = {
    translate: 0.5, // move half the height of the screen down
    scale: 0.5,     // shrink vertically (by a factor of 2)
    rotate: -45,   // rotated 45 degrees counter-clock-wise
}

let nonIsoMetricSettings = {
    translate: 0,
    scale: 1,
    rotate: 0,
}

let currentIsoMetricSettings = {
    translate: 0, 
    scale: 1,     
    rotate: 0,   
}

let groupedConnections = {}

function clearCanvas() {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height)
    ctx.beginPath() // See: http://codetheory.in/why-clearrect-might-not-be-clearing-canvas-pixels/
    ctx.closePath()    
}

function resizeCanvasToWindowSize () {
    if ( canvasElement.width != window.innerWidth || canvasElement.height != window.innerHeight) {
        canvasElement.style.width = window.innerWidth
        canvasElement.style.height = window.innerHeight
        canvasElement.width = window.innerWidth
        canvasElement.height = window.innerHeight
    }
}
    
function lighten(color, percentage) {
    let lightColor = { r:0, g:0, b:0, a:0 }
    lightColor.a = color.a
    lightColor.r = color.r + (255 - color.r) * percentage
    lightColor.g = color.g + (255 - color.g) * percentage
    lightColor.b = color.b + (255 - color.b) * percentage
    return lightColor
}

function darken(color, percentage) {
    let darkColor = { r:0, g:0, b:0, a:0 }
    darkColor.a = color.a
    darkColor.r = color.r - color.r * percentage
    darkColor.g = color.g - color.g * percentage
    darkColor.b = color.b - color.b * percentage
    return darkColor
}

function rgba(color) {
    return 'rgba(' + color.r + ',' + color.g + ',' + color.b + ',' + color.a + ')'
}

function drawCanvas() {
    
    clearCanvas()
    resizeCanvasToWindowSize()
    
    // TODO: we want to re-position the button (because the screensize might have just changed), not re-inialize the menu
    initMenu()

    if (interaction.showGrid) {
        drawGrid()
    }
 
    let rootContainer = containersAndConnections.containers['root']
    drawContainers(rootContainer.children)
    
    let doConnectionGrouping = true
    if (doConnectionGrouping) {
        groupConnections()
        drawConnectionGroups()
    }
    else {
        drawConnections()
    }
    drawNewConnection()
    
    drawTinyDetail()
    
    drawMenu()
    
    // TODO: when the mouse (with button pressed) is moving its style doesn't get changed?
    canvasElement.style.cursor = interaction.mousePointerStyle
    
}

function drawMenu() {
    drawButtonList(menuButtons)
}

function drawButtonList(buttonList) {
    for (let buttonIndex = 0; buttonIndex < buttonList.length; buttonIndex++) {
        let buttonData = buttonList[buttonIndex]
        let drawOnlySelected = false
        drawButton(buttonData, drawOnlySelected)
    }
    for (let buttonIndex = 0; buttonIndex < buttonList.length; buttonIndex++) {
        let buttonData = buttonList[buttonIndex]
        let drawOnlySelected = true
        drawButton(buttonData, drawOnlySelected)
    }
}

function drawButton(buttonData, drawOnlySelected) {
    let buttonStroke = "#AAAAAA"
    let buttonFill = "#F8F8F8"
    
    if (interaction.currentlyHoveredMode != null && 
        buttonData.mode === interaction.currentlyHoveredMode) {
        buttonFill = "#FFFFFF"
    }
    
    let buttonPosition = buttonData.position
    let buttonSize = buttonData.size
    
    {
        // Draw Rectangle 
        
        if (!drawOnlySelected) {
            ctx.lineWidth = 1
            ctx.strokeStyle = buttonStroke
            ctx.fillStyle = buttonFill
            ctx.fillRect(buttonPosition.x, buttonPosition.y, buttonSize.width, buttonSize.height)
            
            // TODO: how to deal with stoking and offset: 0.5 ?
            ctx.strokeRect(buttonPosition.x + 0.5, buttonPosition.y + 0.5, buttonSize.width, buttonSize.height)
        }
        
        if (interaction.currentlySelectedMode != null && 
            buttonData.mode === interaction.currentlySelectedMode) {
                
            ctx.lineWidth = 1
            ctx.fillStyle = "#FFFFFF"
            ctx.strokeStyle = "#000000"
            ctx.fillRect(buttonPosition.x, buttonPosition.y, buttonSize.width, buttonSize.height)
            // TODO: how to deal with stoking and offset: 0.5 ?
            ctx.strokeRect(buttonPosition.x + 0.5, buttonPosition.y + 0.5, buttonSize.width, buttonSize.height)
        }
        
        // Draw Icon
        if (menuIcons.hasOwnProperty(buttonData.mode)) {
            if (menuIcons[buttonData.mode]) {
                ctx.drawImage(menuIcons[buttonData.mode], buttonPosition.x, buttonPosition.y)
            }
        }
        else {
            if (buttonData.toggle === 'isoMetric') {
                if (interaction.percentageIsoMetric > 0) {
                    if (menuIcons['isoMetric']) {
                        ctx.drawImage(menuIcons['isoMetric'], buttonPosition.x, buttonPosition.y)
                    }
                }
                else {
                    if (menuIcons['square']) {
                        ctx.drawImage(menuIcons['square'], buttonPosition.x, buttonPosition.y)
                    }
                }
            }
            else if (buttonData.toggle === 'grid') {
                if (menuIcons['grid']) {
                    ctx.drawImage(menuIcons['grid'], buttonPosition.x, buttonPosition.y)
                }
            }
        }
        
    }
    
}

function drawTinyDetail () {
    let tinyDetailSize = { width: 600, height: 40 }
    let tinyDetailPosition = { x: canvasElement.width - tinyDetailSize.width - 100, y: canvasElement.height - tinyDetailSize.height - 20 }

    if (interaction.currentlyHoveredContainerIdentifier != null) {
        ctx.lineWidth = 1
        ctx.fillStyle = "#F0F0F0"
        ctx.strokeStyle = "#888888"
        ctx.fillRect(tinyDetailPosition.x, tinyDetailPosition.y, tinyDetailSize.width, tinyDetailSize.height)
        ctx.strokeRect(tinyDetailPosition.x + 0.5, tinyDetailPosition.y + 0.5, tinyDetailSize.width, tinyDetailSize.height)
        
        let textToDraw = interaction.currentlyHoveredContainerIdentifier
        
        // Get text size
        let textSize = {}
        let fontSize = 14
        let heightBottomWhiteArea = fontSize / 6
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize
        
        ctx.font = fontSize + "px Arial"
        ctx.textBaseline = "top"

        ctx.fillStyle = "#000000"
        ctx.fillText(textToDraw, tinyDetailPosition.x + 20, tinyDetailPosition.y + 20 - 5) // FIXME: hacked the position
    }
}

function drawGrid () {

    let minX = 0
    let maxX = canvasElement.width
    let stepX = 30
    
    let minY = 0
    let maxY = canvasElement.height
    let stepY = 30
    
    // TODO: we are adding 0.5, because we are drawing line (of witdh = 1). Maybe do this differently
    ctx.lineWidth = 1
    ctx.strokeStyle = '#CCCCCC'
    for (let x = minX; x < maxX; x += stepX) {
        ctx.beginPath()
        let screenPosMin = fromWorldPositionToScreenPosition({x: x, y: minY})
        let screenPosMax = fromWorldPositionToScreenPosition({x: x, y: maxY})
        ctx.moveTo(screenPosMin.x + 0.5, screenPosMin.y + 0.5)
        ctx.lineTo(screenPosMax.x + 0.5, screenPosMax.y + 0.5)
        ctx.stroke()
    }
    for (let y = minY; y < maxY; y += stepY) {
        ctx.beginPath()
        let screenPosMin = fromWorldPositionToScreenPosition({x: minX, y: y})
        let screenPosMax = fromWorldPositionToScreenPosition({x: maxX, y: y})
        ctx.moveTo(screenPosMin.x + 0.5, screenPosMin.y + 0.5)
        ctx.lineTo(screenPosMax.x + 0.5, screenPosMax.y + 0.5)
        ctx.stroke()
    }
    
}

function drawNewConnection () {
    if (interaction.newConnectionBeingAddedIdentifier != null) {
        let newConnectionBeingAdded = getConnectionByIdentifier(interaction.newConnectionBeingAddedIdentifier)
        let fromContainer = getContainerByIdentifier(newConnectionBeingAdded.fromContainerIdentifier)
        let toContainer = null
        if (newConnectionBeingAdded.to != null) {
            toContainer = getContainerByIdentifier(newConnectionBeingAdded.toContainerIdentifier)
        }
        else {
            toContainer = {
                identifier: '__new__', // TODO: this is a to prevent crashing at getFirstVisibleContainer. Is there a better way?
                worldSize: { width: 0, height: 0},
                worldPosition: { x: mouseState.worldPosition.x, 
                            y: mouseState.worldPosition.y }
            }
        }
        drawConnection(newConnectionBeingAdded, fromContainer, toContainer)
    }
}

function getFirstVisibleContainer(container) {
    if (container.identifier === '__new__') { // TODO: this is a way to deal with to-be-added containers. Is there a better way?
        return container
    }
    if (container.parentContainerIdentifier === 'root') {
        return container
    }

    let parentContainer = containersAndConnections.containers[container.parentContainerIdentifier]
    if (showContainerChildren(parentContainer) > 0) {
        return container
    }
    return getFirstVisibleContainer(parentContainer)
}

function getClosestConnectionPointToThisPoint(container, toContainerCenterPosition) {
    
    // FIXME: use the dot product and check whether the point (that has the right-angle) is still *on* the line between the two centers of the containers
    //        of those left, take the closest one to the line
    
    let closestDistance = null
    let closestPoint = null
    for (let pointIdentifier in container.worldConnectionPoints) {
        let worldConnectionPoint = container.worldConnectionPoints[pointIdentifier]

        let currentDistance = distanceBetweenTwoPoints(toContainerCenterPosition, worldConnectionPoint.position)

        if (closestDistance == null || currentDistance < closestDistance) {
            closestDistance = currentDistance
            closestPoint = worldConnectionPoint

        }
    }
    already = true
    return closestPoint
}

function groupConnections() {
    
    groupedConnections = {}
    
    for (let connectionIdentifier in containersAndConnections.connections) {
        let connection = containersAndConnections.connections[connectionIdentifier]
        
        // Draw all connections here, but not the new connection-being-added
        if (interaction.newConnectionBeingAddedIdentifier == null || 
            connection.identifier !== interaction.newConnectionBeingAddedIdentifier) {
                
            groupConnection(connection)
        }
    }
}

function groupConnection(connection) {
    
    let fromContainer = containersAndConnections.containers[connection.fromContainerIdentifier]
    let toContainer = containersAndConnections.containers[connection.toContainerIdentifier]
    let fromFirstVisibleContainer = getFirstVisibleContainer(fromContainer)
    let toFirstVisibleContainer = getFirstVisibleContainer(toContainer)
    if (fromFirstVisibleContainer.identifier === toFirstVisibleContainer.identifier) {
        // Not drawing a connection if it effectively connects one container with itself
        return
    }
    
    if (!groupedConnections.hasOwnProperty(fromFirstVisibleContainer.identifier)) {
        groupedConnections[fromFirstVisibleContainer.identifier] = {}
    }
    if (!groupedConnections[fromFirstVisibleContainer.identifier].hasOwnProperty(toFirstVisibleContainer.identifier)) {
        groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier] = {}
    }
    // TODO: workaround for connections that dont have a type. Should we not group them instead? Of group all that have no type?
    let connectionType = '_none_'
    if (connection.type != null) {
        connectionType = connection.type
    }
    if (!groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier].hasOwnProperty(connectionType)) {
        groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType] = {}
    }
    
    groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType][connection.identifier] = connection
}

function drawConnectionGroups() {
    for (let fromFirstVisibleContainerIdentifier in groupedConnections) {
        for (let toFirstVisibleContainerIdentifier in groupedConnections[fromFirstVisibleContainerIdentifier]) {
            for (let connectionType in groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier]) {
                let connectionGroup = { 
                    'fromFirstVisibleContainerIdentifier' : fromFirstVisibleContainerIdentifier,
                    'toFirstVisibleContainerIdentifier' : toFirstVisibleContainerIdentifier,
                    'connectionType' : connectionType,
                }
                let nrOfConnections = 0
                let sumOfXPositionFrom = 0
                let sumOfYPositionFrom = 0
                let sumOfXPositionTo = 0
                let sumOfYPositionTo = 0
                for (let connectionIdentifier in groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]) {
                    let connection = groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType][connectionIdentifier]
                    nrOfConnections++
                    
                    // We take the color of the first connection in the group
                    if (!connectionGroup.hasOwnProperty('stroke')) {
                        connectionGroup.stroke = connection.stroke
                    }
                    
                    let fromContainer = containersAndConnections.containers[connection.fromContainerIdentifier]
                    let toContainer = containersAndConnections.containers[connection.toContainerIdentifier]
                    let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
                    let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
                    sumOfXPositionFrom += fromContainerCenterPosition.x
                    sumOfYPositionFrom += fromContainerCenterPosition.y
                    sumOfXPositionTo += toContainerCenterPosition.x
                    sumOfYPositionTo += toContainerCenterPosition.y
                }
                let averageFromPosition = { x: sumOfXPositionFrom / nrOfConnections, y: sumOfYPositionFrom / nrOfConnections }
                let averageToPosition = { x: sumOfXPositionTo / nrOfConnections, y: sumOfYPositionTo / nrOfConnections }
                
                connectionGroup.nrOfConnections = nrOfConnections
                connectionGroup.averageFromPosition = averageFromPosition
                connectionGroup.averageToPosition = averageToPosition
                
                drawConnectionGroup(connectionGroup)
            }
        }
    }
}

let alreadyLogged = false
function drawConnectionGroup(connectionGroup) {

    let fromFirstVisibleContainer = getContainerByIdentifier(connectionGroup.fromFirstVisibleContainerIdentifier)
    let toFirstVisibleContainer = getContainerByIdentifier(connectionGroup.toFirstVisibleContainerIdentifier)
    // TODO: do something (color wise) with the connectionType?
    let connectionType = connectionGroup.connectionType
    
    let nrOfConnections = connectionGroup.nrOfConnections
    let averageFromPosition = connectionGroup.averageFromPosition
    let averageToPosition = connectionGroup.averageToPosition
    
    // TODO: add comment explaining why To and From are "mixed" here per line:
    let fromContainerBorderPoint = getClosestConnectionPointToThisPoint(fromFirstVisibleContainer, averageToPosition)
    let toContainerBorderPoint = getClosestConnectionPointToThisPoint(toFirstVisibleContainer, averageFromPosition)
    
    // let angleBetweenPoints = getAngleBetweenPoints(averageFromPosition, averageToPosition)
    // let fromContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, fromFirstVisibleContainer, false, fromContainerCenterPosition)
    // let toContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, toFirstVisibleContainer, true, toContainerCenterPosition)
    
    let worldDistanceBetweenFromAndTo = distanceBetweenTwoPoints(fromContainerBorderPoint.position, toContainerBorderPoint.position)
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint.position)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint.position)
    
    let bendingDistance = worldDistanceBetweenFromAndTo / 2
    let fromBendPosition = getPositionFromAnglePointAndDistance(fromContainerBorderPoint.position, fromContainerBorderPoint.rightAngle, bendingDistance)
    let toBendPosition = getPositionFromAnglePointAndDistance(toContainerBorderPoint.position, toContainerBorderPoint.rightAngle, bendingDistance)
    let screenFromBendPosition = fromWorldPositionToScreenPosition(fromBendPosition)
    let screenToBendPosition = fromWorldPositionToScreenPosition(toBendPosition)
    
    {
        /*
        let size = 10
        ctx.fillStyle = "#FF00FF"
        ctx.fillRect(screenFromContainerPosition.x - size/2, screenFromContainerPosition.y - size/2, size, size)
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(screenFromBendPosition.x - size/2, screenFromBendPosition.y - size/2, size, size)
        
        ctx.fillStyle = "#FFFF00"
        ctx.fillRect(screenToContainerPosition.x - size/2, screenToContainerPosition.y - size/2, size, size)
        ctx.fillStyle = "#00FF00"
        ctx.fillRect(screenToBendPosition.x - size/2, screenToBendPosition.y - size/2, size, size)
        */
        
        // Draw line 
        ctx.lineWidth = 2 * interaction.viewScale * nrOfConnections
        ctx.strokeStyle = rgba(connectionGroup.stroke)
        
        /*
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        */
        
        ctx.beginPath()
        ctx.moveTo(       screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.bezierCurveTo(screenFromBendPosition.x, screenFromBendPosition.y, 
                          screenToBendPosition.x, screenToBendPosition.y, 
                          screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()        
        
        if (interaction.currentlySelectedConnection != null) {
            // TODO: how do we select grouped connections? And single connections when they are grouped?
            /*
            if (connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
                ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ctx.strokeStyle = "#FF0000"
                
                ctx.beginPath()
                ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
                ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
                ctx.stroke()
            }
            */

        }
    }
    
}

function drawConnections() {
    for (let connectionIdentifier in containersAndConnections.connections) {
        let connection = containersAndConnections.connections[connectionIdentifier]

        // Draw all connections here, but not the new connection-being-added
        if (interaction.newConnectionBeingAddedIdentifier == null || 
            connection.identifier !== interaction.newConnectionBeingAddedIdentifier) {

            let fromContainer = containersAndConnections.containers[connection.fromContainerIdentifier]
            let toContainer = containersAndConnections.containers[connection.toContainerIdentifier]
            drawConnection(connection, fromContainer, toContainer)
        }
    }
}

function drawConnection(connection, fromContainer, toContainer) {
    
    let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
    let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
    
    let angleBetweenPoints = getAngleBetweenPoints(fromContainerCenterPosition, toContainerCenterPosition)
    
    let fromFirstVisibleContainer = getFirstVisibleContainer(fromContainer)
    let toFirstVisibleContainer = getFirstVisibleContainer(toContainer)
    if (fromFirstVisibleContainer.identifier === toFirstVisibleContainer.identifier) {
        // Not drawing a connection if it effectively connects one container with itself
        return
    }
    let fromContainerBorderPoint = getClosestConnectionPointToThisPoint(fromFirstVisibleContainer, toContainerCenterPosition)
    let toContainerBorderPoint = getClosestConnectionPointToThisPoint(toFirstVisibleContainer, fromContainerCenterPosition)
    // let fromContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, fromFirstVisibleContainer, false, fromContainerCenterPosition)
    // let toContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, toFirstVisibleContainer, true, toContainerCenterPosition)
    
    let worldDistanceBetweenFromAndTo = distanceBetweenTwoPoints(fromContainerBorderPoint.position, toContainerBorderPoint.position)
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint.position)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint.position)
    
    let bendingDistance = worldDistanceBetweenFromAndTo / 2
    let fromBendPosition = getPositionFromAnglePointAndDistance(fromContainerBorderPoint.position, fromContainerBorderPoint.rightAngle, bendingDistance)
    let toBendPosition = getPositionFromAnglePointAndDistance(toContainerBorderPoint.position, toContainerBorderPoint.rightAngle, bendingDistance)
    let screenFromBendPosition = fromWorldPositionToScreenPosition(fromBendPosition)
    let screenToBendPosition = fromWorldPositionToScreenPosition(toBendPosition)
    
    {
        /*
        let size = 5
        ctx.fillStyle = "#FF00FF"
        ctx.fillRect(screenFromContainerPosition.x - size/2, screenFromContainerPosition.y - size/2, size, size)
        ctx.fillStyle = "#FF0000"
        ctx.fillRect(screenFromBendPosition.x - size/2, screenFromBendPosition.y - size/2, size, size)
        
        ctx.fillStyle = "#FFFF00"
        ctx.fillRect(screenToContainerPosition.x - size/2, screenToContainerPosition.y - size/2, size, size)
        ctx.fillStyle = "#00FF00"
        ctx.fillRect(screenToBendPosition.x - size/2, screenToBendPosition.y - size/2, size, size)
        */
        
        // Draw line 
        ctx.lineWidth = 2 * interaction.viewScale
        ctx.strokeStyle = rgba(connection.stroke)
/*        
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        */
        
        ctx.beginPath()
        ctx.moveTo(       screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.bezierCurveTo(screenFromBendPosition.x, screenFromBendPosition.y, 
                          screenToBendPosition.x, screenToBendPosition.y, 
                          screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()        
        
        if (interaction.currentlySelectedConnection != null) {
            if (connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
                ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ctx.strokeStyle = "#FF0000"
                
                ctx.beginPath()
                ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
                ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
                ctx.stroke()
            }

        }
    }
    
}

// TODO: maybe call this: showCover instead?
function showContainerChildren(container) {
    if (container.identifier === 'root') return 1
    
    // TODO: should we really iterate all children to see whether we should show them all? And should we take the highest scale or the average?
    let highestChildScale = 0
    for (let childContainerIndex = 0; childContainerIndex < container.children.length; childContainerIndex++) {
        let childContainerIdentifier = container.children[childContainerIndex]
        let childContainer = containersAndConnections.containers[childContainerIdentifier]
        
        if (interaction.viewScale * childContainer.worldScale > highestChildScale) {
            highestChildScale = interaction.viewScale * childContainer.worldScale
        }
    }
    let beginToShow = 0.1
    let fullyShow = 0.15
    if (highestChildScale > fullyShow) {
        return 1
    }
    else if (highestChildScale > beginToShow) {
        let fractionToShow = (highestChildScale - beginToShow) / (fullyShow - beginToShow)
        return fractionToShow
    }
    else {
        return 0
    }
}

function drawContainers(containerIdentifiers, alpha = null) {
    for (let containerIndex = 0; containerIndex < containerIdentifiers.length; containerIndex++) {
        let containerIdentifier = containerIdentifiers[containerIndex]
        let container = containersAndConnections.containers[containerIdentifier]
        drawContainer(container, alpha)
        let fractionToShowContainer = showContainerChildren(container)
        if (fractionToShowContainer > 0) {
            drawContainers(container.children, fractionToShowContainer)
        }
    }
}

function drawContainerShape (container) {
    let containerShape = containerShapes[container.shapeType]

    ctx.beginPath()
    for (let pathPart of containerShape.strokeAndFillPath) {
        if (pathPart.type === 'move') {
            let toPointIdentifier = pathPart.toPoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            ctx.moveTo(toPoint.x, toPoint.y)
        }
        else if (pathPart.type === 'line') {
            let toPointIdentifier = pathPart.toPoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            ctx.lineTo(toPoint.x, toPoint.y)
        }
        else if (pathPart.type === 'arcto') {
            let toPointIdentifier = pathPart.toPoint
            let edgePointIdentifier = pathPart.edgePoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            let edgePoint = fromWorldPositionToScreenPosition(container.worldPoints[edgePointIdentifier])
            let radius = distanceBetweenTwoPoints(toPoint, edgePoint) // TODO: we derive the radios, which might not always be correct
            ctx.arcTo(edgePoint.x, edgePoint.y, toPoint.x, toPoint.y, radius)
        }
        else {
            console.log('ERROR: unsupported pathPart type: ' + pathPart.type)
        }
    }
    ctx.closePath()
}

function drawContainer(container, alpha = null) {
    
    {
        // Draw rectangle 
        ctx.lineWidth = 2 * interaction.viewScale * container.worldScale
        let stroke = container.stroke
        if (alpha == null) {
            ctx.strokeStyle = rgba(container.stroke)
            ctx.fillStyle = rgba(container.fill)
        }
        else {
            let stroke = {r: container.stroke.r, g:container.stroke.g, b:container.stroke.b, a:container.stroke.a * alpha}
            let fill = {r: container.fill.r, g:container.fill.g, b:container.fill.b, a:container.fill.a * alpha}
            ctx.strokeStyle = rgba(stroke)
            ctx.fillStyle = rgba(fill)
        }
        
        
        drawContainerShape(container)
        ctx.fill()
        
        /*
        if (interaction.percentageIsoMetric > 0) {
            // TODO: using percentageIsoMetric directly (without sin/cos/tan) is probably not quite right
            let containerThickness = 6 * interaction.viewScale * container.worldScale * interaction.percentageIsoMetric
            
            // TODO: at some point we want to draw the *sides* of the containers again
            ctx.fillStyle = rgba(darken(container.fill, 0.3))
            ctx.beginPath()
            ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
            ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
            ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y + containerThickness)
            ctx.lineTo(leftTopContainerPosition.x, leftTopContainerPosition.y + containerThickness)
            ctx.closePath()
            ctx.fill()
            
            ctx.fillStyle = rgba(lighten(container.fill, 0.3))
            ctx.beginPath()
            ctx.moveTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
            ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
            ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y + containerThickness)
            ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y + containerThickness)
            ctx.closePath()
            ctx.fill()
        }
        */
        
        if (Object.keys(interaction.currentlySelectedContainerIdentifiers).length > 0) {
            if (interaction.currentlySelectedContainerIdentifiers.hasOwnProperty(container.identifier)) {
                ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ctx.strokeStyle = "#FF0000"
                
                drawContainerShape(container)
                ctx.stroke()
            }
            else if (interaction.selectedContainersAreBeingDragged && 
                     interaction.emcompassingContainerIdentifier !== 'root' &&
                     container.identifier === interaction.emcompassingContainerIdentifier) {

                ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ctx.strokeStyle = "#FFFF00"
                
                drawContainerShape(container)
                ctx.stroke()
            }
        }
    }
    
    let textColor = { r:0, g:0, b:0, a:1 }
    {
        // Draw text
        let textToDraw = container.name ? container.name : ''
        
        // Get text size
        let textSize = {}
        let fontSize = 14
// FIXME
if (container.parentContainerIdentifier === 'root') {
    fontSize *= 20
}
        
        let heightBottomWhiteArea = fontSize / 6
        ctx.font = fontSize + "px Arial"
        ctx.textBaseline = "top"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize

        // Determine text position
        let textWorldPosition = {}
        textWorldPosition.x = container.worldPosition.x + (container.worldSize.width / 2) - (textSize.width * container.worldScale / 2)
        textWorldPosition.y = container.worldPosition.y + (container.worldSize.height / 2) - (textSize.height * container.worldScale / 2) + heightBottomWhiteArea * container.worldScale
        
        let screenTextPosition = fromWorldPositionToScreenPosition(textWorldPosition)
        
        let debugText = false
        if (debugText) {
            let screenTextSize = scaleSize(interaction.viewScale * container.worldScale, textSize)
            
            ctx.lineWidth = 1
            ctx.strokeStyle = "#FF0000"
            ctx.strokeRect(screenTextPosition.x, screenTextPosition.y, screenTextSize.width, screenTextSize.height)
        }
        
        ctx.save()
        ctx.translate(screenTextPosition.x, screenTextPosition.y) // move the text to the screen position (since we draw the text at 0,0)
        ctx.scale(interaction.viewScale * container.worldScale, interaction.viewScale * container.worldScale) // make the text smaller/bigger according to zoom (viewScale)
        
        if (interaction.percentageIsoMetric > 0) {
            ctx.scale(1, currentIsoMetricSettings.scale)                   // make the text smaller vertically due to isometric view
            ctx.rotate(currentIsoMetricSettings.rotate * Math.PI / 180)    // rotate the text due to isometric view
        }
        
        // Draw the text at the text positions
        ctx.fillStyle = rgba(textColor)
        ctx.fillText(textToDraw, 0, 0)
        
        ctx.restore()
    }
    
}

