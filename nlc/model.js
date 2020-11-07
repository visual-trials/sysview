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
    
    
function storeChangesBetweenKnownUsers(originalKnownUsers, changedKnownUsers) {    
    let knownUsersChanges = []    
        
    originalKnownUsersById = groupById(originalKnownUsers)    
        
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused    
        
    for (let knownUserIndex = 0; knownUserIndex < changedKnownUsers.length; knownUserIndex++) {    
        let changedKnownUser = changedKnownUsers[knownUserIndex]    
        // FIXME: we should check if the id exists!    
        let originalKnownUser = originalKnownUsersById[changedKnownUser.id]    
            
        if (JSON.stringify(changedKnownUser.userPermissions) !== JSON.stringify(originalKnownUser.userPermissions) ) {    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "knownUsers", originalKnownUser.id, "userPermissions" ],    
                "data" : changedKnownUser.userPermissions    
            }    
            knownUsersChanges.push(nlcDataChange)    
                
            // FIXME: we do this here, but we normally do this below!    
            originalKnownUsersById[changedKnownUser.id].userPermissions = changedKnownUser.userPermissions    
        }    
            
    }    
    
    if (knownUsersChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(knownUsersChanges)    
            
        NLC.dataHasChanged = true    
            
        // FIXME: we now change the originals above!    
    }    
}    
    
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
        
    if (changedDiagram.level !== originalDiagram.level) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "diagrams", originalDiagram.id, "level" ],    
            "data" : changedDiagram.level    
        }    
        diagramChanges.push(nlcDataChange)    
    }    
    
    if (changedDiagram.projectUrl !== originalDiagram.projectUrl) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "diagrams", originalDiagram.id, "projectUrl" ],    
            "data" : changedDiagram.projectUrl    
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
    
    // TODO: compare each codeVersion individually!    
    if (JSON.stringify(changedNode.codeVersions) !== JSON.stringify(originalNode.codeVersions) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", originalNode.id, "codeVersions" ],    
            "data" : changedNode.codeVersions    
        }    
        nodeChanges.push(nlcDataChange)    
    }    
    // TODO: compare each functionalDocumentVersion individually!    
    if (JSON.stringify(changedNode.functionalDocumentVersions) !== JSON.stringify(originalNode.functionalDocumentVersions) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", originalNode.id, "functionalDocumentVersions" ],    
            "data" : changedNode.functionalDocumentVersions    
        }    
        nodeChanges.push(nlcDataChange)    
    }    
    // TODO: compare each technicalDocumentVersion individually!    
    if (JSON.stringify(changedNode.technicalDocumentVersions) !== JSON.stringify(originalNode.technicalDocumentVersions) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", originalNode.id, "technicalDocumentVersions" ],    
            "data" : changedNode.technicalDocumentVersions    
        }    
        nodeChanges.push(nlcDataChange)    
    }    
        
    if (JSON.stringify(changedNode.environmentSpecificData) !== JSON.stringify(originalNode.environmentSpecificData) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", originalNode.id, "environmentSpecificData" ],    
            "data" : changedNode.environmentSpecificData    
        }    
        nodeChanges.push(nlcDataChange)    
    }    
        
        
    if (nodeChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(nodeChanges)    
            
        NLC.dataHasChanged = true    
            
        // TODO: we should only do this if we accept the changes    
        // FIXME: We should copy all object-attributes BACK to the selectedNode (see above where we do the same for comparisons)    
        originalNode.commonData = changedNode.commonData    
        originalNode.codeVersions = changedNode.codeVersions    
        originalNode.functionalDocumentVersions = changedNode.functionalDocumentVersions    
        originalNode.technicalDocumentVersions = changedNode.technicalDocumentVersions    
        originalNode.environmentSpecificData = changedNode.environmentSpecificData    
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
    
    if (JSON.stringify(changedLink.environmentSpecificData) !== JSON.stringify(originalLink.environmentSpecificData) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "links", originalLink.id, "environmentSpecificData" ],    
            "data" : changedLink.environmentSpecificData    
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
    
    // FIXME: you probably don't need the stringify right?    
    if (JSON.stringify(changedLink.type) !== JSON.stringify(originalLink.type) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "links", originalLink.id, "type" ],    
            "data" : changedLink.type    
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
        originalLink.environmentSpecificData = changedLink.environmentSpecificData    
        originalLink.fromNodeId = changedLink.fromNodeId    
        originalLink.toNodeId = changedLink.toNodeId    
    }    
}    
    
function storeNodeLocalFontSizeInDiagram(nodeId, diagramIdentifier, localFontSize) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramIdentifier]) {    
                
            node.diagramSpecificVisualData[diagramIdentifier].localFontSize = localFontSize    
    
            // TODO: you probably want to apply this change in javascript to (on the node in nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramIdentifier, "localFontSize"],    
                "data" : localFontSize    
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
    let diagramsByIdentifier = NLC.nodesAndLinksData.diagramsByIdentifier    
    
    let diagramIndexToDelete = null    
    for (let diagramIndex = 0; diagramIndex < NLC.nodesAndLinksData.diagrams.length; diagramIndex++) {    
        let diagram = NLC.nodesAndLinksData.diagrams[diagramIndex]    
        if (diagram.identifier === diagramToBeRemoved.identifier) {    
            diagramIndexToDelete = diagramIndex    
        }    
    }    
    if (diagramIndexToDelete != null) {    
        NLC.nodesAndLinksData.diagrams.splice(diagramIndexToDelete)    
        delete diagramsByIdentifier[diagramToBeRemoved.identifier]    
    }    
    else {    
        console.log("ERROR: could not find diagram to be deleted!")    
    }    
        
    // FIXME: remove all visualData from nodes and links pointing to this diagram!    
        
    
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.diagrams and diagramsByIdentifier)    
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
        "codeVersions" : [],    
        "functionalDocumentVersions" : [],    
        "technicalDocumentVersions" : [],    
        "environmentSpecificData" : {    
            "T" : {    
                "DUMMY" : true,    
            },    
            "A" : {    
                "DUMMY" : true,    
            },    
            "P" : {    
                "DUMMY" : true,    
            }    
        },    
        "diagramSpecificVisualData" : {    
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!    
            "DUMMY" : true    
        }    
    }    
        
    return newNode    
        
}    
    
function storeNewDiagram(newDiagram) {    
    let diagramsByIdentifier = NLC.nodesAndLinksData.diagramsByIdentifier    
    
    diagramsByIdentifier[newDiagram.identifier] = newDiagram    
    NLC.nodesAndLinksData.diagrams.push(newDiagram)    
    
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.diagrams and diagramsByIdentifier)    
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
        
    let newLink = {    
        "id" : null,    
        "type" : linkTypeIdentifier,    
        "fromNodeId" : fromNodeId,    
        "toNodeId" : toNodeId,    
        "commonData" : {    
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!    
            "DUMMY" : true,    
            // FIXME; add more required fields (probably by using a pop-up/modal of sorts    
        },    
        "environmentSpecificData" : {    
            // FIXME: what should we put in here?    
            "T" : {    
                "DUMMY" : true,    
            },    
            "A" : {    
                "DUMMY" : true,    
            },    
            "P" : {    
                "DUMMY" : true,    
            }    
        },    
        "diagramSpecificVisualData" : {    
// FIXME: WORKAROUND! (api.php doesnt know this is/should be an associative array, so we force it this way!    
            "DUMMY" : true    
        }    
    }    
        
    return newLink    
        
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
    
function linkIsInDiagram(link, diagramIdentifier) {    
    // FIXME: should we not explicitily store links as being in a diagram?    
        
    // FIXME: what about LOD? Should we chech that too?    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
    let fromNode = nodesById[link.fromNodeId]    
    let toNode = nodesById[link.toNodeId]    
        
    let linkIsInDiagram = fromNode != null &&     
                          toNode != null &&    
                          nodeIsInDiagram(fromNode, diagramIdentifier) &&    
                          nodeIsInDiagram(toNode, diagramIdentifier)    
    return linkIsInDiagram    
}    
    
    
    
// FIXME: make this more generic!    
//   OR    
// FIXME: move this function out of model.js (into a more specific file)    
function getColorNamesWithLightForNode (node, selectedLegendaId) {    
        
    if (selectedLegendaId == null) {    
        return null    
    }    
        
    let selectedLegenda = NLC.nodesAndLinksData.legendasById[selectedLegendaId]    
    let colorMapping = selectedLegenda.colorMapping    
        
    let colorNamesWithLight = null    
    if (selectedLegenda.field === 'type') {    
        let nodeTypeIdentifier = node.type    
        // TODO: hardcoded exception!    
        if (nodeTypeIdentifier === 'Mediation' && 'iraType' in node.commonData && node.commonData['iraType'] === 'BS') {    
            nodeTypeIdentifier = 'Mediation|BS'    
        }    
        if (colorMapping.hasOwnProperty(nodeTypeIdentifier)) {    
            colorNamesWithLight = colorMapping[nodeTypeIdentifier]    
        }    
    }    
    else if (selectedLegenda.field === 'dataType') {    
        for (let colorMappingIndex = 0; colorMappingIndex < selectedLegenda.colorMappings.length; colorMappingIndex++) {    
            let colorMap = selectedLegenda.colorMappings[colorMappingIndex]    
            let shouldMatchWith = colorMap.shouldMatchWith    
            if (node.commonData.hasOwnProperty('dataType') && node.commonData.dataType.toUpperCase() === shouldMatchWith.toUpperCase()) {    
                colorNamesWithLight = colorMap    
                break    
            }    
        }    
            
        if (colorNamesWithLight == null && selectedLegenda.defaultColor) {    
            colorNamesWithLight = selectedLegenda.defaultColor    
        }    
            
    }    
    else if (selectedLegenda.field === 'migrationPlanning') {    
        let colorKey = null    
            
        let selectedDate = new Date(ikbApp.selectedDateISO)    
        if (selectedDate) {    
            if ('plannedMigrationDate' in node.commonData) {    
                let daysToStart = 30    
                let daysToMigrate = 90    
                let plannedMigrationDate = new Date(node.commonData.plannedMigrationDate)    
                let startingMigrationDate = new Date(plannedMigrationDate)    
                let doingMigrationDate = new Date(plannedMigrationDate)    
                startingMigrationDate.setDate(plannedMigrationDate.getDate() - daysToMigrate - daysToStart)    
                doingMigrationDate.setDate(plannedMigrationDate.getDate() - daysToMigrate)    
                    
                if (selectedDate > plannedMigrationDate) {    
                    colorKey = 'migrated'    
                }    
                else if (selectedDate >= startingMigrationDate && selectedDate < doingMigrationDate) {    
                    colorKey = 'starting_to_migrate'    
                }    
                else if (selectedDate >= doingMigrationDate && selectedDate < plannedMigrationDate) {    
                    colorKey = 'migrating'    
                }    
            }    
            
            
        }    
            
            
        if (colorKey != null && colorMapping.hasOwnProperty(colorKey)) {    
            colorNamesWithLight = colorMapping[colorKey]    
        }    
        if (colorNamesWithLight == null && selectedLegenda.defaultColor) {    
            colorNamesWithLight = selectedLegenda.defaultColor    
        }    
    }    
    else if (selectedLegenda.field === 'T_vs_P') {    
        let colorKey = null    
            
        if ('environmentSpecificData' in node) {    
                
            let deployedP = ('P' in node.environmentSpecificData) && node.environmentSpecificData.P.deployedTAB === 'Ja'    
            let deployedT = ('T' in node.environmentSpecificData) && node.environmentSpecificData.T.deployedTAB === 'Ja'    
            let versionTKnown = ('T' in node.environmentSpecificData) && ('codeVersionId' in node.environmentSpecificData.T) && node.environmentSpecificData.T.codeVersionId    
            let versionPKnown = ('P' in node.environmentSpecificData) && ('codeVersionId' in node.environmentSpecificData.P) && node.environmentSpecificData.P.codeVersionId    
                
            if (deployedT && !deployedP) {    
                // We have a code version in T, but not in P    
                colorKey = 'in_T_but_not_in_P'    
            }    
            else if (!deployedT && deployedP) {    
                colorKey = 'in_P_but_not_in_T'    
            }    
            else if (!deployedT && !deployedP) {    
                // not in T and not in P, we do nothing (= default color)    
            }    
            else if (!versionTKnown || !versionPKnown) {    
                // both T and P have been deployed, but we don't known both versions (so we cant compare them)    
                colorKey = 'in_T_and_in_P'    
            }    
            else if (versionTKnown &&  versionPKnown && node.environmentSpecificData.P.codeVersionId === node.environmentSpecificData.T.codeVersionId) {    
                // we know both versions and the are the same    
                colorKey = 'same_version_in_T_and_P'    
            }    
            else if (versionTKnown && versionPKnown && node.environmentSpecificData.P.codeVersionId !== node.environmentSpecificData.T.codeVersionId) {    
                // TODO: we could still check if the version in P is higher or lower than in T    
                colorKey = 'different_version_in_T_and_P'    
            }    
            else {    
                console.log("ERROR: when determining the colors for T_vs_P we cane to a combination of environmentSpecificData that was not forseen!")    
            }    
        }    
                
        if (colorKey != null && colorMapping.hasOwnProperty(colorKey)) {    
            colorNamesWithLight = colorMapping[colorKey]    
        }    
        if (colorNamesWithLight == null && selectedLegenda.defaultColor) {    
            colorNamesWithLight = selectedLegenda.defaultColor    
        }    
    }    
    else {    
        // This is the generic case (no hardcoded exceptions)    
        if (selectedLegenda.field in node.commonData) {    
            let nodeTypeIdentifier = node.commonData[selectedLegenda.field]    
            if (colorMapping.hasOwnProperty(nodeTypeIdentifier)) {    
                colorNamesWithLight = colorMapping[nodeTypeIdentifier]    
            }    
        }    
        if (colorNamesWithLight == null && selectedLegenda.defaultColor) {    
            colorNamesWithLight = selectedLegenda.defaultColor    
        }    
    }    
    return colorNamesWithLight    
}    
    
// FIXME: move this function out of model.js (into a more specific file)    
function getColorNamesWithLightForLink (link, selectedLegendaId) {    
        
    if (selectedLegendaId == null) {    
        return null    
    }    
        
    let selectedLegenda = NLC.nodesAndLinksData.legendasById[selectedLegendaId]    
    let colorMapping = selectedLegenda.colorMapping    
        
    let colorNamesWithLight = null    
    if (selectedLegenda.field === 'type') {    
        if (colorMapping.hasOwnProperty(link.type)) {    
            colorNamesWithLight = colorMapping[link.type]    
        }    
    }    
    else if (selectedLegenda.field === 'dataType') {    
        for (let colorMappingIndex = 0; colorMappingIndex < selectedLegenda.colorMappings.length; colorMappingIndex++) {    
            let colorMap = selectedLegenda.colorMappings[colorMappingIndex]    
            let shouldMatchWith = colorMap.shouldMatchWith    
            if (link.commonData.hasOwnProperty('dataType') && link.commonData.dataType.toUpperCase() === shouldMatchWith.toUpperCase()) {    
                colorNamesWithLight = colorMap    
                break    
            }    
        }    
            
        if (colorNamesWithLight == null && selectedLegenda.defaultColor) {    
            colorNamesWithLight = selectedLegenda.defaultColor    
        }    
            
    }    
    else if (selectedLegenda.field === 'T_vs_P') {    
        /*     
        let colorKey = null    
            
        // FIXME: as long as we don't have versions for links this wont work!    
                
        if (colorKey != null && colorMapping.hasOwnProperty(colorKey)) {    
            colorNamesWithLight = colorMapping[colorKey]    
        }    
        */    
    }    
    return colorNamesWithLight    
}    
    
function getNodeTypeInfo(node) {    
    let nodeTypeIdentifier = node.type    
    
    // FIXME: looping through all nodesTypes is a kinda slow: we should use nodeTypesById    
    for (let nodeTypeId = 0; nodeTypeId < NLC.nodesAndLinksData.nodeTypes.length; nodeTypeId++) {    
        let nodeTypeInfo = NLC.nodesAndLinksData.nodeTypes[nodeTypeId]    
        if (nodeTypeInfo.identifier === nodeTypeIdentifier) {    
            if ("_overridesBasedOnCommonDataValue" in nodeTypeInfo) {    
                // TODO: can we make a faster deep-copy of nodeTypeInfo?    
                nodeTypeInfo = JSON.parse(JSON.stringify(nodeTypeInfo))    
                for (let overrideIndex = 0; overrideIndex < nodeTypeInfo._overridesBasedOnCommonDataValue.length; overrideIndex++) {    
                    let overrideBasedOnCommonDataValue = nodeTypeInfo._overridesBasedOnCommonDataValue[overrideIndex]    
                    let keyToMatch = overrideBasedOnCommonDataValue["keyToMatch"]    
                    let valueToMatch = overrideBasedOnCommonDataValue["valueToMatch"]    
                    if (keyToMatch in node.commonData && node.commonData[keyToMatch] === valueToMatch) {    
                        for (let keyToOverride in overrideBasedOnCommonDataValue.overrides) {    
                            nodeTypeInfo[keyToOverride] = overrideBasedOnCommonDataValue.overrides[keyToOverride]    
                        }    
                    }    
                    // TODO: we can probably break here if we want the first match to override. (now it continues to find matches)    
                }    
            }    
            return nodeTypeInfo    
        }    
    }    
    return null    
}    
    
function getLinkTypeInfo(link) {    
    let linkTypeIdentifier = link.type    
    // FIXME: this is a kinda slow: we should use linkTypesById    
    for (let linkTypeId = 0; linkTypeId < NLC.nodesAndLinksData.linkTypes.length; linkTypeId++) {    
        let linkTypeInfo = NLC.nodesAndLinksData.linkTypes[linkTypeId]    
        if (linkTypeInfo.identifier === linkTypeIdentifier) {    
            if ("_overridesBasedOnCommonDataValue" in linkTypeInfo) {    
                // TODO: can we make a faster deep-copy of nodeTypeInfo?    
                linkTypeInfo = JSON.parse(JSON.stringify(linkTypeInfo))    
                for (let overrideIndex = 0; overrideIndex < linkTypeInfo._overridesBasedOnCommonDataValue.length; overrideIndex++) {    
                    let overrideBasedOnCommonDataValue = linkTypeInfo._overridesBasedOnCommonDataValue[overrideIndex]    
                    let keyToMatch = overrideBasedOnCommonDataValue["keyToMatch"]    
                    let valueToMatch = overrideBasedOnCommonDataValue["valueToMatch"]    
                    if (keyToMatch in link.commonData && link.commonData[keyToMatch] === valueToMatch) {    
                        for (let keyToOverride in overrideBasedOnCommonDataValue.overrides) {    
                            linkTypeInfo[keyToOverride] = overrideBasedOnCommonDataValue.overrides[keyToOverride]    
                        }    
                    }    
                    // TODO: we can probably break here if we want the first match to override. (now it continues to find matches)    
                }    
            }    
            return linkTypeInfo    
        }    
    }    
    return null    
}    
    
function setNodesAndLinksAsContainersAndConnections(diagramIdentifier, selectedLegendaId) {    
    
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
            
        let localScale = 1    
        /*    
        // TODO: this is an intereting idea!    
        if (ZUI.levelOfDetail === 'medium') {    
            localScale = 2    
        }    
        */    
            
        let nodeTypeInfo = getNodeTypeInfo(node)    
        if (nodeTypeInfo != null) {    
            let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
            let nodeTypeIsInCurrentLevelOfDetail = nodeTypeHasLevelOfDetailProperties && nodeTypeInfo.lod[ZUI.levelOfDetail]    
            if (nodeTypeHasLevelOfDetailProperties && !nodeTypeIsInCurrentLevelOfDetail) {    
                // TODO: we sometimes want to show a node *fading-out*. In that case we do want to show it: ZUI.levelOfDetailFading is needed    
                // The node is not in the current levelOfDetail detail, so we are not going to show/add the node    
                continue    
            }    
        }    
            
        let position = {     
            x: 96, // FIXME: use a default position? Or determine where there is room?? Or set to null?    
            y: 96  // FIXME: use a default position? Or determine where there is room?? Or set to null?    
        }    
        if (node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty("position")) {    
            position = node.diagramSpecificVisualData[diagramIdentifier].position    
        }    
            
        let size = {     
            width: 96, // FIXME: change to width of text!    
            height: 96 // FIXME: get from visualInfo or part of shape?    
        }    
        if (node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty("size")) {    
            size = node.diagramSpecificVisualData[diagramIdentifier].size    
        }    
            
        let localFontSize = 14    
        if (node.diagramSpecificVisualData[diagramIdentifier].hasOwnProperty("localFontSize")) {    
            localFontSize = node.diagramSpecificVisualData[diagramIdentifier].localFontSize    
        }    
            
        let shape = null    
        let textBelowContainer = null    
        if (nodeTypeInfo != null) {    
            if ('shapeAndColor' in nodeTypeInfo) {    
                if ('shape' in nodeTypeInfo.shapeAndColor) {    
                    shape = nodeTypeInfo.shapeAndColor.shape    
                }    
                if ('textBelowContainer' in nodeTypeInfo.shapeAndColor) {    
                    textBelowContainer = nodeTypeInfo.shapeAndColor.textBelowContainer    
                }    
            }    
            else {    
                console.log("ERROR: no shape and color info : " + node)    
            }    
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
            localScale: localScale,    
            localSize: size,    
            localFontSize : localFontSize,    
            shape : shape,    
            textBelowContainer : textBelowContainer    
        }    
            
        let colorsForNode = null    
        let colorNamesWithLight = getColorNamesWithLightForNode(node, selectedLegendaId)    
        if (colorNamesWithLight != null) {    
            let colors = {}    
            containerInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
            containerInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
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
            // If either the fromNode or the toNode is not added to the diagram, we do not add the link connecting them    
            continue    
        }    
            
        let linkHasDiagramSpecificVisualData = link.hasOwnProperty('diagramSpecificVisualData') &&     
                              link.diagramSpecificVisualData.hasOwnProperty(diagramIdentifier)    
        if (!linkHasDiagramSpecificVisualData) {    
            // The link does not have diagramSpecificVisualData for the selectedDiagram, so we SHOULD not show/add the node    
            // FIXME: we should 'continue' here, but the DEFAULT right now is to add it anyway!    
            // FIXME: continue    
        }    
            
        let linkTypeInfo = getLinkTypeInfo(link)    
        if (linkTypeInfo != null) {    
                
            let linkTypeHasLevelOfDetailProperties = linkTypeInfo.hasOwnProperty('lod')    
            let linkTypeIsInCurrentLevelOfDetail = linkTypeHasLevelOfDetailProperties && linkTypeInfo.lod[ZUI.levelOfDetail]    
            if (linkTypeHasLevelOfDetailProperties && !linkTypeIsInCurrentLevelOfDetail) {    
                // TODO: we sometimes want to show a link *fading-out*. In that case we do want to show it: ZUI.levelOfDetailFading is needed    
                // The link is not in the current levelOfDetail detail, so we are not going to show/add the link    
                continue    
            }    
                
        }    
    
        // link.dataType = sourceDataType    
        let connectionInfo = {    
            "identifier": link.id,    
            "name": link.commonData.dataType,  // TODO:  we are assuming commonData.dataType exists here!    
            "type": link.type,    
            "dataType": link.dataType,    
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
            
        let colorsForLink = null    
        let colorNamesWithLight = getColorNamesWithLightForLink(link, selectedLegendaId)    
        if (colorNamesWithLight != null) {    
            let colors = {}    
            connectionInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
            connectionInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
        }    
    
        createConnection(connectionInfo)    
    }    
        
}    
    
function groupById (listWithIds) {    
    let elementsById = {}    
    for (let index = 0; index < listWithIds.length; index++) {    
        let listElement = listWithIds[index]    
        elementsById[listElement.id] = listElement    
    }    
    return elementsById    
}    
