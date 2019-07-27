let containersAndConnections = null

function init() {
    
    // TODO: replace this eventually
    containersAndConnections = getExampleData()
    
    addInputListeners()
    drawCanvas()
}

function getExampleData() {
    
    let exampleContainersAndConnections = { containers: [], connections: [] }
    
    let firstServer = {
        type: 'server',
        identifier: 'FirstServer',
        name: 'My First Server',
        position: {
            x: 50,
            y: 200
        },
        size: {
            width: 200,
            height: 250
        }
    }
    
    let firstServerIdentifier = addContainer(firstServer, "", exampleContainersAndConnections.containers)
    
    let firstAPI = {
        type: 'API',
        identifier: 'API1',
        name: 'First API',
        position: {
            x: 70,
            y: 230
        },
        size: {
            width: 70,
            height: 50
        }
    }
    
    let firstAPIIdentifier = addContainer(firstAPI, firstServerIdentifier, exampleContainersAndConnections.containers)
    
    let secondServer = {
        type: 'server',
        identifier: 'SecondServer',
        name: 'My Second Server',
        position: {
            x: 350,
            y: 200
        },
        size: {
            width: 150,
            height: 150
        }
    }
    
    let secondServerIdentifier = addContainer(secondServer, "", exampleContainersAndConnections.containers)
    
    let secondAPI = {
        type: 'API',
        identifier: 'API2',
        name: 'Second API',
        position: {
            x: 380,
            y: 210
        },
        size: {
            width: 70,
            height: 50
        }
    }
    
    let secondAPIIdentifier = addContainer(secondAPI, secondServerIdentifier, exampleContainersAndConnections.containers)
    
    
    // Connections
    
    let firstAPIToSecondAPI = {
        type: 'API2API',
        identifier: '1to2',
        name: 'My connection',
        from: 'API1',
        to: 'API2',
    }
    
    addConnection(firstAPIToSecondAPI, exampleContainersAndConnections.connections)
    
    return exampleContainersAndConnections
}

function addConnection(connectionData, connectionsToAddTo) {
    
    let connectionIdentifier = connectionData.identifier
    
    let stroke = 'rgba(0, 0, 0, 1)'

    if (connectionData.type === 'API2API') {
        stroke = 'rgba(0, 80, 200, 1)'
    }
    else {
        console.log("ERROR: Unknown connection type: " + connectionData.type)
    }
    
    connectionsToAddTo.push({
        identifier: connectionIdentifier,
        name: connectionData.name,
        from: connectionData.from,
        to: connectionData.to,
        stroke: stroke,
    })
}

function addContainer(containerData, parentContainerIdentifier, containersToAddTo) {
    
    let containerIdentifier = containerData.identifier
    
    let fill = 'rgba(0, 0, 0, 1)'
    let stroke = 'rgba(0, 0, 0, 1)'
    
    if (containerData.type === 'server') {
        fill = 'rgba(200, 180, 0, 1)'
        stroke = 'rgba(200, 80, 0, 1)'
    }
    else if (containerData.type === 'API') {
        fill = 'rgba(0, 180, 200, 1)'
        stroke = 'rgba(0, 80, 200, 1)'
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    // TODO: determine absolute postiion based on absolute position of parent (we need a hashmap of containers (of the parent itself) for that)
    containersToAddTo.push({
        identifier: containerIdentifier,
        name: containerData.name,
        position: {
            x: containerData.position.x,
            y: containerData.position.y,
        },
        size: { 
            width: containerData.size.width,
            height: containerData.size.height,
        },
        isGroup: true,
        group: parentContainerIdentifier,
        fill: fill,
        stroke: stroke,
    })
    return containerIdentifier
}



let canvasElement = document.getElementById('canvas')
let ctx = canvasElement.getContext("2d")

// Interaction info
let interaction = {
    viewOffset : { x: 0, y: 0},
    viewIsBeingDragged : false,
    currentlyHoveredContainer : null,
    currentlySelectedContainer : null,
    selectedContainerIsBeingDragged : false,
    selectedContainerIsBeingResized : false,
    selectedContainerResizeSide : null,
    mousePointerStyle: 'default'  // Possible mouse styles: http://www.javascripter.net/faq/stylesc.htm
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
    
    resizeCanvasToWindowSize()
    clearCanvas()
    
    drawContainers()
    drawConnections()
    
    // FIXME: when the mouse (with button pressed) is moving its style doesn't get changed?
    canvasElement.style.cursor = interaction.mousePointerStyle
}

function drawConnections() {
    for (let connectionIndex = 0; connectionIndex < containersAndConnections.connections.length; connectionIndex++) {
        let connection = containersAndConnections.connections[connectionIndex]
        drawConnection(connection)
    }
}

function getContainerByIdentifier(identifier) {
    // FIXME: use a hashmap instead!
    for (let containerIndex = 0; containerIndex < containersAndConnections.containers.length; containerIndex++) {
        let container = containersAndConnections.containers[containerIndex]
        if (container.identifier === identifier) {
            return container
        }
    }
    console.log("ERROR: unknown container identifier: " + identifier)
    return null
}

function drawConnection(connection) {
    
    let fromContainer = getContainerByIdentifier(connection.from)
    let toContainer = getContainerByIdentifier(connection.to)
    let fromContainerCenterPosition = getCenterPositonOfContainer(fromContainer)
    let toContainerCenterPosition = getCenterPositonOfContainer(toContainer)
    let screenFromContainerPosition = addOffsetToPosition(interaction.viewOffset, fromContainerCenterPosition)
    let screenToContainerPosition = addOffsetToPosition(interaction.viewOffset, toContainerCenterPosition)
    
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

function drawContainers() {
    for (let containerIndex = 0; containerIndex < containersAndConnections.containers.length; containerIndex++) {
        let container = containersAndConnections.containers[containerIndex]
        drawContainer(container)
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
    let offsetPosition = { x: 0, y: 0}
    offsetPosition.x = offset.x + position.x
    offsetPosition.y = offset.y + position.y
    return offsetPosition
}

function getCenterPositonOfContainer(container) {
    let centerPosition = { x: 0, y: 0 }
    centerPosition.x = container.position.x + container.size.width / 2
    centerPosition.y = container.position.y + container.size.height / 2
    return centerPosition
}

function handleMouseStateChange () {
    
    let containerAtMousePosition = findContainerAtScreenPosition(mouseState.position)
    
    interaction.currentlyHoveredContainer = containerAtMousePosition
    
    // Check mouse position
    
    let selectedContainerNearness = whichSideIsPositionFromContainer(mouseState.position, interaction.currentlySelectedContainer)
    
    let mouseIsNearSelectedContainerBorder = false
    
    if (interaction.currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
        if (selectedContainerNearness.x === 0 && selectedContainerNearness.y === 0) {
            interaction.mousePointerStyle = 'move'
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y > 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y < 0))
        {
            interaction.mousePointerStyle = 'nw-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if ((selectedContainerNearness.x > 0 && selectedContainerNearness.y < 0) ||
                 (selectedContainerNearness.x < 0 && selectedContainerNearness.y > 0))
        {
            interaction.mousePointerStyle = 'ne-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.x !== 0) {
            interaction.mousePointerStyle = 'e-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        else if (selectedContainerNearness.y !== 0) {
            interaction.mousePointerStyle = 'n-resize'
            mouseIsNearSelectedContainerBorder = true
        }
        
    }
    else if (interaction.currentlyHoveredContainer != null) {
        interaction.mousePointerStyle = 'move'
    }
    else {
        interaction.mousePointerStyle = 'default'
    }
    
    // Handle mouse clicking

    if (mouseState.leftButtonHasGoneDown) {
        
        if (mouseIsNearSelectedContainerBorder) {
            interaction.selectedContainerIsBeingResized = true
            interaction.selectedContainerResizeSide = { x: selectedContainerNearness.x, y: selectedContainerNearness.y }
            
            interaction.selectedContainerIsBeingDragged = false
            interaction.viewIsBeingDragged = false
        }
        else if (containerAtMousePosition != null) {
            interaction.currentlySelectedContainer = containerAtMousePosition
            interaction.selectedContainerIsBeingDragged = true
            
            interaction.selectedContainerIsBeingResized = false
            interaction.viewIsBeingDragged = false
        }
        else {
            // we did not click on a container, so we clicked on the background
            interaction.viewIsBeingDragged = true
            
            interaction.currentlySelectedContainer = null
            interaction.selectedContainerIsBeingDragged = false
            interaction.selectedContainerIsBeingResized = false
        }
    }
    
    if (mouseState.leftButtonHasGoneUp) {
        interaction.selectedContainerIsBeingDragged = false
        interaction.selectedContainerIsBeingResized = false
        interaction.selectedContainerResizeSide = null
        interaction.viewIsBeingDragged = false
    }
    
    // Hande mouse movement
    
    if (mouseState.hasMoved && interaction.selectedContainerIsBeingDragged) {
        interaction.currentlySelectedContainer.position.x += mouseState.position.x - mouseState.previousPosition.x 
        interaction.currentlySelectedContainer.position.y += mouseState.position.y - mouseState.previousPosition.y
    }
    
    if (mouseState.hasMoved && interaction.selectedContainerIsBeingResized) {
        if (interaction.selectedContainerResizeSide.x > 0) { // right side
            interaction.currentlySelectedContainer.size.width += mouseState.position.x - mouseState.previousPosition.x 
        }
        if (interaction.selectedContainerResizeSide.y > 0) { // bottom side
            interaction.currentlySelectedContainer.size.height += mouseState.position.y - mouseState.previousPosition.y
        }
        if (interaction.selectedContainerResizeSide.x < 0) { // left side
            interaction.currentlySelectedContainer.position.x += mouseState.position.x - mouseState.previousPosition.x 
            interaction.currentlySelectedContainer.size.width -= mouseState.position.x - mouseState.previousPosition.x 
        }
        if (interaction.selectedContainerResizeSide.y < 0) { // top side
            interaction.currentlySelectedContainer.position.y += mouseState.position.y - mouseState.previousPosition.y
            interaction.currentlySelectedContainer.size.height -= mouseState.position.y - mouseState.previousPosition.y
        }
    }
    
    if (mouseState.hasMoved && interaction.viewIsBeingDragged) {
        interaction.viewOffset.x += mouseState.position.x - mouseState.previousPosition.x 
        interaction.viewOffset.y += mouseState.position.y - mouseState.previousPosition.y
    }

    drawCanvas()
    
    // Reset mouse(event) data
    mouseState.previousPosition.x = mouseState.position.x
    mouseState.previousPosition.y = mouseState.position.y
    mouseState.hasMoved = false
    mouseState.leftButtonHasGoneDown = false
    mouseState.leftButtonHasGoneUp = false
    mouseState.rightButtonHasGoneDown = false
    mouseState.rightButtonHasGoneUp = false
}


function findContainerAtScreenPosition(screenPosition) {
    
    // FIXME: you want to find this recursively!! (starting with children, then their parents etc)
    
    for (let containerIndex = 0; containerIndex < containersAndConnections.containers.length; containerIndex++) {
        let container = containersAndConnections.containers[containerIndex]
        
        if (screenPositionIsInsideContainer(screenPosition, container)) {
            return container
        }
    }
    
    return null
}

function whichSideIsPositionFromContainer(screenPosition, container) {
    
    // FIXME: maybe if container is (very) small, we should make the margin smaller?
    let margin = 10
    
    let side = { x: 0, y: 0, isNearContainer: true }
    
    if (container == null) {
        return side
    }
    
    let containerScreenPosition = addOffsetToPosition(interaction.viewOffset, container.position)
    
    if (screenPosition.x < containerScreenPosition.x + margin) {
        side.x = -1
        if (screenPosition.x < containerScreenPosition.x - margin) {
            side.isNearContainer = false
        }
    }
    if (screenPosition.y < containerScreenPosition.y + margin) {
        side.y = -1
        if (screenPosition.y < containerScreenPosition.y - margin) {
            side.isNearContainer = false
        }
    }
    if (screenPosition.x > containerScreenPosition.x + container.size.width - margin) {
        side.x = 1
        if (screenPosition.x > containerScreenPosition.x + container.size.width + margin) {
            side.isNearContainer = false
        }
    }
    if (screenPosition.y > containerScreenPosition.y + container.size.height - margin) {
        side.y = 1
        if (screenPosition.y > containerScreenPosition.y + container.size.height + margin) {
            side.isNearContainer = false
        }
    }
    return side
}

function screenPositionIsInsideContainer(screenPosition, container) {
    let containerScreenPosition = addOffsetToPosition(interaction.viewOffset, container.position)
    
    if (screenPosition.x < containerScreenPosition.x ||
        screenPosition.y < containerScreenPosition.y ||
        screenPosition.x > containerScreenPosition.x + container.size.width ||
        screenPosition.y > containerScreenPosition.y + container.size.height) {
            
        return false
    }
    else {
        return true
    }
}

let mouseState = {
    position : { x: 0, y: 0 },
    previousPosition : { x: 0, y: 0 },
    hasMoved : false,
    leftButtonHasGoneDown : false,
    leftButtonIsDown : false,
    leftButtonHasGoneUp : false,
    rightButtonHasGoneDown : false,
    rightButtonIsDown : false,
    rightButtonHasGoneUp : false,
}

function updateMousePosition(x, y) {
    mouseState.position.x = x
    mouseState.position.y = y
    mouseState.hasMoved = mouseState.previousPosition.x != mouseState.position.x || 
                          mouseState.previousPosition.y != mouseState.position.y
}

function mouseButtonDown (e) {
        
    if (e.button == 0) {
        // left mouse button down
        mouseState.leftButtonHasGoneDown = true
        mouseState.leftButtonIsDown = true
        handleMouseStateChange()
    }
    else if (e.button == 2) {
        // right mouse button down
        mouseState.rightButtonHasGoneDown = true
        mouseState.rightButtonIsDown = true
        handleMouseStateChange()
    }

    e.preventDefault()
}

function mouseButtonUp (e) {
    if (e.button == 0) {
        // left mouse button up
        mouseState.leftButtonHasGoneUp = true
        mouseState.leftButtonIsDown = false
        handleMouseStateChange()
    }
    else if (e.button == 2) {
        // right mouse button up
        mouseState.rightButtonHasGoneUp = true
        mouseState.rightButtonIsDown = false
        handleMouseStateChange()
    }

    e.preventDefault()
}

function mouseEntered (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseMoved (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseExited (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    handleMouseStateChange()

    e.preventDefault()
}

function mouseWheelMoved (e) {
    // TODO
}
    
function addInputListeners () {
    canvasElement.addEventListener("mousedown", mouseButtonDown, false)
    // We want to know if the mouse goes up OUTSIDE the canvas, so we attach the eventlistener to the 'window' instead
    window.addEventListener("mouseup", mouseButtonUp, false)
    canvasElement.addEventListener("mousemove", mouseMoved, false)
    // TODO: the mouseenter is not triggered on *page load* for Chrome. It is for FF.
    //       See this link *why* we want to use it: 
    //       https://stackoverflow.com/questions/2601097/how-to-get-the-mouse-position-without-events-without-moving-the-mouse
    canvasElement.addEventListener("mouseenter", mouseEntered, false)
    canvasElement.addEventListener("mouseleave", mouseExited, false)
    // IE9, Chrome, Safari, Opera
    canvasElement.addEventListener("mousewheel", mouseWheelMoved, false)
    // Firefox
    canvasElement.addEventListener("DOMMouseScroll", mouseWheelMoved, false)
    
    window.addEventListener("resize", drawCanvas, false)
    
    // TODO: for now preventing the context-menu this way
    canvasElement.addEventListener('contextmenu', event => event.preventDefault());
}
