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
        relativeScale: 1,
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
        fill = { r:200, g:180, b:200, a:1 }
        stroke = { r:200, g:180, b:200, a:1 }
    }
    else if (containerData.type === 'API') {
        fill = { r:0, g:180, b:200, a:1 }
        stroke = { r:0, g:180, b:200, a:1 }
    }
    else if (containerData.type === 'transferFiles') {
        fill = { r:180, g:0, b:200, a:1 }
        stroke = { r:180, g:0, b:200, a:1 }
    }
    else if (containerData.type === 'localDir') {
        fill = { r:200, g:200, b:200, a:1 }
        stroke = { r:100, g:100, b:100, a:1 }
    }
    else if (containerData.type === 'visualContainer') {
        fill = { r:240, g:240, b:240, a:1 }
        stroke = { r:100, g:100, b:100, a:1 }
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    let newContainer = {
        identifier: containerIdentifier,
        name: containerData.name,
        parentContainerIdentifier: parentContainerIdentifier != null ? parentContainerIdentifier : 'root',
        position: {},
        relativePosition: {
            x: containerData.relativePosition.x,
            y: containerData.relativePosition.y,
        },
        relativeScale: containerData.relativeScale,
        scale: null,
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

function getExistingField(fieldName, firstObject, secondObject, defaultValue = null) {
    if (firstObject != null && firstObject.hasOwnProperty(fieldName)) {
        return firstObject[fieldName]
    }
    else if (secondObject != null && secondObject.hasOwnProperty(fieldName)) {
        return secondObject[fieldName]
    }
    else {
        return defaultValue
    }
}

function mergeSourceAndVisualContainerData (sourceContainerData, visualContainerData) {
    
    let containerData = {
        identifier : getExistingField('identifier', visualContainerData, sourceContainerData),
        name : getExistingField('name', visualContainerData, sourceContainerData),
        type : getExistingField('type', visualContainerData, sourceContainerData),
        parentContainerIdentifier : getExistingField('parentContainerIdentifier', visualContainerData, sourceContainerData),
        relativePosition : { 
            x: parseFloat(getExistingField(
                'x', 
                visualContainerData == null ? null : visualContainerData.relativePosition, 
                sourceContainerData == null ? null : sourceContainerData.relativePosition, 
                0)
            ),
            y: parseFloat(getExistingField(
                'y', 
                visualContainerData == null ? null : visualContainerData.relativePosition, 
                sourceContainerData == null ? null : sourceContainerData.relativePosition, 
                0)
            )
        },
        size : { 
            width: parseFloat(getExistingField(
                'width', 
                visualContainerData == null ? null : visualContainerData.size, 
                sourceContainerData == null ? null : sourceContainerData.size, 
                0)
            ),
            height: parseFloat(getExistingField(
                'height', 
                visualContainerData == null ? null : visualContainerData.size, 
                sourceContainerData == null ? null : sourceContainerData.size, 
                0)
            )
        },
        relativeScale : getExistingField('relativeScale', visualContainerData, sourceContainerData),
    }
    
    return containerData
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
        else {
            console.log('WARNING: parentContainerIdentifier ' + parentContainerIdentifier + ' not found')
        }
        
    }
}

function getContainerByIdentifier(containerIdentifier) {
    
    if (containerIdentifier == null) {
        return null
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

function mergeSourceAndVisualConnectionData (sourceConnectionData, visualConnectionData) {
    
    let connectionData = {
        identifier : getExistingField('identifier', visualConnectionData, sourceConnectionData),
        name : getExistingField('name', visualConnectionData, sourceConnectionData),
        type : getExistingField('type', visualConnectionData, sourceConnectionData),
        // FIXME: we call it 'from' and 'fromIdentifier', which is inconsistent
        from : getExistingField('from', visualConnectionData, sourceConnectionData),
        to : getExistingField('to', visualConnectionData, sourceConnectionData),
    }
    
    return connectionData
}

