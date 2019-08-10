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

let isoMetricSettings = {
    translate: 0.5, // move half the height of the screen down
    scale: 0.5,     // shrink vertically (by a factor of 2)
    rotate: -45,   // rotated 45 degrees counter-clock-wise
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

    if (interaction.viewAsIsometric) {
        ctx.save()
//        ctx.translate(0, canvasElement.height * isoMetricSettings.translate)
//        ctx.scale(1, isoMetricSettings.scale)
//        ctx.rotate(isoMetricSettings.rotate * Math.PI / 180)
    }
    
    if (interaction.showGrid) {
        drawGrid()
    }
 
    let rootContainer = containersAndConnections.containers['root']
    // FIXME: this is overkill. it should already be up-to-date
    // recalculateAbsolutePositions(rootContainer)
    drawContainers(rootContainer.children)
    
    drawConnections()
    drawNewConnection()
    
    if (interaction.viewAsIsometric) {
        ctx.restore()
    }
    
    drawMenu()
    
    // FIXME: when the mouse (with button pressed) is moving its style doesn't get changed?
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
                if (interaction.viewAsIsometric) {
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
                size: { width: 0, height: 0},
                position: { x: mouseState.worldPosition.x, 
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

function drawConnection(connection, fromContainer, toContainer) {
    
    let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
    let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
    
    let angleBetweenPoints = getAngleBetweenPoints(fromContainerCenterPosition, toContainerCenterPosition)
    
    let fromContainerBorderPoint = getContainerBorderPointFromAngle(angleBetweenPoints, fromContainer, false)
    let toContainerBorderPoint = getContainerBorderPointFromAngle(angleBetweenPoints, toContainer, true)
    
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint)
    
    {
        // Draw line 
        ctx.lineWidth = 2
        ctx.strokeStyle = rgba(connection.stroke)
        
        ctx.beginPath()
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        
        if (interaction.currentlySelectedConnection != null && 
            connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
            ctx.lineWidth = 2
            ctx.strokeStyle = "#FF0000"
            
            ctx.beginPath()
            ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
            ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
            ctx.stroke()
        }
    }
    
    /*
    let textColor = { r:0, g:0, b:0, a:1 }
    {
        // Draw text
        let textToDraw = connection.identifier
        
        // Get text size
        let textSize = {}
        let fontSize = 12
        ctx.font = fontSize + "px Arial"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize

        // Determine text position
        let textPosition = {}
        // FIXME: textPosition.x = connection.position.x + (connection.size.width / 2) - (connection.width / 2)
        // FIXME: textPosition.y = connection.position.y + (connection.size.height / 2) + (connection.height / 2) 
        
        // NOTE: these isn't a real screen position (see fromWorldPositionToScreenPosition)
        // FIXME: let screenTextPosition = fromWorldPositionToScreenPosition(textPosition)
        
        // Draw the text at the text positions
        ctx.fillStyle = rgba(textColor)
        // FIXME: ctx.fillText(textToDraw, screenTextPosition.x, screenTextPosition.y)
    }
    */
}

function drawContainers(containerIdentifiers) {
    for (let containerIndex = 0; containerIndex < containerIdentifiers.length; containerIndex++) {
        let containerIdentifier = containerIdentifiers[containerIndex]
        let container = containersAndConnections.containers[containerIdentifier]
        drawContainer(container)
        drawContainers(container.children)
    }
}

function drawContainer(container) {
    
    {
        // Draw rectangle 
        ctx.lineWidth = 2
        ctx.strokeStyle = rgba(container.stroke)
        ctx.fillStyle = rgba(container.fill)
        
        if (interaction.viewAsIsometric) {
        
            let position = { x : 0, y : 0}
            position.x = container.position.x
            position.y = container.position.y
            
            let containerThickness = 3 * interaction.viewScale
            
            let leftTopContainerPosition = fromWorldPositionToScreenPosition(position)
            position.y += container.size.height
            let leftBottomContainerPosition = fromWorldPositionToScreenPosition(position)
            position.x += container.size.width
            let rightBottomContainerPosition = fromWorldPositionToScreenPosition(position)
            position.y -= container.size.height
            let rightTopContainerPosition = fromWorldPositionToScreenPosition(position)
            
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
            
            if (interaction.currentlySelectedContainerIdentifier != null && 
                container.identifier === interaction.currentlySelectedContainerIdentifier) {
                    
                ctx.lineWidth = 2
                ctx.strokeStyle = "#FF0000"
                
                ctx.beginPath()
                ctx.moveTo(leftTopContainerPosition.x, leftTopContainerPosition.y)
                ctx.lineTo(leftBottomContainerPosition.x, leftBottomContainerPosition.y)
                ctx.lineTo(rightBottomContainerPosition.x, rightBottomContainerPosition.y)
                ctx.lineTo(rightTopContainerPosition.x, rightTopContainerPosition.y)
                ctx.closePath()
                ctx.stroke()
            }
        }
        else {
            
            let screenContainerPosition = fromWorldPositionToScreenPosition(container.position)
            let screenContainerSize = scaleSize(interaction.viewScale, container.size)
            ctx.fillRect(screenContainerPosition.x, screenContainerPosition.y, screenContainerSize.width, screenContainerSize.height)
            
            if (interaction.currentlySelectedContainerIdentifier != null && 
                container.identifier === interaction.currentlySelectedContainerIdentifier) {
                    
                ctx.lineWidth = 2
                ctx.strokeStyle = "#FF0000"
                ctx.strokeRect(screenContainerPosition.x, screenContainerPosition.y, screenContainerSize.width, screenContainerSize.height)
            }
        }
    }
    
    let textColor = { r:0, g:0, b:0, a:1 }
    {
        // Draw text
        let textToDraw = container.identifier
        
        // Get text size
        let textSize = {}
        let fontSize = 12
        ctx.font = fontSize + "px Arial"
        let textHeightToFontSizeRatioArial = 1.1499023
        
        textSize.width = ctx.measureText(textToDraw).width
        textSize.height = textHeightToFontSizeRatioArial * fontSize

        // Determine text position
        let textWorldPosition = {}
        textWorldPosition.x = container.position.x + (container.size.width / 2) - (textSize.width / 2)
        textWorldPosition.y = container.position.y + (container.size.height / 2) + (textSize.height / 2) 
        
        // TODO: we probably want to use this instead: let screenTextPosition = fromWorldPositionToScreenPosition(textWorldPosition)
        let scaledTextWorldPosition = scalePosition(interaction.viewScale, textWorldPosition)
        let screenTextPosition = addOffsetToPosition(interaction.viewOffset, scaledTextWorldPosition) // TODO: This is a bit of a HACK
        
        if (interaction.viewAsIsometric) {
            ctx.save()
            ctx.translate(screenTextPosition.x, screenTextPosition.y)
            ctx.scale(interaction.viewScale, interaction.viewScale)
            ctx.translate(0, canvasElement.height * isoMetricSettings.translate)
            ctx.scale(1, isoMetricSettings.scale)
            ctx.rotate(isoMetricSettings.rotate * Math.PI / 180)
        }
        else {
            ctx.save()
            ctx.translate(screenTextPosition.x, screenTextPosition.y)
            ctx.scale(interaction.viewScale, interaction.viewScale)
        }
        
        // Draw the text at the text positions
        ctx.fillStyle = rgba(textColor)
        ctx.fillText(textToDraw, 0, 0)
        
        if (interaction.viewAsIsometric) {
            ctx.restore()
        }
        else {
            ctx.restore()
        }
    }
    
}

