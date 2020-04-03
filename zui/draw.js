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
 
// FIXME: let canvasElement = document.getElementById('canvas')

let canvasElement = null
let ctx = null

// TODO: we dont want to call this vue...! (maybe external... ?)
function setCanvas(vueCanvasElement) {
    canvasElement = vueCanvasElement
    ctx = canvasElement.getContext("2d")
}

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

function resizeCanvasToDesiredSize (desiredCanvasSize) {
    let desiredWidth = desiredCanvasSize.width
    let desiredHeight = desiredCanvasSize.height
    if ( canvasElement.width != desiredWidth || canvasElement.height != desiredHeight) {
        canvasElement.style.width = desiredWidth
        canvasElement.style.height = desiredHeight
        canvasElement.width = desiredWidth
        canvasElement.height = desiredHeight
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

function drawDetailLabelAndValue(position, label, value) {
    drawDetailLabelAndTwoValues(position, label, value, '__none__')
}

function drawDetailLabelAndTwoValues(position, label, value, secondValue) {
    // Get text height
    let fontSize = 14
    let heightBottomWhiteArea = fontSize / 6
    let textHeightToFontSizeRatioArial = 1.1499023
    let textHeight = textHeightToFontSizeRatioArial * fontSize
    
    ctx.textBaseline = "top"
    ctx.fillStyle = "#333333"
    
    ctx.font = "bold " + fontSize + "px Arial"
    ctx.fillText(label, position.x, position.y)
    position.x += 30
    position.y += textHeight * 1.2
    ctx.font = fontSize + "px Arial"
    ctx.fillText(value, position.x, position.y)
    position.x -= 30
    position.y += textHeight * 1.2
    if (secondValue !== '__none__') {
        position.x += 30
        ctx.fillText(secondValue, position.x, position.y)
        position.x -= 30
        position.y += textHeight * 1.2
    }
}

function drawContainerData (position, label, visualData, sourceData) {
    if (visualData != null && sourceData != null) {
        drawDetailLabelAndTwoValues(position, label, visualData[label], sourceData[label])
    }
    else if (visualData != null) {
        drawDetailLabelAndTwoValues(position, label, visualData[label], '')
    }
    else if (sourceData != null) {
        drawDetailLabelAndTwoValues(position, label, '', sourceData[label])
    }
    else {
        drawDetailLabelAndTwoValues(position, label, '', '')
    }

}
function drawDebugDetail (databaseData) {
    let detailSize = { width: 300, height: canvasElement.height - 115 }
    let detailPosition = { x: canvasElement.width - detailSize.width - 20, y: 55 }

    if (interaction.currentlyHoveredContainerIdentifier != null) {
        ctx.lineWidth = 1
        ctx.fillStyle = "rgba(255,255,255,0.8)" // "#FFFFFF"
        ctx.strokeStyle = "#DDDDDD"
        ctx.fillRect(detailPosition.x, detailPosition.y, detailSize.width, detailSize.height)
        ctx.strokeRect(detailPosition.x + 0.5, detailPosition.y + 0.5, detailSize.width, detailSize.height)

        let containerToDetail = getContainerByIdentifier(interaction.currentlyHoveredContainerIdentifier)
        // TODO: we should not assume visual/source databaseData here
        let visualData = databaseData.visual.containers[containerToDetail.identifier]
        let sourceData = databaseData.source.containers[containerToDetail.identifier]

        position = {x: detailPosition.x + 20, y: detailPosition.y + 20 }
        
        drawDetailLabelAndValue(position, 'identifier', containerToDetail.identifier)
        drawDetailLabelAndValue(position, 'name', containerToDetail.name)
        drawDetailLabelAndValue(position, 'worldScale', containerToDetail.worldScale)
        drawDetailLabelAndValue(position, 'localScale', containerToDetail.localScale)
        drawDetailLabelAndValue(position, 'localFontSize', containerToDetail.localFontSize)
        //drawDetailLabelAndValue(position, 'localPosition.x', containerToDetail.localPosition.x)
        //drawDetailLabelAndValue(position, 'localPosition.y', containerToDetail.localPosition.y)
        //drawDetailLabelAndValue(position, 'localSize.width', containerToDetail.localSize.width)
        //drawDetailLabelAndValue(position, 'localSize.height', containerToDetail.localSize.height)
        
        drawContainerData(position, 'type', visualData, sourceData)
        drawContainerData(position, 'dataType', visualData, sourceData)
        drawContainerData(position, 'longName', visualData, sourceData)
        drawContainerData(position, 'parentContainerIdentifier', visualData, sourceData)
        //drawContainerData(position, 'localScale', visualData, sourceData)
        //drawContainerData(position, 'localFontSize', visualData, sourceData)
    }
    else if (interaction.currentlyHoveredConnectionIdentifier != null) {
        ctx.lineWidth = 1
        ctx.fillStyle = "rgba(255,255,255,0.8)" // "#FFFFFF"
        ctx.strokeStyle = "#DDDDDD"
        ctx.fillRect(detailPosition.x, detailPosition.y, detailSize.width, detailSize.height)
        ctx.strokeRect(detailPosition.x + 0.5, detailPosition.y + 0.5, detailSize.width, detailSize.height)

        let connectionToDetail = getConnectionByIdentifier(interaction.currentlyHoveredConnectionIdentifier)
        // TODO: we should not assume visual/source databaseData here
        let visualData = databaseData.visual.connections[connectionToDetail.identifier]
        let sourceData = databaseData.source.connections[connectionToDetail.identifier]

        position = {x: detailPosition.x + 20, y: detailPosition.y + 20 }
        
        drawDetailLabelAndValue(position, 'identifier', connectionToDetail.identifier)
        drawDetailLabelAndValue(position, 'name', connectionToDetail.name)
        
        drawContainerData(position, 'type', visualData, sourceData)
        drawContainerData(position, 'dataType', visualData, sourceData)
    }
}

function drawTinyDebugDetail () {
    let textToDraw = null
    if (interaction.currentlySelectedMode === 'connect') {
        if (interaction.currentlyHoveredConnectionIdentifier != null) {
            textToDraw = interaction.currentlyHoveredConnectionIdentifier
        }
    }
    else {
        if (interaction.currentlyHoveredContainerIdentifier != null) {
            if (typeof interaction.currentlyHoveredContainerIdentifier === 'string' && 
                interaction.currentlyHoveredContainerIdentifier.indexOf('AddedContainer_') == 0) {
                let hoveredContainer = getContainerByIdentifier(interaction.currentlyHoveredContainerIdentifier)
                textToDraw = hoveredContainer.name + ' (added manually)'
            }
            else {
                textToDraw = interaction.currentlyHoveredContainerIdentifier
            }
        }
    }

    if (textToDraw != null) {
        let tinyDetailSize = { width: 600, height: 30 }
        
        if (textToDraw.length > 80) {
            tinyDetailSize.width = 800
        }
        // bottom right: let tinyDetailPosition = { x: canvasElement.width - tinyDetailSize.width - 100, y: canvasElement.height - tinyDetailSize.height - 20 }
        let tinyDetailPosition = { x: canvasElement.width - tinyDetailSize.width - 20, y: 20 }

        ctx.lineWidth = 1
        ctx.fillStyle = "rgba(255,255,255,0.9)" // "#FFFFFF"
        ctx.strokeStyle = "#DDDDDD"
        ctx.fillRect(tinyDetailPosition.x, tinyDetailPosition.y, tinyDetailSize.width, tinyDetailSize.height)
        ctx.strokeRect(tinyDetailPosition.x + 0.5, tinyDetailPosition.y + 0.5, tinyDetailSize.width, tinyDetailSize.height)
        
        
        // Get text size
        let textSize = {}
        let fontSize = 14
        let heightBottomWhiteArea = fontSize / 6
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize
        
        ctx.font = fontSize + "px Arial"
        ctx.textBaseline = "top"

        ctx.fillStyle = "#333333"
        ctx.fillText(textToDraw, tinyDetailPosition.x + 20, tinyDetailPosition.y + 20 - 10) // FIXME: hacked the position
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
                worldScale: 1,
                worldSize: { width: 0, height: 0},
                worldPosition: { x: mouseState.worldPosition.x, y: mouseState.worldPosition.y },
                worldConnectionPoints: { 
                    'center-1' : { position: {x: mouseState.worldPosition.x, y: mouseState.worldPosition.y}, rightAngle: 0.0 * Math.PI},
                    'center-2' : { position: {x: mouseState.worldPosition.x, y: mouseState.worldPosition.y}, rightAngle: 0.5 * Math.PI},
                    'center-3' : { position: {x: mouseState.worldPosition.x, y: mouseState.worldPosition.y}, rightAngle: 1.0 * Math.PI},
                    'center-4' : { position: {x: mouseState.worldPosition.x, y: mouseState.worldPosition.y}, rightAngle: 1.5 * Math.PI}
                }
            }
        }

        let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
        let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
        
        let nrOfConnections = 1  // FIXME: hardcoded
        let stroke = "#0000FF" // FIXME: hardcoded
        
        let connectionGroup = { }
        connectionGroup.connectionType = newConnectionBeingAdded.type
        connectionGroup.nrOfConnections = nrOfConnections
        connectionGroup['connections'] = {}
        connectionGroup['connections'][interaction.newConnectionBeingAddedIdentifier] = newConnectionBeingAdded
        connectionGroup.averageFromPosition = fromContainerCenterPosition
        connectionGroup.averageToPosition = toContainerCenterPosition
        connectionGroup.stroke = stroke
        
        drawConnection(fromContainer, toContainer, connectionGroup);
//        drawConnection(newConnectionBeingAdded, fromContainer, toContainer)
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

function getClosestConnectionPointToThisPointUsingDistance(container, toContainerCenterPosition, distanceBetweenCenters) {
    
    // FIXME: use the dot product and check whether the point (that has the right-angle) is still *on* the line between the two centers of the containers
    //        of those left, take the closest one to the line
    
    // FIXME: we now try to mimic the bending point and see if it is the closest to the toContainerCenterPosition (btw the 2 is hardcoded!)
    let approximateBendingDistance = distanceBetweenCenters / 2
    
    let closestDistance = null
    let closestPoint = null
    for (let pointIdentifier in container.worldConnectionPoints) {
        let worldConnectionPoint = container.worldConnectionPoints[pointIdentifier]

        let currentBendPosition = getPositionFromAnglePointAndDistance(worldConnectionPoint.position, worldConnectionPoint.rightAngle, approximateBendingDistance)
        let currentDistance = distanceBetweenTwoPoints(toContainerCenterPosition, currentBendPosition)

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

let nrOfErrors = 0
function groupConnection(connection) {
    
    let fromContainer = containersAndConnections.containers[connection.fromContainerIdentifier]
    if (fromContainer == null && nrOfErrors < 100) {
        nrOfErrors++
        console.log('ERROR:' + connection.fromContainerIdentifier + ' not found!')
    }
    let toContainer = containersAndConnections.containers[connection.toContainerIdentifier]
    if (toContainer == null && nrOfErrors < 100) {
        nrOfErrors++
        console.log('ERROR:' + connection.toContainerIdentifier + ' not found!')
    }
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
    if (connection.dataType != null) {
        connectionType = connection.dataType
    }
    if (!groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier].hasOwnProperty(connectionType)) {
        groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType] = {}
        groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType]['connections'] = {}
    }
    
    groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType]['connections'][connection.identifier] = connection
}

function drawConnectionGroups() {
    
    for (let fromFirstVisibleContainerIdentifier in groupedConnections) {
        for (let toFirstVisibleContainerIdentifier in groupedConnections[fromFirstVisibleContainerIdentifier]) {
            for (let connectionType in groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier]) {
                let connectionGroup = groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]
                
                connectionGroup.fromFirstVisibleContainerIdentifier = fromFirstVisibleContainerIdentifier
                connectionGroup.toFirstVisibleContainerIdentifier = toFirstVisibleContainerIdentifier
                connectionGroup.connectionType = connectionType
                
                let nrOfConnections = 0
                let sumOfXPositionFrom = 0
                let sumOfYPositionFrom = 0
                let sumOfXPositionTo = 0
                let sumOfYPositionTo = 0
                for (let connectionIdentifier in groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]['connections']) {
                    let connection = groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]['connections'][connectionIdentifier]
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
                
                connectionGroup.nrOfConnections = nrOfConnections // TODO: this actually is redundant, since we already have the 'connections' array/object (we can count)
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
    
    drawConnection(fromFirstVisibleContainer, toFirstVisibleContainer, connectionGroup);
    
}


function drawConnection(fromFirstVisibleContainer, toFirstVisibleContainer, connectionGroup) {

    // TODO: do something (color wise) with the connectionType?
    let connectionType = connectionGroup.connectionType
    let nrOfConnections = connectionGroup.nrOfConnections
    let averageFromPosition = connectionGroup.averageFromPosition
    let averageToPosition = connectionGroup.averageToPosition
    let stroke = connectionGroup.stroke
    
    let singleConnectionIdentifier = null
    if (connectionGroup.nrOfConnections === 1) {
        let singleConnection = connectionGroup.connections[Object.keys(connectionGroup.connections)[0]]
        singleConnectionIdentifier = singleConnection.identifier
    }
    
    // TODO: add comment explaining why To and From are "mixed" here per line:
    let worldDistanceBetweenFromAndToCenters = distanceBetweenTwoPoints(averageFromPosition, averageToPosition)
    let fromContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(fromFirstVisibleContainer, averageToPosition, worldDistanceBetweenFromAndToCenters)
    let toContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(toFirstVisibleContainer, averageFromPosition, worldDistanceBetweenFromAndToCenters)

    // TODO: check if the rectangle (formed by the two border-points) is on screen, if not don't draw the connection

    // let angleBetweenPoints = getAngleBetweenPoints(averageFromPosition, averageToPosition)
    // let fromContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, fromFirstVisibleContainer, false, fromContainerCenterPosition)
    // let toContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, toFirstVisibleContainer, true, toContainerCenterPosition)

    let averageContainersWorldScale = (fromFirstVisibleContainer.worldScale + toFirstVisibleContainer.worldScale) / 2

    let worldDistanceBetweenFromAndTo = distanceBetweenTwoPoints(fromContainerBorderPoint.position, toContainerBorderPoint.position)
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint.position)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint.position)


    let bendingDistance = worldDistanceBetweenFromAndTo / 2
    let fromBendPosition = getPositionFromAnglePointAndDistance(fromContainerBorderPoint.position, fromContainerBorderPoint.rightAngle, bendingDistance)
    let toBendPosition = getPositionFromAnglePointAndDistance(toContainerBorderPoint.position, toContainerBorderPoint.rightAngle, bendingDistance)
    let screenFromBendPosition = fromWorldPositionToScreenPosition(fromBendPosition)
    let screenToBendPosition = fromWorldPositionToScreenPosition(toBendPosition)


    // FIXME: remove this (old way):     
    // let screenMiddlePoint = fromWorldPositionToScreenPosition(connectionGroup.worldMiddlePoint)
    // connectionGroup.worldMiddlePoint = middleOfTwoPoints(fromContainerBorderPoint.position, toContainerBorderPoint.position)

    let percentageOfCurve = 0.5 // FIXME: hardcoded!
    let screenMiddlePoint = getPointOnBezierCurve(percentageOfCurve, screenFromContainerPosition, screenFromBendPosition, screenToBendPosition, screenToContainerPosition)
    connectionGroup.worldMiddlePoint = fromScreenPositionToWorldPosition(screenMiddlePoint)
    

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
        ctx.lineWidth = 4 * interaction.viewScale * nrOfConnections * averageContainersWorldScale
        ctx.strokeStyle = rgba(stroke)
        
        /*
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        */
        
        if (singleConnectionIdentifier != null && singleConnectionIdentifier === interaction.currentlySelectedConnectionIdentifier) {
            ctx.strokeStyle = rgba({ r:255, g:0, b:0, a:1 })
        }
        ctx.beginPath()
        ctx.moveTo(       screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.bezierCurveTo(screenFromBendPosition.x, screenFromBendPosition.y, 
                          screenToBendPosition.x, screenToBendPosition.y, 
                          screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()        
        
        

        if (interaction.currentlySelectedMode === 'connect') {
            let fill = { r:250, g:200, b:200, a:0.5 }
            ctx.fillStyle = rgba(fill)
            
            ctx.beginPath()
            ctx.arc(screenMiddlePoint.x, screenMiddlePoint.y, 10, 0, 2 * Math.PI)
            if (singleConnectionIdentifier != null && singleConnectionIdentifier === interaction.currentlyHoveredConnectionIdentifier) {
                let stroke = { r:250, g:150, b:150, a:0.8 }
                fill = { r:250, g:200, b:0, a:0.8 }
                ctx.strokeStyle = rgba(stroke)
                ctx.fillStyle = rgba(fill)
                ctx.stroke()
                ctx.fill()
            }
            else {
                ctx.fill()
            }
            
        }
        
        if (interaction.currentlySelectedConnection != null) {
            // TODO: how do we select grouped connections? And single connections when they are grouped?
            /*
            if (connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
                ctx.lineWidth = 4 * interaction.viewScale * nrOfConnections * averageContainersWorldScale
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

/*
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
    let worldDistanceBetweenFromAndToCenters = distanceBetweenTwoPoints(fromContainerCenterPosition, toContainerCenterPosition)
    let fromContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(fromFirstVisibleContainer, toContainerCenterPosition, worldDistanceBetweenFromAndToCenters)
    let toContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(toFirstVisibleContainer, fromContainerCenterPosition, worldDistanceBetweenFromAndToCenters)
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
    
    let averageContainersWorldScale = (fromFirstVisibleContainer.worldScale + toFirstVisibleContainer.worldScale) / 2
    
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
/*        
        // Draw line 
        ctx.lineWidth = 2 * interaction.viewScale * averageContainersWorldScale
        ctx.strokeStyle = rgba(connection.stroke)
        */
/*        
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        */
        /*
        ctx.beginPath()
        ctx.moveTo(       screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.bezierCurveTo(screenFromBendPosition.x, screenFromBendPosition.y, 
                          screenToBendPosition.x, screenToBendPosition.y, 
                          screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()        
        
        if (interaction.currentlySelectedConnection != null) {
            if (connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
                ctx.lineWidth = 4 * interaction.viewScale * averageContainersWorldScale
                ctx.strokeStyle = "#FF0000"
                
                ctx.beginPath()
                ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
                ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
                ctx.stroke()
            }

        }
    }
    
}
*/

function showContainerChildren(container) {
    if (container.identifier === 'root') return 1
    
    let containerViewScale = interaction.viewScale * container.worldScale
    
    let beginToShow = 0.2 // 0.001
    let fullyShow = 0.25
    if (containerViewScale > fullyShow) {
        return 1
    }
    else if (containerViewScale > beginToShow) {
        let fractionToShow = (containerViewScale - beginToShow) / (fullyShow - beginToShow)
        return fractionToShow
    }
    else {
        return 0
    }
}

function drawContainers(containerIdentifiers, alpha) {
    for (let containerIndex = 0; containerIndex < containerIdentifiers.length; containerIndex++) {
        let containerIdentifier = containerIdentifiers[containerIndex]
        let container = containersAndConnections.containers[containerIdentifier]
        
        /* TODO: do this when setting the absolute position of each container,
                 if its outside the parent, mark the container, so it is drawn purple!
        if (!containerIsInsideParent(container)) {
            console.log(containerIdentifier)
        }
        */
        
        // TODO: this assumes that the children of a container are never outside the bounds of their parent
        //       but that might not always be true
        if (containerIsOnScreen(container)) {
            let fractionToShowContainerChildren = showContainerChildren(container)
            // When we draw the children, we do not want to draw the parents text
            let fractionToShowText = 1
            if (container.children.length > 0) {
                fractionToShowText = 1 - fractionToShowContainerChildren
            }
            drawContainer(container, alpha, fractionToShowText)
            if (fractionToShowContainerChildren > 0) {
                drawContainers(container.children, fractionToShowContainerChildren)
            }
        }
    }
}

function containerIsOnScreen (container) {
    let leftTopPoint = fromWorldPositionToScreenPosition(container.worldPoints['left-top'])
    let rightTopPoint = fromWorldPositionToScreenPosition(container.worldPoints['right-top'])
    let rightBottomPoint = fromWorldPositionToScreenPosition(container.worldPoints['right-bottom'])
    let leftBottomPoint = fromWorldPositionToScreenPosition(container.worldPoints['left-bottom'])
    
    // TODO: hardcoded, so this only works for full screen view!
    let screenRectangle = { x: 0, y: 0, width: canvasElement.width, height: canvasElement.height }
    if (
        leftTopPoint.x > screenRectangle.x + screenRectangle.width ||   // checking most-left-side: for iso-metric leftTop is the most left point
        rightBottomPoint.x < screenRectangle.x ||                       // checking most-right-side: for iso-metric rightBottom is the most right point
        rightTopPoint.y > screenRectangle.y + screenRectangle.height || // checking most-top-side: for iso-metric rightTop is the most top point
        leftBottomPoint.y < screenRectangle.y                           // checking most-bottom-side: for iso-metric leftBottom is the most bottom point
    ) {
        // The container (assuming its is not rotated) in outside the screen-rectangel
        return false
    }
    else {
        return true
    }
}

function containerIsInsideParent (container) {
    let leftTopPoint = container.worldPoints['left-top']
    let rightTopPoint = container.worldPoints['right-top']
    let rightBottomPoint = container.worldPoints['right-bottom']
    let leftBottomPoint = container.worldPoints['left-bottom']
    
    let parentContainerIdentifier = container.parentContainerIdentifier
    // TODO: we now assume the parent always exist. What if it doesn't? Will it be put into a special container?
    let parentContainer = containersAndConnections.containers[parentContainerIdentifier]
    if (parentContainer == null || parentContainer.identifier === 'root') {
        return true
    }
    
    let parentLeftTopPoint = parentContainer.worldPoints['left-top']
    let parentrightBottomPoint = parentContainer.worldPoints['right-bottom']
    
    // TODO: hardcoded, so this only works for full screen view!
    let screenRectangle = { x: 0, y: 0, width: canvasElement.width, height: canvasElement.height }
    if (
        leftTopPoint.x > parentrightBottomPoint.x ||
        rightBottomPoint.x < parentLeftTopPoint.x ||
        rightTopPoint.y > parentrightBottomPoint.y ||
        leftBottomPoint.y < parentLeftTopPoint.y                          
    ) {
        // The container (assuming its is not rotated) in outside the screen-rectangel
        return false
    }
    else {
        return true
    }
}

function drawContainerShape (container) {
    let containerShape = containerShapes[container.shapeType]

    ctx.beginPath()
    for (let pathPartIndex = 0; pathPartIndex < containerShape.strokeAndFillPath.length; pathPartIndex++) {
        let pathPart = containerShape.strokeAndFillPath[pathPartIndex]
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
        else if (pathPart.type === 'bezierCurve') {
            let toPointIdentifier = pathPart.toPoint
            let controlPoint1Identifier = pathPart.controlPoint1
            let controlPoint2Identifier = pathPart.controlPoint2
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            let controlPoint1 = fromWorldPositionToScreenPosition(container.worldPoints[controlPoint1Identifier])
            let controlPoint2 = fromWorldPositionToScreenPosition(container.worldPoints[controlPoint2Identifier])
            ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, toPoint.x, toPoint.y)
        }
        else {
            console.log('ERROR: unsupported pathPart type: ' + pathPart.type)
        }
    }
    ctx.closePath()
}

function drawContainer(container, alpha, textAlpha) {
    
    ctx.save()
    {
        // Draw shape
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
        ctx.stroke()
        
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
        
        // TODO: currenltly we are drawing a shape multiple times if it is being hovered AND is selected
        if (interaction.highlightHoveredContainer &&
            interaction.currentlyHoveredContainerIdentifier != null &&
            interaction.currentlyHoveredContainerIdentifier === container.identifier) {
                
            ctx.lineWidth = 2 // TODO: do we want to scale this too?
            ctx.fillStyle = "#EECC00"
            
            // FIXME: currently filling AFTER stroking, removed HALF of the stroke!
            drawContainerShape(container)
            ctx.fill()
        }
        
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
                ctx.strokeStyle = "#00CC00"
                
                drawContainerShape(container)
                ctx.stroke()
            }
        }
        
    }
    ctx.restore()
    
    let textColor = { r:0, g:0, b:0, a:1 * textAlpha }
    {
        // Draw text
        let textToDraw = container.name ? container.name : ''
        
        // Get text size
        let textSize = {}
        let localFontSize = 14
        if (container.localFontSize != null) {
            localFontSize = container.localFontSize
        }
        
        let heightBottomWhiteArea = localFontSize / 6
        ctx.font = localFontSize + "px Arial"
        ctx.textBaseline = "top"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * localFontSize

        // Determine text position
        let textWorldPosition = {}
        if (container.textBelowContainer) {
            textWorldPosition.x = container.worldPosition.x + (container.worldSize.width / 2) - (textSize.width * container.worldScale / 2)
            textWorldPosition.y = container.worldPosition.y + (container.worldSize.height * 1.15)
        }
        else {
            textWorldPosition.x = container.worldPosition.x + (container.worldSize.width / 2) - (textSize.width * container.worldScale / 2)
            textWorldPosition.y = container.worldPosition.y + (container.worldSize.height / 2) - (textSize.height * container.worldScale / 2) + heightBottomWhiteArea * container.worldScale
        }
        
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

