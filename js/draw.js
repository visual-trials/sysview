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
    
    drawConnections()
    drawNewConnection()
    
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
    if (interaction.newConnectionBeingAdded != null) {
        let fromContainer = getContainerByIdentifier(interaction.newConnectionBeingAdded.from)
        let toContainer = null
        if (interaction.newConnectionBeingAdded.to != null) {
            toContainer = getContainerByIdentifier(interaction.newConnectionBeingAdded.to)
        }
        else {
            toContainer = {
                identifier: '__new__', // FIXME: this is a HACK to prevent crashing at getFirstVisibleContainer
                localSize: { width: 0, height: 0},
                worldPosition: { x: mouseState.worldPosition.x, 
                            y: mouseState.worldPosition.y }
            }
        }
        drawConnection(interaction.newConnectionBeingAdded, fromContainer, toContainer)
    }
}

function drawConnections() {
    for (let connectionIdentifier in containersAndConnections.connections) {
        let connection = containersAndConnections.connections[connectionIdentifier]
        
        let fromContainer = containersAndConnections.containers[connection.fromIdentifier]
        let toContainer = containersAndConnections.containers[connection.toIdentifier]
        drawConnection(connection, fromContainer, toContainer)
    }
}


function getFirstVisibleContainer(container) {
    if (container.identifier === '__new__') { // FIXME: this is a HACK
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
    let fromContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, fromFirstVisibleContainer, false, fromContainerCenterPosition)
    let toContainerBorderPoint = getContainerBorderPointFromAngleAndPoint(angleBetweenPoints, toFirstVisibleContainer, true, toContainerCenterPosition)
    
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint)
    
    {
        // Draw line 
        ctx.lineWidth = 2 * interaction.viewScale
        ctx.strokeStyle = rgba(connection.stroke)
        
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
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
        
        if (interaction.percentageIsoMetric > 0) {
        
            let worldPosition = { x : 0, y : 0}
            worldPosition.x = container.worldPosition.x
            worldPosition.y = container.worldPosition.y
            
            // TODO: using percentageIsoMetric directly (without sin/cos/tan) is probably not quite right
            let containerThickness = 6 * interaction.viewScale * container.worldScale * interaction.percentageIsoMetric
            
            let leftTopContainerPosition = fromWorldPositionToScreenPosition(worldPosition)
            worldPosition.y += container.worldSize.height
            let leftBottomContainerPosition = fromWorldPositionToScreenPosition(worldPosition)
            worldPosition.x += container.worldSize.width
            let rightBottomContainerPosition = fromWorldPositionToScreenPosition(worldPosition)
            worldPosition.y -= container.worldSize.height
            let rightTopContainerPosition = fromWorldPositionToScreenPosition(worldPosition)
            
            ctx.beginPath()
            ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
            ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
            ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
            ctx.lineTo(rightTopContainerPosition.x, rightTopContainerPosition.y)
            ctx.closePath()
            ctx.fill()
            
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
            
            if (interaction.currentlySelectedContainerIdentifier != null) {
                if (container.identifier === interaction.currentlySelectedContainerIdentifier) {
                    ctx.lineWidth = 2 // TODO: do we want to scale this too?
                    ctx.strokeStyle = "#FF0000"
                    
                    ctx.beginPath()
                    ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
                    ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
                    ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
                    ctx.lineTo(rightTopContainerPosition.x, rightTopContainerPosition.y)
                    ctx.closePath()
                    ctx.stroke()
                }
                else if (interaction.selectedContainerIsBeingDragged && 
                         interaction.emcompassingContainerIdentifier !== 'root' &&
                         container.identifier === interaction.emcompassingContainerIdentifier) {

                    ctx.lineWidth = 2 // TODO: do we want to scale this too?
                    ctx.strokeStyle = "#FFFF00"
                    
                    ctx.beginPath()
                    ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
                    ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
                    ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
                    ctx.lineTo(rightTopContainerPosition.x, rightTopContainerPosition.y)
                    ctx.closePath()
                    ctx.stroke()
                }
            }
        }
        else {
            
            let screenContainerPosition = fromWorldPositionToScreenPosition(container.worldPosition)
            let screenContainerSize = scaleSize(interaction.viewScale, container.worldSize)
            ctx.fillRect(screenContainerPosition.x, screenContainerPosition.y, screenContainerSize.width, screenContainerSize.height)
            
            if (interaction.currentlySelectedContainerIdentifier != null) { 
                if (container.identifier === interaction.currentlySelectedContainerIdentifier) {
                    
                    ctx.lineWidth = 2 // TODO: do we want to scale this too?
                    ctx.strokeStyle = "#FF0000"
                    ctx.strokeRect(screenContainerPosition.x, screenContainerPosition.y, screenContainerSize.width, screenContainerSize.height)
                }
                else if (interaction.selectedContainerIsBeingDragged && 
                         interaction.emcompassingContainerIdentifier !== 'root' &&
                         container.identifier === interaction.emcompassingContainerIdentifier) {
                             
                    ctx.lineWidth = 2 // TODO: do we want to scale this too?
                    ctx.strokeStyle = "#FFFF00"
                    ctx.strokeRect(screenContainerPosition.x, screenContainerPosition.y, screenContainerSize.width, screenContainerSize.height)
                             
                }
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

