let canvasElement = document.getElementById('canvas')
let ctx = canvasElement.getContext("2d")
let viewAsIsometric = false

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

    if (viewAsIsometric) {
        ctx.save()
        ctx.translate(0, canvasElement.height / 2)
        ctx.scale(1, 0.5)
        ctx.rotate(- 45 * Math.PI / 180)
        drawGrid()
    }
 
    let rootContainer = containersAndConnections.containers[0]
    // FIXME: this is overkill. it should already be up-to-date
    // recalculateAbsolutePositions(rootContainer)
    drawContainers(rootContainer.children)
    
    drawConnections()
    drawNewConnection()
    
    if (viewAsIsometric) {
        ctx.restore()
    }
    
    drawMenu()
    
    // FIXME: when the mouse (with button pressed) is moving its style doesn't get changed?
    canvasElement.style.cursor = interaction.mousePointerStyle
    
}

function drawGrid () {

    // TODO: draw these lines diagonally, so we wont draw too much or too little
    let minX = 0
    let maxX = canvasElement.width
    let stepX = 20
    
    let minY = 0
    let maxY = canvasElement.height
    let stepY = 20
    
    ctx.lineWidth = 1
    ctx.strokeStyle = '#666666'
    for (let x = minX; x < maxX; x += stepX) {
        ctx.beginPath()
        ctx.moveTo(x, minY)
        ctx.lineTo(x, maxY)
        ctx.stroke()
    }
    for (let y = minY; y < maxY; y += stepY) {
        ctx.beginPath()
        ctx.moveTo(minX, y)
        ctx.lineTo(maxX, y)
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
                position: { x: mouseState.position.x - interaction.viewOffset.x, 
                            y: mouseState.position.y - interaction.viewOffset.y }
            }
        }
        drawConnection(interaction.newConnectionBeingAdded, fromContainer, toContainer)
    }
}

function drawMenu() {
    
    for (let buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex++) {
        let buttonData = menuButtons[buttonIndex]
        let drawOnlySelected = false
        drawButton(buttonData, drawOnlySelected)
    }
    for (let buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex++) {
        let buttonData = menuButtons[buttonIndex]
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
    
    let screenFromContainerPosition = addOffsetToPosition(interaction.viewOffset, fromContainerBorderPoint)
    let screenToContainerPosition = addOffsetToPosition(interaction.viewOffset, toContainerBorderPoint)
    
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
        
        // FIXME: let screenTextPosition = addOffsetToPosition(interaction.viewOffset, textPosition)
        
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
        let screenContainerPosition = addOffsetToPosition(interaction.viewOffset, container.position)
        ctx.fillRect(screenContainerPosition.x, screenContainerPosition.y, container.size.width, container.size.height)
        
        if (interaction.currentlySelectedContainer != null && 
            container.identifier === interaction.currentlySelectedContainer.identifier) {
                
            ctx.lineWidth = 2
            ctx.strokeStyle = "#FF0000"
            ctx.strokeRect(screenContainerPosition.x, screenContainerPosition.y, container.size.width, container.size.height)
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
        
        let screenTextPosition = addOffsetToPosition(interaction.viewOffset, textPosition)
        
        // Draw the text at the text positions
        ctx.fillStyle = textColor
        ctx.fillText(textToDraw, screenTextPosition.x, screenTextPosition.y)
    }
    
}

function addOffsetToPosition(offset, position) {
    let addedPosition = { x: 0, y: 0}
    addedPosition.x = position.x + offset.x
    addedPosition.y = position.y + offset.y
    return addedPosition
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
    for (let buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex++) {
        let buttonData = menuButtons[buttonIndex]
        
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
