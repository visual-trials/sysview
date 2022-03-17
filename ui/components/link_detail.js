let LinkDetail = {
    linkEditor: {
        editedLink: null,
        showLinkSource: true,
        linkSourceYPosition : null,
        linkSourceInfo : {},    
    },
    openLinkDetailFunction : null,
    closeLinkDetailFunction : null,
}

LinkDetail.getFromNodeName = function (link) {
	if (link.fromNodeId in NLC.nodesAndLinksData.nodesById) {
		let fromNode = NLC.nodesAndLinksData.nodesById[link.fromNodeId]
		let fromNodeName = fromNode.commonData.name
		return fromNodeName
	}
	else {
		console.log("WARNING: link with id " + link.id + " either has no valid fromNode!")
	}
}

LinkDetail.getToNodeName =  function (link) {
	if (link.toNodeId in NLC.nodesAndLinksData.nodesById) {
		let toNode = NLC.nodesAndLinksData.nodesById[link.toNodeId]
		let toNodeName = toNode.commonData.name
		return toNodeName
	}
	else {
		console.log("WARNING: link with id " + link.id + " either has no valid toNode!")
	}
}

LinkDetail.setEditedLinkUsingOriginalLink = function (originalLink) {
    
    if (originalLink == null) {
        LinkDetail.linkEditor.editedLink = null
    }
    else {
        // TODO: right now, we clone the link! Only when we SAVE will it be copied back again!
        LinkDetail.linkEditor.editedLink = JSON.parse(JSON.stringify(originalLink))
    }
}

LinkDetail.toggleShowLinkSource = function () {
    if (LinkDetail.linkEditor.showLinkSource) {
        LinkDetail.linkEditor.showLinkSource = false
        LinkDetail.linkEditor.linkSourceYPosition = null
    }
    else {
        LinkDetail.linkEditor.showLinkSource = true
    }
}


LinkDetail.createNewLinkAndOpenDetail = function (linkType) {
    let linkTypeIdentifier = linkType.identifier
    
    let firstSelectedNodeId = null
    let secondSelectedNodeId = null
    let selectedNodeIds = ZUI.interaction.currentlySelectedContainerIdentifiers
    if (selectedNodeIds && selectedNodeIds.length === 2) {
        firstSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
        secondSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[1]
    }
    else if (selectedNodeIds && selectedNodeIds.length === 1) {
        firstSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
    }
    let newLink = createNewLink(linkTypeIdentifier, firstSelectedNodeId, secondSelectedNodeId)
    
    LinkDetail.setEditedLinkUsingOriginalLink(newLink)
    
    LinkDetail.linkEditor.editedLink.isNewLink = true
    
    // Creating a new link id here and (if succesful) async calling open modal
    LinkDetail.generateNewLinkIdAndOpenDetail(LinkDetail.linkEditor.editedLink)
}

LinkDetail.saveLinkDetail = function (editedLink) {
    let linksById = NLC.nodesAndLinksData.linksById
    if (linksById.hasOwnProperty(NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId)) {
        let selectedLink = linksById[NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId]
        
        storeChangesBetweenLinks(selectedLink, editedLink) // ASYNC
        storeChangesBetweenListsOfSourceLinks(selectedLink._sourceLinks, editedLink._sourceLinks) // ASYNC!
        
        // FIXME: is this correct?
        // We are removing the old (and possibly outdated) list of sourceLinks
        delete selectedLink._sourceLinks
        
        LinkDetail.closeLinkDetailFunction()
    }
    else {
        
        // Since editedLink.id does not yet exist, we assume this is a new node (and its id has already been generated). 
        // So we add and store it as a new link here.
        
        // FIXME: shouldn't we have created a sourceLink for every field that have been entered already (manually?) when creating a new link?
        storeNewLink(editedLink)
        
        // TODO: we probably want to auto-select the link here!
        
        // TODO: NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId =
        //       selectedConnectionIdentifier =
        
        delete editedLink.isNewLink
        
        // FIXME: is this correct?
        // We are removing the old (and possibly outdated) list of sourceLinks
        delete editedLink._sourceLinks
        
        LinkDetail.closeLinkDetailFunction()
    }
}

LinkDetail.removeLinkAndCloseDetail = function (editedLink) {
    removeLink(editedLink)
    
    // TODO: create function: unselectLink
    NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = null
    LinkDetail.linkEditor.editedLink = null
    
    LinkDetail.closeLinkDetailFunction()
}


LinkDetail.loadLinkDetailsAndOpenLinkDetail = function (link) {
    
    function openLinkDetail (loadedLinkDetails) {
        
        let linksById = NLC.nodesAndLinksData.linksById
        if (linksById.hasOwnProperty(loadedLinkDetails.id)) {
            let oldOriginalLink = linksById[link.id]
            
            // FIXME: HOW DO WE REPLACE THE ORIGINAL LINK in the links *list*!? Should we get rid of this *list* of links?
            // FIXME: this is a workaround to make sure the link in the links-list is also updated with the new information
            oldOriginalLink.type = loadedLinkDetails.type
            oldOriginalLink.fromNodeId = loadedLinkDetails.fromNodeId
            oldOriginalLink.toNodeId = loadedLinkDetails.toNodeId
            
            oldOriginalLink.commonData = loadedLinkDetails.commonData    
            oldOriginalLink.diagramSpecificVisualData = loadedLinkDetails.diagramSpecificVisualData
            oldOriginalLink.environmentSpecificData = loadedLinkDetails.environmentSpecificData    

            // Overwriting the link in linksById
            linksById[loadedLinkDetails.id] = loadedLinkDetails
            LinkDetail.setEditedLinkUsingOriginalLink(loadedLinkDetails)
        }
        else {
            console.log("ERROR: the details of a link is reloaded, but it doesn't exist anymore in the linksById!?")
        }
            
        LinkDetail.linkEditor.showLinkSource = true
        LinkDetail.linkEditor.nodeSourceYPosition = null
        LinkDetail.openLinkDetailFunction()
    }

    
    let dataDetailsToLoad = [ 'links' , link.id ]
    loadNLCDataDetails(dataDetailsToLoad, openLinkDetail) // ASYNC!
    
}

LinkDetail.generateNewLinkIdAndOpenDetail = function (editedLink) {
    
    function assignIdToNewLinkAndOpenModal(newId) {
        editedLink.id = newId
        
        LinkDetail.openLinkDetailFunction()
    }
    generateNewId(assignIdToNewLinkAndOpenModal) // ASYNC!
}