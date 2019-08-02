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
 
let containersAndConnections = null

function initContainersAndConnections () {
    containersAndConnections = { 
        containers: {}, 
        lastContainerId: 0, 
        containerIdentifierToId: {},
        
        connections: {}, 
        lastConnectionId: 0,
        connectionIdentifierToId: {},
    }
    
    let rootContainer = {
        type: 'root',
        id: 0,
        identifier: null,
        position : { x: 0, y: 0 },
        children: [],
    }
    
    containersAndConnections.containers[0] = rootContainer
}

function getNewContainerId () {
    return ++containersAndConnections.lastContainerId
}

function createContainer(containerData) {
    
    let containerId = getNewContainerId()
    let containerIdentifier = containerData.identifier
    containersAndConnections.containerIdentifierToId[containerIdentifier] = containerId
    
    let parentContainerIdentifier = containerData.parentIdentifier
    let parentContainerId = null
    let parentContainer = null
    if (parentContainerIdentifier != null) {
        parentContainerId = containersAndConnections.containerIdentifierToId[parentContainerIdentifier]
    }
    else {
        parentContainerId = 0 // = root container
    }
    parentContainer = containersAndConnections.containers[parentContainerId]
    
    let fill = { r:0, g:0, b:0, a:1 }
    let stroke = { r:0, g:0, b:0, a:1 }
    
    if (containerData.type === 'server') {
        fill = { r:200, g:180, b:0, a:1 }
        stroke = { r:200, g:180, b:0, a:1 }
    }
    else if (containerData.type === 'API') {
        fill = { r:0, g:180, b:200, a:1 }
        stroke = { r:0, g:180, b:200, a:1 }
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    // TODO: determine absolute postiion based on absolute position of parent (we need a hashmap of containers (of the parent itself) for that)
    let newContainer = {
        id: containerId,
        identifier: containerIdentifier,
        name: containerData.name,
        parentContainerId: parentContainerId,
        position: {},
        relativePosition: {
            x: containerData.relativePosition.x,
            y: containerData.relativePosition.y,
        },
        size: { 
            width: containerData.size.width,
            height: containerData.size.height,
        },
        fill: fill,
        stroke: stroke,
        children: [],
    }
    
    recalculateAbsolutePositions(newContainer)
    
    containersAndConnections.containers[containerId] = newContainer
    
    if (parentContainer != null) {
        parentContainer.children.push(containerId)
    }
    
    return containerId
}

function getContainerByIdentifier(containerIdentifier) {
    
    // TODO: maybe there is a nicer way to say: we need the root container (but this is kinda easy)
    if (containerIdentifier == null) {
        return containersAndConnections.containers[0]
    }
    containerId = containersAndConnections.containerIdentifierToId[containerIdentifier]
    
    if (containerId != null) {
        return containersAndConnections.containers[containerId]
    }
    else {
        console.log('ERROR: unknown containerIdentifier: ' + containerIdentifier)
        return null
    }
}

function getNewConnectionId () {
    return ++containersAndConnections.lastConnectionId
}

function createConnection(connectionData) {
    
    let connectionId = getNewConnectionId()
    let connectionIdentifier = connectionData.identifier
    containersAndConnections.connectionIdentifierToId[connectionIdentifier] = connectionId
    
    let fromContainerId = containersAndConnections.containerIdentifierToId[connectionData.from]
    let toContainerId = containersAndConnections.containerIdentifierToId[connectionData.to]
    
    let stroke = { r:0, g:0, b:0, a:1 }

    if (connectionData.type === 'API2API') {
        stroke = { r:0, g:180, b:200, a:1 }
    }
    else {
        console.log("ERROR: Unknown connection type: " + connectionData.type)
    }
    
    let newConnection = {
        id: connectionId,
        identifier: connectionIdentifier,
        name: connectionData.name,
        fromId: fromContainerId,
        toId: toContainerId,
        stroke: stroke,
    }
    
    containersAndConnections.connections[connectionId] = newConnection
    
    return connectionId
}

