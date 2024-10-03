function CreateNewNodeAndLinkScroller() {

    let NodeAndLinkScroller = {
        scrollToSelectedNodeFunction: null,
        scrollToSelectedTeamFunction: null,
        scrollToSelectedLinkFunction: null,
    }

    // Source Diagram Selector

    NodeAndLinkScroller.sourceDiagramAndPointSelector = {
        // TODO: we probably want the sourceDiagram to be half of the screen inside the ikb application.
        currentlySelectedSourceDiagramId : null,
    }

    NodeAndLinkScroller.getNodeIdFromSourcePointId = function (sourceDiagram, sourcePointId) {
        let nodeId = null
        for (let sourcePointIndex in sourceDiagram.sourcePoints) {
            let sourcePoint = sourceDiagram.sourcePoints[sourcePointIndex]
            if (sourcePoint.id === sourcePointId) {
                nodeId = sourcePoint.nodeId
                break
            }
        }
        return nodeId
    }

    NodeAndLinkScroller.localStorageChange = function (ev) {
        if (ev.key == 'currentlySelectedSourceDiagram') {
            var currentlySelectedSourceDiagramData = JSON.parse(ev.newValue)
            
            if ('sourceDiagramId' in currentlySelectedSourceDiagramData &&
                currentlySelectedSourceDiagramData.sourceDiagramId in NLC.nodesAndLinksData.sourceDiagramsById) {
                
                NodeAndLinkScroller.sourceDiagramAndPointSelector.currentlySelectedSourceDiagramId = currentlySelectedSourceDiagramData.sourceDiagramId
                NLC.dataHasChanged = true
            }
            else {
                console.log("ERROR: could not find sourceDiagramId in database")
            }
            return
        }
        
        // TODO: we probably want to make this more generic
        if (ev.key != 'currentlySelectedSourceDiagramPoint') return
        
        var currentlySelectedSourceDiagramPointData = JSON.parse(ev.newValue)
        if (!currentlySelectedSourceDiagramPointData) return
        
        console.log(currentlySelectedSourceDiagramPointData)

        let sourceDiagram = null
        if ('sourceDiagramId' in currentlySelectedSourceDiagramPointData && 
            currentlySelectedSourceDiagramPointData.sourceDiagramId in NLC.nodesAndLinksData.sourceDiagramsById) {
            sourceDiagram = NLC.nodesAndLinksData.sourceDiagramsById[currentlySelectedSourceDiagramPointData.sourceDiagramId]
        }
        else {
            console.log("ERROR: could not find sourceDiagramId in database")
            return 
        }

        let oldSelectedNodeId = NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId
        
        let toBeSelectedNodeId = NodeAndLinkScroller.getNodeIdFromSourcePointId(sourceDiagram, currentlySelectedSourceDiagramPointData.sourcePointId)
        
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
        hoveredTeamId: null,
        containerOrConnectionHoveringHasChanged: false,
        
        selectedNodeId: null,
        nodeIdsLinkedToSelectedNode: null, // this is used to show other nodes that are connected (via a link) to the selected node
        
        selectedLinkId: null,
        linkIdsLinkedToSelectedNode: null, // this is used to show other links that are connected to the selected node
        
        selectedTeamId: null,
// FIXME: do we need this?        teamIdsLinkedToSelectedNode: null, // this is used to show other nodes that are connected (via a link) to the selected node
        
        // TODO: maybe add nodeIdsLinkedToSelectedLink and linkIdsLinkedToSelectedLink (via a node)?
        containerOrConnectionSelectionHasChanged: false,
    }

    NodeAndLinkScroller.hoverNode = function (node) {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = null
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = node.id
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId = null

        let containerIdentifiersInDiagram = getContainerIdentifiersInDiagramByContainerId(NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId)
        if (containerIdentifiersInDiagram) {
            // FIXME: for now take the first node we find in the diagram!
            ZUI.interaction.currentlyHoveredContainerIdentifier = containerIdentifiersInDiagram[0]
        }
        else {
            ZUI.interaction.currentlyHoveredContainerIdentifier = null
        }
        ZUI.interaction.currentlyHoveredConnectionIdentifier = null
        NodeAndLinkScroller.nodeAndLinkSelector.containerOrConnectionHoveringHasChanged = true
    }

    // TODO: should we updateSelectedContainers like we do in selectNode?
    NodeAndLinkScroller.unselectNode = function () {
        NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId = null
        NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode = null
        NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode = null
    }
    
    NodeAndLinkScroller.unselectLink = function () {
        NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = null
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
            
            NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId = null
            // LinkDetail.setEditedTeamUsingOriginalTeam(null)
            
            // Since we always show the selected node (even when the search criteria doesn't match) we have to make sure the nodeType is shown aswell. 
            // This is calculated in updateSearchHitsPerNodeType
            NodeAndLinkScroller.updateSearchHitsPerNodeType()
            
            if (updateSelectedContainers) {
                
                let currentlySelectedContainerIds = []
                for (let currentlySelectedContainerIdentifiersIndex in ZUI.interaction.currentlySelectedContainerIdentifiers) {
                    let currentlySelectedContainerId = convertContainerIdentifierToContainerId(ZUI.interaction.currentlySelectedContainerIdentifiers[currentlySelectedContainerIdentifiersIndex])
                    currentlySelectedContainerIds.push(currentlySelectedContainerId)
                }
                
                let containerIdentifiersInDiagram = getContainerIdentifiersInDiagramByContainerId(NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId)
                if (containerIdentifiersInDiagram &&
                    !currentlySelectedContainerIds.includes(NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId)) {

                    // FIXME: for now take the first node we find in the diagram! AND we put it in the ARRAY of selected container
                    //        MAYBE we can select them ALL?
                    ZUI.interaction.currentlySelectedContainerIdentifiers = [containerIdentifiersInDiagram[0]]
                }
                else {
                    ZUI.interaction.currentlySelectedContainerIdentifiers = []
                }
             
                ZUI.interaction.currentlySelectedConnectionIdentifier = null
            }
            
        }
        else {
            console.log("ERROR: Could not find node with id: " + nodeId)
        }
    }

    NodeAndLinkScroller.hoverLink = function (link) {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = link.id
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = null
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId = null
        
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
        
            NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId = null
            // LinkDetail.setEditedTeamUsingOriginalTeam(null)
            
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

    NodeAndLinkScroller.hoverTeam = function (team) {
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId = team.id
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredLinkId = null
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = null

        let containerIdentifiersInDiagram = getContainerIdentifiersInDiagramByContainerId(NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId)
        if (containerIdentifiersInDiagram) {
            // FIXME: for now take the first node we find in the diagram!
            ZUI.interaction.currentlyHoveredContainerIdentifier = containerIdentifiersInDiagram[0]
        }
        else {
            ZUI.interaction.currentlyHoveredContainerIdentifier = null
        }
        ZUI.interaction.currentlyHoveredConnectionIdentifier = null
        NodeAndLinkScroller.nodeAndLinkSelector.containerOrConnectionHoveringHasChanged = true
    }

    NodeAndLinkScroller.selectTeam = function (teamId, updateSelectedContainers) {
        let teamsById = NLC.nodesAndLinksData.teamsById
        if (teamsById.hasOwnProperty(teamId)) {
            let selectedTeam = teamsById[teamId]
            
            NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId = teamId
            NodeAndLinkScroller.nodeAndLinkSelector.nodeIdsLinkedToSelectedNode = null
            NodeAndLinkScroller.nodeAndLinkSelector.linkIdsLinkedToSelectedNode = null
            // NodeDetail.setEditedTeamUsingOriginalTeam(selectedTeam)
                    
            NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId = null
            NodeAndLinkScroller.nodeAndLinkSelector.selectedLinkId = null
            LinkDetail.setEditedLinkUsingOriginalLink(null)
            NodeDetail.setEditedNodeUsingOriginalNode(null)
            
            // NOT? Since we always show the selected team (even when the search criteria doesn't match) we have to make sure the teamType is shown aswell. 
            // This is calculated in updateSearchHitsPerTeamType
            NodeAndLinkScroller.updateSearchHitsPerTeamType()
            
            if (updateSelectedContainers) {
                
                let currentlySelectedContainerIds = []
                for (let currentlySelectedContainerIdentifiersIndex in ZUI.interaction.currentlySelectedContainerIdentifiers) {
                    let currentlySelectedContainerId = convertContainerIdentifierToContainerId(ZUI.interaction.currentlySelectedContainerIdentifiers[currentlySelectedContainerIdentifiersIndex])
                    currentlySelectedContainerIds.push(currentlySelectedContainerId)
                }
                
                let containerIdentifiersInDiagram = getContainerIdentifiersInDiagramByContainerId(NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId)
                if (containerIdentifiersInDiagram &&
                    !currentlySelectedContainerIds.includes(NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId)) {

                    // FIXME: for now take the first team we find in the diagram! AND we put it in the ARRAY of selected container
                    //        MAYBE we can select them ALL?
                    ZUI.interaction.currentlySelectedContainerIdentifiers = [containerIdentifiersInDiagram[0]]
                }
                else {
                    ZUI.interaction.currentlySelectedContainerIdentifiers = []
                }
             
                ZUI.interaction.currentlySelectedConnectionIdentifier = null
            }
            
        }
        else {
            console.log("ERROR: Could not find node with id: " + nodeId)
        }
    }


    NodeAndLinkScroller.updateNodeAndLinkSelectionsBasedOnZUI = function () {
        
        // TODO: we should only update .hoveredNodeId if it is changed
        let hoveredContainerId = convertContainerIdentifierToContainerId(ZUI.interaction.currentlyHoveredContainerIdentifier)
        let hoveredContainerType = containerTypeByIdentifier(ZUI.interaction.currentlyHoveredContainerIdentifier)
        
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = null
        NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId = null
        if (hoveredContainerId) {
            if (hoveredContainerType == 'node') {
                NodeAndLinkScroller.nodeAndLinkSelector.hoveredNodeId = hoveredContainerId
            }
            else if (hoveredContainerType == 'team') {
                NodeAndLinkScroller.nodeAndLinkSelector.hoveredTeamId = hoveredContainerId
            }
        }
        
        let selectedContainerIdentifiers = ZUI.interaction.currentlySelectedContainerIdentifiers
        if (selectedContainerIdentifiers && selectedContainerIdentifiers.length === 1) {
            // TODO: right now, we only allow 1 node to be selected in Vue. Should we allow more to be selected?
            let selectedContainerIdentifier = selectedContainerIdentifiers[0]
            
            let toBeSelectedContainerId = convertContainerIdentifierToContainerId(selectedContainerIdentifier)

            let containerType = containerTypeByIdentifier(selectedContainerIdentifier)

            if (containerType == 'node') {
                let toBeSelectedNodeId = toBeSelectedContainerId
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
            else if (containerType == 'team') {
                let toBeSelectedTeamId = toBeSelectedContainerId
                // FIXME: this is triggered when hovering over the selected container!!
                if (toBeSelectedTeamId !== NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId) {
                    let oldSelectedTeamId = NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId
                    let updateSelectedContainers = false  // We do not want the selected containers to be updated, only the node
                    NodeAndLinkScroller.selectTeam(toBeSelectedTeamId, updateSelectedContainers)
                    if (NodeAndLinkScroller.scrollToSelectedTeamFunction != null) {

                        NodeAndLinkScroller.scrollToSelectedTeamFunction(toBeSelectedTeamId, oldSelectedTeamId)
                    }
        // FIXME: we want localStorage not to be a global here! We probably want to call a function which has the side-effect of storing something in localStorage.
        console.log("currentlySelectedTeam: " + toBeSelectedTeamId)
                }
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
        filterOnDiagramContent : false,
        filterOnConnectedElements : false,
        filterOnResponsibleTeam: false, 
        searchHitsPerNodeType : {},
        searchHitsPerLinkType : {},
        searchHitsPerTeamType : {},
    }

    NodeAndLinkScroller.toggleScroller = function () {
        NodeAndLinkScroller.nodeAndLinkScroller.showScroller = !NodeAndLinkScroller.nodeAndLinkScroller.showScroller
    }

    NodeAndLinkScroller.searchChanged = function () {
        NodeAndLinkScroller.updateSearchHitsPerNodeType()
        NodeAndLinkScroller.updateSearchHitsPerLinkType()
        NodeAndLinkScroller.updateSearchHitsPerTeamType()
        
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
            if ('responsibleTeamId' in node &&
                currentUserTeamId && node.responsibleTeamId === currentUserTeamId) {
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
            if ('responsibleTeamId' in link &&
                currentUserTeamId && link.responsibleTeamId === currentUserTeamId) {
                teamIsResponsibleForLink = true
            }
            if (!teamIsResponsibleForLink) {
                match = false
            }
        }
        
        if (NodeAndLinkScroller.nodeAndLinkScroller.searchText !== '') {
            
            if (link.fromNodeId in NLC.nodesAndLinksData.nodesById && link.toNodeId in NLC.nodesAndLinksData.nodesById) {
            
                // If both the fromNodeName and the toNodeName doesnt match the searchText, we filter out this link
            
                let fromNode = NLC.nodesAndLinksData.nodesById[link.fromNodeId]
                let toNode = NLC.nodesAndLinksData.nodesById[link.toNodeId]
                
                let toNodeName = toNode.commonData.name
                let fromNodeName = fromNode.commonData.name
                
                if (fromNodeName.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1 &&
                    toNodeName.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1
                ) {
                    match = false
                }
            }
            else {
                console.log("WARNING: link with id " + link.id + " either has no valid fromNode or no toNode!")
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
    
    
    NodeAndLinkScroller.teamMatchesSearchAndFilter = function (team) {
        
        let match = true
        
        if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnDiagramContent) {
            if (!teamIsInDiagram(team, DiagramLegendaLodSelector.diagramSelector.selectedDiagramId)) {
                match = false
            }
        }
        
        if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnResponsibleTeam) {
            let currentUserTeamId = UserManagement.getUserTeamId()
            // FIXME: we might also want to add the Cluster and the ResultArea the team is part of!
            if (team.id !== currentUserTeamId) {
                match = false
            }
        }
        
        if (NodeAndLinkScroller.nodeAndLinkScroller.searchText !== '') {
            // If the name doesn't match the search text (but the search text is filled) then we filter it out
            if (team.name.toUpperCase().indexOf(NodeAndLinkScroller.nodeAndLinkScroller.searchText.toUpperCase()) === -1) {
                match = false
            }
        }

        if (NodeAndLinkScroller.nodeAndLinkScroller.filterOnConnectedElements) {
            // FIXME: is this still used? What should we do here?
        }

        // Always show the selected node
        // TODO: should we also do this when the selected team is not on the diagram? (and we are filtering on diagram content?)
        if (NodeAndLinkScroller.nodeAndLinkSelector.selectedTeamId === team.id) {
// FIXME: should we enable this again?
    //        match = true
        }
        
        return match
    }
    

    NodeAndLinkScroller.updateSearchHitsPerNodeType = function () {
        let nodes = NLC.nodesAndLinksData.nodes
        
        NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerNodeType = {}
        for (let nodeIndex in nodes) {
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
        for (let linkIndex in links) {
            let link = links[linkIndex]
            if (NodeAndLinkScroller.linkMatchesSearchAndFilter(link)) {
                if (!NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType.hasOwnProperty(link.type)) {
                    NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType[link.type] = 0
                }
                NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerLinkType[link.type]++
            }
        }
    }
    
    NodeAndLinkScroller.updateSearchHitsPerTeamType = function () {
        let teams = NLC.nodesAndLinksData.teams
        
        NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerTeamType = {}
        for (let teamIndex in teams) {
            let team = teams[teamIndex]
            if (NodeAndLinkScroller.teamMatchesSearchAndFilter(team)) {
                if (!NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerTeamType.hasOwnProperty(team.type)) {
                    NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerTeamType[team.type] = 0
                }
                NodeAndLinkScroller.nodeAndLinkScroller.searchHitsPerTeamType[team.type]++
            }
        }
    }
        
    return NodeAndLinkScroller
}
