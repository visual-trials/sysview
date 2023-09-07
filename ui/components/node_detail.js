function CreateNewNodeDetail() {

    let NodeDetail = {

        nodeEditor: {
            editedNode: null,
            showNodeSource: true,
            nodeSourceYPosition : null,
            
            selectedNodeEnvironmentIdentifier: null, // TODO: we should put environmentIdentifier INSIDE editedNodeEnvironment (so we won't need this field anymore)
            editedNodeEnvironment: null,  // TODO: this is effectively a child of editedNode (editedNode.environmentSpecificData[x])
            // Not supported yet: editedNodeCodeVersion: null, // TODO: this is effectively a child of editedNode (editedNode.codeVersions[x])
            editedNodeFunctionalDocumentVersion: null, // TODO: this is effectively a child of editedNode (editedNode.functionalDocumentVersions[x])
            editedNodeTechnicalDocumentVersion: null, // TODO: this is effectively a child of editedNode (editedNode.technicalDocumentVersions[x])
            
            nodeSourceInfo : {},
        },
        openNodeDetailFunction: null,
        closeNodeDetailFunction: null,
    }

    NodeDetail.toggleShowNodeSource = function () {
        if (NodeDetail.nodeEditor.showNodeSource) {
            NodeDetail.nodeEditor.showNodeSource = false
            NodeDetail.nodeEditor.nodeSourceYPosition = null
        }
        else {
            NodeDetail.nodeEditor.showNodeSource = true
        }
    }

    NodeDetail.isActiveFunctionalDocumentVersion = function (functionalDocumentVersion) {
        if (NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion && 
            NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion.id === functionalDocumentVersion.id) {
            return true
        }
        else {
            return false
        }
    }

    NodeDetail.isActiveTechnicalDocumentVersion = function (technicalDocumentVersion) {
        if (NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion && 
            NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion.id === technicalDocumentVersion.id) {
            return true
        }
        else {
            return false
        }
    }

    NodeDetail.resetEditedFunctionalDocumentVersion = function (editedNode) {
        NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion = null
        if ('functionalDocumentVersions' in editedNode && editedNode.functionalDocumentVersions.length > 0) {
            // FIXME: we default to the first version, maybe do this differently?
            // TODO: right now, we use the clone of the originalNode (=editedNode) of which we take the first version
            NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion = editedNode.functionalDocumentVersions[0]
        }
    }

    NodeDetail.resetEditedTechnicalDocumentVersion = function (editedNode) {
        NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion = null
        if ('technicalDocumentVersions' in editedNode && editedNode.technicalDocumentVersions.length > 0) {
            // FIXME: we default to the first version, maybe do this differently?
            // TODO: right now, we use the clone of the originalNode (=editedNode) of which we take the first version
            NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion = NodeDetail.nodeEditor.editedNode.technicalDocumentVersions[0]
        }
    }

    NodeDetail.selectNodeEnvironment = function (selectedEnvironmentIdentifier) {
        // TODO: we are looping through all versions here. We should have a map instead!
        for (let environmentIdentifier in NodeDetail.nodeEditor.editedNode.environmentSpecificData) {
            let nodeEnvironment = NodeDetail.nodeEditor.editedNode.environmentSpecificData[environmentIdentifier]
            if (environmentIdentifier === selectedEnvironmentIdentifier) {
                NodeDetail.nodeEditor.editedNodeEnvironment = nodeEnvironment
                NodeDetail.nodeEditor.selectedNodeEnvironmentIdentifier = selectedEnvironmentIdentifier
            }
        }
    }

    NodeDetail.selectNodeFunctionalDocumentVersion = function (selectedNodeFunctionalDocumentVersionId) {
        // TODO: we are looping through all versions here. We should have a map instead!
        for (let versionIndex = 0; versionIndex < NodeDetail.nodeEditor.editedNode.functionalDocumentVersions.length; versionIndex++) {
            let functionalDocumentVersion = NodeDetail.nodeEditor.editedNode.functionalDocumentVersions[versionIndex]
            if (functionalDocumentVersion.id === selectedNodeFunctionalDocumentVersionId) {
                NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion = functionalDocumentVersion
            }
        }
    }

    NodeDetail.selectNodeTechnicalDocumentVersion = function (selectedNodeTechnicalDocumentVersionId) {
        // TODO: we are looping through all versions here. We should have a map instead!
        for (let versionIndex = 0; versionIndex < NodeDetail.nodeEditor.editedNode.technicalDocumentVersions.length; versionIndex++) {
            let technicalDocumentVersion = NodeDetail.nodeEditor.editedNode.technicalDocumentVersions[versionIndex]
            if (technicalDocumentVersion.id === selectedNodeTechnicalDocumentVersionId) {
                NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion = technicalDocumentVersion
            }
        }
    }

    NodeDetail.setEditedNodeUsingOriginalNode = function (originalNode) {
        if (originalNode == null) {
            NodeDetail.nodeEditor.editedNode = null
            NodeDetail.nodeEditor.selectedNodeEnvironmentIdentifier = null
            NodeDetail.nodeEditor.editedNodeEnvironment = null
            // NodeDetail.nodeEditor.editedNodeCodeVersion = null
            NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion = null
            NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion = null
        }
        else {
            // TODO: right now, we clone the node! Only when we SAVE will it be copied back again!
            NodeDetail.nodeEditor.editedNode = JSON.parse(JSON.stringify(originalNode))

            NodeDetail.nodeEditor.selectedNodeEnvironmentIdentifier = null
            NodeDetail.nodeEditor.editedNodeEnvironment = null
            if ('environmentSpecificData' in originalNode && originalNode.environmentSpecificData != null && Object.keys(originalNode.environmentSpecificData).length > 0) {
                // FIXME: we default to the 'first' environment, which is possibly random. We should have a sorted list and choose one by default. Maybe always P?
                NodeDetail.nodeEditor.selectedNodeEnvironmentIdentifier = Object.keys(originalNode.environmentSpecificData)[0]
                // TODO: right now, we use the clone of the originalNode (=editedNode) of which we take the first environment
                NodeDetail.nodeEditor.editedNodeEnvironment = NodeDetail.nodeEditor.editedNode.environmentSpecificData[NodeDetail.nodeEditor.selectedNodeEnvironmentIdentifier]
            }

            /*
            NodeDetail.nodeEditor.editedNodeCodeVersion = null
            if ('codeVersions' in originalNode && originalNode.codeVersions.length > 0) {
                // FIXME: we default to the first version, maybe do this differently? Maybe the codeVersion of the selected environment? Or of the P-environment?
                // TODO: right now, we use the clone of the originalNode (=editedNode) of which we take the first version
                NodeDetail.nodeEditor.editedNodeCodeVersion = NodeDetail.nodeEditor.editedNode.codeVersions[0]
            }
            */
            
            NodeDetail.resetEditedFunctionalDocumentVersion(NodeDetail.nodeEditor.editedNode)
            NodeDetail.resetEditedTechnicalDocumentVersion(NodeDetail.nodeEditor.editedNode)
            
        }        
    }

    NodeDetail.createNewNodeAndOpenDetail = function(nodeType) {
        let nodeTypeIdentifier = nodeType.identifier
        
        let newNode = createNewNode(nodeTypeIdentifier)
        NodeDetail.setEditedNodeUsingOriginalNode(newNode)
        
        NodeDetail.nodeEditor.editedNode.isNewNode = true
        NodeDetail.nodeEditor.editedNode.addToDiagram = true
        
        // Creating a new node id here and (if succesful) async calling open modal
        NodeDetail.generateNewNodeIdAndOpenDetail(NodeDetail.nodeEditor.editedNode)
    }

    NodeDetail.saveNodeDetail = function (editedNode) {
        let nodesById = NLC.nodesAndLinksData.nodesById
        if (nodesById.hasOwnProperty(editedNode.id)) {
            let selectedNode = nodesById[editedNode.id]
            
            storeChangesBetweenNodes(selectedNode, editedNode) // ASYNC!
            storeChangesBetweenListsOfSourceLinks(selectedNode._sourceLinks, editedNode._sourceLinks) // ASYNC!
            
            // FIXME: is this correct?
            // We are removing the old (and possibly outdated) list of sourceLinks
            delete selectedNode._sourceLinks

            NodeDetail.closeNodeDetailFunction()
        }
        else {
            
            // Since editedNode.id does not yet exist, we assume this is a new node (and its id has already been generated). 
            // So we add and store it as a new new node here.
            
            storeNewNode(editedNode)
            // Since there was no previous node, we sourceLinks for the new node is an empty array, so we pass that here
            storeChangesBetweenListsOfSourceLinks([], editedNode._sourceLinks) // ASYNC!
            
            // TODO: we probably want to auto-select the node here!
            
            // TODO: NodeAndLinkScroller.nodeAndLinkSelector.selectedNodeId =
            //        selectedContainerIdentifier(s) =
            
            if (editedNode.addToDiagram) {
                let diagramId = DiagramLegendaLodSelector.diagramSelector.selectedDiagramId
                addNodeToDiagram(editedNode, diagramId)
            }
            
            delete editedNode.isNewNode
            delete editedNode.addToDiagram
            // FIXME: is this correct?
            // We are removing the old (and possibly outdated) list of sourceLinks
            delete editedNode._sourceLinks

            NodeDetail.closeNodeDetailFunction()
        }
    }

    NodeDetail.removeNodeAndCloseDetail = function (editedNode) {
        let removeLinksAttachedToNode = true
        let removedLinkIds = removeNode(editedNode, removeLinksAttachedToNode)
        // This effectively removes all the sourceLinks of the deleted node, since the resulting amount of sourceLinks is empty
        storeChangesBetweenListsOfSourceLinks(editedNode._sourceLinks, [])
        
        // FIXME: use removedLinkIds to remove the sourceLinks of these removedLinks as well
            
        NodeAndLinkScroller.unselectNode()
        NodeDetail.nodeEditor.editedNode = null

        NodeDetail.closeNodeDetailFunction()
    }


    NodeDetail.loadNodeDetailsAndOpenNodeDetail = function (node) {
        
        function openNodeDetail (loadedNodeDetails) {
            
            let nodesById = NLC.nodesAndLinksData.nodesById
            if (nodesById.hasOwnProperty(loadedNodeDetails.id)) {
                let oldOriginalNode = nodesById[node.id]
                
                // FIXME: HOW DO WE REPLACE THE ORIGINAL NODE in the nodes *list*!? Should we get rid of this *list* of nodes?
                // FIXME: this is a workaround to make sure the node in the nodes-list is also updated with the new information
                oldOriginalNode.type = loadedNodeDetails.type
                oldOriginalNode.commonData = loadedNodeDetails.commonData    
                oldOriginalNode.diagramSpecificVisualData = loadedNodeDetails.diagramSpecificVisualData
                // oldOriginalNode.codeVersions = loadedNodeDetails.codeVersions    
                oldOriginalNode.functionalDocumentVersions = loadedNodeDetails.functionalDocumentVersions    
                oldOriginalNode.technicalDocumentVersions = loadedNodeDetails.technicalDocumentVersions    
                oldOriginalNode.environmentSpecificData = loadedNodeDetails.environmentSpecificData    

                // Overwriting the node in nodesById
                nodesById[loadedNodeDetails.id] = loadedNodeDetails
                NodeDetail.setEditedNodeUsingOriginalNode(loadedNodeDetails)
            }
            else {
                console.log("ERROR: the details of a node is reload, but it doesn't exist anymore in the nodesById!?")
            }
                
            NodeDetail.nodeEditor.showNodeSource = true
            NodeDetail.nodeEditor.nodeSourceYPosition = null
            NodeDetail.openNodeDetailFunction()
        }
        
        let dataDetailsToLoad = [ 'nodes' , node.id ]
        loadNLCDataDetails(dataDetailsToLoad, openNodeDetail) // ASYNC!
    }

    NodeDetail.generateNewNodeIdAndOpenDetail = function (editedNode) {
        
        function assignIdToNewNodeAndOpenModal(newId) {
            editedNode.id = newId

            NodeDetail.openNodeDetailFunction()
        }
        generateNewId(assignIdToNewNodeAndOpenModal) // ASYNC!
    }

    NodeDetail.createNewFunctionalDocumentVersionForEditedNode = function (editedNode) {
        
        // TODO: its better to use model.js to create an empty FunctionalDocumentVersion!
        let newFunctionalDocumentVersion = {}
        function assignIdToNewFunctionalDocumentVersionAndAddToEditedNode(newId) {
            newFunctionalDocumentVersion.id = newId
            if (editedNode.functionalDocumentVersions == null) {
                editedNode.functionalDocumentVersions = []
            }
            editedNode.functionalDocumentVersions.push(newFunctionalDocumentVersion)
            
            NodeDetail.nodeEditor.editedNodeFunctionalDocumentVersion = newFunctionalDocumentVersion
        }
        generateNewId(assignIdToNewFunctionalDocumentVersionAndAddToEditedNode) // ASYNC!   
    }

    NodeDetail.createNewTechnicalDocumentVersionForEditedNode = function (editedNode) {
        
        // TODO: its better to use model.js to create an empty TechnicalDocumentVersion!
        let newTechnicalDocumentVersion = {}
        function assignIdToNewTechnicalDocumentVersionAndAddToEditedNode(newId) {
            newTechnicalDocumentVersion.id = newId
            if (editedNode.technicalDocumentVersions == null) {
                editedNode.technicalDocumentVersions = []
            }
            editedNode.technicalDocumentVersions.push(newTechnicalDocumentVersion)
            
            NodeDetail.nodeEditor.editedNodeTechnicalDocumentVersion = newTechnicalDocumentVersion
        }
        generateNewId(assignIdToNewTechnicalDocumentVersionAndAddToEditedNode) // ASYNC!   
    }

    NodeDetail.removeFunctionalDocumentVersionFromEditedNode = function (functionalDocumentVersionToBeRemoved) {
        let functionalDocumentVersionIndexToDelete = null    
        for (let functionalDocumentVersionIndex in  NodeDetail.nodeEditor.editedNode.functionalDocumentVersions) {    
            let functionalDocumentVersion = NodeDetail.nodeEditor.editedNode.functionalDocumentVersions[functionalDocumentVersionIndex]
            if (functionalDocumentVersion.id === functionalDocumentVersionToBeRemoved.id) {    
                functionalDocumentVersionIndexToDelete = functionalDocumentVersionIndex
            }    
        }    
        if (functionalDocumentVersionIndexToDelete != null) {    
            NodeDetail.nodeEditor.editedNode.functionalDocumentVersions.splice(functionalDocumentVersionIndexToDelete, 1)
            NodeDetail.resetEditedFunctionalDocumentVersion(NodeDetail.nodeEditor.editedNode)
        }    
        else {    
            console.log("ERROR: could not find functionalDocumentVersion to be deleted (in editedNode)!")
        }
    }

    NodeDetail.removeTechnicalDocumentVersionFromEditedNode = function (technicalDocumentVersionToBeRemoved) {
        let technicalDocumentVersionIndexToDelete = null    
        for (let technicalDocumentVersionIndex in  NodeDetail.nodeEditor.editedNode.technicalDocumentVersions) {    
            let technicalDocumentVersion = NodeDetail.nodeEditor.editedNode.technicalDocumentVersions[technicalDocumentVersionIndex]
            if (technicalDocumentVersion.id === technicalDocumentVersionToBeRemoved.id) {    
                technicalDocumentVersionIndexToDelete = technicalDocumentVersionIndex
            }    
        }    
        if (technicalDocumentVersionIndexToDelete != null) {    
            NodeDetail.nodeEditor.editedNode.technicalDocumentVersions.splice(technicalDocumentVersionIndexToDelete, 1)
            NodeDetail.resetEditedTechnicalDocumentVersion(NodeDetail.nodeEditor.editedNode)
        }    
        else {    
            console.log("ERROR: could not find technicalDocumentVersion to be deleted (in editedNode)!")
        }
        
    }

    /*
    NodeDetail.selectNodeCodeVersion = function(selectedCodeVersionId) {
        
        // TODO: we are looping through all versions here. We should have a map instead!
        for (let versionIndex = 0; versionIndex < NodeDetail.nodeEditor.editedNode.codeVersions.length; versionIndex++) {
            let codeVersion = NodeDetail.nodeEditor.editedNode.codeVersions[versionIndex]
            if (codeVersion.id === selectedCodeVersionId) {
                NodeDetail.nodeEditor.editedNodeCodeVersion = codeVersion
            }
        }
    },
    */

    /*
    NodeDetail.nodeHasCodeVersionForEnvironment = function (node, environmentIdentifier, codeVersionId) {
        if ('environmentSpecificData' in node &&
            environmentIdentifier in  node.environmentSpecificData &&
            'codeVersionId' in node.environmentSpecificData[environmentIdentifier] &&
            node.environmentSpecificData[environmentIdentifier].codeVersionId === codeVersionId) {
            
            return true
        }
        else {
            return false
        }
    },
    */
    
    return NodeDetail
}
