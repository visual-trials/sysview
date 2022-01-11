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

ZUI.canvasElement = null
ZUI.ctx = null

// TODO: we dont want to call this vue...! (maybe external... ?)
function setCanvas(vueCanvasElement) {
    ZUI.canvasElement = vueCanvasElement
    ZUI.ctx = ZUI.canvasElement.getContext("2d")
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


ZUI.isoMetricSettings = {
    translate: 0.5, // move half the height of the screen down
    scale: 0.5,     // shrink vertically (by a factor of 2)
    rotate: -45,   // rotated 45 degrees counter-clock-wise
}

ZUI.nonIsoMetricSettings = {
    translate: 0,
    scale: 1,
    rotate: 0,
}

ZUI.currentIsoMetricSettings = {
    translate: 0, 
    scale: 1,     
    rotate: 0,   
}

ZUI.groupedConnections = {}

ZUI.menuButtons = []
ZUI.menuIcons = {}

function initIcons() {

    let menuIconsRaw = {}
    // see: https://ezgif.com/image-to-datauri
    menuIconsRaw['view'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAp0lEQVRYR+3W4QqAIAwE4Pn+D10ICTISvdvhCvRfYPZ52rRYcivJ37cD+FUCl5l+yZAEKqA25J3pHkcGawlIk2AAdVYyBAuQISIACSIKCCMUgBBCBaARSgCFUANghArQqmRf+ZbGXur0jOqLT/9MFyYW4M+FrYDRzCkEmoA/DcPLgALe+ocQCGB0tqcD/L8P7QVFAp8ANAR8ZVMlML37jTocwEkgPYEbdmUtIUAAjAQAAAAASUVORK5CYII='
    menuIconsRaw['move'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAApUlEQVRYR+2V4QrAIAiE7f0feqOBEFtqepAN7Odw3pde2ij5tGR9KoCqAFqBiwjzEQLQxfmE80R/HMUhiAjATDwMEQEYZ1eqBzrINgBJyPv9M/lXWsA9n8VqAF3MzG8FWE/NAjAhNADN7d4lKuocXQG+ZaoHRgivCa3qPrmXgpSGb5sDEkMKwBG7IHUbvl8H5KXfm9A7EUPLCBbREqAtgOEKoCpwA2MJHyFyeKK8AAAAAElFTkSuQmCC'
    menuIconsRaw['connect'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA60lEQVRYR+2WsQ2EIBSGn7UNE9HTOIWtqzgBoaCxt3ENC1awo2ECLpDY3Omh8MBCSCgICd/HD+HRwMOteZgPVeAdCYzjaKWUsK7rz4azJeCgQghQSvl7zhiDZVnKCQzDYKdpAq21F+CcQ9/35QQclBBi27aFbdvc8DDtbEfg4F3XAaUU5nl2vZzADpdSeijn3B7FfxpLyuv4DQ+thXoEd+GoCcTA0QRi4SgCKfBkgVR4kgAGPFoACx4lgAm/LYANvyWQA35ZIBf8kkBOeFAgN/yvQAn4qYD7ThljYK/noZKaMo9ajmNEqkBN4AOo0XEhIBB/ywAAAABJRU5ErkJggg=='
    menuIconsRaw['isoMetric'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAjElEQVRYR+2VwQrAIAxD9f8/ervMS6Uk6YRuEK+2yTMVnaN5zWb/YQAn4AR+n8D1vCPlg1Qbo3EZRAVARmh/e3hZAFWYrkcAtFDyp8D+DAA2ip9YqhcBThtHzk3/cwlA4lPRLx10CVedOhq6ngVgQWhjNQE0Gtn4LQCbCLwy6gigoFpgACfgBJxAewI3vSgYIdYpy48AAAAASUVORK5CYII='
    menuIconsRaw['square'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAW0lEQVRYR+2WQQoAIAgE9f+PTnpArWSgh+mabeNApFvz8ub7DQAMjDewPr2SY6PKwAZQNYrxmqHCAcAABjCAAQxgYIQB9d9n9p8Hkkx4qUYNJKXwzGEAMNBuIABaPSIhIHxqIwAAAABJRU5ErkJggg=='
    menuIconsRaw['grid'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAABeSURBVEhL7dFBCgAhDEPROve/VQ+mgxFxUwLFLoS8lVmJfusHd1+n6cr8rFj5Be1/yzoWwU9B7pchmu83UOQtmopMKTKlyBxSQC4jRFORKUWmFJlDCshlhGi+3sBsAB2ejdkSVbdvAAAAAElFTkSuQmCC'
    // menuIconsRaw['grid'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAABQfqXFsNnFTizzXk99+MAAQIECBAgQIAAAQIECBAgMBo/ACHo7lH9AAAAAElFTkSuQmCC'
    
    for (let mode in menuIconsRaw) {
        let iconImage = new Image
        iconImage.src = menuIconsRaw[mode]
        iconImage.onload = function(){
            ZUI.menuIcons[mode] = iconImage
            // FIXME: there is probably a better way to do this!
            // drawCanvas(true, true)
        }
    }
}

function clearCanvas() {
    ZUI.ctx.clearRect(0, 0, ZUI.canvasElement.width, ZUI.canvasElement.height)
    ZUI.ctx.beginPath() // See: http://codetheory.in/why-clearrect-might-not-be-clearing-canvas-pixels/
    ZUI.ctx.closePath()    
}

function resizeCanvasToDesiredSize (desiredCanvasSize, doRecentering) {
    let desiredWidth = desiredCanvasSize.width
    let desiredHeight = desiredCanvasSize.height
    if ( ZUI.canvasElement.width != desiredWidth || ZUI.canvasElement.height != desiredHeight) {
        if (doRecentering) {
            let verticalDifference = desiredCanvasSize.height - ZUI.canvasElement.height
            let horizontalDifference = desiredCanvasSize.width - ZUI.canvasElement.width
            
            // TODO: this does not take isometrics into account
            ZUI.interaction.viewOffset.y += verticalDifference / 2
            ZUI.interaction.viewOffset.x += horizontalDifference / 2
        }
        
        ZUI.canvasElement.style.width = desiredWidth
        ZUI.canvasElement.style.height = desiredHeight
        ZUI.canvasElement.width = desiredWidth
        ZUI.canvasElement.height = desiredHeight
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
    drawButtonList(ZUI.menuButtons)
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
    
    if (ZUI.interaction.currentlyHoveredMode != null && 
        buttonData.mode === ZUI.interaction.currentlyHoveredMode) {
        buttonFill = "#FFFFFF"
    }
    
    let buttonPosition = buttonData.position
    let buttonSize = buttonData.size
    
    {
        // Draw Rectangle 
        
        if (!drawOnlySelected) {
            ZUI.ctx.lineWidth = 1
            ZUI.ctx.strokeStyle = buttonStroke
            ZUI.ctx.fillStyle = buttonFill
            ZUI.ctx.fillRect(buttonPosition.x, buttonPosition.y, buttonSize.width, buttonSize.height)
            
            // TODO: how to deal with stoking and offset: 0.5 ?
            ZUI.ctx.strokeRect(buttonPosition.x + 0.5, buttonPosition.y + 0.5, buttonSize.width, buttonSize.height)
        }
        
        if (ZUI.interaction.currentlySelectedMode != null && 
            buttonData.mode === ZUI.interaction.currentlySelectedMode) {
                
            ZUI.ctx.lineWidth = 1
            ZUI.ctx.fillStyle = "#FFFFFF"
            ZUI.ctx.strokeStyle = "#000000"
            ZUI.ctx.fillRect(buttonPosition.x, buttonPosition.y, buttonSize.width, buttonSize.height)
            // TODO: how to deal with stoking and offset: 0.5 ?
            ZUI.ctx.strokeRect(buttonPosition.x + 0.5, buttonPosition.y + 0.5, buttonSize.width, buttonSize.height)
        }
        
        // Draw Icon
        if (ZUI.menuIcons.hasOwnProperty(buttonData.mode)) {
            if (ZUI.menuIcons[buttonData.mode]) {
                ZUI.ctx.drawImage(ZUI.menuIcons[buttonData.mode], buttonPosition.x, buttonPosition.y)
            }
        }
        else {
            if (buttonData.toggle === 'isoMetric') {
                if (ZUI.interaction.percentageIsoMetric > 0) {
                    if (ZUI.menuIcons['isoMetric']) {
                        ZUI.ctx.drawImage(ZUI.menuIcons['isoMetric'], buttonPosition.x, buttonPosition.y)
                    }
                }
                else {
                    if (ZUI.menuIcons['square']) {
                        ZUI.ctx.drawImage(ZUI.menuIcons['square'], buttonPosition.x, buttonPosition.y)
                    }
                }
            }
            else if (buttonData.toggle === 'grid') {
                if (ZUI.menuIcons['grid']) {
                    ZUI.ctx.drawImage(ZUI.menuIcons['grid'], buttonPosition.x, buttonPosition.y)
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
    
    ZUI.ctx.textBaseline = "top"
    ZUI.ctx.fillStyle = "#333333"
    
    ZUI.ctx.font = "bold " + fontSize + "px Arial"
    ZUI.ctx.fillText(label, position.x, position.y)
    position.x += 30
    position.y += textHeight * 1.2
    ZUI.ctx.font = fontSize + "px Arial"
    ZUI.ctx.fillText(value, position.x, position.y)
    position.x -= 30
    position.y += textHeight * 1.2
    if (secondValue !== '__none__') {
        position.x += 30
        ZUI.ctx.fillText(secondValue, position.x, position.y)
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
    let detailSize = { width: 300, height: ZUI.canvasElement.height - 115 }
    let detailPosition = { x: ZUI.canvasElement.width - detailSize.width - 20, y: 55 }

    if (ZUI.interaction.currentlyHoveredContainerIdentifier != null) {
        ZUI.ctx.lineWidth = 1
        ZUI.ctx.fillStyle = "rgba(255,255,255,0.8)" // "#FFFFFF"
        ZUI.ctx.strokeStyle = "#DDDDDD"
        ZUI.ctx.fillRect(detailPosition.x, detailPosition.y, detailSize.width, detailSize.height)
        ZUI.ctx.strokeRect(detailPosition.x + 0.5, detailPosition.y + 0.5, detailSize.width, detailSize.height)

        let containerToDetail = getContainerByIdentifier(ZUI.interaction.currentlyHoveredContainerIdentifier)
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
    else if (ZUI.interaction.currentlyHoveredConnectionIdentifier != null) {
        ZUI.ctx.lineWidth = 1
        ZUI.ctx.fillStyle = "rgba(255,255,255,0.8)" // "#FFFFFF"
        ZUI.ctx.strokeStyle = "#DDDDDD"
        ZUI.ctx.fillRect(detailPosition.x, detailPosition.y, detailSize.width, detailSize.height)
        ZUI.ctx.strokeRect(detailPosition.x + 0.5, detailPosition.y + 0.5, detailSize.width, detailSize.height)

        let connectionToDetail = getConnectionByIdentifier(ZUI.interaction.currentlyHoveredConnectionIdentifier)
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
    if (ZUI.interaction.currentlySelectedMode === 'connect') {
        if (ZUI.interaction.currentlyHoveredConnectionIdentifier != null) {
            textToDraw = ZUI.interaction.currentlyHoveredConnectionIdentifier
        }
    }
    else {
        if (ZUI.interaction.currentlyHoveredContainerIdentifier != null) {
            if (typeof ZUI.interaction.currentlyHoveredContainerIdentifier === 'string' && 
                ZUI.interaction.currentlyHoveredContainerIdentifier.indexOf('AddedContainer_') == 0) {
                let hoveredContainer = getContainerByIdentifier(ZUI.interaction.currentlyHoveredContainerIdentifier)
                textToDraw = hoveredContainer.name + ' (added manually)'
            }
            else {
                textToDraw = ZUI.interaction.currentlyHoveredContainerIdentifier
            }
        }
    }

    if (textToDraw != null) {
        let tinyDetailSize = { width: 600, height: 30 }
        
        if (textToDraw.length > 80) {
            tinyDetailSize.width = 800
        }
        // bottom right: let tinyDetailPosition = { x: ZUI.canvasElement.width - tinyDetailSize.width - 100, y: ZUI.canvasElement.height - tinyDetailSize.height - 20 }
        let tinyDetailPosition = { x: ZUI.canvasElement.width - tinyDetailSize.width - 20, y: 20 }

        ZUI.ctx.lineWidth = 1
        ZUI.ctx.fillStyle = "rgba(255,255,255,0.9)" // "#FFFFFF"
        ZUI.ctx.strokeStyle = "#DDDDDD"
        ZUI.ctx.fillRect(tinyDetailPosition.x, tinyDetailPosition.y, tinyDetailSize.width, tinyDetailSize.height)
        ZUI.ctx.strokeRect(tinyDetailPosition.x + 0.5, tinyDetailPosition.y + 0.5, tinyDetailSize.width, tinyDetailSize.height)
        
        
        // Get text size
        let textSize = {}
        let fontSize = 14
        let heightBottomWhiteArea = fontSize / 6
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ZUI.ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize
        
        ZUI.ctx.font = fontSize + "px Arial"
        ZUI.ctx.textBaseline = "top"

        ZUI.ctx.fillStyle = "#333333"
        ZUI.ctx.fillText(textToDraw, tinyDetailPosition.x + 20, tinyDetailPosition.y + 20 - 10) // FIXME: hacked the position
    }
}

function drawGrid () {

    let minX = 0
    let maxX = ZUI.canvasElement.width
    let stepX = 30
    
    let minY = 0
    let maxY = ZUI.canvasElement.height
    let stepY = 30
    
    // TODO: we are adding 0.5, because we are drawing line (of witdh = 1). Maybe do this differently
    ZUI.ctx.lineWidth = 1
    ZUI.ctx.strokeStyle = '#CCCCCC'
    for (let x = minX; x < maxX; x += stepX) {
        ZUI.ctx.beginPath()
        let screenPosMin = fromWorldPositionToScreenPosition({x: x, y: minY})
        let screenPosMax = fromWorldPositionToScreenPosition({x: x, y: maxY})
        ZUI.ctx.moveTo(screenPosMin.x + 0.5, screenPosMin.y + 0.5)
        ZUI.ctx.lineTo(screenPosMax.x + 0.5, screenPosMax.y + 0.5)
        ZUI.ctx.stroke()
    }
    for (let y = minY; y < maxY; y += stepY) {
        ZUI.ctx.beginPath()
        let screenPosMin = fromWorldPositionToScreenPosition({x: minX, y: y})
        let screenPosMax = fromWorldPositionToScreenPosition({x: maxX, y: y})
        ZUI.ctx.moveTo(screenPosMin.x + 0.5, screenPosMin.y + 0.5)
        ZUI.ctx.lineTo(screenPosMax.x + 0.5, screenPosMax.y + 0.5)
        ZUI.ctx.stroke()
    }
    
}

function drawNewConnection () {
    if (ZUI.interaction.newConnectionBeingAddedIdentifier != null) {
        let newConnectionBeingAdded = getConnectionByIdentifier(ZUI.interaction.newConnectionBeingAddedIdentifier)
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
                worldPosition: { x: ZUI.mouseState.worldPosition.x, y: ZUI.mouseState.worldPosition.y },
                worldConnectionPoints: { 
                    'center-1' : { position: {x: ZUI.mouseState.worldPosition.x, y: ZUI.mouseState.worldPosition.y}, rightAngle: 0.0 * Math.PI},
                    'center-2' : { position: {x: ZUI.mouseState.worldPosition.x, y: ZUI.mouseState.worldPosition.y}, rightAngle: 0.5 * Math.PI},
                    'center-3' : { position: {x: ZUI.mouseState.worldPosition.x, y: ZUI.mouseState.worldPosition.y}, rightAngle: 1.0 * Math.PI},
                    'center-4' : { position: {x: ZUI.mouseState.worldPosition.x, y: ZUI.mouseState.worldPosition.y}, rightAngle: 1.5 * Math.PI}
                }
            }
        }

        let fromCenterPosition = getCenterPositonOfContainer(fromContainer)
        let toCenterPosition = getCenterPositonOfContainer(toContainer)
        
        let nrOfConnections = 1  // FIXME: hardcoded
        let stroke = "#0000FF" // FIXME: hardcoded
        
        let connectionType = newConnectionBeingAdded.type
        let connectionName = newConnectionBeingAdded.name
        
        let singleConnectionIdentifier = ZUI.interaction.newConnectionBeingAddedIdentifier
        
        drawConnection(fromContainer, toContainer, connectionType, connectionName, nrOfConnections, fromCenterPosition, toCenterPosition, stroke, singleConnectionIdentifier, null, null)   
    }
}

function getFirstVisibleContainer(container) {
    if (container.identifier === '__new__') { // TODO: this is a way to deal with to-be-added containers. Is there a better way?
        return container
    }
    if (container.parentContainerIdentifier === 'root') {
        return container
    }

    let parentContainer = ZUI.containersAndConnections.containers[container.parentContainerIdentifier]
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
    
    ZUI.groupedConnections = {}
    
    for (let connectionIdentifier in ZUI.containersAndConnections.connections) {
        let connection = ZUI.containersAndConnections.connections[connectionIdentifier]
        
        // Draw all connections here, but not the new connection-being-added
        if (ZUI.interaction.newConnectionBeingAddedIdentifier == null || 
            connection.identifier !== ZUI.interaction.newConnectionBeingAddedIdentifier) {
                
            groupConnection(connection)
        }
    }
}

let nrOfErrors = 0
function groupConnection(connection) {
    
    let fromContainer = ZUI.containersAndConnections.containers[connection.fromContainerIdentifier]
    if (fromContainer == null && nrOfErrors < 100) {
        nrOfErrors++
        console.log('ERROR:' + connection.fromContainerIdentifier + ' not found!')
    }
    let toContainer = ZUI.containersAndConnections.containers[connection.toContainerIdentifier]
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
    
    if (!ZUI.groupedConnections.hasOwnProperty(fromFirstVisibleContainer.identifier)) {
        ZUI.groupedConnections[fromFirstVisibleContainer.identifier] = {}
    }
    if (!ZUI.groupedConnections[fromFirstVisibleContainer.identifier].hasOwnProperty(toFirstVisibleContainer.identifier)) {
        ZUI.groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier] = {}
    }
    // TODO: workaround for connections that dont have a type. Should we not group them instead? Of group all that have no type?
    let connectionType = '_none_'
    if (connection.dataType != null) {
        connectionType = connection.dataType
    }
    if (!ZUI.groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier].hasOwnProperty(connectionType)) {
        ZUI.groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType] = {}
        ZUI.groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType]['connections'] = {}
    }
    
    ZUI.groupedConnections[fromFirstVisibleContainer.identifier][toFirstVisibleContainer.identifier][connectionType]['connections'][connection.identifier] = connection
}

function drawConnectionGroups() {
    
    // TODO: is this the right place to reset this?
    ZUI.interaction.closestConnectionDistance = null
    ZUI.interaction.closestConnectionIdentifier = null
            
    for (let fromFirstVisibleContainerIdentifier in ZUI.groupedConnections) {
        for (let toFirstVisibleContainerIdentifier in ZUI.groupedConnections[fromFirstVisibleContainerIdentifier]) {
            for (let connectionType in ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier]) {
                let connectionGroup = ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]
                
                connectionGroup.fromFirstVisibleContainerIdentifier = fromFirstVisibleContainerIdentifier
                connectionGroup.toFirstVisibleContainerIdentifier = toFirstVisibleContainerIdentifier
                connectionGroup.connectionType = connectionType
                
                let nrOfConnections = 0
                let sumOfXPositionFrom = 0
                let sumOfYPositionFrom = 0
                let sumOfXPositionTo = 0
                let sumOfYPositionTo = 0
                for (let connectionIdentifier in ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]['connections']) {
                    let connection = ZUI.groupedConnections[fromFirstVisibleContainerIdentifier][toFirstVisibleContainerIdentifier][connectionType]['connections'][connectionIdentifier]
                    nrOfConnections++
                    
                    // We take the color of the first connection in the group
                    if (!connectionGroup.hasOwnProperty('stroke')) {
                        connectionGroup.stroke = connection.stroke
                    }
                    
                    let fromContainer = ZUI.containersAndConnections.containers[connection.fromContainerIdentifier]
                    let toContainer = ZUI.containersAndConnections.containers[connection.toContainerIdentifier]
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

    let fromContainer = getContainerByIdentifier(connectionGroup.fromFirstVisibleContainerIdentifier)
    let toContainer = getContainerByIdentifier(connectionGroup.toFirstVisibleContainerIdentifier)
    
    // TODO: do something (color wise) with the connectionType?
    let connectionType = connectionGroup.connectionType
    let connectionName = '' // TODO: fill this with something?
    let nrOfConnections = connectionGroup.nrOfConnections
    let fromCenterPosition = connectionGroup.averageFromPosition
    let toCenterPosition = connectionGroup.averageToPosition
    let stroke = connectionGroup.stroke
    let alpha = 1.0 // TODO: do we want to do something with the avarageAlpha of the underlying connections?
    
    let singleConnectionIdentifier = null
    if (connectionGroup.nrOfConnections === 1) {
        let singleConnection = connectionGroup.connections[Object.keys(connectionGroup.connections)[0]]
        singleConnectionIdentifier = singleConnection.identifier
    }
    
    drawConnection(fromContainer, toContainer, connectionType, connectionName, nrOfConnections, fromCenterPosition, toCenterPosition, stroke, alpha, singleConnectionIdentifier, null, null)   
}

function drawConnections() {
    
    // TODO: is this the right place to reset this?
    ZUI.interaction.closestConnectionDistance = null
    ZUI.interaction.closestConnectionIdentifier = null
    
    for (let connectionIdentifier in ZUI.containersAndConnections.connections) {
        let connection = ZUI.containersAndConnections.connections[connectionIdentifier]

        // Draw all connections here, but not the new connection-being-added
        if (ZUI.interaction.newConnectionBeingAddedIdentifier == null || 
            connection.identifier !== ZUI.interaction.newConnectionBeingAddedIdentifier) {

            let fromContainer = ZUI.containersAndConnections.containers[connection.fromContainerIdentifier]
            let toContainer = ZUI.containersAndConnections.containers[connection.toContainerIdentifier]
            
            let connectionType = null
            if (connection.type != null) {
                connectionType = connection.type
            }
            let nrOfConnections = 1
            
            let stroke = connection.stroke
            let alpha = connection.alpha
            let singleConnectionIdentifier = connection.identifier
            
            let fromCenterPosition = getCenterPositonOfContainer(fromContainer)
            let toCenterPosition = getCenterPositonOfContainer(toContainer)
            
            let fromConnectionPointIdentifier = connection.fromConnectionPointIdentifier
            let toConnectionPointIdentifier = connection.toConnectionPointIdentifier
            
            let connectionName = connection.name

            if ((ZUI.interaction.viewScale >= connection.fromLevelOfDetail && ZUI.interaction.viewScale <  connection.toLevelOfDetail) ||
                (ZUI.interaction.viewScale >= 1.0                          && connection.toLevelOfDetail == 1.0)) {
                drawConnection(fromContainer, toContainer, connectionType, connectionName, nrOfConnections, fromCenterPosition, toCenterPosition, stroke, alpha, singleConnectionIdentifier, fromConnectionPointIdentifier, toConnectionPointIdentifier)
            }
        }
    }
}

// TODO: put this somewhere else
function pathRoundRect (x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2
    if (height < 2 * radius) radius = height / 2
    
    ZUI.ctx.beginPath()
    ZUI.ctx.moveTo(x + radius, y)
    ZUI.ctx.arcTo(x + width, y,          x + width, y + height, radius)
    ZUI.ctx.arcTo(x + width, y + height, x,         y + height, radius)
    ZUI.ctx.arcTo(x,         y + height, x,         y,          radius)
    ZUI.ctx.arcTo(x,         y,     x + width,      y,          radius)
    ZUI.ctx.closePath()
}

function drawConnection(fromContainer, toContainer, connectionType, connectionName, nrOfConnections, fromCenterPosition, toCenterPosition, stroke, alpha, singleConnectionIdentifier, fromConnectionPointIdentifier, toConnectionPointIdentifier) {

    let worldDistanceBetweenFromAndToCenters = distanceBetweenTwoPoints(fromCenterPosition, toCenterPosition)
    
    // From Point
    
    let fromContainerBorderPoint = null
    if (fromConnectionPointIdentifier != null && fromContainer.worldConnectionPoints.hasOwnProperty(fromConnectionPointIdentifier)) {
        fromContainerBorderPoint = fromContainer.worldConnectionPoints[fromConnectionPointIdentifier]
    }
    else {
        // TODO: add comment explaining why To and From are "mixed" here per line:
        fromContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(fromContainer, toCenterPosition, worldDistanceBetweenFromAndToCenters)
    }
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint.position)
    
    // To Point
    
    let toContainerBorderPoint = null
    if (toConnectionPointIdentifier != null && toContainer.worldConnectionPoints.hasOwnProperty(toConnectionPointIdentifier)) {
        toContainerBorderPoint = toContainer.worldConnectionPoints[toConnectionPointIdentifier]
    }
    else {
        // TODO: add comment explaining why To and From are "mixed" here per line:
        toContainerBorderPoint = getClosestConnectionPointToThisPointUsingDistance(toContainer, fromCenterPosition, worldDistanceBetweenFromAndToCenters)
    }
    // The tip of the arrow-head (where you connect to the toContainer)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint.position)

    let averageContainersWorldScale = (fromContainer.worldScale + toContainer.worldScale) / 2
    
// FIXME: dirty HACK!
if (connectionType === 'common') {
    averageContainersWorldScale = averageContainersWorldScale * 2
}
    
    // Arrow head
    
    // The point where the line attaches to the arrow-head
    let arrowWorldSize = 25 * nrOfConnections * averageContainersWorldScale // TODO: we apply the viewScale on a world size which is technically not correct I guess
    let toArrowAttachPosition = getPositionFromAnglePointAndDistance(toContainerBorderPoint.position, toContainerBorderPoint.rightAngle, arrowWorldSize)
    let screenToArrowAttachPosition = fromWorldPositionToScreenPosition(toArrowAttachPosition)

    // Left and right point of the arrow-head
    // TODO: will this work on all browsers? Since we might get out-of-bounds here (less than -PI or more than +PI)
    let angleToLeft = toContainerBorderPoint.rightAngle - Math.PI / 2
    let angleToRight = toContainerBorderPoint.rightAngle + Math.PI / 2
    let toArrowLeftPosition = getPositionFromAnglePointAndDistance(toArrowAttachPosition, angleToLeft, arrowWorldSize / 2)
    let toArrowRightPosition = getPositionFromAnglePointAndDistance(toArrowAttachPosition, angleToRight, arrowWorldSize / 2)
    let screenToArrowLeftPosition = fromWorldPositionToScreenPosition(toArrowLeftPosition)
    let screenToArrowRightPosition = fromWorldPositionToScreenPosition(toArrowRightPosition)
    
    // Bezier curve
    
    // The helper-points to make the bezier curve
    // TODO: techically we need the to-point here to be the attachment point of the arrow-head (so instead of using toContainerBorderPoint.position we use toArrowAttachPosition)
    let worldDistanceBetweenFromAndTo = distanceBetweenTwoPoints(fromContainerBorderPoint.position, toContainerBorderPoint.position)
    let bendingDistance = worldDistanceBetweenFromAndTo / 2
    let fromBendPosition = getPositionFromAnglePointAndDistance(fromContainerBorderPoint.position, fromContainerBorderPoint.rightAngle, bendingDistance)
    let toBendPosition = getPositionFromAnglePointAndDistance(toArrowAttachPosition, toContainerBorderPoint.rightAngle, bendingDistance)
    let screenFromBendPosition = fromWorldPositionToScreenPosition(fromBendPosition)
    let screenToBendPosition = fromWorldPositionToScreenPosition(toBendPosition)

    // Rectangle around connection
    
    let screenRectangleAroundConnection = getRectangleAroundPoints([screenFromContainerPosition, screenFromBendPosition, screenToBendPosition, screenToContainerPosition])
    let screenRectangle = { 
        position : {
            x: 0, 
            y: 0
        },
        size : {
            width: ZUI.canvasElement.width, 
            height: ZUI.canvasElement.height 
        }
    }
    if (!rectanglesOverlap(screenRectangleAroundConnection, screenRectangle)) {
        // if rectangle around 4 bezier points are not inside the screen, then we dont have to draw it
        return
    }
    
    // Middle point
    
    let percentageOfCurve = 0.5 // FIXME: hardcoded!
    let screenMiddlePoint = getPointOnBezierCurve(percentageOfCurve, screenFromContainerPosition, screenFromBendPosition, screenToBendPosition, screenToContainerPosition)
    
    // Mouse hover over connection

    if (singleConnectionIdentifier != null) {
        let screenPointToFindClosestDistanceTo = ZUI.mouseState.position
        // Only check the distance if the mouse pointer is somewhere inside the rectangle surrounding the 4 points of the bezier curve
        
        // TODO: using ZUI.minimumDistanceFromConnectionToDetectMouseHover here! But it is defined elsewhere!

        let screenRectangleAroundConnectionWithMargin = addMarginToRectangle(screenRectangleAroundConnection, ZUI.minimumDistanceFromConnectionToDetectMouseHover)
        if (positionIsInsideRectangle(screenPointToFindClosestDistanceTo, screenRectangleAroundConnectionWithMargin)) {
            let closestDistance = getClosestDistanceFromPointToBezierCurve(screenPointToFindClosestDistanceTo, screenFromContainerPosition, screenFromBendPosition, screenToBendPosition, screenToContainerPosition)
            
            if (ZUI.interaction.closestConnectionDistance == null || closestDistance < ZUI.interaction.closestConnectionDistance) {
                ZUI.interaction.closestConnectionDistance = closestDistance
                ZUI.interaction.closestConnectionIdentifier = singleConnectionIdentifier
            }
        }
    }

    // Drawing
        
    {
        // TODO: stroke is already set here! (look at parameters of drawConnection)
        let lineWidth = 4 * ZUI.interaction.viewScale * nrOfConnections * averageContainersWorldScale
        
        if (singleConnectionIdentifier != null && singleConnectionIdentifier === ZUI.interaction.currentlyHoveredConnectionIdentifier) {
            ZUI.ctx.lineWidth = 6 * ZUI.interaction.viewScale * nrOfConnections * averageContainersWorldScale
            stroke = { r:255, g:170, b:0, a:1 }
        }
        
        if (singleConnectionIdentifier != null && singleConnectionIdentifier === ZUI.interaction.currentlySelectedConnectionIdentifier) {
            stroke = { r:255, g:0, b:0, a:1 }
        }
        
        if (alpha < 1.0) {
            // TODO: we want to do this, but we lower the stroke of the connection each draw: stroke.a = stroke.a * alpha
            stroke.a = alpha
        }
        
        // Draw line 
        ZUI.ctx.lineWidth = lineWidth
        ZUI.ctx.strokeStyle = rgba(stroke)
        
        // Draw arrow head
        
        // TODO: we might want a different color for the arrow-head?
        ZUI.ctx.fillStyle = ZUI.ctx.strokeStyle
        ZUI.ctx.beginPath()
        ZUI.ctx.moveTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ZUI.ctx.lineTo(screenToArrowLeftPosition.x, screenToArrowLeftPosition.y)
        ZUI.ctx.lineTo(screenToArrowRightPosition.x, screenToArrowRightPosition.y)
        ZUI.ctx.closePath()
        ZUI.ctx.fill()
        
        ZUI.ctx.beginPath()
        ZUI.ctx.moveTo(       screenFromContainerPosition.x, screenFromContainerPosition.y)
        ZUI.ctx.bezierCurveTo(screenFromBendPosition.x, screenFromBendPosition.y, 
                          screenToBendPosition.x, screenToBendPosition.y, 
                          screenToArrowAttachPosition.x, screenToArrowAttachPosition.y)
        ZUI.ctx.stroke()        
        
        // Draw label
        if (singleConnectionIdentifier != null && 
                (singleConnectionIdentifier === ZUI.interaction.currentlyHoveredConnectionIdentifier || 
                 singleConnectionIdentifier === ZUI.interaction.currentlySelectedConnectionIdentifier)
           ) {
            drawLabel(connectionName, screenMiddlePoint)
        }
        

        // Debug 
        
        /*
        let size = 5
        ZUI.ctx.fillStyle = "#FF00FF"
        ZUI.ctx.fillRect(screenPointToFindClosestDistanceTo.x - size/2, screenPointToFindClosestDistanceTo.y - size/2, size, size)
        ZUI.ctx.fillStyle = "#FF0000"
        ZUI.ctx.fillRect(closestPoint.x - size/2, closestPoint.y - size/2, size, size)
        
        ZUI.ctx.fillStyle = "#FFFF00"
        ZUI.ctx.fillRect(screenToContainerPosition.x - size/2, screenToContainerPosition.y - size/2, size, size)
        ZUI.ctx.fillStyle = "#00FF00"
        ZUI.ctx.fillRect(screenToBendPosition.x - size/2, screenToBendPosition.y - size/2, size, size)
        */
        
    }

}


function drawLabel(textToDraw, screenMiddlePoint) {
    let backgroundColor = { r:250, g:250, b:250, a:0.8 }
    let borderColor = { r:100, g:100, b:100, a:0.8 }
    let textColor = { r:50, g:50, b:50, a:1 }
    let borderWidth = 1
    let borderRadius = 4
    
    // let textToDraw = connectionName
    
    // Determine positions and sizes (of text and textBox)
    
    let textSize = {}
    let fontSize = 14
    let heightBottomWhiteArea = fontSize / 6
    let textHeightToFontSizeRatioArial = 1.1499023
    
    let horizontalPadding = 12
    let verticalPadding = 6
    
    textSize.width = ZUI.ctx.measureText(textToDraw).width
    textSize.height = textHeightToFontSizeRatioArial * fontSize
    
    let textBox = {}
    textBox.size = {
        width: textSize.width + horizontalPadding,
        height: textSize.height + verticalPadding
    }
    // TODO: maybe put the textBox above the line if the line is horizontal, otherwise on top of it?
    textBox.position = {
        x: screenMiddlePoint.x - textBox.size.width / 2,
        y: screenMiddlePoint.y - textBox.size.height - 2 // TODO: where should we put the textBox vertically?
    }
    
    let textPosition = {}
    textPosition.x = textBox.position.x + (textBox.size.width / 2) - (textSize.width / 2)
    textPosition.y = textBox.position.y + (textBox.size.height / 2) - (textSize.height / 2) + heightBottomWhiteArea

    // Draw text box
    
    ZUI.ctx.lineWidth = borderWidth
    ZUI.ctx.strokeStyle = rgba(borderColor)
    ZUI.ctx.fillStyle = rgba(backgroundColor)
    
    pathRoundRect (textBox.position.x, textBox.position.y, textBox.size.width, textBox.size.height, borderRadius)
    ZUI.ctx.fill()
    ZUI.ctx.stroke()

    // Draw text
    
    ZUI.ctx.font = fontSize + "px Arial"
    ZUI.ctx.textBaseline = "top"
    ZUI.ctx.fillStyle = rgba(textColor)
    ZUI.ctx.fillText(textToDraw, textPosition.x, textPosition.y)
}


function showContainerChildren(container) {
    // OLD: if (container.identifier === 'root') return 1
    if (container.worldScale >= 1) { // The root container (and its non-scaled children) should always be shown. Since they all have a worldScale of 1 (or higher) we can make sure they are always shown
        return 1   
    }
    
    let containerViewScale = ZUI.interaction.viewScale * container.worldScale
    
    let beginToShow = 0.2 // 0.001
    let fullyShow = 0.25
// FIXME: with these settings a form of "semantic zooming" will NOT be visible
//    let beginToShow = 0.001
//    let fullyShow = 0.001
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
        let container = ZUI.containersAndConnections.containers[containerIdentifier]
        
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
            let alphaContainer = alpha
            if (container.alpha < 1.0) {
                if (alpha != null) {
                    alphaContainer = alpha * container.alpha
                }
                else {
                    alphaContainer = container.alpha
                }
            }
            
            if ((ZUI.interaction.viewScale >= container.fromLevelOfDetail && ZUI.interaction.viewScale <  container.toLevelOfDetail) ||
                (ZUI.interaction.viewScale >= 1.0                         && container.toLevelOfDetail == 1.0)) {
                    
                drawContainer(container, alphaContainer, fractionToShowText)
                if (fractionToShowContainerChildren > 0) {
                    drawContainers(container.children, fractionToShowContainerChildren)
                }
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
    let screenRectangle = { x: 0, y: 0, width: ZUI.canvasElement.width, height: ZUI.canvasElement.height }
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
    let parentContainer = ZUI.containersAndConnections.containers[parentContainerIdentifier]
    if (parentContainer == null || parentContainer.identifier === 'root') {
        return true
    }
    
    let parentLeftTopPoint = parentContainer.worldPoints['left-top']
    let parentrightBottomPoint = parentContainer.worldPoints['right-bottom']
    
    // TODO: hardcoded, so this only works for full screen view!
    let screenRectangle = { x: 0, y: 0, width: ZUI.canvasElement.width, height: ZUI.canvasElement.height }
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
    let containerShape = ZUI.containerShapes[container.shapeType]

    ZUI.ctx.beginPath()
    for (let pathPartIndex = 0; pathPartIndex < containerShape.strokeAndFillPath.length; pathPartIndex++) {
        let pathPart = containerShape.strokeAndFillPath[pathPartIndex]
        if (pathPart.type === 'move') {
            let toPointIdentifier = pathPart.toPoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            ZUI.ctx.moveTo(toPoint.x, toPoint.y)
        }
        else if (pathPart.type === 'line') {
            let toPointIdentifier = pathPart.toPoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            ZUI.ctx.lineTo(toPoint.x, toPoint.y)
        }
        else if (pathPart.type === 'arcto') {
            let toPointIdentifier = pathPart.toPoint
            let edgePointIdentifier = pathPart.edgePoint
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            let edgePoint = fromWorldPositionToScreenPosition(container.worldPoints[edgePointIdentifier])
            let radius = distanceBetweenTwoPoints(toPoint, edgePoint) // TODO: we derive the radios, which might not always be correct
            ZUI.ctx.arcTo(edgePoint.x, edgePoint.y, toPoint.x, toPoint.y, radius)
        }
        else if (pathPart.type === 'bezierCurve') {
            let toPointIdentifier = pathPart.toPoint
            let controlPoint1Identifier = pathPart.controlPoint1
            let controlPoint2Identifier = pathPart.controlPoint2
            let toPoint = fromWorldPositionToScreenPosition(container.worldPoints[toPointIdentifier])
            let controlPoint1 = fromWorldPositionToScreenPosition(container.worldPoints[controlPoint1Identifier])
            let controlPoint2 = fromWorldPositionToScreenPosition(container.worldPoints[controlPoint2Identifier])
            ZUI.ctx.bezierCurveTo(controlPoint1.x, controlPoint1.y, controlPoint2.x, controlPoint2.y, toPoint.x, toPoint.y)
        }
        else {
            console.log('ERROR: unsupported pathPart type: ' + pathPart.type)
        }
    }
    ZUI.ctx.closePath()
}

function drawContainer(container, alpha, textAlpha) {
    
    ZUI.ctx.save()
    {
        // Draw shape
        ZUI.ctx.lineWidth = 2 * ZUI.interaction.viewScale * container.worldScale // TODO: turned this of for the moment (don't understand why it has a weird effect in default mode):   * container.lineWidth 
        let stroke = container.stroke
        let fill = container.fill
        if (alpha == null) {
            ZUI.ctx.strokeStyle = rgba(stroke)
            ZUI.ctx.fillStyle = rgba(fill)
        }
        else {
            stroke = {r: stroke.r, g:stroke.g, b:stroke.b, a:stroke.a * alpha}
            fill = {r: fill.r, g:fill.g, b:fill.b, a:fill.a * alpha}
            ZUI.ctx.strokeStyle = rgba(stroke)
            ZUI.ctx.fillStyle = rgba(fill)
        }
        
        
        drawContainerShape(container)
        ZUI.ctx.fill()
        ZUI.ctx.stroke()
        
        /*
        if (ZUI.interaction.percentageIsoMetric > 0) {
            // TODO: using percentageIsoMetric directly (without sin/cos/tan) is probably not quite right
            let containerThickness = 6 * ZUI.interaction.viewScale * container.worldScale * ZUI.interaction.percentageIsoMetric
            
            // TODO: at some point we want to draw the *sides* of the containers again
            ZUI.ctx.fillStyle = rgba(darken(container.fill, 0.3))
            ZUI.ctx.beginPath()
            ZUI.ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
            ZUI.ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
            ZUI.ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y + containerThickness)
            ZUI.ctx.lineTo(leftTopContainerPosition.x, leftTopContainerPosition.y + containerThickness)
            ZUI.ctx.closePath()
            ZUI.ctx.fill()
            
            ZUI.ctx.fillStyle = rgba(lighten(container.fill, 0.3))
            ZUI.ctx.beginPath()
            ZUI.ctx.moveTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
            ZUI.ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
            ZUI.ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y + containerThickness)
            ZUI.ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y + containerThickness)
            ZUI.ctx.closePath()
            ZUI.ctx.fill()
        }
        */
        
        // TODO: currenltly we are drawing a shape multiple times if it is being hovered AND is selected
        if (ZUI.interaction.highlightHoveredContainer &&
            ZUI.interaction.currentlyHoveredContainerIdentifier != null &&
            ZUI.interaction.currentlyHoveredContainerIdentifier === container.identifier) {
                
            ZUI.ctx.lineWidth = 2 // TODO: do we want to scale this too?
            //ZUI.ctx.fillStyle = "#EECC00"
            ZUI.ctx.fillStyle = rgba(darken(fill, 0.015))
            
            // FIXME: currently filling AFTER stroking, removed HALF of the stroke!
            drawContainerShape(container)
            ZUI.ctx.fill()
            ZUI.ctx.stroke()
        }
        
        if (ZUI.interaction.currentlySelectedContainerIdentifiers.length > 0) {
            if (ZUI.interaction.currentlySelectedContainerIdentifiers.includes(container.identifier)) {
                ZUI.ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ZUI.ctx.strokeStyle = "#FF0000"
                
                drawContainerShape(container)
                ZUI.ctx.stroke()
            }
            else if (ZUI.interaction.selectedContainersAreBeingDragged && 
                     ZUI.interaction.emcompassingContainerIdentifier !== 'root' &&
                     container.identifier === ZUI.interaction.emcompassingContainerIdentifier) {

                ZUI.ctx.lineWidth = 2 // TODO: do we want to scale this too?
                ZUI.ctx.strokeStyle = "#00CC00"
                
                drawContainerShape(container)
                ZUI.ctx.stroke()
            }
        }
        
    }
    ZUI.ctx.restore()
    
    let textColor = { r:0, g:0, b:0, a:1 * textAlpha }
// FIXME: do this more properly (also see above in this function)
if (container.stroke) {
    textColor = darken(container.stroke, 0.4)
}
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
        ZUI.ctx.font = localFontSize + "px Arial"
        ZUI.ctx.textBaseline = "top"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ZUI.ctx.measureText(textToDraw).width
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
            let screenTextSize = scaleSize(ZUI.interaction.viewScale * container.worldScale, textSize)
            
            ZUI.ctx.lineWidth = 1
            ZUI.ctx.strokeStyle = "#FF0000"
            ZUI.ctx.strokeRect(screenTextPosition.x, screenTextPosition.y, screenTextSize.width, screenTextSize.height)
        }
        
        ZUI.ctx.save()
        ZUI.ctx.translate(screenTextPosition.x, screenTextPosition.y) // move the text to the screen position (since we draw the text at 0,0)
        ZUI.ctx.scale(ZUI.interaction.viewScale * container.worldScale, ZUI.interaction.viewScale * container.worldScale) // make the text smaller/bigger according to zoom (viewScale)
        
        if (ZUI.interaction.percentageIsoMetric > 0) {
            ZUI.ctx.scale(1, ZUI.currentIsoMetricSettings.scale)                   // make the text smaller vertically due to isometric view
            ZUI.ctx.rotate(ZUI.currentIsoMetricSettings.rotate * Math.PI / 180)    // rotate the text due to isometric view
        }
        
        // Draw the text at the text positions
        ZUI.ctx.fillStyle = rgba(textColor)
        ZUI.ctx.fillText(textToDraw, 0, 0)
        
        ZUI.ctx.restore()
        
        /*
        // TODO: we want to do something like this, but labels should be drawn at the end (not it is behind other containers and to the upper-left)
        // Draw label
        if (ZUI.interaction.highlightHoveredContainer &&
            ZUI.interaction.currentlyHoveredContainerIdentifier != null &&
            ZUI.interaction.currentlyHoveredContainerIdentifier === container.identifier) {
            drawLabel(textToDraw, screenTextPosition)
        }
        */
    }
    
    
    
}

function drawBackgoundImage (backgroundImage) {
    let backgroundImageWorldPosition = { x: 0, y: 0 }
    
    let backgroundImageScreenPosition = fromWorldPositionToScreenPosition(backgroundImageWorldPosition)
    
    ZUI.ctx.save()
    ZUI.ctx.translate(backgroundImageScreenPosition.x, backgroundImageScreenPosition.y) // move the image to the screen position (since we draw the image at 0,0)
    ZUI.ctx.scale(ZUI.interaction.viewScale, ZUI.interaction.viewScale) // make the image smaller/bigger according to zoom (viewScale)
    
    if (ZUI.interaction.percentageIsoMetric > 0) {
        ZUI.ctx.scale(1, ZUI.currentIsoMetricSettings.scale)                   // make the text smaller vertically due to isometric view
        ZUI.ctx.rotate(ZUI.currentIsoMetricSettings.rotate * Math.PI / 180)    // rotate the text due to isometric view
    }
    
    ZUI.ctx.drawImage(backgroundImage, 0, 0)
    
    ZUI.ctx.restore()
    
}


