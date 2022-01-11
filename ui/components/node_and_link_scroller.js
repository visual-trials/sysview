let NodeAndLinkScroller = {
    scrollToSelectedNodeFunction: null,
    scrollToSelectedLinkFunction: null,
}

// Source Page Selector

NodeAndLinkScroller.sourcePageAndPointSelector = {
    // TODO: we probably want the sourcePage to be half of the screen inside the ikb application.
    currentlySelectedSourcePageId : null,
}

NodeAndLinkScroller.getNodeIdFromSourcePointId = function (sourcePage, sourcePointId) {
    let nodeId = null
    for (let sourcePointIndex in sourcePage.sourcePoints) {
        let sourcePoint = sourcePage.sourcePoints[sourcePointIndex]
        if (sourcePoint.id === sourcePointId) {
            nodeId = sourcePoint.nodeId
            break
        }
    }
    return nodeId
}

NodeAndLinkScroller.localStorageChange = function (ev) {
    if (ev.key == 'currentlySelectedSourcePage') {
        var currentlySelectedSourcePageData = JSON.parse(ev.newValue)
        
        if ('sourcePageId' in currentlySelectedSourcePageData &&
            currentlySelectedSourcePageData.sourcePageId in NLC.nodesAndLinksData.sourcePagesById) {
            
            NodeAndLinkScroller.sourcePageAndPointSelector.currentlySelectedSourcePageId = currentlySelectedSourcePageData.sourcePageId
            NLC.dataHasChanged = true
        }
        else {
            console.log("ERROR: could not find sourcePageId in database")
        }
        return
    }
    
    // TODO: we probably want to make this more generic
    if (ev.key != 'currentlySelectedSourcePagePoint') return
    
    var currentlySelectedSourcePagePointData = JSON.parse(ev.newValue)
    if (!currentlySelectedSourcePagePointData) return
    
    console.log(currentlySelectedSourcePagePointData)

    let sourcePage = null
    if ('sourcePageId' in currentlySelectedSourcePagePointData && 
        currentlySelectedSourcePagePointData.sourcePageId in NLC.nodesAndLinksData.sourcePagesById) {
        sourcePage = NLC.nodesAndLinksData.sourcePagesById[currentlySelectedSourcePagePointData.sourcePageId]
    }
    else {
        console.log("ERROR: could not find sourcePageId in database")
        return 
    }

    let oldSelectedNodeId = NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId
    
    let toBeSelectedNodeId = NodeAndLinkScroller.getNodeIdFromSourcePointId(sourcePage, currentlySelectedSourcePagePointData.sourcePointId)
    
    if (toBeSelectedNodeId != null) {
        NodeAndLinkScroller.selectNode(toBeSelectedNodeId, true)
        if (NodeAndLinkScroller.scrollToSelectedNodeFunction != null) {
            NodeAndLinkScroller.scrollToSelectedNodeFunction(toBeSelectedNodeId, oldSelectedNodeId)
        }
        ZUI.interaction.centerViewOnFirstSelectedContainer = true
    }
}


// Node and Link Selector

NodeAndLinkScroller.nodeAndLinkSelector = {
    hoveredNodeId: null,
    hoveredLinkId: null,
    containerOrConnectionHoveringHasChanged: false,
    
    selectedNodeId: null,
	nodeIdsLinkedToSelectedNode: null, // this is used to show other nodes that are connected (via a link) to the selected node
	linkIdsLinkedToSelectedNode: null, // this is used to show other links that are connected to the selected node
    selectedLinkId: null,
	// TODO: maybe add nodeIdsLinkedToSelectedLink and linkIdsLinkedToSelectedLink (via a node)?
    containerOrConnectionSelectionHasChanged: false,
}

NodeAndLinkScroller.hoverNode = function (node) {
    NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = null
    NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = node.id

    ZUI.interaction.currentlyHoveredContainerIdentifier = NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId
    ZUI.interaction.currentlyHoveredConnectionIdentifier = null
    NodeAndLinkScroller.nodeAndLinkSelector.containerOrConnectionHoveringHasChanged = true
}

// TODO: should we updateSelectedContainers like we do in selectNode?
NodeAndLinkScroller.unselectNode = function () {
    NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId = null
	NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode = null
	NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode = null
}

NodeAndLinkScroller.nodeAndLinkSelector.getConnectedNodesForSelectedNode = function () {
    let connectedNodes = []
    if (NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode != null) {
        for (let connectedNodeId in NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode) {
            let connectedNode = NLC.nodesAndLinksData.nodesById[connectedNodeId]
            connectedNodes.push(connectedNode)
        }
    }
    return connectedNodes
}

NodeAndLinkScroller.selectNode = function (nodeId, updateSelectedContainers) {
    let nodesById = NLC.nodesAndLinksData.nodesById
    if (nodesById.hasOwnProperty(nodeId)) {
        let selectedNode = nodesById[nodeId]
        
        NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId = nodeId
		NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode = getLinkedNodeIds(nodeId)
		NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode = getLinkedLinkIds(nodeId)
        // TODO: we also do this when opening the NodeDetail-window. Can we get rid of this call here? (when we do this, we somehow can't close the NodeDetail window...)
        NodeDetail.setEditedNodeUsingOriginalNode(selectedNode)
                
        NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = null
        LinkDetail.setEditedLinkUsingOriginalLink(null)
        
        // Since we always show the selected node (even when the search criteria doesn't match) we have to make sure the nodeType is shown aswell. 
        // This is calculated in updateSearchHitsPerNodeType
        NodeAndLinkScroller.updateSearchHitsPerNodeType()
        
        if (updateSelectedContainers) {
            if (ZUI.containersAndConnections.containers.hasOwnProperty(NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId) &&
                !ZUI.interaction.currentlySelectedContainerIdentifiers.includes(NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId)) {
                    
                ZUI.interaction.currentlySelectedContainerIdentifiers = [NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId]
                ZUI.interaction.currentlySelectedConnectionIdentifier = null
            }
            else {
                ZUI.interaction.currentlySelectedContainerIdentifiers = []
            }
        }
        
    }
    else {
        console.log("ERROR: Could not find node with id: " + nodeId)
    }
}

NodeAndLinkScroller.hoverLink = function (link) {
    NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = link.id
    NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = null
    
    ZUI.interaction.currentlyHoveredConnectionIdentifier = NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId
    ZUI.interaction.currentlyHoveredContainerIdentifier = null
    NodeAndLinkScroller.nodeAndLinkSelector.containerOrConnectionHoveringHasChanged = true
}

NodeAndLinkScroller.selectLink = function (linkId, updateSelectedConnections) {
    
    let linksById = NLC.nodesAndLinksData.linksById
    if (linksById.hasOwnProperty(linkId)) {
        let selectedLink = linksById[linkId]
        
        NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = linkId
        // TODO: we also do this when opening the LinkDetail-window. Can we get rid of this call here? (when we do this, we somehow can't close the LinkDetail window...)
        LinkDetail.setEditedLinkUsingOriginalLink(selectedLink)
    
		NodeAndLinkScroller.unselectNode()
        NodeDetail.setEditedNodeUsingOriginalNode(null)
    
        // Since we always show the selected link (even when the search criteria doesn't match) we have to make sure the linkType is shown aswell. 
        // This is calculated in updateSearchHitsPerLinkType
        NodeAndLinkScroller.updateSearchHitsPerLinkType()
        
        if (updateSelectedConnections) {
            if (ZUI.containersAndConnections.connections.hasOwnProperty(NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId) &&
                ZUI.interaction.currentlySelectedConnectionIdentifier !== NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId) {
                    
                ZUI.interaction.currentlySelectedConnectionIdentifier = NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId
                ZUI.interaction.currentlySelectedContainerIdentifiers = []
            }
            else {
                ZUI.interaction.currentlySelectedConnectionIdentifier = null
            }
        }
    }
    else {
        console.log("ERROR: Could not find link with id: " + linkId)
    }
}


NodeAndLinkScroller.updateNodeAndLinkSelectionsBasedOnZUI = function () {
    
    // TODO: we should only update .hoveredNodeId if it is changed
    let hoveredNodeId = ZUI.interaction.currentlyHoveredContainerIdentifier
    if (hoveredNodeId) {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = hoveredNodeId
    }
    else {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = null
    }
    
    let toBeSelectedNodeIds = ZUI.interaction.currentlySelectedContainerIdentifiers
    if (toBeSelectedNodeIds && toBeSelectedNodeIds.length === 1) {
        // TODO: right now, we only allow 1 node to be selected in Vue. Should we allow more to be selected?
        let toBeSelectedNodeId = toBeSelectedNodeIds[0]
        // FIXME: this is triggered when hovering over the selected container!!
        if (toBeSelectedNodeId !== NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId) {
            let oldSelectedNodeId = NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId
            let updateSelectedContainers = false  // We do not want the selected containers to be updated, only the node
            NodeAndLinkScroller.selectNode(toBeSelectedNodeId, updateSelectedContainers)
            if (NodeAndLinkScroller.scrollToSelectedNodeFunction != null) {
                NodeAndLinkScroller.scrollToSelectedNodeFunction(toBeSelectedNodeId, oldSelectedNodeId)
            }
// FIXME: we want localStorage not to be a global here! We probably want to call a function which has the side-effect of storing something in localStorage.
console.log("currentlySelectedNode: " + toBeSelectedNodeId)
localStorage.setItem('currentlySelectedNode', JSON.stringify({'id' : toBeSelectedNodeId}))
localStorage.removeItem('currentlySelectedNode')
        }
    }
    else {
        // FIXME: do we want to deselect the node if the container is deselected/null? Or only when we explicitily selected into "nothing"?
//        NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId = null
//        NodeDetail.nodeEditor.editedNode = null
// localStorage.setItem('currentlySelectedNode', JSON.stringify({'id' : null}))
// localStorage.removeItem('currentlySelectedNode')
    }
    
    // TODO: we should only update .hoveredLinkId if it is changed
    let hoveredLinkId = ZUI.interaction.currentlyHoveredConnectionIdentifier
    if (hoveredLinkId) {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = hoveredLinkId
    }
    else {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = null
    }
    
    let toBeSelectedLinkId = ZUI.interaction.currentlySelectedConnectionIdentifier
    if (toBeSelectedLinkId) {
        if (toBeSelectedLinkId !== NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId) {
            let oldSelectedLinkId = NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId
            let updateSelectedConnections = false  // We do not want the selected connection to be updated, only the link
            NodeAndLinkScroller.selectLink(toBeSelectedLinkId, updateSelectedConnections)
            if (NodeAndLinkScroller.scrollToSelectedLinkFunction != null) {
                NodeAndLinkScroller.scrollToSelectedLinkFunction(toBeSelectedLinkId, oldSelectedLinkId)
            }
        }
    }
    else {
        // FIXME: do we want to deselect the link if the connnection is deselected/null? Or only when we explicitily selected into "nothing"?
        // NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = null  
    }
}



// Scroller


NodeAndLinkScroller.nodeAndLinkScroller = {
    // FIXME the problem with the list of nodes (and links) in the scroller now is: we loop through all the nodeTypes and show all nodes of that node.type
    //       BUT: if there are any nodes with a DIFFERENT node.type, we will NEVER see them in the GUI!

    showScroller: true,
    
    focusPossible : false,

    dimUninteresting : false, // This option allows you to dim nodes and links in the ZUI that are not in the search/filter

    searchText: '',
    filterOnDiagramContent : true,
	filterOnConnectedElements : false,
    filterOnResponsibleTeam: false, 
    searchHitsPerNodeType : {},
    searchHitsPerLinkType : {},
}

NodeAndLinkScroller.toggleScroller = function () {
    NodeAndLinkScroller.nodeAndLinkScroller.showScroller = !NodeAndLinkScroller.nodeAndLinkScroller.showScroller
}

NodeAndLinkScroller.searchChanged = function () {
    NodeAndLinkScroller.updateSearchHitsPerNodeType()
    NodeAndLinkScroller.updateSearchHitsPerLinkType()
    
    NodeAndLinkScroller.nodeAndLinkScroller.focusPossible = true
    
    // FIXME: is there a better way of triggering a redraw/re-creation of all the containers and connections?
    NLC.dataHasChanged = true
}

NodeAndLinkScroller.nodeMatchesSearchAndFilter = function (node) {
    
    let match = true
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnDiagramContent) {
        if (!nodeIsInDiagram(node, DiagramLegendaLodSelector.diagramSelector.selectedDiagramId)) {
            match = false
        }
    }
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnResponsibleTeam) {
        let teamIsResponsibleForNode = false
        let currentUserTeamId = UserManagement.getUserTeamId()
        if ('responsibleTeamId' in node.commonData &&
            currentUserTeamId && node.commonData.responsibleTeamId === currentUserTeamId) {
            teamIsResponsibleForNode = true
        }
        if (!teamIsResponsibleForNode) {
            match = false
        }
    }
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.searchText !== '') {
        // If the name doesn't match the search text (but the search text is filled) then we filter it out
        if ('name' in node.commonData) {
            if (node.commonData.name.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1) {
                match = false
            }
        }
        else {
            console.log("WARNING: the node with id " + node.id + " has no name!")
            match = false
        }
        
    }

    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnConnectedElements) {
		// We only show the nodes that are connected through a link with each other
		if (NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode == null || !(node.id in NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode)) {
			match = false
		}
	}

    // Always show the selected node
    // TODO: should we also do this when the selected node is not on the diagram? (and we are filtering on diagram content?)
    if (NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId === node.id) {
//        match = true
    }
    
    return match
}

NodeAndLinkScroller.linkMatchesSearchAndFilter = function (link) {
    let match = true
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnDiagramContent) {
        if (!linkIsInDiagram(link, DiagramLegendaLodSelector.diagramSelector.selectedDiagramId)) {
            match = false
        }
    }
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnResponsibleTeam) {
        let teamIsResponsibleForLink = false
        let currentUserTeamId = UserManagement.getUserTeamId()
        if ('responsibleTeamId' in link.commonData &&
            currentUserTeamId && link.commonData.responsibleTeamId === currentUserTeamId) {
            teamIsResponsibleForLink = true
        }
        if (!teamIsResponsibleForLink) {
            match = false
        }
    }
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.searchText !== '') {
        // If both the fromNodeName and the toNodeName doesnt match the searchText, we filter out this link
        if ('fromNodeName' in link && 'toNodeName' in link) {
            if (link.fromNodeName.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1 &&
                link.toNodeName.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1
            ) {
                match = false
            }
        }
        else {
            console.log("WARNING: link with id " + link.id + " either has no fromNodeName or no toNodeName!")
            match = false
        }
    }
    
    if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnConnectedElements) {
		// We only show the nodes that are connected through a link with each other
		if (NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode == null || !(link.id in NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode)) {
			match = false
		}
	}

    // Always show the selected link
    // TODO: should we also do this when the selected link is not on the diagram? (and we are filtering on diagram content?)
    if (NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId === link.id) {
        match = true
    }
    
    return match
}

NodeAndLinkScroller.updateSearchHitsPerNodeType = function () {
    let nodes = NLC.nodesAndLinksData.nodes
    
    NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerNodeType = {}
    for (let nodeIndex = 0; nodeIndex < nodes.length; nodeIndex++) {
        let node = nodes[nodeIndex]
        if (NodeAndLinkScroller.nodeMatchesSearchAndFilter(node)) {
            if (!NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerNodeType.hasOwnProperty(node.type)) {
                NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerNodeType[node.type] = 0
            }
            NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerNodeType[node.type]++
        }
    }
}
    
NodeAndLinkScroller.updateSearchHitsPerLinkType = function () {
    let links = NLC.nodesAndLinksData.links
    
    NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType = {}
    for (let linkIndex = 0; linkIndex < links.length; linkIndex++) {
        let link = links[linkIndex]
        if (NodeAndLinkScroller.linkMatchesSearchAndFilter(link)) {
            if (!NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType.hasOwnProperty(link.type)) {
                NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType[link.type] = 0
            }
            NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType[link.type]++
        }
    }
}
