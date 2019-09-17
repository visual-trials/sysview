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

// FIXME: make this available as data
let containerShapes = {
    'rectangle4points' : {
        'points' : {
            'top' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
            },
            'right' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-top', type : 'move' },
            { toPoint : 'right-top', type : 'line' },
            { toPoint : 'right-bottom', type : 'line' },
            { toPoint : 'left-bottom', type : 'line' },
            // TODO: for now we always close the path. We might not (always) want to do that!
        ]
    },
    'roundedRectangleManyConnections' : {
        'points' : {
            'left-top-r' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-top-b' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 0, y: 200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-top-l' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: -200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-top-b' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: 0, y: 200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: 0, y: -200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-bottom-l' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: -200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-bottom-r' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 0, y: -200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'middle-top' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'middle-left' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'middle-bottom' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
            },
            'middle-right' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-top-r', type : 'move' },
            { toPoint : 'right-top-l', type : 'line' },
            { toPoint : 'right-top-b', edgePoint : 'right-top', type : 'arcto' },
            { toPoint : 'right-bottom-t', type : 'line' },
            { toPoint : 'right-bottom-l', edgePoint : 'right-bottom', type : 'arcto' },
            { toPoint : 'left-bottom-r', type : 'line' },
            { toPoint : 'left-bottom-t', edgePoint : 'left-bottom', type : 'arcto' },
            { toPoint : 'left-top-b', type : 'line' },
            { toPoint : 'left-top-r', edgePoint : 'left-top', type : 'arcto' },
        ]
    }
}

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
        worldPosition: {},
        worldSize: {},
        worldScale: null,
        fill: fill,
        stroke: stroke,
        shapeType : shapeType, 
        worldPoints: {}, 
        worldConnectionPoints: {},
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
