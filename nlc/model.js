/*

   Copyright 2020 Jeffrey Hullekes

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

let NLC = {}

NLC.dataHasChanged = false
NLC.dataChangesToStore = []
NLC.nodesAndLinksData = {}

function storeChangesBetweenDiagrams(originalDiagram, changedDiagram) {
    let diagramChanges = []
    
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused

    if (changedDiagram.name !== originalDiagram.name) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "diagrams", originalDiagram.id, "name" ],
            "data" : changedDiagram.name
        }
        diagramChanges.push(nlcDataChange)
    }

    if (diagramChanges.length > 0) {
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(diagramChanges)
        
        NLC.dataHasChanged = true
        
        // TODO: we should only do this if we accept the changes
        originalDiagram.name = changedDiagram.name
        originalDiagram.identifier = changedDiagram.identifier  // FIXME: we should get rid of this!
    }
}

function storeChangesBetweenNodes(originalNode, changedNode) {
    let nodeChanges = []

    // TODO: can we this function using a config of sorts? Which says what to ignore, compare and how?

    // TODO: compare 'type' aswell!
    // TODO: ignoring 'diagramSpecificVisualData' for now! We should do this more explicitly!
    
    // TODO: do a more precise comparision (instead of using JSON.stringify, which is not reliable)
    if (JSON.stringify(changedNode.commonData) !== JSON.stringify(originalNode.commonData) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "nodes", originalNode.id, "commonData" ],
            "data" : changedNode.commonData
        }
        nodeChanges.push(nlcDataChange)
    }

    // TODO: compare each version individually!
    if (JSON.stringify(changedNode.versions) !== JSON.stringify(originalNode.versions) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "nodes", originalNode.id, "versions" ],
            "data" : changedNode.versions
        }
        nodeChanges.push(nlcDataChange)
    }
    
    if (JSON.stringify(changedNode.environmentVersions) !== JSON.stringify(originalNode.environmentVersions) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "nodes", originalNode.id, "environmentVersions" ],
            "data" : changedNode.environmentVersions
        }
        nodeChanges.push(nlcDataChange)
    }
    
    
    if (nodeChanges.length > 0) {
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(nodeChanges)
        
        NLC.dataHasChanged = true
        
        // TODO: we should only do this if we accept the changes
        // FIXME: We should copy all object-attributes BACK to the selectedNode (see above where we do the same for comparisons)
        originalNode.commonData = changedNode.commonData
        originalNode.versions = changedNode.versions
        originalNode.environmentVersions = changedNode.environmentVersions
    }
}

function storeChangesBetweenLinks(originalLink, changedLink) {
    let linkChanges = []

    // TODO: can we this function using a config of sorts? Which says what to ignore, compare and how?

    // TODO: compare 'type' aswell!
    // TODO: ignoring 'diagramSpecificVisualData' for now! We should do this more explicitly!
    
    // TODO: do a more precise comparision (instead of using JSON.stringify, which is not reliable)
    if (JSON.stringify(changedLink.commonData) !== JSON.stringify(originalLink.commonData) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", originalLink.id, "commonData" ],
            "data" : changedLink.commonData
        }
        linkChanges.push(nlcDataChange)
    }

    // TODO: compare each version individually!
    if (JSON.stringify(changedLink.versions) !== JSON.stringify(originalLink.versions) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", originalLink.id, "versions" ],
            "data" : changedLink.versions
        }
        linkChanges.push(nlcDataChange)
    }
    
    if (JSON.stringify(changedLink.environmentVersions) !== JSON.stringify(originalLink.environmentVersions) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", originalLink.id, "environmentVersions" ],
            "data" : changedLink.environmentVersions
        }
        linkChanges.push(nlcDataChange)
    }
    
    // FIXME: you probably don't need the stringify right? How about NUMBER vs STRING here?
    if (JSON.stringify(changedLink.fromNodeId) !== JSON.stringify(originalLink.fromNodeId) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", originalLink.id, "fromNodeId" ],
            "data" : changedLink.fromNodeId
        }
        linkChanges.push(nlcDataChange)
    }
    
    // FIXME: you probably don't need the stringify right? How about NUMBER vs STRING here?
    if (JSON.stringify(changedLink.toNodeId) !== JSON.stringify(originalLink.toNodeId) ) {
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", originalLink.id, "toNodeId" ],
            "data" : changedLink.toNodeId
        }
        linkChanges.push(nlcDataChange)
    }

    if (linkChanges.length > 0) {
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(linkChanges)
        
        // TODO: maybe its better to call this: linkDataHasChanged ?
        NLC.dataHasChanged = true

        // TODO: we should only do this if we accept the changes
        // FIXME: We should copy all object-attributes BACK to the originalLink (see above where we do the same for comparisons)
        originalLink.commonData = changedLink.commonData
        originalLink.versions = changedLink.versions
        originalLink.environmentVersions = changedLink.environmentVersions
        originalLink.fromNodeId = changedLink.fromNodeId
        originalLink.toNodeId = changedLink.toNodeId
    }
}

function storeNodeLocalPositionInDiagram (nodeId, diagramIdentifier, localPosition) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    if (nodesById.hasOwnProperty(nodeId)) {
        let node = nodesById[nodeId]
        
        // TODO: check if key exists instead of checking for the value to be "true"
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramIdentifier]) {
            // TODO: do we really need to make a clone here?
            let newLocalPosition = {
                "x" : localPosition.x,
                "y" : localPosition.y
            }
            
            node.diagramSpecificVisualData[diagramIdentifier].position = newLocalPosition

            // TODO: you probably want to apply this change in javascript to (on the node in nodesAndLinksData.nodes)
            let nlcDataChange = {
                "method" : "update",
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramIdentifier, "position"],
                "data" : newLocalPosition                
            }
            NLC.dataChangesToStore.push(nlcDataChange)
        }
    
        // TODO: maybe its better to call this: visualDataHasChanged ?
        NLC.dataHasChanged = true
    }
    else {
        console.log("ERROR: cannot store node: unknown nodeId:" + nodeId)
    }
}

function storeNodeLocalSizeInDiagram(nodeId, diagramIdentifier, localSize) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    if (nodesById.hasOwnProperty(nodeId)) {
        let node = nodesById[nodeId]
        
        // TODO: check if key exists instead of checking for the value to be "true"
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramIdentifier]) {
            // TODO: do we really need to make a clone here?
            let newLocalSize = {
                "width" : localSize.width,
                "height" : localSize.height
            }
            
            node.diagramSpecificVisualData[diagramIdentifier].size = newLocalSize

            // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes)
            let nlcDataChange = {
                "method" : "update",
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramIdentifier, "size"],
                "data" : newLocalSize
            }
            NLC.dataChangesToStore.push(nlcDataChange)
        }
    
        // TODO: maybe its better to call this: visualDataHasChanged ?
        NLC.dataHasChanged = true
    }
    else {
        console.log("ERROR: cannot store node: unknown nodeId:" + nodeId)
    }
}

function removeNodeFromDiagram(nodeId, diagramIdentifier) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    if (nodesById.hasOwnProperty(nodeId)) {
        let node = nodesById[nodeId]

        // TODO: check if key exists instead of checking for the value to be "true"
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramIdentifier]) {
            // We are removing the node from the diagram (or actually: the diagram info from the node)
            delete node.diagramSpecificVisualData[diagramIdentifier]
            
            // TODO: you probably want to apply this change in javascript to (on the link in NLC.nodesAndLinksData.links)
            let nlcDataChange = {
                "method" : "delete",
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramIdentifier],
                "data" : null
            }
            NLC.dataChangesToStore.push(nlcDataChange)
        }
        
        // TODO: maybe its better to call this: visualDataHasChanged ?
        NLC.dataHasChanged = true
    }
}

function storeLinkConnectionPointIdentifierInDiagram(linkId, diagramIdentifier, fromOrTo, connectionPointIdentifier) {
  
    let linksById = NLC.nodesAndLinksData.linksById
    
    if (linksById.hasOwnProperty(linkId)) {
        let link = linksById[linkId]

        if (!link.hasOwnProperty('diagramSpecificVisualData')) {
            link.diagramSpecificVisualData = {}
            
// FIXME: this is a very roundabout way of creating a map in the db!
            let dummyValue = {}
            dummyValue[diagramIdentifier] = {}
            dummyValue[diagramIdentifier]['DUMMY'] = true
            let nlcDataChange = {
                "method" : "update",
                "path" : [ "links", linkId, "diagramSpecificVisualData"],
                "data" : dummyValue
            }
            NLC.dataChangesToStore.push(nlcDataChange)
        }
        if (!link.diagramSpecificVisualData.hasOwnProperty(diagramIdentifier)) {
            link.diagramSpecificVisualData[diagramIdentifier] = {}
            
// FIXME: this is a very roundabout way of creating a map in the db!
            let dummyValue = {}
            dummyValue['DUMMY'] = true
            let nlcDataChange = {
                "method" : "update",
                "path" : [ "links", linkId, "diagramSpecificVisualData", diagramIdentifier],
                "data" : dummyValue
            }
            NLC.dataChangesToStore.push(nlcDataChange)
        }
            
        let keyToStore = 'fromConnectionPointIdentifier'
        if (fromOrTo === 'to') {
            keyToStore = 'toConnectionPointIdentifier'
        }
        link.diagramSpecificVisualData[diagramIdentifier][keyToStore] = connectionPointIdentifier
        
        // TODO: you probably want to apply this change in javascript to (on the link in NLC.nodesAndLinksData.links)
        let nlcDataChange = {
            "method" : "update",
            "path" : [ "links", linkId, "diagramSpecificVisualData", diagramIdentifier, keyToStore],
            "data" : connectionPointIdentifier
        }
        NLC.dataChangesToStore.push(nlcDataChange)
    
        // TODO: maybe its better to call this: visualDataHasChanged ?
        NLC.dataHasChanged = true
    }
    else {
        console.log("ERROR: cannot store link: unknown linkId:" + linkId)
    }
}


function removeDiagram (diagramToBeRemoved) {
    let diagramsById = NLC.nodesAndLinksData.diagramsById

    let diagramIndexToDelete = null
    for (let diagramIndex = 0; diagramIndex < NLC.nodesAndLinksData.diagrams.length; diagramIndex++) {
        let diagram = NLC.nodesAndLinksData.diagrams[diagramIndex]
        if (diagram.id === diagramToBeRemoved.id) {
            diagramIndexToDelete = diagramIndex
        }
    }
    if (diagramIndexToDelete != null) {
        NLC.nodesAndLinksData.diagrams.splice(diagramIndexToDelete)
        delete diagramsById[diagramToBeRemoved.id]
    }
    else {
        console.log("ERROR: could not find diagram to be deleted!")
    }
    
    // FIXME: remove all visualData from nodes and links pointing to this diagram!
    

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.diagrams and diagramsById)
    let nlcDataChange = {
        "method" : "delete",
        "path" : [ "diagrams", diagramToBeRemoved.id],
        "data" : diagramToBeRemoved
    }
    NLC.dataChangesToStore.push(nlcDataChange)
    
    NLC.dataHasChanged = true
}


function removeLink (linkToBeRemoved) {
    let linksById = NLC.nodesAndLinksData.linksById

    let linkIndexToDelete = null
    for (let linkIndex = 0; linkIndex < NLC.nodesAndLinksData.links.length; linkIndex++) {
        let link = NLC.nodesAndLinksData.links[linkIndex]
        if (link.id === linkToBeRemoved.id) {
            linkIndexToDelete = linkIndex
        }
    }
    if (linkIndexToDelete != null) {
        NLC.nodesAndLinksData.links.splice(linkIndexToDelete)
        delete linksById[linkToBeRemoved.id]
    }
    else {
        console.log("ERROR: could not find link to be deleted!")
    }

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes and nodesById)
    let nlcDataChange = {
        "method" : "delete",
        "path" : [ "links", linkToBeRemoved.id],
        "data" : linkToBeRemoved
    }
    NLC.dataChangesToStore.push(nlcDataChange)
    
    NLC.dataHasChanged = true
}

function removeNode (nodeToBeRemoved, removeLinksAttachedToNode) {
    let nodesById = NLC.nodesAndLinksData.nodesById

    if (removeLinksAttachedToNode) {
        let linksToBeRemoved = []
        
        for (let linkIndex = 0; linkIndex < NLC.nodesAndLinksData.links.length; linkIndex++) {
            let link = NLC.nodesAndLinksData.links[linkIndex]
            if (link.fromNodeId === nodeToBeRemoved.id) {
                linksToBeRemoved.push(link)
            }
            if (link.toNodeId === nodeToBeRemoved.id) {
                linksToBeRemoved.push(link)
            }
        }
        
        for (let linkToBeRemovedIndex = 0; linkToBeRemovedIndex < linksToBeRemoved.length; linkToBeRemovedIndex++) {
            let linkTobeRemoved = linksToBeRemoved[linkToBeRemovedIndex]
            removeLink(linkTobeRemoved)
        }
    }
    
    let nodeIndexToDelete = null
    for (let nodeIndex = 0; nodeIndex < NLC.nodesAndLinksData.nodes.length; nodeIndex++) {
        let node = NLC.nodesAndLinksData.nodes[nodeIndex]
        if (node.id === nodeToBeRemoved.id) {
            nodeIndexToDelete = nodeIndex
        }
    }
    if (nodeIndexToDelete != null) {
        NLC.nodesAndLinksData.nodes.splice(nodeIndexToDelete)
        delete nodesById[nodeToBeRemoved.id]
    }
    else {
        console.log("ERROR: could not find node to be deleted!")
    }

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes and nodesById)
    let nlcDataChange = {
        "method" : "delete",
        "path" : [ "nodes", nodeToBeRemoved.id],
        "data" : nodeToBeRemoved
    }
    NLC.dataChangesToStore.push(nlcDataChange)

    NLC.dataHasChanged = true
}


function createNewDiagram() {
    
    // FIXME: we should take into account default values and required fields!
    
    // Create the diagram locally
    
    let newName = "Nieuw" // FIXME: should we require a new to be typed first? (or is this edited afterwards?)
    
    let newDiagram = {
        "id" : null,
        "name" : newName,
        "identifier" : null
    }
    
    return newDiagram
}

function createNewNode(nodeTypeIdentifier) {
    
    // FIXME: we should take into account default values and required fields!
    
    // Create the node locally
    
    let newName = "Nieuw" // FIXME: should we require a new to be typed first? (or is this edited afterwards?)
    
    let newNode = {
        "id" : null,
        "type" : nodeTypeIdentifier,
        "commonData" : {
            "name" : newName,
            // FIXME; add more required fields (probably by using a pop-up/modal of sorts
        },
        "versions" : [
            // FIXME: what should we put in here?
        ],
        "environmentVersions" : {
            // FIXME: what should we put in here?
        },
        "diagramSpecificVisualData" : {
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!
            "DUMMY" : true
        }
    }
    
    return newNode
    
}

function storeNewDiagram(newDiagram) {
    let diagramsById = NLC.nodesAndLinksData.diagramsById

    diagramsById[newDiagram.id] = newDiagram
    NLC.nodesAndLinksData.diagrams.push(newDiagram)

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.diagrams and diagramsById)
    let nlcDataChange = {
        "method" : "insert",
        "path" : [ "diagrams"],
        "data" : newDiagram
    }
    NLC.dataChangesToStore.push(nlcDataChange)
    NLC.dataHasChanged = true
}

function storeNewNode(newNode) {
    let nodesById = NLC.nodesAndLinksData.nodesById

    nodesById[newNode.id] = newNode
    NLC.nodesAndLinksData.nodes.push(newNode)

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes and nodesById)
    let nlcDataChange = {
        "method" : "insert",
        "path" : [ "nodes"],
        "data" : newNode
    }
    NLC.dataChangesToStore.push(nlcDataChange)
    NLC.dataHasChanged = true
}

function createNewLink(linkTypeIdentifier, fromNodeId, toNodeId) {
    
    // FIXME: we should take into account default values and required fields!
    
    // Create the link locally
    
    let newNode = {
        "id" : null,
        "type" : linkTypeIdentifier,
        "fromNodeId" : fromNodeId,
        "toNodeId" : toNodeId,
        "commonData" : {
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!
            "DUMMY" : true,
            // FIXME; add more required fields (probably by using a pop-up/modal of sorts
        },
        "versions" : [
            // FIXME: what should we put in here?
        ],
        "environmentVersions" : {
            // FIXME: what should we put in here?
        },
        "diagramSpecificVisualData" : {
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!
            "DUMMY" : true
        }
    }
    
    return newNode
    
}

function storeNewLink(newLink) {
    
    let linksById = NLC.nodesAndLinksData.linksById

    linksById[newLink.id] = newLink
    NLC.nodesAndLinksData.links.push(newLink)

    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes and nodesById)
    let nlcDataChange = {
        "method" : "insert",
        "path" : [ "links"],
        "data" : newLink
    }
    NLC.dataChangesToStore.push(nlcDataChange)
    NLC.dataHasChanged = true
}

function addNodeToDiagram(node, diagramIdentifier) {
    
    // FIXME: create a more practival initial position!!
    let newLocalPosition = {
        "x" : 0,
        "y" : 0
    }
    node.diagramSpecificVisualData[diagramIdentifier] = {}
    node.diagramSpecificVisualData[diagramIdentifier].position = newLocalPosition
    
    // TODO: you probably want to apply this change in javascript too (on the node in nodesAndLinksData.nodes)
    let nlcDataChange = {
        "method" : "update",
        "path" : [ "nodes", node.id, "diagramSpecificVisualData", diagramIdentifier],
        "data" : node.diagramSpecificVisualData[diagramIdentifier]
    }
    NLC.dataChangesToStore.push(nlcDataChange)

    // TODO: maybe its better to call this: visualDataHasChanged ?
    NLC.dataHasChanged = true
}




// == Combining with ZUI ==

// FIXME: hardcoded!
ZUI.levelOfDetail = "high"
// FIMXE: ZUI.levelOfDetailFading (for fading-in or fading-out)
// FIXME: allowedLevelsOfDetail (for example: only-high, or: high and medium)


function nodeIsInDiagram(node, diagramIdentifier) {
    let nodeIsInDiagram = node.hasOwnProperty('diagramSpecificVisualData') && 
                          node.diagramSpecificVisualData.hasOwnProperty(diagramIdentifier)
    return nodeIsInDiagram
}

function setNodesAndLinksAsContainersAndConnections(diagramIdentifier) {
    
    // Removing all connections and containers
    initContainersAndConnections()

    let nodeIdsAddedToContainers = {}
    let nodes = NLC.nodesAndLinksData.nodes
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        let node = nodes[nodeIndex]
        
        let nodeInDiagram = nodeIsInDiagram(node, diagramIdentifier)
        if (!nodeInDiagram) {
            // The node does not have diagramSpecificVisualData for the selectedDiagram, so we are not going to show/add the node
            continue
        }
        
        let nodeHasLevelOfDetailProperties = node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty('lod')
        let nodeIsInCurrentLevelOfDetail = nodeHasLevelOfDetailProperties && node.diagramSpecificVisualData[diagramIdentifier].lod[ZUI.levelOfDetail]
        if (nodeHasLevelOfDetailProperties && !nodeIsInCurrentLevelOfDetail) {
            // TODO: we sometimes want to show a node *fading-out*. In that case we do want to show it: ZUI.levelOfDetailFading is needed
            // The node is not in the current levelOfDetail detail, so we are not going to show/add the node
            continue
        }
        
        let position = { 
            x: 100, // FIXME: use a default position? Or determine where there is room?? Or set to null?
            y: 100  // FIXME: use a default position? Or determine where there is room?? Or set to null?
        }
        if (node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty("position")) {
            position = node.diagramSpecificVisualData[diagramIdentifier].position
        }
        
        let size = { 
            width: 100, // FIXME: change to width of text!
            height: 100 // FIXME: get from visualInfo or part of shape?
        }
        if (node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty("size")) {
            size = node.diagramSpecificVisualData[diagramIdentifier].size
        }
        
        let containerInfo = {
            type: node.type,
            identifier: node.id,
            parentContainerIdentifier: 'root', // FIXME: hardcodes for now
            // FIXME; we cannot be sure commonDate.name exists!
            name: node.commonData.name,
            localPosition: {
                x: position.x,
                y: position.y
            },
            localScale: 1,
            localSize: size
        }

        createContainer(containerInfo)
        nodeIdsAddedToContainers[node.id] = true
    }

    // TODO: we currently set the absolute positions of the container before we add the connections. Is this required? Of should/can we do this after adding the connections?
    setContainerChildren()
    recalculateWorldPositionsAndSizes(null)


    for (let linkId in NLC.nodesAndLinksData.linksById) {
        let link = NLC.nodesAndLinksData.linksById[linkId]
        
        let fromAndToNodesAreAddedToDiagram = nodeIdsAddedToContainers.hasOwnProperty(link.fromNodeId) &&
                                              nodeIdsAddedToContainers.hasOwnProperty(link.toNodeId)
        
        if (!fromAndToNodesAreAddedToDiagram) {
            // TODO: better handling
            console.log("WARNING: link found but connected node(s) not found!")
            continue
        }
        
        let linkHasDiagramSpecificVisualData = link.hasOwnProperty('diagramSpecificVisualData') && 
                              link.diagramSpecificVisualData.hasOwnProperty(diagramIdentifier)
        if (!linkHasDiagramSpecificVisualData) {
            // The link does not have diagramSpecificVisualData for the selectedDiagram, so we SHOULD not show/add the node
            // FIXME: we should 'continue' here, but the DEFAULT right now is to add it anyway!
            // FIXME: continue
        }
        
        // FIXME: only IF we have diagramInfo AND we have 'lod' do we check for levelOfDetail right now!
        if (linkHasDiagramSpecificVisualData && link.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty('lod')) { 
            if (!link.diagramSpecificVisualData[diagramIdentifier].lod[ZUI.levelOfDetail]) {
                // TODO: we sometimes want to show a link *fading-out*. In that case we do want to show it: ZUI.levelOfDetailFading is needed
                // The link is not in the current levelOfDetail detail, so we are not going to show/add the node
                continue
            }
        }

        // link.dataType = sourceDataType
        let connectionInfo = {
            "identifier": link.id,
            "type": "??->??", // FIXME
            "dataType": "unknown", // FIXME
            "fromContainerIdentifier": link.fromNodeId,
            "toContainerIdentifier": link.toNodeId
        }
        
        if (linkHasDiagramSpecificVisualData) {
            if (link.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty('fromConnectionPointIdentifier')) {
                connectionInfo['fromConnectionPointIdentifier'] = link.diagramSpecificVisualData[diagramIdentifier]['fromConnectionPointIdentifier']
            }
            if (link.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty('toConnectionPointIdentifier')) {
                connectionInfo['toConnectionPointIdentifier'] = link.diagramSpecificVisualData[diagramIdentifier]['toConnectionPointIdentifier']
            }
        }
        
        createConnection(connectionInfo)
    }
    
}
