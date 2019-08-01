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
    
function drawCanvas() {
    
    clearCanvas()
    resizeCanvasToWindowSize()

    if (interaction.viewAsIsometric) {
        ctx.save()
//        ctx.translate(0, canvasElement.height * isoMetricSettings.translate)
//        ctx.scale(1, isoMetricSettings.scale)
//        ctx.rotate(isoMetricSettings.rotate * Math.PI / 180)
    }
    
    if (interaction.showGrid) {
        drawGrid()
    }
 
    let rootContainer = containersAndConnections.containers[0]
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
            ctx.drawImage(menuIcons[buttonData.mode], buttonPosition.x, buttonPosition.y)
        }
    }
    
}

function drawGrid () {

    // TODO: draw the grid on a fixed point in WORLD-space (and only draw what is on the screen)
    
    let minX = 0
    let maxX = canvasElement.width
    let stepX = 20
    
    let minY = 0
    let maxY = canvasElement.height
    let stepY = 20
    
    // TODO: we are adding 0.5, because we are drawing line (of witdh = 1). Maybe do this differently
    ctx.lineWidth = 1
    ctx.strokeStyle = '#CCCCCC'
    for (let x = minX; x < maxX; x += stepX) {
        ctx.beginPath()
        ctx.moveTo(x + 0.5, minY + 0.5)
        ctx.lineTo(x + 0.5, maxY + 0.5)
        ctx.stroke()
    }
    for (let y = minY; y < maxY; y += stepY) {
        ctx.beginPath()
        ctx.moveTo(minX + 0.5, y + 0.5)
        ctx.lineTo(maxX + 0.5, y + 0.5)
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
    for (let connectionId in containersAndConnections.connections) {
        let connection = containersAndConnections.connections[connectionId]
        
        let fromContainer = containersAndConnections.containers[connection.fromId]
        let toContainer = containersAndConnections.containers[connection.toId]
        drawConnection(connection, fromContainer, toContainer)
    }
}

function drawConnection(connection, fromContainer, toContainer) {
    
    let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
    let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
    
    let angleBetweenPoints = getAngleBetweenPoints(fromContainerCenterPosition, toContainerCenterPosition)
    
    let fromContainerBorderPoint = getContainerBorderPointFromAngle(angleBetweenPoints, fromContainer, false)
    let toContainerBorderPoint = getContainerBorderPointFromAngle(angleBetweenPoints, toContainer, true)
    
    // NOTE: these aren't real screen positions (see fromWorldPositionToScreenPosition)
    let screenFromContainerPosition = fromWorldPositionToScreenPosition(fromContainerBorderPoint)
    let screenToContainerPosition = fromWorldPositionToScreenPosition(toContainerBorderPoint)
    
    {
        // Draw line 
        ctx.lineWidth = 2
        ctx.strokeStyle = connection.stroke
        
        ctx.beginPath()
        // FIXME: don't draw from left-upper corner to left-upper corner!
        ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
        ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
        ctx.stroke()
        
        if (interaction.currentlySelectedConnection != null && 
            connection.identifier === interaction.currentlySelectedConnection.identifier) {
                
            ctx.lineWidth = 2
            ctx.strokeStyle = "#FF0000"
            
            // FIXME: don't draw from left-upper corner to left-upper corner!
            ctx.beginPath()
            ctx.moveTo(screenFromContainerPosition.x, screenFromContainerPosition.y)
            ctx.lineTo(screenToContainerPosition.x, screenToContainerPosition.y)
            ctx.stroke()
        }
    }
    
    let textColor = "#000000"
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
        ctx.fillStyle = textColor
        // FIXME: ctx.fillText(textToDraw, screenTextPosition.x, screenTextPosition.y)
    }
    
}

function drawContainers(containerIds) {
    for (let containerIndex = 0; containerIndex < containerIds.length; containerIndex++) {
        let containerId = containerIds[containerIndex]
        let container = containersAndConnections.containers[containerId]
        drawContainer(container)
        drawContainers(container.children)
    }
}

function drawContainer(container) {
    
    {
        // Draw rectangle 
        ctx.lineWidth = 2
        ctx.strokeStyle = container.stroke
        ctx.fillStyle = container.fill
        
        if (interaction.viewAsIsometric) {
        
            let position = { x : 0, y : 0}
            position.x = container.position.x
            position.y = container.position.y
            
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
            
            if (interaction.currentlySelectedContainer != null && 
                container.identifier === interaction.currentlySelectedContainer.identifier) {
                    
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
            
            ctx.fillRect(screenContainerPosition.x, screenContainerPosition.y, container.size.width, container.size.height)
            
            if (interaction.currentlySelectedContainer != null && 
                container.identifier === interaction.currentlySelectedContainer.identifier) {
                    
                ctx.lineWidth = 2
                ctx.strokeStyle = "#FF0000"
                ctx.strokeRect(screenContainerPosition.x, screenContainerPosition.y, container.size.width, container.size.height)
            }
        }
    }
    
    let textColor = "#000000"
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
        let textPosition = {}
        textPosition.x = container.position.x + (container.size.width / 2) - (textSize.width / 2)
        textPosition.y = container.position.y + (container.size.height / 2) + (textSize.height / 2) 
        
        // NOTE: this isn't a real screen position (see fromWorldPositionToScreenPosition)
        let screenTextPosition = fromWorldPositionToScreenPosition(textPosition)
        
        // Draw the text at the text positions
        ctx.fillStyle = textColor
        ctx.fillText(textToDraw, screenTextPosition.x, screenTextPosition.y)
    }
    
}

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
        parentContainer = containersAndConnections.containers[container.parentContainerId]
        container.position.x = parentContainer.position.x + container.relativePosition.x
        container.position.y = parentContainer.position.y + container.relativePosition.y
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
