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

function addSourcePointToSourcePage(sourcePage, sourcePoint) {    
        
    if (!('sourcePoints' in sourcePage)) {
        sourcePage.sourcePoints = []
    }
    sourcePage.sourcePoints.push(sourcePoint)
    
    let nlcDataChange = {    
        "method" : "insert",    
        "path" : [ "sourcePages", sourcePage.id, "sourcePoints" ],
        "data" : sourcePoint
    }
    NLC.dataChangesToStore.push(nlcDataChange)    
    
    // TODO: maybe its better to call this: visualDataHasChanged ?    
    NLC.dataHasChanged = true    
}    

function storeSourcePointNodeId(sourcePage, originalSourcePoint, nodeId) {    

    let sourcePagesChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point nodeid and the new nodeid
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourcePages", sourcePage.id, "sourcePoints", originalSourcePoint.id, "nodeId" ],    
            "data" : nodeId
        }    
        originalSourcePoint.nodeId = nodeId
        sourcePagesChanges.push(nlcDataChange)    
    }
                
    if (sourcePagesChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourcePagesChanges)    
        NLC.dataHasChanged = true
    }

}    

function storeSourcePointLocalPosition(sourcePage, originalSourcePoint, localPosition) {    

    let sourcePagesChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point position and the new position
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourcePages", sourcePage.id, "sourcePoints", originalSourcePoint.id, "position" ],    
            "data" : localPosition
        }    
        originalSourcePoint.position = localPosition
        sourcePagesChanges.push(nlcDataChange)    
    }
                
    if (sourcePagesChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourcePagesChanges)    
        NLC.dataHasChanged = true
    }

}    

function storeSourcePointLocalSize(sourcePage, originalSourcePoint, localSize) {    

    let sourcePagesChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point size and the new size
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourcePages", sourcePage.id, "sourcePoints", originalSourcePoint.id, "size" ],    
            "data" : localSize
        }    
        originalSourcePoint.size = localSize
        sourcePagesChanges.push(nlcDataChange)    
    }
                
    if (sourcePagesChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourcePagesChanges)    
        NLC.dataHasChanged = true
    }

}    

function storeChangesBetweenKnownUsers(originalKnownUsers, changedKnownUsers) {    
    let knownUsersChanges = []    
        
    originalKnownUsersById = groupById(originalKnownUsers)    
        
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused    
        
    for (let knownUserIndex = 0; knownUserIndex < changedKnownUsers.length; knownUserIndex++) {    
        let changedKnownUser = changedKnownUsers[knownUserIndex]    
        // FIXME: we should check if the id exists!    
        let originalKnownUser = originalKnownUsersById[changedKnownUser.id]    
            
        if (changedKnownUser.teamId !== originalKnownUser.teamId) {    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "knownUsers", originalKnownUser.id, "teamId" ],    
                "data" : changedKnownUser.teamId
            }    
            knownUsersChanges.push(nlcDataChange)    
            
            // FIXME: we do this here, but we normally do this below!    
            originalKnownUsersById[changedKnownUser.id].teamId = changedKnownUser.teamId
        }    
            
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
        
    // FIXME: you probably don't need the stringify right?    
    if (JSON.stringify(changedNode.type) !== JSON.stringify(originalNode.type) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", originalNode.id, "type" ],    
            "data" : changedNode.type    
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
    
function storeNodeLocalFontSizeInDiagram(nodeId, diagramId, localFontSize) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
                
            node.diagramSpecificVisualData[diagramId].localFontSize = localFontSize    
    
            // TODO: you probably want to apply this change in javascript to (on the node in nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId, "localFontSize"],    
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
    
function storeNodeLocalPositionInDiagram (nodeId, diagramId, localPosition) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
            // TODO: do we really need to make a clone here?    
            let newLocalPosition = {    
                "x" : localPosition.x,    
                "y" : localPosition.y    
            }    
                
            node.diagramSpecificVisualData[diagramId].position = newLocalPosition    
    
            // TODO: you probably want to apply this change in javascript to (on the node in nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId, "position"],    
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
    
function storeNodeLocalSizeInDiagram(nodeId, diagramId, localSize) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
            // TODO: do we really need to make a clone here?    
            let newLocalSize = {    
                "width" : localSize.width,    
                "height" : localSize.height    
            }    
                
            node.diagramSpecificVisualData[diagramId].size = newLocalSize    
    
            // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId, "size"],    
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
    
function removeNodeFromDiagram(nodeId, diagramId) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
    
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
            // We are removing the node from the diagram (or actually: the diagram info from the node)    
            delete node.diagramSpecificVisualData[diagramId]    
                
            // TODO: you probably want to apply this change in javascript to (on the link in NLC.nodesAndLinksData.links)    
            let nlcDataChange = {    
                "method" : "delete",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId],    
                "data" : null    
            }    
            NLC.dataChangesToStore.push(nlcDataChange)    
        }    
            
        // TODO: maybe its better to call this: visualDataHasChanged ?    
        NLC.dataHasChanged = true    
    }    
}    
    
function storeLinkConnectionPointIdentifierInDiagram(linkId, diagramId, fromOrTo, connectionPointIdentifier) {    
      
    let linksById = NLC.nodesAndLinksData.linksById    
        
    if (linksById.hasOwnProperty(linkId)) {    
        let link = linksById[linkId]    
    
        // If there is no diagramSpecificVisualData, we create if and fill it with empy visualData for this diagram
        if (!link.hasOwnProperty('diagramSpecificVisualData')) {    
                
            let diagramSpecificVisualData = {}    
            diagramSpecificVisualData[diagramId] = {}    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "links", linkId, "diagramSpecificVisualData"],    
                "data" : diagramSpecificVisualData
            }    
            link.diagramSpecificVisualData = diagramSpecificVisualData
            NLC.dataChangesToStore.push(nlcDataChange)    
        }    
        // If there is diagramSpecificVisualData but not for this diagram, we fill it with empy visualData for this diagram
        if (!link.diagramSpecificVisualData.hasOwnProperty(diagramId)) {    
                
            let visualData = {}    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "links", linkId, "diagramSpecificVisualData", diagramId],
                "data" : visualData
            }    
            link.diagramSpecificVisualData[diagramId] = visualData
            NLC.dataChangesToStore.push(nlcDataChange)    
        }    
                
        let keyToStore = 'fromConnectionPointIdentifier'    
        if (fromOrTo === 'to') {    
            keyToStore = 'toConnectionPointIdentifier'    
        }    
        link.diagramSpecificVisualData[diagramId][keyToStore] = connectionPointIdentifier    
            
        // TODO: you probably want to apply this change in javascript to (on the link in NLC.nodesAndLinksData.links)    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "links", linkId, "diagramSpecificVisualData", diagramId, keyToStore],    
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
    
    // FIXME: also remove nodeIds from sourcePages/sourcePoints!!
        
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
        },    
        "codeVersions" : [],    
        "functionalDocumentVersions" : [],    
        "technicalDocumentVersions" : [],    
        "environmentSpecificData" : {    
            "T" : {},    
            "A" : {},    
            "P" : {}    
        },    
        "diagramSpecificVisualData" : {}    
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
        "data" : newNode    // FIXME: we should make a clone of the newNode, since other changes may be applied to it, which should not be included in the insert here
                            //        in this specific case: the node is created and the node is (right after that) added to a diagram. But in the insert the diagram info is already included (which is incorrect)
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
        "commonData" : {},    
        "environmentSpecificData" : {
            "T" : {},    
            "A" : {},    
            "P" : {}    
        },    
        "diagramSpecificVisualData" : {}    
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
    
function addNodeToDiagram(node, diagramId) {    
    
    // FIXME: we now cast the diagramId to a string, since keys of type int are not allowed (in JSON/BSON). 
    //        we should probably not use diagramIds as keys anyway but store the diagramSpecificVisualData inside the diagram instead and point towards the node/links.
    let diagramIdString = '' + diagramId
    
    // FIXME: create a more practival initial position!!    
    let newLocalPosition = {    
        "x" : 0,    
        "y" : 0    
    }    
    node.diagramSpecificVisualData[diagramIdString] = {}    
    node.diagramSpecificVisualData[diagramIdString].position = newLocalPosition    
        
    // TODO: you probably want to apply this change in javascript too (on the node in nodesAndLinksData.nodes)    
    let nlcDataChange = {    
        "method" : "update",    
        "path" : [ "nodes", node.id, "diagramSpecificVisualData", diagramIdString],    
        "data" : node.diagramSpecificVisualData[diagramIdString]    
    }    
    NLC.dataChangesToStore.push(nlcDataChange)    
    
    // TODO: maybe its better to call this: visualDataHasChanged ?    
    NLC.dataHasChanged = true    
}    
    
    
    
    
// == Combining with ZUI ==    
    
// FIXME: hardcoded!    
NLC.levelOfDetail = "high"    
// FIMXE: ZUI.levelOfDetailFading (for fading-in or fading-out)    
// FIXME: allowedLevelsOfDetail (for example: only-high, or: high and medium)    
    
    
function nodeIsInDiagram(node, diagramId) {    
    let nodeIsInDiagram = node.hasOwnProperty('diagramSpecificVisualData') &&     
                          node.diagramSpecificVisualData.hasOwnProperty(diagramId)    
    return nodeIsInDiagram    
}    
    
function linkIsInDiagram(link, diagramId) {    
    // FIXME: should we not explicitily store links as being in a diagram?    
        
    // FIXME: what about LOD? Should we chech that too?    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
    let fromNode = nodesById[link.fromNodeId]    
    let toNode = nodesById[link.toNodeId]    
        
    let linkIsInDiagram = fromNode != null &&     
                          toNode != null &&    
                          nodeIsInDiagram(fromNode, diagramId) &&    
                          nodeIsInDiagram(toNode, diagramId)    
    return linkIsInDiagram    
}    
    
    
    
// FIXME: make this more generic!    
//   OR    
// FIXME: move this function out of model.js (into a more specific file)    
function getColorNamesWithLightForNode (node, selectedLegendaId, dimUninteresting, teamId) {    

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
            
        // FIMXE: referring to ikbApp here!!
        let selectedDate = new Date(ikbApp.dateSelector.selectedDateISO)
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
    else if (selectedLegenda.field === 'isInSourcePage') {
        let colorKey = null    
        if ('isInSourcePages' in node) {
            colorKey = 'isInAtLeastOneSourcePage'
            
            // FIMXE: referring to ikbApp here!!
            if (ikbApp.currentlySelectedSourcePageId && 
                ikbApp.currentlySelectedSourcePageId in node.isInSourcePages &&
                node.isInSourcePages[ikbApp.currentlySelectedSourcePageId]) {
                colorKey = 'isInCurrentSourcePage'
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


    if (colorNamesWithLight != null) {
        colorNamesWithLight.doDim = false
        if (dimUninteresting) {
            // FIXME: this is very specific and should be put into a more specific place!
            colorNamesWithLight.doDim = true
            if ('responsibleTeamId' in node.commonData &&
                teamId && node.commonData.responsibleTeamId === teamId) {
                colorNamesWithLight.doDim = false
            }
        }
    }
    
    return colorNamesWithLight    
}    
    
// FIXME: move this function out of model.js (into a more specific file)    
function getColorNamesWithLightForLink (link, selectedLegendaId, dimUninteresting, teamId) {    
        
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
    
    if (colorNamesWithLight != null) {
        colorNamesWithLight.doDim = false
        if (dimUninteresting) {
            // FIXME: this is very specific and should be put into a more specific place!
            colorNamesWithLight.doDim = true
            if ('responsibleTeamId' in link.commonData &&
                teamId && link.commonData.responsibleTeamId === teamId) {
                colorNamesWithLight.doDim = false
            }
        }
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
    
function setNodesAndLinksAsContainersAndConnections(diagramId, selectedLegendaId, dimUninteresting, teamId) {    
    
    // Removing all connections and containers    
    initContainersAndConnections()    
    
    let nodeIdsAddedToContainers = {}    
    let nodes = NLC.nodesAndLinksData.nodes    
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {    
        let node = nodes[nodeIndex]    
            
        let nodeInDiagram = nodeIsInDiagram(node, diagramId)    
        if (!nodeInDiagram) {    
            // The node does not have diagramSpecificVisualData for the selectedDiagram, so we are not going to show/add the node    
            continue    
        }    
            
        let localScale = 1    
        /*    
        // TODO: this is an intereting idea!    
        if (NLC.levelOfDetail === 'medium') {    
            localScale = 2    
        }    
        */    
            
        let nodeTypeInfo = getNodeTypeInfo(node)    
        if (nodeTypeInfo != null) {    
            let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
            let nodeTypeIsInCurrentLevelOfDetail = nodeTypeHasLevelOfDetailProperties && nodeTypeInfo.lod[NLC.levelOfDetail]    
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
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("position")) {    
            position = node.diagramSpecificVisualData[diagramId].position    
        }    
            
        let size = {     
            width: 96, // FIXME: change to width of text!    
            height: 96 // FIXME: get from visualInfo or part of shape?    
        }    
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("size")) {    
            size = node.diagramSpecificVisualData[diagramId].size    
        }    
            
        let localFontSize = 14    
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("localFontSize")) {    
            localFontSize = node.diagramSpecificVisualData[diagramId].localFontSize    
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
        let colorNamesWithLight = getColorNamesWithLightForNode(node, selectedLegendaId, dimUninteresting, teamId)
        if (colorNamesWithLight != null) {    
            let colors = {}    
            containerInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
            containerInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
            if (colorNamesWithLight.doDim) {
                containerInfo.alpha = 0.3
            }
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
                              link.diagramSpecificVisualData.hasOwnProperty(diagramId)    
        if (!linkHasDiagramSpecificVisualData) {    
            // The link does not have diagramSpecificVisualData for the selectedDiagram, so we SHOULD not show/add the node    
            // FIXME: we should 'continue' here, but the DEFAULT right now is to add it anyway!    
            // FIXME: continue    
        }    
            
        let linkTypeInfo = getLinkTypeInfo(link)    
        if (linkTypeInfo != null) {    
                
            let linkTypeHasLevelOfDetailProperties = linkTypeInfo.hasOwnProperty('lod')    
            let linkTypeIsInCurrentLevelOfDetail = linkTypeHasLevelOfDetailProperties && linkTypeInfo.lod[NLC.levelOfDetail]    
            if (linkTypeHasLevelOfDetailProperties && !linkTypeIsInCurrentLevelOfDetail) {    
                // TODO: we sometimes want to show a link *fading-out*. In that case we do want to show it: NLC.levelOfDetailFading is needed    
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
            if (link.diagramSpecificVisualData[diagramId].hasOwnProperty('fromConnectionPointIdentifier')) {    
                connectionInfo['fromConnectionPointIdentifier'] = link.diagramSpecificVisualData[diagramId]['fromConnectionPointIdentifier']    
            }    
            if (link.diagramSpecificVisualData[diagramId].hasOwnProperty('toConnectionPointIdentifier')) {    
                connectionInfo['toConnectionPointIdentifier'] = link.diagramSpecificVisualData[diagramId]['toConnectionPointIdentifier']    
            }    
        }    
            
        let colorsForLink = null    
        let colorNamesWithLight = getColorNamesWithLightForLink(link, selectedLegendaId, dimUninteresting, teamId)    
        if (colorNamesWithLight != null) {    
            let colors = {}    
            connectionInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
            connectionInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
            if (colorNamesWithLight.doDim) {
                connectionInfo.alpha = 0.3
            }
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
