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


// Known users

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


// Teams
    
function createNewTeam() {    
        
    // FIXME: we should take into account default values and required fields!    
        
    // Create the team locally    
        
    let newName = "Nieuw" // FIXME: should we require a new to be typed first? (or is this edited afterwards?)    
        
    let newTeam = {    
        "id" : null,    
        "name" : newName,    
    }    
        
    return newTeam
}    
    
function storeChangesBetweenTeams(originalTeams, changedTeams) {    
    let teamsChanges = []
    
    let originalTeamsById = groupById(originalTeams)
    let changedTeamsById = groupById(changedTeams)
        
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused
    
    for (let teamIndex = 0; teamIndex < changedTeams.length; teamIndex++) {    
        let changedTeam = changedTeams[teamIndex]    
        // FIXME: we should check if the id exists!    
        
        if (changedTeam.id in originalTeamsById) {
            let originalTeam = originalTeamsById[changedTeam.id]    
                
            if (changedTeam.name !== originalTeam.name) {    
                let nlcDataChange = {    
                    "method" : "update",    
                    "path" : [ "teams", originalTeam.id, "name" ],    
                    "data" : changedTeam.name
                }    
                teamsChanges.push(nlcDataChange)    
                
                // FIXME: we do this here, but we normally do this below!    
                originalTeamsById[changedTeam.id].name = changedTeam.name
            }    
        }
        else {
            // The id of the changedTeam is not in the originalTeamsById. We are assuming this team was added, so we insert it
        
            let nlcDataChange = {    
                "method" : "insert",    
                "path" : [ "teams"],    
                "data" : changedTeam
            }
            teamsChanges.push(nlcDataChange)
            // FIXME: we probably only want to copy certain fields here
            originalTeamsById[changedTeam.id] = changedTeam
            originalTeams.push(changedTeam)
        }
        
    }    
    
    if (teamsChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(teamsChanges)    
            
        NLC.dataHasChanged = true
        
        // FIXME: we now change the originals above!    
    }
    
    // Also removing teams that are not in changedTeams anyomre
    for (let originalTeamIndex in originalTeams) {
        let originalTeam = originalTeams[originalTeamIndex]
        if (!(originalTeam.id in changedTeamsById)) {
            // The original team is not in the changed teams anymore, so we remove it
            if (removeTeam(originalTeam)) {
                // Note that this will also have the effect extending NLC.dataChangesToStore and NLC.dataHasChanged = true
            }
            else {
                console.log("ERROR: tried to remove team (due to not being in the changedTeams anymore), but could not remove it!")
            }
        }
    }
    
}    

function getNumberOfTeamMembers (teamId) {
    let numberOfTeamMembers = 0
    for (let knownUserIndex in NLC.nodesAndLinksData.knownUsers) {
        let knownUser = NLC.nodesAndLinksData.knownUsers[knownUserIndex]

        if (knownUser.teamId && knownUser.teamId == teamId) {
            numberOfTeamMembers++
        }
    }
    return numberOfTeamMembers
}

function removeTeam (teamToBeRemoved) {
    if (getNumberOfTeamMembers(teamToBeRemoved.id) > 0) {
        console.log("ERROR: this team cannot be removed since it still has members in it!")
        return false
    }
    
    let teamsById = groupById(NLC.nodesAndLinksData.teams)
    
    let teamIndexToDelete = null    
    for (let teamIndex = 0; teamIndex < NLC.nodesAndLinksData.teams.length; teamIndex++) {    
        let team = NLC.nodesAndLinksData.teams[teamIndex]    
        if (team.id === teamToBeRemoved.id) {    
            teamIndexToDelete = teamIndex    
        }    
    }    
    if (teamIndexToDelete != null) {    
        NLC.nodesAndLinksData.teams.splice(teamIndexToDelete, 1)
        delete teamsById[teamToBeRemoved.id]     // This is not really needed, since teamsById is used only locally here
    }    
    else {    
        console.log("ERROR: could not find team to be deleted!")    
        return false
    }    
        
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.teams and teamsById)    
    let nlcDataChange = {    
        "method" : "delete",    
        "path" : [ "teams", teamToBeRemoved.id],    
        "data" : teamToBeRemoved    
    }    
    NLC.dataChangesToStore.push(nlcDataChange)
        
    NLC.dataHasChanged = true    
    
    return true
}   
    
// Source Documents
    
function createNewSourceDocument() {    
        
    // FIXME: we should take into account default values and required fields!    
        
    // Create the source document locally    
        
    let newSourceDocument = {
        "id" : null,
        "type" : "sharepointWordFile", // FIXME: hardcoded default type
        "basicData" : {
            "fileName" : null,
            "url" : null
        }
    }    
        
    return newSourceDocument
}    
    
function storeChangesBetweenSourceDocuments(originalSourceDocuments, changedSourceDocuments) {    
    let sourceDocumentsChanges = []
    
    let originalSourceDocumentsById = groupById(originalSourceDocuments)
    let changedSourceDocumentsById = groupById(changedSourceDocuments)
        
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused
    
    for (let sourceDocumentIndex = 0; sourceDocumentIndex < changedSourceDocuments.length; sourceDocumentIndex++) {    
        let changedSourceDocument = changedSourceDocuments[sourceDocumentIndex]    
        // FIXME: we should check if the id exists!    
        
        if (changedSourceDocument.id in originalSourceDocumentsById) {
            let originalSourceDocument = originalSourceDocumentsById[changedSourceDocument.id]    
                
            if (changedSourceDocument.type !== originalSourceDocument.type) {    
                let nlcDataChange = {    
                    "method" : "update",    
                    "path" : [ "sourceDocuments", originalSourceDocument.id, "type" ],    
                    "data" : changedSourceDocument.type
                }    
                sourceDocumentsChanges.push(nlcDataChange)    
                
                // FIXME: we do this here, but we normally do this below!    
                originalSourceDocumentsById[changedSourceDocument.id].type = changedSourceDocument.type
            }    

            if (JSON.stringify(changedSourceDocument.basicData) !== JSON.stringify(originalSourceDocument.basicData)) {    
                let nlcDataChange = {    
                    "method" : "update",    
                    "path" : [ "sourceDocuments", originalSourceDocument.id, "basicData" ],    
                    "data" : changedSourceDocument.basicData
                }    
                sourceDocumentsChanges.push(nlcDataChange)    
                
                // FIXME: we do this here, but we normally do this below!    
                originalSourceDocumentsById[changedSourceDocument.id].basicData = changedSourceDocument.basicData
            }    
        }
        else {
            // The id of the changedSourceDocument is not in the originalSourceDocumentsById. We are assuming this sourceDocument was added, so we insert it
        
            let nlcDataChange = {    
                "method" : "insert",    
                "path" : [ "sourceDocuments"],    
                "data" : changedSourceDocument
            }
            sourceDocumentsChanges.push(nlcDataChange)
            // FIXME: we probably only want to copy certain fields here
            originalSourceDocumentsById[changedSourceDocument.id] = changedSourceDocument
            originalSourceDocuments.push(changedSourceDocument)
        }
        
    }    
    
    if (sourceDocumentsChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceDocumentsChanges)    
            
        NLC.dataHasChanged = true
        
        // FIXME: we now change the originals above!    
    }
    
    // Also removing sourceDocuments that are not in changedSourceDocuments anyomre
    for (let originalSourceDocumentIndex in originalSourceDocuments) {
        let originalSourceDocument = originalSourceDocuments[originalSourceDocumentIndex]
        if (!(originalSourceDocument.id in changedSourceDocumentsById)) {
            // The original sourceDocument is not in the changed sourceDocuments anymore, so we remove it
            if (removeSourceDocument(originalSourceDocument)) {
                // Note that this will also have the effect extending NLC.dataChangesToStore and NLC.dataHasChanged = true
            }
            else {
                console.log("ERROR: tried to remove sourceDocument (due to not being in the changedSourceDocuments anymore), but could not remove it!")
            }
        }
    }
    
}    

/*
// FIXME: this is WAY to slow!
function getNumberOfSourceLinks (sourceDocumentId) {
    let numberOfSourceLinks = 0
    for (let sourceLinkIndex in NLC.nodesAndLinksData.sourceLinks) {
        let sourceLink = NLC.nodesAndLinksData.sourceLinks[sourceLinkIndex]

        if (sourceLink.sourceDocumentId && sourceLink.sourceDocumentId == sourceDocumentId) {
            numberOfSourceLinks++
        }
    }
    return numberOfSourceLinks
}
*/

function removeSourceDocument (sourceDocumentToBeRemoved) {
    /*
    if (getNumberOfSourceLinks(sourceDocumentToBeRemoved.id) > 0) {
        console.log("ERROR: this sourceDocument cannot be removed since it still has sourceLinks pointing to it!")
        return false
    }
    */
    
    let sourceDocumentsById = NLC.nodesAndLinksData.sourceDocumentsById
    
    let sourceDocumentIndexToDelete = null    
    for (let sourceDocumentIndex = 0; sourceDocumentIndex < NLC.nodesAndLinksData.sourceDocuments.length; sourceDocumentIndex++) {    
        let sourceDocument = NLC.nodesAndLinksData.sourceDocuments[sourceDocumentIndex]    
        if (sourceDocument.id === sourceDocumentToBeRemoved.id) {    
            sourceDocumentIndexToDelete = sourceDocumentIndex    
        }    
    }    
    if (sourceDocumentIndexToDelete != null) {    
        NLC.nodesAndLinksData.sourceDocuments.splice(sourceDocumentIndexToDelete, 1)
        delete sourceDocumentsById[sourceDocumentToBeRemoved.id]
    }    
    else {    
        console.log("ERROR: could not find sourceDocument to be deleted!")    
        return false
    }    
        
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.sourceDocuments and sourceDocumentsById)    
    let nlcDataChange = {    
        "method" : "delete",    
        "path" : [ "sourceDocuments", sourceDocumentToBeRemoved.id],    
        "data" : sourceDocumentToBeRemoved    
    }    
    NLC.dataChangesToStore.push(nlcDataChange)
        
    NLC.dataHasChanged = true    
    
    return true
}   

// SourceLinks

function storeNewSourceLink(newSourceLink) {    
    let nlcDataChange = {    
        "method" : "insert",    
        "path" : [ "sourceLinks"],    
        "data" : newSourceLink    // FIXME: we should make a clone of the newSourceLink, since other changes may be applied to it, which should not be included in the insert here
    }    
    NLC.dataChangesToStore.push(nlcDataChange)    
    NLC.dataHasChanged = true    
}    

function removeSourceLink (sourceLinkToBeRemoved) {    
    let nlcDataChange = {    
        "method" : "delete",    
        "path" : [ "sourceLinks", sourceLinkToBeRemoved.id],    
        "data" : sourceLinkToBeRemoved  
    }    
    NLC.dataChangesToStore.push(nlcDataChange)    
    NLC.dataHasChanged = true    
}    

function storeChangesBetweenSourceLinks(originalSourceLink, changedSourceLink) {
    let sourceLinkChanges = []    
    
    // TODO: do a more precise comparision (instead of using JSON.stringify, which is not reliable)    
    if (JSON.stringify(changedSourceLink) !== JSON.stringify(originalSourceLink) ) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceLinks", originalSourceLink.id ],    
            "data" : changedSourceLink
        }    
        sourceLinkChanges.push(nlcDataChange)    
    }    
    
    if (sourceLinkChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceLinkChanges)    
        NLC.dataHasChanged = true    
    }    
}    

function storeChangesBetweenListsOfSourceLinks(originalSourceLinks, editedSourceLinks) {

    // Bases on the field of the sourceLinks we check if we have to DELETE, UPDATE or INSERT any sourceLinks
    // Note that whenever we have to INSERT a new sourceLink, we first have to generate a new id for it

    let originalSourceLinksByField = groupByField(originalSourceLinks)
    let editedSourceLinksByField = groupByField(editedSourceLinks)

    for (let field in editedSourceLinksByField) {
        let editedSourceLink = editedSourceLinksByField[field]
        if (field in originalSourceLinksByField) {
            let originalSourceLink = originalSourceLinksByField[field]
            // The sourceLink with this field exists if both the originalSourceLinks as the editedSourceLinks
            // We need to check whether the id is present in the editedSourceLink
            
            if ('id' in editedSourceLink) {
                // We have an id in the editedSourceLink, so we have to update it
                if (editedSourceLink.id == originalSourceLink.id) {
                    storeChangesBetweenSourceLinks(originalSourceLink, editedSourceLink)
                }
                else {
                    // FIXME: allow for more than one sourceLink per field!
                    console.log("ERROR: editedSourceLink.id is not the same as originalSourceLink. We currently only allow one sourceLink per field!")
                }
            }
            else {
                console.log("ERROR: editedSourceLink should have an id!")
            }
        }
        else {
            // The sourceLink with this field was not present in the originalSourceLinks, but it is in the editedSourceLinks
            // So we have to store the new sourceLink
            storeNewSourceLink(editedSourceLink)
        }
    }
    
    for (let field in originalSourceLinksByField) {
        let originalSourceLink = originalSourceLinksByField[field]
        if (field in editedSourceLinksByField) {
            // Do nothing, already handled
        }
        else {
            // The sourceLink with this field was present in the originalSourceLinks, but not in the editedSourceLinks
            // So we have to remove the originalSourceLink
            removeSourceLink(originalSourceLink)
        }
    }
}

function insertOrUpdateSourceLink(key, refData, fieldPath, sourceLinkToSet) {
    let matchingSourceLink = findMatchingSourceLink(key, refData, fieldPath)

    let foundMatchingSourceLink = false
    if (refData != null && '_sourceLinks' in refData) {
        
        if (fieldPath == null) {
            console.log('ERROR: fieldPath is null for field "'+key+'" and id ' + refData.id)
        }
        else {
            let field = getFullField(key, fieldPath)
            
            // FIXME: this is *slow* since we are looping through all sourceLinks. We should instead create a sourceLinksByField to make this quicker.
            for (let sourceLinkIndex in refData._sourceLinks) {
                let sourceLink = refData._sourceLinks[sourceLinkIndex]
                
                if (sourceLink.field == field) {
                    //console.log('Found field "' + field + '" for id ' + refData.id)
                    refData._sourceLinks[sourceLinkIndex] = sourceLinkToSet
                    foundMatchingSourceLink = true
                }
            }
        }
    }
    
    if (!foundMatchingSourceLink) {
        refData._sourceLinks.push(sourceLinkToSet)
    }
}

function findMatchingSourceLink (key, refData, fieldPath) {

    // TODO: what if there is more than one matching sourceLink?
    
    let matchingSourceLink = null
    if (refData != null && '_sourceLinks' in refData) {
        if (fieldPath == null) {
            console.log('ERROR: fieldPath is null for field "'+key+'" and id ' + refData.id)
        }
        else {
            let field = getFullField(key, fieldPath)
            
            // FIXME: this is *slow* since we are looping through all sourceLinks. We should instead create a sourceLinksByField to make this quicker.
            for (let sourceLinkIndex in refData._sourceLinks) {
                let sourceLink = refData._sourceLinks[sourceLinkIndex]
                
                if (sourceLink.field == field) {
                    // console.log('Found field "' + field + '" for id ' + refData.id)
                    matchingSourceLink = sourceLink
                }
            }
        }
    }
    
    return matchingSourceLink
}

function getFullField(key, fieldPath) {
    let field = fieldPath + '.' + key
    if (fieldPath == '') {
        field = key
    }
    return field
}
    
// Nodes
    
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
        "diagramSpecificVisualData" : {},
        "_sourceLinks" : []  // FIXME: should we always create this?
    }    
        
    return newNode    
        
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
    
    // FIXME: also remove nodeIds from sourceDiagrams/sourcePoints!!
        
    let nodeIndexToDelete = null    
    for (let nodeIndex = 0; nodeIndex < NLC.nodesAndLinksData.nodes.length; nodeIndex++) {    
        let node = NLC.nodesAndLinksData.nodes[nodeIndex]    
        if (node.id === nodeToBeRemoved.id) {    
            nodeIndexToDelete = nodeIndex    
        }    
    }    
    if (nodeIndexToDelete != null) {    
        NLC.nodesAndLinksData.nodes.splice(nodeIndexToDelete, 1)
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



// Links
    
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
        "diagramSpecificVisualData" : {},
        "_sourceLinks" : [] // FIXME: should we always create this?
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
        NLC.nodesAndLinksData.links.splice(linkIndexToDelete, 1)
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


// Diagrams
    
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
        NLC.nodesAndLinksData.diagrams.splice(diagramIndexToDelete, 1)
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
    
// Nodes in Diagrams

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

function storeNodeLocalScaleInDiagram(nodeId, diagramId, localScale) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
                
            node.diagramSpecificVisualData[diagramId].scale = localScale
    
            // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId, "scale"],    
                "data" : localScale
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
    
function storeNodeParentNodeIdInDiagram(nodeId, diagramId, parentNodeId) {    
        
    let nodesById = NLC.nodesAndLinksData.nodesById    
        
    if (nodesById.hasOwnProperty(nodeId)) {    
        let node = nodesById[nodeId]    
            
        // TODO: check if key exists instead of checking for the value to be "true"    
        if (node.diagramSpecificVisualData && node.diagramSpecificVisualData[diagramId]) {    
                
            node.diagramSpecificVisualData[diagramId].parentNodeId = parentNodeId
    
            // TODO: you probably want to apply this change in javascript to (on the node in nodesAndLinksData.nodes)    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", nodeId, "diagramSpecificVisualData", diagramId, "parentNodeId"],
                "data" : parentNodeId
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
    
    
// Links in Diagrams

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



// Source diagrams
    
function createNewSourceDiagram() {    
        
    // FIXME: we should take into account default values and required fields!    
        
    // Create the sourceDiagram locally    
        
    let newName = "Nieuw" // FIXME: should we require a new to be typed first? (or is this edited afterwards?)    
        
    let newSourceDiagram = {    
        "id" : null,    
        "name" : newName,    
        "imageUrl" : null,
        "sourcePoints" : [],
    }    
        
    return newSourceDiagram    
}    
    
function storeNewSourceDiagram(newSourceDiagram) {    
    let sourceDiagramsById = NLC.nodesAndLinksData.sourceDiagramsById
    
    sourceDiagramsById[newSourceDiagram.id] = newSourceDiagram    
    NLC.nodesAndLinksData.sourceDiagrams.push(newSourceDiagram)    
    
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.sourceDiagrams and sourceDiagramsById)    
    let nlcDataChange = {    
        "method" : "insert",    
        "path" : [ "sourceDiagrams"],    
        "data" : newSourceDiagram    
    }    
    NLC.dataChangesToStore.push(nlcDataChange)    
    NLC.dataHasChanged = true    
}    
    
function storeChangesBetweenSourceDiagrams(originalSourceDiagram, changedSourceDiagram) {    
    let sourceDiagramChanges = []    
        
    // FIXME: we should make sure that all fields we want to diff are placed somewhere central and is reused    
    
    if (changedSourceDiagram.name !== originalSourceDiagram.name) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceDiagrams", originalSourceDiagram.id, "name" ],    
            "data" : changedSourceDiagram.name    
        }    
        sourceDiagramChanges.push(nlcDataChange)    
    }    
        
    if (changedSourceDiagram.imageUrl !== originalSourceDiagram.imageUrl) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceDiagrams", originalSourceDiagram.id, "imageUrl" ],    
            "data" : changedSourceDiagram.imageUrl    
        }    
        sourceDiagramChanges.push(nlcDataChange)    
    }    
    
    if (sourceDiagramChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceDiagramChanges)    
            
        NLC.dataHasChanged = true    
            
        // TODO: we should only do this if we accept the changes    
        originalSourceDiagram.name = changedSourceDiagram.name    
        originalSourceDiagram.imageUrl = changedSourceDiagram.imageUrl  // FIXME: we should get rid of this!    
    }    
}    

function removeSourceDiagram (sourceDiagramToBeRemoved) {    
    let sourceDiagramsById = NLC.nodesAndLinksData.sourceDiagramsById
    
    let sourceDiagramIndexToDelete = null    
    for (let sourceDiagramIndex = 0; sourceDiagramIndex < NLC.nodesAndLinksData.sourceDiagrams.length; sourceDiagramIndex++) {    
        let sourceDiagram = NLC.nodesAndLinksData.sourceDiagrams[sourceDiagramIndex]    
        if (sourceDiagram.id === sourceDiagramToBeRemoved.id) {    
            sourceDiagramIndexToDelete = sourceDiagramIndex    
        }    
    }    
    if (sourceDiagramIndexToDelete != null) {    
        NLC.nodesAndLinksData.sourceDiagrams.splice(sourceDiagramIndexToDelete, 1)
        delete sourceDiagramsById[sourceDiagramToBeRemoved.id]    
    }    
    else {    
        console.log("ERROR: could not find sourceDiagram to be deleted!")    
    }    
        
    // FIXME: remove all visualData from nodes and links pointing to this sourceDiagram!    
        
    
    // TODO: you probably want to apply this change in javascript to (on the node in NLC.nodesAndLinksData.sourceDiagrams and sourceDiagramsById)    
    let nlcDataChange = {    
        "method" : "delete",    
        "path" : [ "sourceDiagrams", sourceDiagramToBeRemoved.id],    
        "data" : sourceDiagramToBeRemoved    
    }    
    NLC.dataChangesToStore.push(nlcDataChange)
    NLC.dataHasChanged = true    
}    
    
    
// Source points in source diagrams

function addSourcePointToSourceDiagram(sourceDiagram, sourcePoint) {    
        
    if (!('sourcePoints' in sourceDiagram)) {
        sourceDiagram.sourcePoints = []
    }
    sourceDiagram.sourcePoints.push(sourcePoint)
    
    let nlcDataChange = {    
        "method" : "insert",    
        "path" : [ "sourceDiagrams", sourceDiagram.id, "sourcePoints" ],
        "data" : sourcePoint
    }
    NLC.dataChangesToStore.push(nlcDataChange)    
    
    // TODO: maybe its better to call this: visualDataHasChanged ?    
    NLC.dataHasChanged = true    
}    

function storeSourcePointNodeId(sourceDiagram, originalSourcePoint, nodeId) {    

    let sourceDiagramsChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point nodeid and the new nodeid
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceDiagrams", sourceDiagram.id, "sourcePoints", originalSourcePoint.id, "nodeId" ],    
            "data" : nodeId
        }    
        originalSourcePoint.nodeId = nodeId
        sourceDiagramsChanges.push(nlcDataChange)    
    }
                
    if (sourceDiagramsChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceDiagramsChanges)    
        NLC.dataHasChanged = true
    }

}    

function storeSourcePointLocalPosition(sourceDiagram, originalSourcePoint, localPosition) {    

    let sourceDiagramsChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point position and the new position
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceDiagrams", sourceDiagram.id, "sourcePoints", originalSourcePoint.id, "position" ],    
            "data" : localPosition
        }    
        originalSourcePoint.position = localPosition
        sourceDiagramsChanges.push(nlcDataChange)    
    }
                
    if (sourceDiagramsChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceDiagramsChanges)    
        NLC.dataHasChanged = true
    }

}    

function storeSourcePointLocalSize(sourceDiagram, originalSourcePoint, localSize) {    

    let sourceDiagramsChanges = []
    if (true) { // FIXME: We should check here if there is a difference between the original point size and the new size
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "sourceDiagrams", sourceDiagram.id, "sourcePoints", originalSourcePoint.id, "size" ],    
            "data" : localSize
        }    
        originalSourcePoint.size = localSize
        sourceDiagramsChanges.push(nlcDataChange)    
    }
                
    if (sourceDiagramsChanges.length > 0) {    
        NLC.dataChangesToStore = NLC.dataChangesToStore.concat(sourceDiagramsChanges)    
        NLC.dataHasChanged = true
    }

}    

    
    
    
// == Combining with ZUI ==    
    
NLC.levelOfDetail = "auto"
// FIMXE: ZUI.levelOfDetailFading (for fading-in or fading-out)    
    
function getLinkedNodeIds(nodeId) {
	let linkedNodeIds = {}

	for (let linkIndex = 0; linkIndex < NLC.nodesAndLinksData.links.length; linkIndex++) {    
		let link = NLC.nodesAndLinksData.links[linkIndex]    
		if (link.fromNodeId === nodeId) {
			linkedNodeIds[link.toNodeId] = true
		}    
		if (link.toNodeId === nodeId) {    
			linkedNodeIds[link.fromNodeId] = true
		}    
	}    
	
	return linkedNodeIds
}

function getLinkedLinkIds(nodeId) {
	let linkedLinkIds = {}

	for (let linkIndex = 0; linkIndex < NLC.nodesAndLinksData.links.length; linkIndex++) {    
		let link = NLC.nodesAndLinksData.links[linkIndex]    
		if (link.fromNodeId === nodeId || link.toNodeId === nodeId) {
			linkedLinkIds[link.id] = true
		}
	}    
	
	return linkedLinkIds
}
    
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
    
    
    
// FIXME: only use mappingFunctionNode!   
// FIXME: only use mappingFunctionNode!   
// FIXME: only use mappingFunctionNode!   
function getColorNamesWithLightForNode (node, selectedLegendaId, dimUninteresting) {    

    if (selectedLegendaId == null) {    
        return null    
    }    

    let selectedLegenda = NLC.nodesAndLinksData.legendasById[selectedLegendaId]    
    let colorMapping = selectedLegenda.colorMapping    
        
    let colorNamesWithLight = null    
    if ('mappingFunctionNode' in selectedLegenda && selectedLegenda.mappingFunctionNode != null) {
        colorNamesWithLight = selectedLegenda.mappingFunctionNode(node, selectedLegenda, colorMapping)
    }
    else if (selectedLegenda.field === 'type') {    
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
    else if (selectedLegenda.field === 'isInSourceDiagram') {
        let colorKey = null    
        if ('isInSourceDiagrams' in node) {
            colorKey = 'isInAtLeastOneSourceDiagram'
            
            // FIMXE: referring to ikbApp here!!
            if (ikbApp.currentlySelectedSourceDiagramId && 
                ikbApp.currentlySelectedSourceDiagramId in node.isInSourceDiagrams &&
                node.isInSourceDiagrams[ikbApp.currentlySelectedSourceDiagramId]) {
                colorKey = 'isInCurrentSourceDiagram'
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
            colorNamesWithLight.doDim = true
            // TODO: this is quite specific and should probably be put into a more specific place
            if (NodeAndLinkScroller.nodeMatchesSearchAndFilter(node)) {
                colorNamesWithLight.doDim = false
            }
        }
    }
    
    return colorNamesWithLight    
}    
    
// FIXME: only use mappingFunctionLink!   
// FIXME: only use mappingFunctionLink!   
// FIXME: only use mappingFunctionLink!   
function getColorNamesWithLightForLink (link, selectedLegendaId, dimUninteresting) {    
        
    if (selectedLegendaId == null) {    
        return null    
    }    
        
    let selectedLegenda = NLC.nodesAndLinksData.legendasById[selectedLegendaId]    
    let colorMapping = selectedLegenda.colorMapping    
        
    let colorNamesWithLight = null    
    if ('mappingFunctionLink' in selectedLegenda && selectedLegenda.mappingFunctionLink != null) {
        colorNamesWithLight = selectedLegenda.mappingFunctionLink(link, selectedLegenda, colorMapping)
    }
    else if (selectedLegenda.field === 'type') {    
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
            colorNamesWithLight.doDim = true
            // TODO: this is quite specific and should probably be put into a more specific place
            if (NodeAndLinkScroller.linkMatchesSearchAndFilter(link)) {
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
    
function setNodesAndLinksAsContainersAndConnections(diagramId, selectedLegendaId, dimUninteresting) {    
    
    // Removing all connections and containers    
    initContainersAndConnections()    
    
	// When looking at all the nodes, we keep track of the lowest fromLevelOfDetail. This is the level that will always be shown (since it is the lowest). Not showing these nodes, would otherwise empty the screen.
	let lowestFromLevelOfDetail = null
	
    let nodeIdsAddedToContainers = {}    
    let nodes = NLC.nodesAndLinksData.nodes    
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {    
        let node = nodes[nodeIndex]    
            
        let nodeInDiagram = nodeIsInDiagram(node, diagramId)    
        if (!nodeInDiagram) {    
            // The node does not have diagramSpecificVisualData for the selectedDiagram, so we are not going to show/add the node    
            continue    
        }    
        
        let parentNodeId = 'root'
        if ('parentNodeId' in node.diagramSpecificVisualData[diagramId]) {
            parentNodeId = node.diagramSpecificVisualData[diagramId].parentNodeId
        }    
            
        let localScale = 1    
        /*    
        // TODO: this is an intereting idea!    
        if (NLC.levelOfDetail === 'medium') {    
            localScale = 2    
        }    
        */    
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("scale")) {
            localScale = node.diagramSpecificVisualData[diagramId].scale
        }    
        
        let nodeTypeInfo = getNodeTypeInfo(node)    
        
        let fromLevelOfDetail = 0.0 // FIXME: should the default really be 0.0? or should we assume 1.0?
        let toLevelOfDetail = 1.0  // FIXME: should the default really be 1.0?
        
        if (NLC.levelOfDetail == "auto") {
            if (nodeTypeInfo != null) {    
                let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
                
                if (nodeTypeHasLevelOfDetailProperties) {
					toLevelOfDetail = nodeTypeInfo.lod['to']
					fromLevelOfDetail = nodeTypeInfo.lod['from']
					
					if (lowestFromLevelOfDetail == null || fromLevelOfDetail < lowestFromLevelOfDetail) {
						lowestFromLevelOfDetail = fromLevelOfDetail
					}
                }
				else {
					console.log("WARNING: not level of detail information for nodeType: " + nodeTypeInfo.identifier)
				}
            }    
        }
        else {
            // TODO: we now assume levelOfDetail == "all" here, so we show all details
			lowestFromLevelOfDetail = 1.0
        }
            
        let position = {     
            x: 96, // FIXME: use a default position? Or determine where there is room?? Or set to null?    
            y: 96  // FIXME: use a default position? Or determine where there is room?? Or set to null?    
        }    
            
        let size = {     
            width: 96, // FIXME: change to width of text!    
            height: 96 // FIXME: get from visualInfo or part of shape?    
        }    
            
        let localFontSize = 14    
            
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
                if ('defaultSize' in nodeTypeInfo.shapeAndColor) {
                    size.width = nodeTypeInfo.shapeAndColor.defaultSize.width
                    size.height = nodeTypeInfo.shapeAndColor.defaultSize.height
                }
                if ('defaultFontSize' in nodeTypeInfo.shapeAndColor) {
                    localFontSize = nodeTypeInfo.shapeAndColor.defaultFontSize
                }
            }    
            else {    
                console.log("ERROR: no shape and color info : " + node)    
            }    
        }    
            
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("size")) {    
            size = node.diagramSpecificVisualData[diagramId].size    
        }
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("localFontSize")) {    
            localFontSize = node.diagramSpecificVisualData[diagramId].localFontSize    
        }    
        if (node.diagramSpecificVisualData[diagramId].hasOwnProperty("position")) {    
            position = node.diagramSpecificVisualData[diagramId].position    
        }    
        
        let containerInfo = {    
            type: node.type,    
            identifier: node.id,    
            parentContainerIdentifier: parentNodeId,
            // FIXME; we cannot be sure commonDate.name exists!    
            name: node.commonData.name,    
            localPosition: {    
                x: position.x,    
                y: position.y    
            },
            fromLevelOfDetail: fromLevelOfDetail,
            toLevelOfDetail: toLevelOfDetail,
            localScale: localScale,    
            localSize: size,    
            localFontSize : localFontSize,    
            shape : shape,    
            textBelowContainer : textBelowContainer    
        }    

        let colorsForNode = null    
        let colorNamesWithLight = getColorNamesWithLightForNode(node, selectedLegendaId, dimUninteresting)
        if (colorNamesWithLight != null) {    
            // If we get a direct color (no translation needed) we simply copy all rgba values
            if ('stroke' in colorNamesWithLight && 'r' in colorNamesWithLight.stroke) {
                containerInfo.stroke = {}
                containerInfo.stroke.r = colorNamesWithLight.stroke.r
                containerInfo.stroke.g = colorNamesWithLight.stroke.g
                containerInfo.stroke.b = colorNamesWithLight.stroke.b
                containerInfo.stroke.a = colorNamesWithLight.stroke.a
                containerInfo.fill = {}
                containerInfo.fill.r = colorNamesWithLight.fill.r
                containerInfo.fill.g = colorNamesWithLight.fill.g
                containerInfo.fill.b = colorNamesWithLight.fill.b
                containerInfo.fill.a = colorNamesWithLight.fill.a
            }
            else {
                containerInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
                containerInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
                if (colorNamesWithLight.doDim) {
                    containerInfo.alpha = 0.3
                }
            }
        }    
            
        createContainer(containerInfo)    
        nodeIdsAddedToContainers[node.id] = true    
    }
	
	// We now set the levelOfDetailToAlwaysShow to the lowestFromLevelOfDetail of all the nodes
	if (lowestFromLevelOfDetail != null) {
		ZUI.interaction.levelOfDetailToAlwaysShow = lowestFromLevelOfDetail
	}
	else {
		// TODO: if no node has any fromLevelOfDetail information, we
		ZUI.interaction.levelOfDetailToAlwaysShow = 0.0
	}
    
    // TODO: we currently set the absolute positions of the container before we add the connections. Is this required? Of should/can we do this after adding the connections?    
    setContainerChildren()    
    recalculateWorldPositionsAndSizes(null)    
    
	
	
	// ----------------- Links -> Connections ---------------------
    
// FIXME: only do this when levelOfDetail == "auto"!
// FIXME: only do this when levelOfDetail == "auto"!
// FIXME: only do this when levelOfDetail == "auto"!

    let nodesById = NLC.nodesAndLinksData.nodesById
	let virtualLinks = []
	let linksByFromNodeId = {}
	let linksByToNodeId = {}
    for (let linkId in NLC.nodesAndLinksData.linksById) {    
        let link = JSON.parse(JSON.stringify(NLC.nodesAndLinksData.linksById[linkId]))
		
// FIXME: remove this!
// FIXME: remove this!
// FIXME: remove this!
// FIXME: remove this!
if (link.type === 'common') {
	console.log("WARNING: removing 'common' link on-the-fly. These should not be in the db anymore!")
	continue
}
		
		// By default we assume all links are visible in all levelOfDetails. Their from-lod can/will be changed when a lower-lod link "takes over"
		link.lod = {
			from: 0.0,
			to: 1.0
		}
		
		// We always want the original links, so we add it to the list of virtualLinks
		virtualLinks.push(link)
		
		if (!(link.fromNodeId in linksByFromNodeId)) {
			linksByFromNodeId[link.fromNodeId] = []
		}
		if (!(link.toNodeId in linksByToNodeId)) {
			linksByToNodeId[link.toNodeId] = []
		}
		linksByFromNodeId[link.fromNodeId].push(link)
		linksByToNodeId[link.toNodeId].push(link)
	}


	let nodesByFromLevelOfDetail = {}
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {    
        let node = nodes[nodeIndex]    
		
		// FIXME: we already did this above. (might be expensive)
        let nodeTypeInfo = getNodeTypeInfo(node)    
		
		let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
		
		if (nodeTypeHasLevelOfDetailProperties) {
			// toLevelOfDetail = nodeTypeInfo.lod['to']
			fromLevelOfDetail = nodeTypeInfo.lod['from']

			if (!(fromLevelOfDetail in nodesByFromLevelOfDetail)) {
				nodesByFromLevelOfDetail[fromLevelOfDetail] = []
			}
			
			nodesByFromLevelOfDetail[fromLevelOfDetail].push(node)
		}
		else {
			console.log("WARNING: not level of detail information for nodeType: " + nodeTypeInfo.identifier)
		}
	}
	
	function findToNodesWithLowerFromLevelOfDetail (node, fromLevelOfDetail) {
		
		let toNodesWithLowerFromLevelOfDetail = []
		
		let linksFromThisNode = linksByFromNodeId[node.id]
		
		for (let linkFromThisNodeIndex in linksFromThisNode) {
			let linkFromThisNode = linksFromThisNode[linkFromThisNodeIndex]
			
			if ('alreadyChained' in linkFromThisNode && linkFromThisNode.alreadyChained) {
				// link is already chained!
			}
			else {
				let toNode = nodesById[linkFromThisNode.toNodeId]
				// FIXME: THIS IS TOO EXPENSIVE!
				let nodeTypeInfo = getNodeTypeInfo(toNode)    
				
				let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    


// FIXME: there is a problem when multiple applications want to reach a topic via the SAME mediation (as can be seen in the DPK diagram: MeldingenRegistratiePS).
//        the first application is virutal-linked (via the mediation) with the topic, and sets the link towards that topic as alreadyChained
//        the next application also want to reach this topic, BUT the link between the mediation and the toptic is not visited (since its alreadyChained)
//        BUT it *should* be chained AGAIN! 
//        Not using alreadyChained will cause possible while(1)-loops. So how to fix that? Maybe set something in the nodes? Or a separate crumbpath for each call to
//        these 2 recursive functions?
//        The other reason for setting the alreadyChained-boolean is for serial high-lod nodes being linked. Without it, you could get double-links: the same link would be created. Maybe check if the same link already exists?
				
				if (nodeTypeHasLevelOfDetailProperties) {
					let toNodeFromLevelOfDetail = nodeTypeInfo.lod['from']
					if (toNodeFromLevelOfDetail === fromLevelOfDetail) {
						// If we find a node with the same levelOfDetail, we keep searching deeper
						toNodesWithLowerFromLevelOfDetail.concat(findToNodesWithLowerFromLevelOfDetail(toNode, fromLevelOfDetail))
					}
					else if (toNodeFromLevelOfDetail < fromLevelOfDetail) {
						toNodesWithLowerFromLevelOfDetail.push(toNode)
					}
					
				}
				
				// FIXME: should this only be done if nodeTypeHasLevelOfDetailProperties? (see 'if' above)
				linkFromThisNode.alreadyChained = true
				linkFromThisNode.lod.from = fromLevelOfDetail
			}
		}
		
		return toNodesWithLowerFromLevelOfDetail
	}
	
	function findFromNodesWithLowerFromLevelOfDetail (node, fromLevelOfDetail) {
		
		let fromNodesWithLowerFromLevelOfDetail = []
		
		let linksToThisNode = linksByToNodeId[node.id]
		
		for (let linkToThisNodeIndex in linksToThisNode) {
			let linkToThisNode = linksToThisNode[linkToThisNodeIndex]
			
			if ('alreadyChained' in linkToThisNode && linkToThisNode.alreadyChained) {
				// link is already chained!
			}
			else {
				let fromNode = nodesById[linkToThisNode.fromNodeId]
				// FIXME: THIS IS TOO EXPENSIVE!
				let nodeTypeInfo = getNodeTypeInfo(fromNode)
				
				let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
				
				if (nodeTypeHasLevelOfDetailProperties) {
					let fromNodeFromLevelOfDetail = nodeTypeInfo.lod['from']
					if (fromNodeFromLevelOfDetail === fromLevelOfDetail) {
						// If we find a node with the same levelOfDetail, we keep searching deeper
						fromNodesWithLowerFromLevelOfDetail.concat(findFromNodesWithLowerFromLevelOfDetail(fromNode, fromLevelOfDetail))
					}
					else if (fromNodeFromLevelOfDetail < fromLevelOfDetail) {
						fromNodesWithLowerFromLevelOfDetail.push(fromNode)
					}
					
				}
				
				// FIXME: should this only be done if nodeTypeHasLevelOfDetailProperties? (see 'if' above)
				linkToThisNode.alreadyChained = true
				linkToThisNode.lod.from = fromLevelOfDetail
			}
		}
		
		return fromNodesWithLowerFromLevelOfDetail
	}

	let previousFromLevelOfDetail = 1.0 // We start with maxLevelOfDetail
	let fromLevelOfDetailsSorted = Object.keys(nodesByFromLevelOfDetail).sort().reverse()
	for (let fromLevelOfDetailIndex in fromLevelOfDetailsSorted) {
		let fromLevelOfDetail = fromLevelOfDetailsSorted[fromLevelOfDetailIndex]
		let nodesWithCertainFromLevelOfDetail = nodesByFromLevelOfDetail[fromLevelOfDetail]

		for (let nodeIndex = 0; nodeIndex < nodesWithCertainFromLevelOfDetail.length; nodeIndex++) {    
			let node = nodesWithCertainFromLevelOfDetail[nodeIndex]    
			
			if (node.id in linksByFromNodeId && node.id in linksByToNodeId) {
				// There are links from AND to this node
// console.log(fromLevelOfDetail)

// FIXME: also return the connectionPoint info for the nodes that should be connected to/from! So we can re-use those!
				let toNodesWithLowerFromLevelOfDetail = findToNodesWithLowerFromLevelOfDetail(node, fromLevelOfDetail)
				let fromNodesWithLowerFromLevelOfDetail = findFromNodesWithLowerFromLevelOfDetail(node, fromLevelOfDetail)

				for (let fromNodeIndex in fromNodesWithLowerFromLevelOfDetail) {
					let fromNode = fromNodesWithLowerFromLevelOfDetail[fromNodeIndex]
					
					// FIXME: THIS IS TOO EXPENSIVE!
					let fromNodeTypeInfo = getNodeTypeInfo(fromNode)    
					let fromNodeTypeHasLevelOfDetailProperties = fromNodeTypeInfo.hasOwnProperty('lod')    
					if (fromNodeTypeHasLevelOfDetailProperties) {
						// FIXME: get rid of this!					
					}
					
					let fromNodeFromLevelOfDetail = fromNodeTypeInfo.lod['from']	
						
					for (let toNodeIndex in toNodesWithLowerFromLevelOfDetail) {
						let toNode = toNodesWithLowerFromLevelOfDetail[toNodeIndex]
						
						if (fromNode.id === toNode.id) {
							// TODO: we now prevent a connection between the same node, but don't we want to show this?
							continue
						}

						// FIXME: THIS IS TOO EXPENSIVE!
						let toNodeTypeInfo = getNodeTypeInfo(toNode)    
						let toNodeTypeHasLevelOfDetailProperties = toNodeTypeInfo.hasOwnProperty('lod')    
						if (toNodeTypeHasLevelOfDetailProperties) {
							// FIXME: get rid of this!					
						}
						
						let toNodeFromLevelOfDetail = toNodeTypeInfo.lod['from']	
						
						let highestLevelOfDetailOfFromAndTo = fromNodeFromLevelOfDetail
						if (toNodeFromLevelOfDetail > highestLevelOfDetailOfFromAndTo) {
							highestLevelOfDetailOfFromAndTo = toNodeFromLevelOfDetail
						}
						
						let newVirtualLink = {
							id : node.id + '-' + toNode.id,  // FIXME: what should we use as id?
							commonData : {}, // FIXME: fill this! (with dataType?)
							fromNodeId : fromNode.id,
							toNodeId : toNode.id,
													// FIXME: Scale * 2?
// FIXME: this doesn't work quite right yet: when setting levelOfDetail to 'all', also the ones the a low-lod can be seen. Whats causing this?
//        see logic for: lowestFromLevelOfDetail
							lod: { 
								from: highestLevelOfDetailOfFromAndTo, // The higest levelOfDetail of either the fromNode or the toNode (since one of those to will disappear at that level, so should this link)
								to: fromLevelOfDetail   // This is where the new links 'ends' (detail-wise)
							}
						}
						virtualLinks.push(newVirtualLink)
						linksByFromNodeId[newVirtualLink.fromNodeId].push(newVirtualLink)
						linksByToNodeId[newVirtualLink.toNodeId].push(newVirtualLink)

					}
				
				}
				
			}
			
		}

	}
	
	
	
	for (let linkIndex in virtualLinks) {
		let link = virtualLinks[linkIndex]
		
		if (!('lod' in link)) {
			console.log("ERROR: (virtual)link doesn't have lod-info!")
		}
	//FIXME: check whether all virtualLinks have an lod!
//    for (let linkId in NLC.nodesAndLinksData.linksById) {    
//        let link = NLC.nodesAndLinksData.linksById[linkId]    
            
        let fromAndToNodesAreAddedToDiagram = nodeIdsAddedToContainers.hasOwnProperty(link.fromNodeId) &&    
                                              nodeIdsAddedToContainers.hasOwnProperty(link.toNodeId)    
            
        if (!fromAndToNodesAreAddedToDiagram) {    
            // If either the fromNode or the toNode is not added to the diagram, we do not add the link connecting them    
            continue    
        }    
            
        let linkHasDiagramSpecificVisualData = link.hasOwnProperty('diagramSpecificVisualData') &&     
                              link.diagramSpecificVisualData.hasOwnProperty(diagramId)    
        if (!linkHasDiagramSpecificVisualData) {    
            // The link does not have diagramSpecificVisualData for the selectedDiagram, so we SHOULD not show/add the link
            // FIXME: we should 'continue' here, but the DEFAULT right now is to add it anyway!    
            // FIXME: continue    
        }    
            
        // let linkTypeInfo = getLinkTypeInfo(link)    
        
        let fromLevelOfDetail = 0.0 // FIXME: should the default really be 0.0?
        let toLevelOfDetail = 1.0  // FIXME: should the default really be 1.0?

// FIXME: should we do ayything here ? Both cases are treated the same right?
        if (NLC.levelOfDetail == "auto") {
			toLevelOfDetail = link.lod['to']
			fromLevelOfDetail = link.lod['from']
			
			
			/*
            if (linkTypeInfo != null) {    
                    
                let linkTypeHasLevelOfDetailProperties = linkTypeInfo.hasOwnProperty('lod')    

                if (linkTypeHasLevelOfDetailProperties) {
					toLevelOfDetail = linkTypeInfo.lod['to']
					fromLevelOfDetail = linkTypeInfo.lod['from']
                }
				else {
					console.log("WARNING: not level of detail information for linkType: " + linkTypeInfo.identifier)
				}
				
            }
			*/
        }
        else {
            // TODO: we now assume levelOfDetail == "all" here, so we show all details
            
			toLevelOfDetail = link.lod['to']
			fromLevelOfDetail = link.lod['from']
			
            // FIXME: as long as we havent removed all "common" links we are now not showing them in this mode
            // FIXME: as long as we havent removed all "common" links we are now not showing them in this mode
            // FIXME: as long as we havent removed all "common" links we are now not showing them in this mode

/*
            if (linkTypeInfo != null) {    
				if (linkTypeInfo.identifier === 'common') {
					toLevelOfDetail = 0.0
				}
            }
 */           
        }
    
        // link.dataType = sourceDataType    
        let connectionInfo = {    
            identifier: link.id,    
            name: link.commonData.dataType,  // TODO:  we are assuming commonData.dataType exists here!    
            type: link.type,
            dataType: link.commonData.dataType,  // TODO:  we are assuming commonData.dataType exists here!
            fromLevelOfDetail: fromLevelOfDetail,
            toLevelOfDetail: toLevelOfDetail,
            fromContainerIdentifier: link.fromNodeId,    
            toContainerIdentifier: link.toNodeId    
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
        let colorNamesWithLight = getColorNamesWithLightForLink(link, selectedLegendaId, dimUninteresting)    
        if (colorNamesWithLight != null) {    
            // If we get a direct color (no translation needed) we simply copy all rgba values
            if ('stroke' in colorNamesWithLight && 'r' in colorNamesWithLight.stroke) {
                connectionInfo.stroke = {}
                connectionInfo.stroke.r = colorNamesWithLight.stroke.r
                connectionInfo.stroke.g = colorNamesWithLight.stroke.g
                connectionInfo.stroke.b = colorNamesWithLight.stroke.b
                connectionInfo.stroke.a = colorNamesWithLight.stroke.a
                connectionInfo.fill = {}
                connectionInfo.fill.r = colorNamesWithLight.fill.r
                connectionInfo.fill.g = colorNamesWithLight.fill.g
                connectionInfo.fill.b = colorNamesWithLight.fill.b
                connectionInfo.fill.a = colorNamesWithLight.fill.a
            }
            else {
                connectionInfo.stroke = getColorByColorNameAndLighten(colorNamesWithLight.stroke)    
                connectionInfo.fill = getColorByColorNameAndLighten(colorNamesWithLight.fill)    
                if (colorNamesWithLight.doDim) {
                    connectionInfo.alpha = 0.3
                }
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
