let SourceInfo = {
    getSourceYPositionFunction : null
}

SourceInfo.inputChanged = function (detailType, key, data, refData, fieldPath) {

	let currentDateTimeISO = getCurrentDateTimeISO()
                          
    // Right now we only allow for one sourceLink per field AND we do not allow for sourceLinks to change their type (or id)
    // So have currently have a very simple logic:
    //    If there is no sourceLink, we create one here
    //    If there is a sourceLink, we use/edit that one
    
    let matchingSourceLink = findMatchingSourceLink(key, refData, fieldPath)
    
    if (matchingSourceLink == null) {
        
        // TODO: maybe by default choose sourceType 'document' (instead of 'manual'), and auto-select a sourceDocument 
        //       that is already part of this node (for example taking the first functionalDocument) 
        
        let newSourceLinkInfo = { 
            "linkType" : detailType,
            "sourceType" : "manual",
            "field" : getFullField(key, fieldPath),
            "certainty" : "medium", 
            "userLogin" : UserManagement.getUserLogin(),
            "userName" : UserManagement.getUserFullName(),
            "date" : currentDateTimeISO
        }
        
        if (detailType == 'node') {
            newSourceLinkInfo.nodeId = refData.id
        }
        else if (detailType == 'link') {
            newSourceLinkInfo.linkId = refData.id
        }

        // This ensures that next time the input is changed the matchingSourceLink is the newSourceLinkInfo
        insertOrUpdateSourceLink(key, refData, fieldPath, newSourceLinkInfo)
        
        let newSourceInfo = SourceInfo.assembleSourceInfoBasedOnSourceLink(key, data, newSourceLinkInfo)
        if (detailType === 'node') {
            NodeDetail.nodeEditor.nodeSourceInfo = newSourceInfo
        }
        else {
            LinkDetail.linkEditor.linkSourceInfo = newSourceInfo
        }
        
        // The call to generateNewId together will the call-back function below will ensure that the new souceLink
        // will have an id when we store it as a new sourceLink
        function setNewSourceLinkId (newId) {
            newSourceLinkInfo.id = newId
        }
        generateNewId(setNewSourceLinkId) // ASYNC!
        
    }
    else {
        // FIXME: if the existing sourceLink is of a different type, we need to remove existing fields in it!
        // For now we assume we are changing the current sourceLink and update it
        matchingSourceLink["userLogin"] = UserManagement.getUserLogin()
        matchingSourceLink["userName"] = UserManagement.getUserFullName()
        matchingSourceLink["date"] = currentDateTimeISO
    }
}

SourceInfo.showSource = function (sourceYPosition, detailType, key, data, refData, fieldPath) {

    let matchingSourceLink = findMatchingSourceLink(key, refData, fieldPath)
    
    let sourceInfo = SourceInfo.assembleSourceInfoBasedOnSourceLink(key, data, matchingSourceLink)

    if (detailType === 'node') {
        NodeDetail.nodeEditor.nodeSourceYPosition = sourceYPosition
        NodeDetail.nodeEditor.nodeSourceInfo = sourceInfo
        // NodeDetail.nodeEditor.showNodeSource = true
    }
    else if (detailType === 'link') {
        LinkDetail.linkEditor.linkSourceYPosition = sourceYPosition
        LinkDetail.linkEditor.linkSourceInfo = sourceInfo
        // LinkDetail.linkEditor.showLinkSource = true
    }
    else {
        console.log("ERROR: unknown detailType: " + detailType)
    }
}

SourceInfo.sourceColorForField = function (detailType, key, data, refData, fieldPath) {
    
    let matchingSourceLink = findMatchingSourceLink(key, refData, fieldPath)

    let sourceInfo = SourceInfo.assembleSourceInfoBasedOnSourceLink(key, data, matchingSourceLink)
    
    let colors = SourceInfo.colorsForSource(sourceInfo)
    if (detailType === 'node') {
        if (NodeDetail.nodeEditor.showNodeSource) {
            return colors
        }
    }
    else if (detailType === 'link'){
        if (LinkDetail.linkEditor.showLinkSource) {
            return colors
        }
        
    }
    else {
        console.log("ERROR: unknown detailType: " + detailType)
        return {}
    }
}

SourceInfo.colorsForSource = function (sourceInfo) {
    let colorsForThisSource = {
        "bg-secondary" : true,
        "text-white" : true,
    }
    if ('sourceLink' in sourceInfo && 'certainty' in sourceInfo.sourceLink) {
        let certaintyColors = {
            "veryHigh" : { 
                "bg-dark-green" : true,
                "text-white" : true,
            },
            "high" : { 
                "bg-green" : true,
                "text-white" : true,
            },
            "medium" : { 
                "bg-orange" : true,
                "text-white" : true,
            },
            "low" : { 
                "bg-red" : true,
                "text-white" : true,
            },
            "veryLow" : { 
                "bg-dark-red" : true,
                "text-white" : true,
            },
            "fake" : { 
                "bg-purple" : true,
                "text-white" : true,
            },
        }
        
        if (sourceInfo.sourceLink.certainty in certaintyColors) {
            colorsForThisSource = certaintyColors[sourceInfo.sourceLink.certainty]
        }
    }
    
    return colorsForThisSource
}

SourceInfo.assembleSourceInfoBasedOnSourceLink = function(key, data, matchingSourceLink) {
    let sourceInfo = { 'sourceState' : 'unknown' }
    if (key in data) {
        // The key is in the data, we check if we have source-information
        if (matchingSourceLink != null) {
            sourceInfo = {
                'sourceState' : 'known',
                'sourceLink' : matchingSourceLink
            }
            
            if (matchingSourceLink.sourceType == 'document') {
                // FIXME: if sourceType is 'document', then add the sourceDocument data to the sourceInfo!
                if (matchingSourceLink.sourceDocumentId in NLC.nodesAndLinksData.sourceDocumentsById) {
                    sourceInfo.sourceDocument = NLC.nodesAndLinksData.sourceDocumentsById[matchingSourceLink.sourceDocumentId]
                }
            }
        }
        else {
            sourceInfo = { 'sourceState' : 'unknownSource' }
        }
    }
    else {
        // The key is not in the data, so we have no date (and therefore no source)
        sourceInfo = { 'sourceState' : 'noData' }
        
        // Note: if there is a sourceLink, but not the data, it should probably have been removed
        if (matchingSourceLink != null) {
            console.log("WARNING: we have no data for field " +matchingSourceLink.field+" but we do have a matchingSourceLink! (id="+matchingSourceLink.id+")")
        }
    }
    return sourceInfo
}
