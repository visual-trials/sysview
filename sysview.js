let containersAndConnections = null
let menuButtons = []
let menuIcons = {}

function init() {
    
    initIcons()
    initMenu()
    
    // TODO: replace this eventually
    containersAndConnections = getExampleData()
    
    addInputListeners()
    drawCanvas()
}

function initIcons() {

    let menuIconsRaw = {}
    // see: https://ezgif.com/image-to-datauri
    menuIconsRaw['view'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAp0lEQVRYR+3W4QqAIAwE4Pn+D10ICTISvdvhCvRfYPZ52rRYcivJ37cD+FUCl5l+yZAEKqA25J3pHkcGawlIk2AAdVYyBAuQISIACSIKCCMUgBBCBaARSgCFUANghArQqmRf+ZbGXur0jOqLT/9MFyYW4M+FrYDRzCkEmoA/DcPLgALe+ocQCGB0tqcD/L8P7QVFAp8ANAR8ZVMlML37jTocwEkgPYEbdmUtIUAAjAQAAAAASUVORK5CYII='
    menuIconsRaw['move'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAApUlEQVRYR+2V4QrAIAiE7f0feqOBEFtqepAN7Odw3pde2ij5tGR9KoCqAFqBiwjzEQLQxfmE80R/HMUhiAjATDwMEQEYZ1eqBzrINgBJyPv9M/lXWsA9n8VqAF3MzG8FWE/NAjAhNADN7d4lKuocXQG+ZaoHRgivCa3qPrmXgpSGb5sDEkMKwBG7IHUbvl8H5KXfm9A7EUPLCBbREqAtgOEKoCpwA2MJHyFyeKK8AAAAAElFTkSuQmCC'
    
    for (let mode in menuIconsRaw) {
        let iconImage = new Image
        iconImage.src = menuIconsRaw[mode]
        iconImage.onload = function(){
            menuIcons[mode] = iconImage
            // FIXME: there is probably a better way to do this!
            drawCanvas()
        }
    }
}

function initMenu() {
    menuButtons = [
        {
            mode: "view",
        },
        {
            mode: "move",
        },
        {
            mode: "connect",
        }
    ]
    
    let buttonPosition = { x: 20, y: 20 }
    let buttonSize = { width: 32, height: 32 }
    for (let buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex++) {
        let buttonData = menuButtons[buttonIndex]
        buttonData.position = {}
        buttonData.position.x = buttonPosition.x
        buttonData.position.y = buttonPosition.y
        buttonData.size = {}
        buttonData.size.width = buttonSize.width
        buttonData.size.height = buttonSize.height
        
        buttonPosition.y += buttonSize.height
    }
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

// Interaction info
let interaction = {
    viewOffset : { x: 0, y: 0},
    viewIsBeingDragged : false,
    currentlySelectedMode : 'view',
    currentlyHoveredMode : null,
    currentlyHoveredContainer : null,
    currentlySelectedContainer : null,
    selectedContainerIsBeingDragged : false,
    selectedContainerIsBeingResized : false,
    selectedContainerResizeSide : null,
    mousePointerStyle: 'default'  // Possible mouse styles: http://www.javascripter.net/faq/stylesc.htm
}

function handleMouseStateChange () {
    
    let containerAtMousePosition = findContainerAtScreenPosition(mouseState.position)
    let menuButtonAtMousePosition = findMenuButtonAtScreenPosition(mouseState.position)
    
    interaction.currentlyHoveredContainer = containerAtMousePosition
    if (menuButtonAtMousePosition != null) {
        interaction.currentlyHoveredMode = menuButtonAtMousePosition.mode
    }
    else {
        interaction.currentlyHoveredMode = null
    }
    
    // Check mouse position
    
    let selectedContainerNearness = whichSideIsPositionFromContainer(mouseState.position, interaction.currentlySelectedContainer)
    
    let mouseIsNearSelectedContainerBorder = false
    
    if (interaction.currentlyHoveredMode != null) {
        // If we hover a menu button, we want to see a default mouse pointer
        interaction.mousePointerStyle = 'default'
    }
    else if (interaction.currentlySelectedContainer != null && selectedContainerNearness.isNearContainer) {
        
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

    // TODO: check if above empty space or container!
    if (mouseState.rightButtonHasGoneDown) {
        // FIXME: we need some lind of (incrmental) id here!
        let extraServer = {
            type: 'server',  // TODO: allow adding different kinds of containers
            identifier: 'ExtraServer',
            name: 'My Extra Server',
            position: {
                x: mouseState.position.x,
                y: mouseState.position.y
            },
            size: {
                width: 200,
                height: 250
            }
        }
        
        let extraServerIdentifier = addContainer(extraServer, "", containersAndConnections.containers)
    }

    if (mouseState.leftButtonHasGoneDown) {
        
        if (interaction.currentlyHoveredMode != null) {
            // Menu-click has higher priority than container-click, we check it first
            interaction.currentlySelectedMode = interaction.currentlyHoveredMode
        }
        else if (mouseIsNearSelectedContainerBorder) {
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
