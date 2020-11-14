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
 
 
ZUI.containersAndConnections = null

function initContainersAndConnections () {
    ZUI.containersAndConnections = { 
        containers: {}, 
        connections: {}, 
    }
    
    // FIXME: treat root as a (almost)normal container by using createContainer here!
    let rootContainer = {
        type: 'root',
        identifier: 'root',
        worldPosition : { x: 0, y: 0 },
        worldSize : { width: 0, height: 0 },
        localScale: 1,
        points: {},
        connectionPoints: {},
        children: [],
    }
    
    ZUI.containersAndConnections.containers['root'] = rootContainer
}

function createContainer(containerData) {
    
    let containerIdentifier = containerData.identifier
    
    let parentContainerIdentifier = containerData.parentContainerIdentifier
    
    let fill = { r:255, g:0, b:255, a:1 }
    let stroke = { r:255, g:255, b:0, a:1 }
    let shape = 'rectangle4points'
    let textBelowContainer = false
    let lineWidth = 1

    if (containerData.fill != null) {
        fill = containerData.fill
    }
    if (containerData.stroke != null) {
        stroke = containerData.stroke
    }
    if (containerData.shape != null) {
        shape = containerData.shape
    }
    if (containerData.lineWidth != null) {
        lineWidth = containerData.lineWidth
    }
    if (containerData.textBelowContainer != null) {
        textBelowContainer = containerData.textBelowContainer
    }
    
    let newContainer = {
        identifier: containerIdentifier,
        name: containerData.name,
        
        type: containerData.type,  // TODO: This is from the database and is not used directly (from here). They do not really belong here, but are more convenient than to lookup the database data using the container identifier
        // FIXME: remove dataType completely here! It should not be a property of a container!
        dataType: containerData.dataType, // TODO: This is from the database and is not used directly (from here). They do not really belong here, but are more convenient than to lookup the database data using the container identifier
        
        parentContainerIdentifier: parentContainerIdentifier != null ? parentContainerIdentifier : 'root',
        localPosition: {
            x: containerData.localPosition.x,
            y: containerData.localPosition.y,
        },
        localSize: { 
            width: containerData.localSize.width,
            height: containerData.localSize.height,
        },
        localScale: containerData.localScale,
        localFontSize: containerData.localFontSize,
        
        shapeType : shape,  // TODO: we should rename shapeType to shape
        textBelowContainer : textBelowContainer,
        
        worldPosition: {},
        worldSize: {},
        worldScale: null,
        worldPoints: {}, 
        worldConnectionPoints: {},
        
        fill: fill,
        stroke: stroke,
        
        children: [],
    }
    
    if (ZUI.containersAndConnections.containers.hasOwnProperty(containerIdentifier)) {
        console.log('WARNING: container with identifier ' + containerIdentifier + 'already exists!')
    }
    ZUI.containersAndConnections.containers[containerIdentifier] = newContainer
    
    return newContainer
}

function setContainerChildren() {

    for (let containerIdentifier in ZUI.containersAndConnections.containers) {
        let container = ZUI.containersAndConnections.containers[containerIdentifier]
        
        let parentContainerIdentifier = container.parentContainerIdentifier
        // TODO: we now assume the parent always exist. What if it doesn't? Will it be put into a special container?
        let parentContainer = ZUI.containersAndConnections.containers[parentContainerIdentifier]
        if (parentContainer != null) {
            parentContainer.children.push(containerIdentifier)
        }
        else {
            if (containerIdentifier != null && containerIdentifier !== 'root') {
                console.log('WARNING: parentContainerIdentifier ' + parentContainerIdentifier + ' not found for container ' + containerIdentifier)
            }
        }
        
    }
}

function containerIsSomeParentOfChild (container, childContainer) {
    if (childContainer == null || childContainer.identifier === 'root') {
        return false
    }
        
    if (childContainer.parentContainerIdentifier == null || childContainer.parentContainerIdentifier === 'root') {
        return false
    }
    
    if (childContainer.parentContainerIdentifier === container.identifier) {
        return true
    }
    
    let parentContainerIdentifier = childContainer.parentContainerIdentifier
    let parentContainer = ZUI.containersAndConnections.containers[parentContainerIdentifier]
    return containerIsSomeParentOfChild(container, parentContainer)
}

function getContainerByIdentifier(containerIdentifier) {
    
    if (containerIdentifier == null) {
        return null
    }
    
    if (ZUI.containersAndConnections.containers.hasOwnProperty(containerIdentifier)) {
        return ZUI.containersAndConnections.containers[containerIdentifier]
    }
    else {
        console.log('ERROR: unknown containerIdentifier: ' + containerIdentifier)
        return null
    }
}

function createConnection(connectionData) {
    
    let shapeType = 'default'
    let fill = { r:170, g:170, b:170, a:1 }
    let stroke = { r:100, g:100, b:100, a:1 }

    if (connectionData.fill != null) {
        fill = connectionData.fill
    }
    if (connectionData.stroke != null) {
        stroke = connectionData.stroke
    }
    
    let newConnection = {
        identifier: connectionData.identifier,
        name: connectionData.name,
        
        type: connectionData.type,  // TODO: This is from the database and is not used directly (from here). They do not really belong here, but are more convenient than to lookup the database data using the container identifier
        dataType: connectionData.dataType, // TODO: This is from the database and is not used directly (from here). They do not really belong here, but are more convenient than to lookup the database data using the container identifier
        
        fromContainerIdentifier: connectionData.fromContainerIdentifier,
        toContainerIdentifier: connectionData.toContainerIdentifier,
        
        fromConnectionPointIdentifier : connectionData.fromConnectionPointIdentifier,
        toConnectionPointIdentifier : connectionData.toConnectionPointIdentifier,
        
        stroke: fill, // TODO: now using fill as line color!
    }
    
    ZUI.containersAndConnections.connections[connectionData.identifier] = newConnection
    
    return newConnection
}

function removeConnection(connectionIdentifier) {
    delete ZUI.containersAndConnections.connections[connectionIdentifier]
}

function getConnectionByIdentifier(connectionIdentifier) {
    
    if (connectionIdentifier == null) {
        return null
    }
    
    if (ZUI.containersAndConnections.connections.hasOwnProperty(connectionIdentifier)) {
        return ZUI.containersAndConnections.connections[connectionIdentifier]
    }
    else {
        console.log('ERROR: unknown connectionIdentifier: ' + connectionIdentifier)
        return null
    }
}
