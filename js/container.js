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

// TODO: put this in a more general place. Maybe in shapes.js?
function getColorByColorNameAndLighten(colorNameAndLighten) {

    let color = { r:0, g:0, b:0, a:1 }
    
    let colorName = colorNameAndLighten.color
    let light = colorNameAndLighten.light
    
    if (basicColors.hasOwnProperty(colorName)) {
        let basicColor = basicColors[colorName]
        
        if (light > 0) {
            color = lighten(basicColor, light)
        }
        else {
            color = darken(basicColor, -light)
        }
    }
    else {
        console.log("ERROR: unknown colorname: " + colorName)
    }
    
    return color
}

function createContainer(containerData) {
    
    let containerIdentifier = containerData.identifier
    
    let parentContainerIdentifier = containerData.parentContainerIdentifier
    
    let fill = { r:255, g:0, b:255, a:1 }
    let stroke = { r:255, g:255, b:0, a:1 }
    let shape = 'rectangle4points'

    // FIXME: get this from colorAndShapeMappings!
    let containerTypeToContainerShapeAndColor = {
        "processor" : { 
            "shape" : "rectangle4points",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "grey", "light": 0.5 }
        },
        "status": { 
            "shape" : "ellipse4Points",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "grey", "light": 0.5 }
        },
        "transferFiles": { 
            "shape" : "rectangle4points",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "grey", "light": 0.5 }
        },
        "localDir": { 
            "shape" : "ellipse4Points",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "grey", "light": 0.5 }
        },
        "remoteDir": { 
            "shape" : "ellipse4Points",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "grey", "light": 0.5 }
        },
        "visualContainer": {
            "shape" : "roundedRectangleManyConnections",
            "stroke" : { "color": "grey", "light": 0.0 },
            "fill" : { "color": "grey", "light": 0.9 }
        },
        "visualContainer-light": {
            "shape" : "roundedRectangleManyConnections",
            "stroke" : { "color": "grey", "light": -0.5 },
            "fill" : { "color": "white", "light": 0.8 }
        }
    }
    
    let dataTypeToColor = {
        "salesOrders" : { 
            "stroke" : { "color": "cyan", "light": -0.5 },
            "fill" : { "color": "cyan", "light": 0.5 }
        },
        "dispatchRequests": { 
            "stroke" : { "color": "purple", "light": -0.5 },
            "fill" : { "color": "purple", "light": 0.5 }
        },
        "dispatchResults": { 
            "stroke" : { "color": "green", "light": -0.5 },
            "fill" : { "color": "green", "light": 0.5 }
        },
        "mancos": { 
            "stroke" : { "color": "orange", "light": -0.5 },
            "fill" : { "color": "orange", "light": 0.5 }
        },
        "returns": { 
            "stroke" : { "color": "red", "light": -0.5 },
            "fill" : { "color": "red", "light": 0.5 }
        },
        "payments": { 
            "stroke" : { "color": "lime", "light": -0.5 },
            "fill" : { "color": "lime", "light": 0.5 }
        },
        "cancels": { 
            "stroke" : { "color": "magento", "light": -0.5 },
            "fill" : { "color": "magento", "light": 0.5 }
        },
        "invoices": { 
            "stroke" : { "color": "lime", "light": -0.5 },
            "fill" : { "color": "lime", "light": 0.5 }
        },
        "quotes": { 
            "stroke" : { "color": "cyan", "light": -0.5 },
            "fill" : { "color": "cyan", "light": 0.5 }
        },
        
        "stock": { 
            "stroke" : { "color": "orange", "light": -0.5 },
            "fill" : { "color": "orange", "light": 0.5 }
        },
        
        "businessPartners": { 
            "stroke" : { "color": "cyan", "light": -0.5 },
            "fill" : { "color": "cyan", "light": 0.5 }
        },
        "products": { 
            "stroke" : { "color": "blue", "light": -0.5 },
            "fill" : { "color": "blue", "light": 0.5 }
        },
        "productAttributes": { 
            "stroke" : { "color": "red", "light": -0.5 },
            "fill" : { "color": "red", "light": 0.5 }
        },
        "productGroups": { 
            "stroke" : { "color": "green", "light": -0.5 },
            "fill" : { "color": "green", "light": 0.5 }
        }

    }
    
    if (containerData.type != null) {
        if (containerTypeToContainerShapeAndColor.hasOwnProperty(containerData.type)) {
            shapeType = containerTypeToContainerShapeAndColor[containerData.type].shape
            stroke = getColorByColorNameAndLighten(containerTypeToContainerShapeAndColor[containerData.type].stroke)
            fill = getColorByColorNameAndLighten(containerTypeToContainerShapeAndColor[containerData.type].fill)
        }
        else {
            console.log("ERROR: unknown container type: " + containerData.type)
        }
    }
    
    if (containerData.dataType != null) {
        if (dataTypeToColor.hasOwnProperty(containerData.dataType)) {
            stroke = getColorByColorNameAndLighten(dataTypeToColor[containerData.dataType].stroke)
            fill = getColorByColorNameAndLighten(dataTypeToColor[containerData.dataType].fill)
        }
        else {
            console.log("ERROR: unknown container data type: " + containerData.dataType)
        }
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
        localFontSize: containerData.localFontSize,
        
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
        localFontSize : getExistingField('localFontSize', visualContainerData, sourceContainerData),
        dataType : getExistingField('dataType', visualContainerData, sourceContainerData),
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
// FIXME: turn this on again?        console.log("ERROR: Unknown connection type: " + connectionData.type)
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

function removeConnection(connectionIdentifier) {
    delete containersAndConnections.connections[connectionIdentifier]
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
