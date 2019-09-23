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
    
    containersAndConnections.containers['root'] = rootContainer
}

function createContainer(containerData) {
    
    let containerIdentifier = containerData.identifier
    
    let parentContainerIdentifier = containerData.parentContainerIdentifier
    
    let fill = { r:0, g:0, b:0, a:1 }
    let stroke = { r:0, g:0, b:0, a:1 }

    // FIXME: do this mapping outside this function!    
    let shapeType = 'rectangle4points' // TODO: maybe a different default shape?
    if (containerData.type === 'server') {
        fill = { r:200, g:180, b:200, a:1 }
        stroke = { r:200, g:180, b:200, a:1 }
    }
    else if (containerData.type === 'API') {
        fill = { r:0, g:180, b:200, a:1 }
        stroke = { r:0, g:180, b:200, a:1 }
    }
    if (containerData.type === 'processor') {
        fill = { r:200, g:200, b:150, a:1 }
        stroke = { r:200, g:200, b:150, a:1 }
    }
    else if (containerData.type === 'status') {
        fill = { r:150, g:150, b:220, a:1 }
        stroke = { r:150, g:150, b:150, a:1 }
        shapeType = 'ellipse4Points'
    }
    else if (containerData.type === 'transferFiles') {
        fill = { r:180, g:0, b:200, a:1 }
        stroke = { r:180, g:0, b:200, a:1 }
    }
    else if (containerData.type === 'localDir') {
        fill = { r:250, g:200, b:200, a:1 }
        stroke = { r:150, g:100, b:100, a:1 }
        shapeType = 'ellipse4Points'
    }
    else if (containerData.type === 'remoteDir') {
        fill = { r:200, g:200, b:250, a:1 }
        stroke = { r:100, g:100, b:150, a:1 }
        shapeType = 'ellipse4Points'
    }
    else if (containerData.type === 'visualContainer') {
        fill = { r:240, g:240, b:240, a:1 }
        stroke = { r:50, g:50, b:50, a:1 }
        shapeType = 'roundedRectangleManyConnections'
    }
    else {
        console.log("ERROR: Unknown container type: " + containerData.type)
    }
    
    let newContainer = {
        identifier: containerIdentifier,
        name: containerData.name,
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
        
        shapeType : shapeType, 
        
        worldPosition: {},
        worldSize: {},
        worldScale: null,
        worldPoints: {}, 
        worldConnectionPoints: {},
        
        fill: fill,
        stroke: stroke,
        
        children: [],
    }
    
    if (containersAndConnections.containers.hasOwnProperty(containerIdentifier)) {
        console.log('WARNING: container with identifier ' + containerIdentifier + 'already exists!')
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
        localPosition : { 
            x: parseFloat(getExistingField(
                'x', 
                visualContainerData == null ? null : visualContainerData.localPosition, 
                sourceContainerData == null ? null : sourceContainerData.localPosition, 
                0)
            ),
            y: parseFloat(getExistingField(
                'y', 
                visualContainerData == null ? null : visualContainerData.localPosition, 
                sourceContainerData == null ? null : sourceContainerData.localPosition, 
                0)
            )
        },
        localSize : { 
            width: parseFloat(getExistingField(
                'width', 
                visualContainerData == null ? null : visualContainerData.localSize, 
                sourceContainerData == null ? null : sourceContainerData.localSize, 
                0)
            ),
            height: parseFloat(getExistingField(
                'height', 
                visualContainerData == null ? null : visualContainerData.localSize, 
                sourceContainerData == null ? null : sourceContainerData.localSize, 
                0)
            )
        },
        localScale : getExistingField('localScale', visualContainerData, sourceContainerData),
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
    let parentContainer = containersAndConnections.containers[parentContainerIdentifier]
    return containerIsSomeParentOfChild(container, parentContainer)
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
        type: connectionData.type, // TODO: maybe call this dataType? Or is there a type as well? (note this is grouped-by in draw.js)
        fromContainerIdentifier: connectionData.fromContainerIdentifier,
        toContainerIdentifier: connectionData.toContainerIdentifier,
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
        fromContainerIdentifier : getExistingField('fromContainerIdentifier', visualConnectionData, sourceConnectionData),
        toContainerIdentifier : getExistingField('toContainerIdentifier', visualConnectionData, sourceConnectionData),
    }
    
    return connectionData
}

function getConnectionByIdentifier(connectionIdentifier) {
    
    if (connectionIdentifier == null) {
        return null
    }
    
    if (containersAndConnections.connections.hasOwnProperty(connectionIdentifier)) {
        return containersAndConnections.connections[connectionIdentifier]
    }
    else {
        console.log('ERROR: unknown connectionIdentifier: ' + connectionIdentifier)
        return null
    }
}
