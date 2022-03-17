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
NLC.chainsAndBundles = null    

// FIXME: NLC.levelOfDetail is defined far below, does it belong here? Or should we put it in a separate file?


function prepareNodesAndLinksData (flatNodesAndLinksData, nodeTypes, linkTypes, legendas) {
    let nodesAndLinksData  = {}

    // Types
    nodesAndLinksData.nodeTypes = nodeTypes
    nodesAndLinksData.nodeTypesByIdentifier = groupByIdentifier(nodeTypes)
    nodesAndLinksData.linkTypes = linkTypes
    nodesAndLinksData.linkTypesByIdentifier = groupByIdentifier(linkTypes)

    // Legendas
    nodesAndLinksData.legendas = legendas
    nodesAndLinksData.legendasById = groupById(legendas)

    // Nodes
    nodesAndLinksData.nodes = flatNodesAndLinksData.nodes
    nodesAndLinksData.nodesById = groupById(flatNodesAndLinksData.nodes)
    
    // Links
    nodesAndLinksData.links = flatNodesAndLinksData.links
    nodesAndLinksData.linksById = groupById(flatNodesAndLinksData.links)

    // Source Documents
    nodesAndLinksData.sourceDocuments = JSON.parse(JSON.stringify(flatNodesAndLinksData.sourceDocuments))
    nodesAndLinksData.sourceDocuments.sort(SourceDocumentManagement.compareSourceDocuments)
    nodesAndLinksData.sourceDocumentsById = groupById(flatNodesAndLinksData.sourceDocuments)
    
    // Source Diagrams
    nodesAndLinksData.sourceDiagrams = flatNodesAndLinksData.sourceDiagrams
    nodesAndLinksData.sourceDiagramsById = groupById(flatNodesAndLinksData.sourceDiagrams)
    
    // Note: right now we loop through all sourceDiagrams and sourcePoints in order to determine which
    //       sourceDiagram mentions which node. We store this inside nodesInSourceDiagram. This can then be used
    //       by a legenda showing which node are mentioned by certain sourcediagrams
    let nodesInSourceDiagram = {}
    for (let sourceDiagramIndex in nodesAndLinksData.sourceDiagrams) {
        let sourceDiagram = nodesAndLinksData.sourceDiagrams[sourceDiagramIndex]
        
        for (let sourcePointIndex in sourceDiagram.sourcePoints) {
            let sourcePoint = sourceDiagram.sourcePoints[sourcePointIndex]
            
            if ('nodeId' in sourcePoint && sourcePoint.nodeId != null) {
                let node = nodesAndLinksData.nodesById[sourcePoint.nodeId]
                
                if (node != null) {
                    if (!(sourcePoint.nodeId in nodesInSourceDiagram)) {
                        nodesInSourceDiagram[sourcePoint.nodeId]  = {}
                    }
                    nodesInSourceDiagram[sourcePoint.nodeId][sourceDiagram.id] = true
                }
                else {
                    console.log("WARNING: sourcePoint " + sourcePoint.id + " has reference to non-existing nodeId " + sourcePoint.nodeId)
                }
            }
        }
    }
    nodesAndLinksData.nodesInSourceDiagram = nodesInSourceDiagram
    
    // Diagrams
    let diagramTree = getDiagramTreeFromList(flatNodesAndLinksData.diagrams, null, 0)
    let diagramsFlatList = []
    convertDiagramTreeToList(diagramTree, diagramsFlatList)
    nodesAndLinksData.diagrams = diagramsFlatList
    nodesAndLinksData.diagramsById = groupById(flatNodesAndLinksData.diagrams)  
    
    // Known users and teams
    nodesAndLinksData.knownUsers = flatNodesAndLinksData.knownUsers
    nodesAndLinksData.teams = flatNodesAndLinksData.teams
    
    return nodesAndLinksData
}

function getDiagramTreeFromList(diagrams, parentDiagramId, depth) {
    let childrenOfParent = []
    let otherDiagrams = []

    for (let diagramIndex in diagrams) {
        let diagram = diagrams[diagramIndex]
        
        // Note: null will also match with null (null = root-parent)
        if (diagram.parentDiagramId == parentDiagramId) {
            diagram.indentedName = repeatString("&nbsp;", depth * 4) + diagram.name
            childrenOfParent.push(diagram) 
        }
        else {
            otherDiagrams.push(diagram)
        }
    }

    childrenOfParent.sort(compareSortIndex)

    for (let childDiagramIndex in childrenOfParent) {
        let childDiagram = childrenOfParent[childDiagramIndex]
    
        childDiagram.children = getDiagramTreeFromList(otherDiagrams, childDiagram.id, depth + 1)
    }
    
    return childrenOfParent
}

function convertDiagramTreeToList (diagramTree, diagramsFlatList) {
    for (let diagramIndex in diagramTree) {
        let diagram = diagramTree[diagramIndex]
        diagramsFlatList.push(diagram)
        
        convertDiagramTreeToList(diagram.children, diagramsFlatList)
    }
}


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
        // TODO: this is not default anymore, remove? "codeVersions" : [],    
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
        
    if (changedDiagram.identifier !== originalDiagram.identifier) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "diagrams", originalDiagram.id, "identifier" ],    
            "data" : changedDiagram.identifier
        }    
        diagramChanges.push(nlcDataChange)    
    }    

    if (changedDiagram.sortIndex !== originalDiagram.sortIndex) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "diagrams", originalDiagram.id, "sortIndex" ],    
            "data" : changedDiagram.sortIndex
        }    
        diagramChanges.push(nlcDataChange)    
    }    
    
    if (changedDiagram.parentDiagramId !== originalDiagram.parentDiagramId) {    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "diagrams", originalDiagram.id, "parentDiagramId" ],    
            "data" : changedDiagram.parentDiagramId
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
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    let keyToStore = 'fromConnectionPointIdentifier'    
    if (fromOrTo === 'to') {    
        keyToStore = 'toConnectionPointIdentifier'    
    }    
    
    if ((''+linkId).includes('-')) {
        // This is a virtualLink, meaning its visualData should be stored in the fromNode (not in the link itself, which doesn't really exist)
        let nodeIds = linkId.split("-")
        if (nodeIds.length != 2) {
            console.log("ERROR: virtualLinkId does not contain fromId and toId! : " + linkId)
            return
        }
        let fromNodeId = parseInt(nodeIds[0])
        // let toNodeId = parseInt(nodeIds[1])
        
        if (!fromNodeId in nodesById) {
            console.log("ERROR: could not find fromNodeId " + fromNodeId + " when trying to store link connectionPoint")
            return
        }
        let fromNode = nodesById[fromNodeId]
        
        // FIXME: instead of this long list of if-statements we need a function that does this for us! (that is: auto-create all the in-between dicts in the frontend and backend)
        // FIXME: instead of this long list of if-statements we need a function that does this for us! (that is: auto-create all the in-between dicts in the frontend and backend)
        // FIXME: instead of this long list of if-statements we need a function that does this for us! (that is: auto-create all the in-between dicts in the frontend and backend)
        
        // If there is no diagramSpecificVisualData, we create if and fill it with empy visualData for this diagram
        if (!fromNode.hasOwnProperty('diagramSpecificVisualData')) {    
                
            let diagramSpecificVisualData = {}
            diagramSpecificVisualData[diagramId] = {}    
            diagramSpecificVisualData[diagramId]['virtualLinks'] = {}    
            diagramSpecificVisualData[diagramId]['virtualLinks'][linkId] = {}    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", fromNodeId, "diagramSpecificVisualData"],    
                "data" : diagramSpecificVisualData
            }    
            fromNode.diagramSpecificVisualData = diagramSpecificVisualData
            NLC.dataChangesToStore.push(nlcDataChange)    
        }
        // If there is diagramSpecificVisualData but not for this diagram, we fill it with empy visualData for this diagram
        else if (!fromNode.diagramSpecificVisualData.hasOwnProperty(diagramId)) {
            let visualData = {}    
            visualData['virtualLinks'] = {}    
            visualData['virtualLinks'][linkId] = {}    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", fromNodeId, "diagramSpecificVisualData", diagramId],
                "data" : visualData
            }    
            fromNode.diagramSpecificVisualData[diagramId] = visualData
            NLC.dataChangesToStore.push(nlcDataChange)    
        }
        else if (!fromNode.diagramSpecificVisualData[diagramId].hasOwnProperty('virtualLinks')) {
            let virtualLinksData = {}    
            virtualLinksData[linkId] = {}    
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", fromNodeId, "diagramSpecificVisualData", diagramId, 'virtualLinks'],
                "data" : virtualLinksData
            }    
            fromNode.diagramSpecificVisualData[diagramId]['virtualLinks'] = virtualLinksData
            NLC.dataChangesToStore.push(nlcDataChange)    
        }
        else if (!fromNode.diagramSpecificVisualData[diagramId].virtualLinks.hasOwnProperty(linkId)) {
            let virtualLinkData = {}
            let nlcDataChange = {    
                "method" : "update",    
                "path" : [ "nodes", fromNodeId, "diagramSpecificVisualData", diagramId, 'virtualLinks', linkId],
                "data" : virtualLinkData
            }    
            fromNode.diagramSpecificVisualData[diagramId]['virtualLinks'][linkId] = virtualLinkData
            NLC.dataChangesToStore.push(nlcDataChange)
        }
        
        fromNode.diagramSpecificVisualData[diagramId]['virtualLinks'][linkId][keyToStore] = connectionPointIdentifier
                
        // TODO: you probably want to apply this change in javascript to (on the link in NLC.nodesAndLinksData.links)    
        let nlcDataChange = {    
            "method" : "update",    
            "path" : [ "nodes", fromNodeId, "diagramSpecificVisualData", diagramId, 'virtualLinks', linkId, keyToStore],
            "data" : connectionPointIdentifier    
        }    
        NLC.dataChangesToStore.push(nlcDataChange)    
        
        // TODO: maybe its better to call this: visualDataHasChanged ?    
        NLC.dataHasChanged = true    
        
    }
    else {
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
    
// FIXME: this default setting is done TWICE! We should set this only ONCE!
NLC.levelOfDetail = "all"
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
    else {    
        // This is the generic case (no hardcoded exceptions)    
        if (selectedLegenda.field in link.commonData) {    
            let linkTypeIdentifier = link.commonData[selectedLegenda.field]    
            if (colorMapping.hasOwnProperty(linkTypeIdentifier)) {
                colorNamesWithLight = colorMapping[linkTypeIdentifier]    
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
            if (NodeAndLinkScroller.linkMatchesSearchAndFilter(link)) {
                colorNamesWithLight.doDim = false
            }
        }
    }
    
    return colorNamesWithLight    
}    

function getNodeTypeInfo(node) {    
    let nodeTypeIdentifier = node.type    
    
    if (nodeTypeIdentifier in NLC.nodesAndLinksData.nodeTypesByIdentifier) {
        let nodeTypeInfo = NLC.nodesAndLinksData.nodeTypesByIdentifier[nodeTypeIdentifier]
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
    return null    
}    
    
function getLinkTypeInfo(link) {    
    let linkTypeIdentifier = link.type    
    
    if (linkTypeIdentifier in NLC.nodesAndLinksData.linkTypesByIdentifier) {
        let linkTypeInfo = NLC.nodesAndLinksData.linkTypesByIdentifier[linkTypeIdentifier]
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
    return null    
}    
    
    
    
// ------------------- Auto-Chaining and Bundling functions ----------------------
    
function getNodeParentsByIdWithinDiagram(node, diagramId) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    // TODO: isnt it a good idea to have this as a list *too*?
    let parentsById = {}  
    let currentNode = node
    let rootReached = false
    
    // TODO: do we want a protection agains a while loop here?
    while (currentNode && !rootReached) {
        let parentNodeId = null
        if (diagramId in  currentNode.diagramSpecificVisualData && 'parentNodeId' in currentNode.diagramSpecificVisualData[diagramId]) {
            parentNodeId = currentNode.diagramSpecificVisualData[diagramId].parentNodeId
        }    
        
        if (parentNodeId != null) {
            parentsById[parentNodeId] = true
            currentNode = nodesById[parentNodeId]
        }
        else {
            rootReached = true
        }
    }
    
    return parentsById
}

function getFirstParentWithLowerFromLevelOfDetail (node, diagramId, fromLevelOfDetail) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    let fromLevelOfDetailPerNodeId = NLC.chainsAndBundles.fromLevelOfDetailPerNodeId
    
    let currentNode = node
    let firstPatentWithLowerLevelOfDetail = null
    
    let rootOrGoalReached = false
    
    // TODO: do we want a protection agains a while loop here?
    while (currentNode && !rootOrGoalReached) {
        let parentNodeId = null
        if (diagramId in  currentNode.diagramSpecificVisualData && 'parentNodeId' in currentNode.diagramSpecificVisualData[diagramId]) {
            parentNodeId = currentNode.diagramSpecificVisualData[diagramId].parentNodeId
        }    
        
        // FIXME: shouldn't we get rid of the application storing 'root' and instead store null?
        if (parentNodeId != null && parentNodeId != 'root') {
            let parentNode = nodesById[parentNodeId]
            
            let parentNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[parentNode.id]
            
            if (parentNodeFromLevelOfDetail < fromLevelOfDetail) {
                firstPatentWithLowerLevelOfDetail = parentNode
                rootOrGoalReached = true
            }
            else {
                currentNode = parentNode
            }
        }
        else {
            rootOrGoalReached = true
        }
    }
    
    return firstPatentWithLowerLevelOfDetail
}

function linkCrossesToParentBorder (link, fromLevelOfDetail, diagramId, doLog) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    let toNode = nodesById[link.toNodeId]
    let fromNode = nodesById[link.fromNodeId]

    // We get the first parent of the toNode that has a lower Level Of detail than the toNode itself
    // This means *when the toNode will disappear* this parent could take over the link.
    let crossesToParentBorder = false
    let toParentWithLowerLod = getFirstParentWithLowerFromLevelOfDetail(toNode, diagramId, fromLevelOfDetail)
    
    if (toParentWithLowerLod != null) {
        // We now check whether the fromNode had this same parent. If it does, then this link doesn't cross the border of this parent
        // If it doesn't have the same parent (OR MAYBE had an closer parent that also has a lower lod? -> I dont think we want this...)
        // then it does cross the border
        
        // FIXME: PERFORMANCE: you want to store this (even temp) in the node! (or: ..ByNodedId)
        let fromParentsById = getNodeParentsByIdWithinDiagram(fromNode, diagramId)
        
        if (!(toParentWithLowerLod.id in fromParentsById)) {
            crossesToParentBorder = true
        }
    }
    
    if (crossesToParentBorder) {
        return toParentWithLowerLod
    }
    else {
        return null
    }
}

function linkCrossesFromParentBorder (link, fromLevelOfDetail, diagramId, doLog) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    
    let toNode = nodesById[link.toNodeId]
    let fromNode = nodesById[link.fromNodeId]

    // We get the first parent of the fromNode that has a lower Level Of detail than the fromNode itself
    // This means *when the fromNode will disappear* this parent could take over the link.
    let crossesToParentBorder = false
    let fromParentWithLowerLod = getFirstParentWithLowerFromLevelOfDetail(fromNode, diagramId, fromLevelOfDetail)
    
    if (fromParentWithLowerLod != null) {
        // We now check whether the toNode had this same parent. If it does, then this link doesn't cross the border of this parent
        // If it doesn't have the same parent (OR MAYBE had an closer parent that also has a lower lod? -> I dont think we want this...)
        // then it does cross the border
        
        // FIXME: PERFORMANCE: you want to store this (even temp) in the node! (or: ..ByNodedId)
        let toParentsById = getNodeParentsByIdWithinDiagram(toNode, diagramId)
        
        if (!(fromParentWithLowerLod.id in toParentsById)) {
            crossesToParentBorder = true
        }
    }
    
    if (crossesToParentBorder) {
        return fromParentWithLowerLod
    }
    else {
        return null
    }
}

function findToChainsWithLowerFromLevelOfDetail (link, fromLevelOfDetail, nodeCrumbPath, diagramId, linksByFromNodeId, doLog) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    let fromLevelOfDetailPerNodeId = NLC.chainsAndBundles.fromLevelOfDetailPerNodeId
    
    let toChainsWithLowerFromLevelOfDetail = []

    let toNode = nodesById[link.toNodeId]
    
    // To prevent from looping, we check our crumbPath of nodes we visited
    if (toNode.id in nodeCrumbPath) {
        return []
    }
    else {
        nodeCrumbPath[toNode.id] = true
    }
    
    let toNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[toNode.id]
    if (toNodeFromLevelOfDetail == fromLevelOfDetail) {
        // If we find a node with the same levelOfDetail (meaning it will disappear), we keep searching 'deeper' (in the chain) or 'higher' (in the parent)

        // First we check the parent (if the current link crosses its border, if so we can use the parent)
        let toParentWithLowerLod = linkCrossesToParentBorder(link, fromLevelOfDetail, diagramId, doLog)
        if (toParentWithLowerLod != null) {
            // FIXME: we need mark this chain as 'crossing a low-lod parent border'
            
            let toChain = []
            // Add toNode to beginning of the new toChain
            // FIXME: HACK! simply adding the parent as the end node here! We should probably add the toNode itself instead and mark the chain (and add the parent too?)
            //toChain.unshift(toNode)
            toChain.unshift(toParentWithLowerLod)
            toChainsWithLowerFromLevelOfDetail.push(toChain)
            
            // FIXME: ugly early return!
            return toChainsWithLowerFromLevelOfDetail
        }
        
        // If not, we we check 'deeper' in the chain
        
        let linksFromThisToNode = linksByFromNodeId[toNode.id]
        
        for (let linkFromThisToNodeIndex in linksFromThisToNode) {
            let linkFromThisToNode = linksFromThisToNode[linkFromThisToNodeIndex]
            
            let deeperToChainsWithLowerFromLevelOfDetail = findToChainsWithLowerFromLevelOfDetail(linkFromThisToNode, fromLevelOfDetail, nodeCrumbPath, diagramId, linksByFromNodeId, doLog)
            for (let deeperToChainIndex in deeperToChainsWithLowerFromLevelOfDetail) {
                // Add linkFromThisToNode and toNode to the beginning of each the deeper to-chain
                let deeperToChain = deeperToChainsWithLowerFromLevelOfDetail[deeperToChainIndex]
                deeperToChain.unshift(linkFromThisToNode)
                deeperToChain.unshift(toNode)
                toChainsWithLowerFromLevelOfDetail.push(deeperToChain)
            }
        }
    }
    else if (toNodeFromLevelOfDetail < fromLevelOfDetail) {
        
        let toChain = []
        // Add toNode to beginning of the new toChain
        toChain.unshift(toNode)
        toChainsWithLowerFromLevelOfDetail.push(toChain)
    }
    
    return toChainsWithLowerFromLevelOfDetail
}

function findFromChainsWithLowerFromLevelOfDetail (link, fromLevelOfDetail, nodeCrumbPath, diagramId, linksByToNodeId, doLog) {
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    let fromLevelOfDetailPerNodeId = NLC.chainsAndBundles.fromLevelOfDetailPerNodeId
    
    let fromChainsWithLowerFromLevelOfDetail = []

    let fromNode = nodesById[link.fromNodeId]
    
    // To prevent from looping, we check our crumbPath of nodes we visited
    if (fromNode.id in nodeCrumbPath) {
        return []
    }
    else {
        nodeCrumbPath[fromNode.id] = true
    }
        
    let fromNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[fromNode.id]
    if (fromNodeFromLevelOfDetail == fromLevelOfDetail) {
        // If we find a node with the same levelOfDetail (meaning it will disappear), we keep searching 'deeper' (in the chain) or 'higher' (in the parent)

        // First we check the parent (if the current link crosses its border, if so we can use the parent)
        let fromParentWithLowerLod = linkCrossesFromParentBorder(link, fromLevelOfDetail, diagramId, doLog)
        if (fromParentWithLowerLod != null) {
            // FIXME: we need mark this chain as 'crossing a low-lod parent border'
            
            let fromChain = []
            // Add toNode to beginning of the new toChain
            // FIXME: HACK! simply adding the parent as the end node here! We should probably add the toNode itself instead and mark the chain (and add the parent too?)
            //toChain.unshift(toNode)
            fromChain.push(fromParentWithLowerLod)
            fromChainsWithLowerFromLevelOfDetail.push(fromChain)
            
            // FIXME: ugly early return!
            return fromChainsWithLowerFromLevelOfDetail
        }

        // If not, we we check 'deeper' in the chain
        
        let linksToThisFromNode = linksByToNodeId[fromNode.id]
        
        for (let linkToThisFromNodeIndex in linksToThisFromNode) {
            let linkToThisFromNode = linksToThisFromNode[linkToThisFromNodeIndex]
            
            let deeperFromChainsWithLowerFromLevelOfDetail = findFromChainsWithLowerFromLevelOfDetail(linkToThisFromNode, fromLevelOfDetail, nodeCrumbPath, diagramId, linksByToNodeId, doLog)
            for (let deeperFromChainIndex in deeperFromChainsWithLowerFromLevelOfDetail) {
                // Add linkToThisNode and fromNode to the end of each the deeper from-chain
                let deeperFromChain = deeperFromChainsWithLowerFromLevelOfDetail[deeperFromChainIndex]
                deeperFromChain.push(linkToThisFromNode)
                deeperFromChain.push(fromNode)
                fromChainsWithLowerFromLevelOfDetail.push(deeperFromChain)
            }
        }
    }
    else if (fromNodeFromLevelOfDetail < fromLevelOfDetail) {
        
        let fromChain = []
        // Add fromNode to end of the new fromChain
        fromChain.push(fromNode)
        fromChainsWithLowerFromLevelOfDetail.push(fromChain)
    }
    
    return fromChainsWithLowerFromLevelOfDetail
}


function markLinkAsChained(link, chainingLinkId) {
    link.alreadyChained = true
    if (!('chainedBy' in link)) {
        link.chainedBy = []
    }
    link.chainedBy.push(chainingLinkId)
}

// FIXME: these two function are the same!
function markLinksInFromChainAsChained(fromChain, chainingLinkId) {
    for (let linkElementIndex in fromChain) {
        // In from-chains the *odd* indexes are the links
        if (linkElementIndex % 2 == 1) {
            let link = fromChain[linkElementIndex]
            markLinkAsChained(link, chainingLinkId)
        }
    }
}

// FIXME: these two function are the same!
function markLinksInToChainAsChained(toChain, chainingLinkId) {
    for (let linkElementIndex in toChain) {
        // In to-chains the *odd* indexes are the links
        if (linkElementIndex % 2 == 1) {
            let link = toChain[linkElementIndex]
            markLinkAsChained(link, chainingLinkId)
        }
    }
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
            lowestFromLevelOfDetail = highLod
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

    NLC.chainsAndBundles = {}
    NLC.chainsAndBundles.fromLevelOfDetailPerNodeId = {}
    NLC.chainsAndBundles.toLevelOfDetailPerNodeId = {}
    NLC.chainsAndBundles.linksByFromNodeId = {}
    NLC.chainsAndBundles.linksByToNodeId = {}
    
    let nodesByFromLevelOfDetail = {}
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {    
        let node = nodes[nodeIndex]    
        
        // FIXME: we already did this above. (might be expensive)
        //     -> Yes, but *here* we loop through *all* the nodes, so we *need* to do it here! -> maybe we can skip it in the above version by running this first?
        let nodeTypeInfo = getNodeTypeInfo(node)    
        
        let nodeTypeHasLevelOfDetailProperties = nodeTypeInfo.hasOwnProperty('lod')    
        
        if (nodeTypeHasLevelOfDetailProperties) {
            toLevelOfDetail = nodeTypeInfo.lod['to']
            fromLevelOfDetail = nodeTypeInfo.lod['from']

            if (!(fromLevelOfDetail in nodesByFromLevelOfDetail)) {
                nodesByFromLevelOfDetail[fromLevelOfDetail] = []
            }
            
            nodesByFromLevelOfDetail[fromLevelOfDetail].push(node)
            
            NLC.chainsAndBundles.fromLevelOfDetailPerNodeId[node.id] = fromLevelOfDetail
            NLC.chainsAndBundles.toLevelOfDetailPerNodeId[node.id] = toLevelOfDetail
        }
        else {
            console.log("WARNING: not level of detail information for nodeType: " + nodeTypeInfo.identifier)
            
            // TODO: what dummy/error/default value should we give these?
            NLC.chainsAndBundles.fromLevelOfDetailPerNodeId[node.id] = 0.0
            NLC.chainsAndBundles.toLevelOfDetailPerNodeId[node.id] = 1.0
        }
    }
    
    let nodesById = NLC.nodesAndLinksData.nodesById
    let virtualLinksById = []
    let virtualLinksByFromLod = {}
    let linksByFromNodeId = NLC.chainsAndBundles.linksByFromNodeId
    let linksByToNodeId = NLC.chainsAndBundles.linksByToNodeId
    let fromLevelOfDetailPerNodeId = NLC.chainsAndBundles.fromLevelOfDetailPerNodeId
    let toLevelOfDetailPerNodeId = NLC.chainsAndBundles.toLevelOfDetailPerNodeId
    
    // FIXME: we should iterate over all existing Lod-levels
    // virtualLinksByFromLod[maxLod] = []  // not needed
    virtualLinksByFromLod[highLod] = []
    virtualLinksByFromLod[mediumLod] = []
    virtualLinksByFromLod[lowLod] = []
    virtualLinksByFromLod[veryLowLod] = []
    
    for (let linkId in NLC.nodesAndLinksData.linksById) {    
        let link = JSON.parse(JSON.stringify(NLC.nodesAndLinksData.linksById[linkId]))
        
        let fromNode = nodesById[link.fromNodeId]
        let toNode = nodesById[link.toNodeId]
        
        let fromNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[fromNode.id]
        let toNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[toNode.id]

        let highestLevelOfDetailOfFromAndTo = fromNodeFromLevelOfDetail
        if (toNodeFromLevelOfDetail > highestLevelOfDetailOfFromAndTo) {
            highestLevelOfDetailOfFromAndTo = toNodeFromLevelOfDetail
        }
        
        link.lod = {
            // FIXME: which one should we choose: LAYERED or NOT? (also note BS->App "color"-issue)
            from: highestLevelOfDetailOfFromAndTo,
            // from: highLod, // FIXME: Should we take this highest in nodesByFromLevelOfDetail instead? Or simply the highest (but one) in types.js? -> highLod
            to: maxLod
        }
        
        // We always want the original links, so we add it to the set of virtualLinks
        virtualLinksById[link.id] = link
        virtualLinksByFromLod[link.lod.from].push(link)
        
        if (!(link.fromNodeId in linksByFromNodeId)) {
            linksByFromNodeId[link.fromNodeId] = []
        }
        if (!(link.toNodeId in linksByToNodeId)) {
            linksByToNodeId[link.toNodeId] = []
        }
        linksByFromNodeId[link.fromNodeId].push(link)
        linksByToNodeId[link.toNodeId].push(link)
    }
    
    /*
    
    => Chaining: 
    
    Left-over issues:
    
     0.1 - BAD is connecting to its OWN parent! (Bijsturing!) *if* you add ILSETimetableMutBlauwSS to the domain Bijsturing!
    
     0.2 - There are several issue regarding having multiple virtualLinks with the same id. These should be bundled.
           HOWEVER: sometimes a new virtualLink with the same id is created after "extened chaining" (for example domain-domain link '390-370').
                   this is because the initial new virtualLink that is created (at the highest lod 0.05-0.4). But LATER this one is ALSO replaced
                   by a virtualLink with lod 0.05-0.2 (NOTE: PstatusInzetRealisatieET related! which is a DIFFERENT chain!). 
                   This problem is related to grouping and layering. But it also is a BUG because no overlapping virtualLink should be created when replacing one.
           SOVLED -> An UNDERLYING problem: the links that connect to the *Applications* get a from/to-lod (when they are copied as virtualLinks) are *ONLY*
              being at the *HIGHEST* lod. YET, their from-lod should be lower, depending on where they are *ATTACHED* to
                   
     SOLVED 0.5 - PstatusInzetRealisatieET connects PSS with BAP. Which also connects DPK with Bijsturing. BUT, when this topic is not shown on a diagram,
           the virtualLink (on a more detailed level) will dissappear, because the lower-lod link is "making room" for the more detailed one. YET, the detailed one
           will *not* be shown.
            -> The ISSUE is here that we should make the from/to lod of virtualLinks set according to what *IN* a diagram.
    
     1 - Chains that contain only the highest lod (like only mediations) will be chained with virtualLinks that are ONLY visible at the *lowest* level, but will dissapear at the *medium* level
        -> Example: Donna -> BAM
     SOLVED 2 - highest level links that are not connected (that is: no chain leading) to a lower node, will always stay visible
                 -> See BIJS, below BAM
     SOLVED 3 - Some medium links are not replaced by lower-lod virual links
        - this is probably caused by the fact that you don't start with these nodes?
        -> Example: BS -> APP connections
     SOLVED 4 - Showing "all" (aka "highest") detail also shows virtual link that should only shown at the lowest level of detail
     SOLVED 5 - In the domain-diagam, low-links are shown first, when zooming in, they are not, even though medium (and high) nodes are *not placed* in this diagram!
        -> should we calculate using the *placed* nodes instead?
     6 - SPEED! (also when panning!)
        -> Why is SEARCHING SLOW???
     
     Extended chaining (with parents):
     
     SOLVED * - We want links that are attached to nodes that will disappear to be replaced by virtualLink that connects to the *PARENT* (or grand parent) of that node,
         if the original link crosses the border of that parent. Otherwise we want the link to be replaced by a virtualLink that will simply chain serveral "serial" links into one virutalLink.s
          -> each time a virtualLink is created (also the initial links become virtualLinks) each side can be checked whether thet cross this border:
                 - if checking the to-side: the (grand)parents of the to-nodes are iterated through and each time its checked whether they are the parent of the from-node. This is done until the next lod-level is reached.
                     -> this side of the link is marked as such being 'chainToParent'
          -> when finding chains (in from or to side), - before going to the next link/link - we check whether we should chainToParent. That ends the chain.
     
     Bundling
     
     % - If more that one virualLink is found for a lod, they should be bundled into a group of virtualLinks. Their identifier is "fromId-toId". So there should be at most 2 virtualLink between 2 nodes
          -> visualInfo about these virtualLinks can be stored in the visual-info of the from-node.


     => SOLUTIONS:
     
     - set the from-lod of all orginal links to 0.5. This will solve (2): by default it will dissapear at 0.5 (and since we wont chain it it wont be visible after that)
     - instead of looping through all the nodes with a specific from-lod, we loop through all the links (with a from-lod). We still loop through all lod's taken from the nodes
        - this will ensure (3) can be solved: we will visit links that are not connected to the highest lod-nodes (and by default the link's from-lod is set to 0.5)
     - when checking a link with a certain from-lod, you get the from- and to- chains. If there is a combination of both to and from chain being 1 node
         then this means the from-node has to be chained directly with the to-node, but the current link has to be replaced (and be marked alreadyChained).
         
     - TODO: If it works, do an explantion how it work using the text and code written above and below. Then clean up the code.
     
    */
    
    let fromLevelOfDetailsSorted = Object.keys(nodesByFromLevelOfDetail).sort().reverse()
    for (let fromLevelOfDetailIndex in fromLevelOfDetailsSorted) {
        let fromLevelOfDetail = fromLevelOfDetailsSorted[fromLevelOfDetailIndex]
        
        let linksWithCertainFromLevelOfDetail = virtualLinksByFromLod[fromLevelOfDetail]
        
        for (let virtualLinkIndex in linksWithCertainFromLevelOfDetail) {
            let virtualLink = linksWithCertainFromLevelOfDetail[virtualLinkIndex]
            
            // Only proceed / add new virtualLinks (to replace the current link) if this link hasn't already been chained
            if ('alreadyChained' in virtualLink) {
                continue
            }
            
            let doLog = false

            // FIXME: add the virtualLink itself too!?
            let toChainsWithLowerFromLevelOfDetail = findToChainsWithLowerFromLevelOfDetail(virtualLink, fromLevelOfDetail, {}, diagramId, linksByFromNodeId, doLog)
            // FIXME: add the virtualLink itself too!?
            let fromChainsWithLowerFromLevelOfDetail = findFromChainsWithLowerFromLevelOfDetail(virtualLink, fromLevelOfDetail, {}, diagramId, linksByToNodeId, doLog)
                
            for (let fromChainIndex in fromChainsWithLowerFromLevelOfDetail) {
                let fromChain = fromChainsWithLowerFromLevelOfDetail[fromChainIndex]
                let firstFromNode = fromChain[0]
                let firstFromNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[firstFromNode.id]
                    
                for (let toChainIndex in toChainsWithLowerFromLevelOfDetail) {
                    let toChain = toChainsWithLowerFromLevelOfDetail[toChainIndex]
                    let lastToNode = toChain[toChain.length - 1]
                    
                    if (firstFromNode.id === lastToNode.id) {
                        // TODO: we now prevent a connection between the same node, but don't we want to show this?
                        continue
                    }

                    let lastToNodeFromLevelOfDetail = fromLevelOfDetailPerNodeId[lastToNode.id] 
                    
                    let highestLevelOfDetailOfFromAndTo = firstFromNodeFromLevelOfDetail
                    if (lastToNodeFromLevelOfDetail > highestLevelOfDetailOfFromAndTo) {
                        highestLevelOfDetailOfFromAndTo = lastToNodeFromLevelOfDetail
                    }
                    
                    let newVirutalLinkId = firstFromNode.id + '-' + lastToNode.id // FIXME: what should we use as id?
                    
                    if (newVirutalLinkId in virtualLinksById) {
                        let existingVirtualLink = virtualLinksById[newVirutalLinkId]
                        
                        if (fromLevelOfDetail > existingVirtualLink.lod.to) {
                            existingVirtualLink.lod.to = fromLevelOfDetail
                            // FIXME: what about the lod.from? -> IF you change this though, you also have to put the new virtualLink info a different virtualLinksByFromLod!
                        }
                        
                        // FIXME: store the fact that there are two virtualLinks (so you can show it to the user)
                    }
                    else {
                    
                        let newVirtualLink = {
                            id : newVirutalLinkId,
                            
                            type: "virtual",
                            
                            // FIXME: should we fill this? (with dataType?) -> or is this done by the legenda-functions?
                            commonData : {}, 
                            
                            // FIXME: this data should somehow contain all bundles and chains that we chained by this virtualLink
                            
                            fromNodeId : firstFromNode.id,
                            toNodeId : lastToNode.id,
                            // FIXME: Scale * 2?
                            lod: { 
                                from: highestLevelOfDetailOfFromAndTo, // The higest levelOfDetail of either the firstFromNode or the lastToNode (since one of those to will disappear at that level, so should this link)
                                to: fromLevelOfDetail   // This is where the new links 'ends' (detail-wise)
                            }
                        }

                        virtualLinksById[newVirutalLinkId] = newVirtualLink
                        virtualLinksByFromLod[newVirtualLink.lod.from].push(newVirtualLink)
                        // FIXME: clean this up!
                        if (!(newVirtualLink.fromNodeId in linksByFromNodeId)) {
                            linksByFromNodeId[newVirtualLink.fromNodeId] = []
                        }
                        linksByFromNodeId[newVirtualLink.fromNodeId].push(newVirtualLink)
                        // FIXME: clean this up!
                        if (!(newVirtualLink.toNodeId in linksByToNodeId)) {
                            linksByToNodeId[newVirtualLink.toNodeId] = []
                        }
                        linksByToNodeId[newVirtualLink.toNodeId].push(newVirtualLink)
                    }
                    
                    
                    // We mark all links as being chained (and add the id of the chaining-link to it)
                    markLinksInFromChainAsChained(fromChain, newVirutalLinkId)
                    markLinksInToChainAsChained(toChain, newVirutalLinkId)
                    // The current link has also been chained now
                    markLinkAsChained(virtualLink, newVirutalLinkId)
                    
                }
            
            }
            
        }

    }

    
    // We loop through all the links again, but this time we check if the higher-level links are visible
    // If they are not, we make the links that chained them have a higher to-lod
    
    for (let fromLevelOfDetailIndex in fromLevelOfDetailsSorted) {
        let fromLevelOfDetail = fromLevelOfDetailsSorted[fromLevelOfDetailIndex]
        
        let linksWithCertainFromLevelOfDetail = virtualLinksByFromLod[fromLevelOfDetail]
        
        for (let virtualLinkIndex in linksWithCertainFromLevelOfDetail) {
            let virtualLink = linksWithCertainFromLevelOfDetail[virtualLinkIndex]
            
            let fromNode = nodesById[virtualLink.fromNodeId]
            let toNode = nodesById[virtualLink.toNodeId]
            
            if (!nodeIsInDiagram(fromNode, diagramId) || !nodeIsInDiagram(toNode, diagramId)) {
                // The link can never be shown, since at least one of the nodes it is attached to are not in the current diagram
                
                // This means we have to change the lod-settings of the chaning-links
                
                if ('chainedBy' in virtualLink) {
                    for (let chainedByIndex in virtualLink.chainedBy) {
                        let chainedById = virtualLink.chainedBy[chainedByIndex]
                        
                        let chainingVirtualLink = virtualLinksById[chainedById]
                        
                        chainingVirtualLink.lod.to = virtualLink.lod.to
                    }
                }
                else {
                    // FIXME: do nothing here?
                    // console.log("WARNING: link is never chained?")
                }
            }
        }
    }
    
    
    for (let linkId in virtualLinksById) {
        let link = virtualLinksById[linkId]
        
        if (!('lod' in link)) {
            console.log("ERROR: (virtual)link doesn't have lod-info!")
        }
            
        let fromAndToNodesAreAddedToDiagram = nodeIdsAddedToContainers.hasOwnProperty(link.fromNodeId) &&    
                                              nodeIdsAddedToContainers.hasOwnProperty(link.toNodeId)    
            
        if (!fromAndToNodesAreAddedToDiagram) {    
            // If either the fromNode or the toNode is not added to the diagram, we do not add the link connecting them    
            continue    
        }    
            
        let diagramSpecificVisualDataForLink = null
        if (link.hasOwnProperty('diagramSpecificVisualData') &&     
            link.diagramSpecificVisualData.hasOwnProperty(diagramId)) {
            diagramSpecificVisualDataForLink = link.diagramSpecificVisualData[diagramId]
        }
                              
        if (link.type == 'virtual') {
            // the visualData of a virtual link is currently stored in: fromNode.diagramSpecificVisualData[diagramId].virtualLinks[virutalLink.id]
            let fromNode = nodesById[link.fromNodeId]
            if ('diagramSpecificVisualData' in fromNode &&
                diagramId in fromNode.diagramSpecificVisualData &&
                'virtualLinks' in fromNode.diagramSpecificVisualData[diagramId] &&
                link.id in fromNode.diagramSpecificVisualData[diagramId].virtualLinks) {
                    
                diagramSpecificVisualDataForLink = fromNode.diagramSpecificVisualData[diagramId].virtualLinks[link.id]
            }
        }
        
        if (diagramSpecificVisualDataForLink == null) {
            // The link does not have diagramSpecificVisualData for the selectedDiagram, so we SHOULD not show/add the link
            // FIXME: we should 'continue' here, but the DEFAULT right now is to add it anyway!    
            // FIXME: continue    
        }    
            
        let fromLevelOfDetail = 0.0 // FIXME: should the default really be 0.0?
        let toLevelOfDetail = 1.0  // FIXME: should the default really be 1.0?

        // FIXME: should we do anything here ? Both cases are treated the same right?
        if (NLC.levelOfDetail == "auto") {
            toLevelOfDetail = link.lod['to']
            fromLevelOfDetail = link.lod['from']
        }
        else {
            // TODO: we now assume levelOfDetail == "all" here, so we show all details
            toLevelOfDetail = link.lod['to']
            fromLevelOfDetail = link.lod['from']
        }

// FIXME: maybe only add connection for links that have a from-lod that is lower than maxLod?
        
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
            
        if (diagramSpecificVisualDataForLink != null) {    
            if (diagramSpecificVisualDataForLink.hasOwnProperty('fromConnectionPointIdentifier')) {    
                connectionInfo['fromConnectionPointIdentifier'] = diagramSpecificVisualDataForLink['fromConnectionPointIdentifier']    
            }    
            if (diagramSpecificVisualDataForLink.hasOwnProperty('toConnectionPointIdentifier')) {    
                connectionInfo['toConnectionPointIdentifier'] = diagramSpecificVisualDataForLink['toConnectionPointIdentifier']    
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


// FIXME: DUPLICATE this is from generic.js. Can we make sure generic.js is always loaded?
function groupById (listWithIds) {    
    let elementsById = {}    
    for (let index = 0; index < listWithIds.length; index++) {    
        let listElement = listWithIds[index]    
        elementsById[listElement.id] = listElement    
    }    
    return elementsById    
}    

function groupByIdentifier (listWithIdentifiers) {
    let elementsByIdentifier = {}
    for (let index = 0; index < listWithIdentifiers.length; index++) {
        let listElement = listWithIdentifiers[index]
        elementsByIdentifier[listElement.identifier] = listElement
    }
    return elementsByIdentifier
}
