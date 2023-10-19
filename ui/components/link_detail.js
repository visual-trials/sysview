function CreateNewLinkDetail() {

    let LinkDetail = {
        linkEditor: {
            editedLink: null,
            
            editedChainLink: null,
            editedChainLinkIndex: null,
            addChainLinkModal: null,
        },
        openLinkDetailFunction : null,
        closeLinkDetailFunction : null,
        unselectRemovedLinkFunction : null,
        interactWithZUI : true,
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

    LinkDetail.unsetEditedLink = function () {
        LinkDetail.linkEditor.editedLink = null
    }
        
    LinkDetail.unsetEditedChainLink = function () {
        LinkDetail.linkEditor.editedChainLink = null
        LinkDetail.linkEditor.editedChainLinkIndex = null
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

    LinkDetail.createNewLinkAndOpenDetail = function (linkType) {
        let linkTypeIdentifier = linkType.identifier
        
        let firstSelectedNodeId = null
        let secondSelectedNodeId = null
        if (LinkDetail.interactWithZUI) {
            let selectedNodeIds = ZUI.interaction.currentlySelectedContainerIdentifiers
            if (selectedNodeIds && selectedNodeIds.length === 2) {
                firstSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
                secondSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[1]
            }
            else if (selectedNodeIds && selectedNodeIds.length === 1) {
                firstSelectedNodeId = ZUI.interaction.currentlySelectedContainerIdentifiers[0]
            }
        }
        let newLink = createNewLink(linkTypeIdentifier, firstSelectedNodeId, secondSelectedNodeId)
        
        LinkDetail.setEditedLinkUsingOriginalLink(newLink)
        
        LinkDetail.linkEditor.editedLink.isNewLink = true
        
        // Creating a new link id here and (if succesful) async calling open modal
        LinkDetail.generateNewLinkIdAndOpenDetail(LinkDetail.linkEditor.editedLink) // ASYNC
    }

    LinkDetail.saveLinkDetail = function (editedLink) {
        let linksById = NLC.nodesAndLinksData.linksById
        if (linksById.hasOwnProperty(editedLink.id)) {
            let selectedLink = linksById[editedLink.id]
            
            storeChangesBetweenLinks(selectedLink, editedLink) // ASYNC
            
            LinkDetail.closeLinkDetailFunction()
        }
        else {
            
            // Since editedLink.id does not yet exist, we assume this is a new node (and its id has already been generated). 
            // So we add and store it as a new link here.
            
            // FIXME: WORKAROUND! we should put this inside of _helper!
            delete editedLink.isNewLink
            delete editedLink.fromNodeType
            delete editedLink.toNodeType
            
            storeNewLink(editedLink)
            
            // TODO: we probably want to auto-select the link here!
            
            // TODO: NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId =
            //       selectedConnectionIdentifier =
            
            LinkDetail.closeLinkDetailFunction()
        }
    }

    LinkDetail.removeLinkAndCloseDetail = function (editedLink) {
        removeLink(editedLink)
        
        if (LinkDetail.unselectRemovedLinkFunction) {
            LinkDetail.unselectRemovedLinkFunction()
        }
        LinkDetail.linkEditor.editedLink = null
        LinkDetail.linkEditor.editedChainLink = null
        LinkDetail.linkEditor.editedChainLinkIndex = null
        
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
                oldOriginalLink.identifier = loadedLinkDetails.identifier
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
    
    return LinkDetail
}