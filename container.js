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
        connections: {}, 
    }
    
    let rootContainer = {
        type: 'root',
        id: 0,
        identifier: null,
        position : { x: 0, y: 0 },
        children: [],
    }
    
    containersAndConnections.containers['root'] = rootContainer
}

function createContainer(containerData) {
    
    // FIXME: check if this identifier is unique!!
    let containerIdentifier = containerData.identifier
    
    let parentContainerIdentifier = containerData.parentContainerIdentifier
    
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
        identifier: containerIdentifier,
        name: containerData.name,
        parentContainerIdentifier: parentContainerIdentifier,
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
    
    containersAndConnections.containers[containerIdentifier] = newContainer
    
    return newContainer
}

function setContainerChildren() {

    for (let containerIdentifier in containersAndConnections.containers) {
        let container = containersAndConnections.containers[containerIdentifier]
        
        let parentContainerIdentifier = container.parentContainerIdentifier
        // TODO: we now assume the parent always exist. What if it doesn't? Will it be put into a special container?
        let parentContainer = containersAndConnections.containers[parentContainerIdentifier]
        if (parentContainer != null) {
            parentContainer.children.push(containerIdentifier)
        }
        
    }
}

function getContainerByIdentifier(containerIdentifier) {
    
    // TODO: maybe there is a nicer way to say: we need the root container (but this is kinda easy)
    if (containerIdentifier == null) {
        return containersAndConnections.containers['root']
    }
    
    if (containersAndConnections.containers.hasOwnProperty(containerIdentifier)) {
        return containersAndConnections.containers[containerIdentifier]
    }
    else {
        console.log('ERROR: unknown containerIdentifier: ' + containerIdentifier)
        return null
    }
}

function createConnection(connectionData) {
    
    let stroke = { r:0, g:0, b:0, a:1 }

    if (connectionData.type === 'API2API') {
        stroke = { r:0, g:180, b:200, a:1 }
    }
    else {
        console.log("ERROR: Unknown connection type: " + connectionData.type)
    }
    
    let newConnection = {
        identifier: connectionData.identifier,
        name: connectionData.name,
        fromIdentifier: connectionData.from,
        toIdentifier: connectionData.to,
        stroke: stroke,
    }
    
    containersAndConnections.connections[connectionData.identifier] = newConnection
    
    return newConnection
}

