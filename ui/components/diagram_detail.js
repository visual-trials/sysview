function CreateNewDiagramDetail() {
    
    let DiagramDetail = {
        openDiagramDetailFunction: null,
        closeDiagramDetailFunction: null,
        diagramEditor : {
            editedDiagram: null,
        }
    }

    DiagramDetail.setEditedDiagramUsingOriginalDiagram = function (originalDiagram) {
        
        if (originalDiagram == null) {
            DiagramDetail.diagramEditor.editedDiagram = null
        }
        else {
            // TODO: right now, we clone the link! Only when we SAVE will it be copied back again!
            DiagramDetail.diagramEditor.editedDiagram = JSON.parse(JSON.stringify(originalDiagram))
        }
    }

    DiagramDetail.createNewDiagramAndOpenDetail = function() {
                
        let diagramEditor = DiagramDetail.diagramEditor
        
        let newDiagram = createNewDiagram()
        DiagramDetail.setEditedDiagramUsingOriginalDiagram(newDiagram)
        
        diagramEditor.editedDiagram.isNewDiagram = true
        
        // Creating a new diagram id here and (if succesful) async calling open modal
        DiagramDetail.generateNewDiagramIdAndOpenDetail(diagramEditor.editedDiagram)
    }

    DiagramDetail.removeDiagramAndCloseDetail = function (editedDiagram) {
        let detachNodesAndLinksAttachedToDiagram = true
        removeDiagram(editedDiagram, detachNodesAndLinksAttachedToDiagram)

        DiagramLegendaLodSelector.selectDiagram('default')
        
        DiagramDetail.closeDiagramDetailFunction()
    }

    DiagramDetail.saveDiagramDetail = function (editedDiagram) {
        let diagramsById = NLC.nodesAndLinksData.diagramsById
        if (editedDiagram.id in diagramsById) {
            let selectedDiagram = diagramsById[editedDiagram.id]
            storeChangesBetweenDiagrams(selectedDiagram, editedDiagram) // ASYNC!

            DiagramDetail.closeDiagramDetailFunction()
        }
        else {
            
            // Since editedDiagram.id does not yet exist, we assume this is a new diagram (and its id has already been generated). 
            // So we add and store it as a new new diagram here.
            storeNewDiagram(editedDiagram)
            
            // TODO: we probably want to auto-select the diagram here!
            
            // TODO: DiagramLegendaLodSelector.diagramSelector.selectedDiagramId =
            
            delete editedDiagram.isNewDiagram
            
            DiagramDetail.closeDiagramDetailFunction()
        }
    }

    DiagramDetail.loadDiagramDetailsAndOpenDiagramDetail = function (diagramId) {
        
        // TODO: we are currently not adding _source information in the diagram_detail-*template*. So effectively we are not loading extra details (like _source) for this diagram yet. 
        
        function openDiagramDetail (loadedDiagramDetails) {
            
            let diagramsById = NLC.nodesAndLinksData.diagramsById
            if (loadedDiagramDetails.id in diagramsById) {
                let oldOriginalDiagram = diagramsById[diagramId]
                
                // FIXME: HOW DO WE REPLACE THE ORIGINAL DIAGRAM in the diagrams *list*!? Should we get rid of this *list* of diagrams?
                // FIXME: this is a workaround to make sure the diagram in the diagrams-list is also updated with the new information
                oldOriginalDiagram.name = loadedDiagramDetails.name
                oldOriginalDiagram.identifier = loadedDiagramDetails.identifier
                oldOriginalDiagram.sortIndex = loadedDiagramDetails.sortIndex
                oldOriginalDiagram.parentDiagramId = loadedDiagramDetails.parentDiagramId
                
                // Overwriting the diagram in diagramsById
                diagramsById[loadedDiagramDetails.id] = loadedDiagramDetails
                DiagramDetail.setEditedDiagramUsingOriginalDiagram(loadedDiagramDetails)
            }
            else {
                console.log("ERROR: the details of a diagram is reloaded, but it doesn't exist anymore in the diagramsById!?")
            }
            
            DiagramDetail.openDiagramDetailFunction()
        }
        
        let dataDetailsToLoad = [ 'diagrams' , diagramId ]
        loadNLCDataDetails(dataDetailsToLoad, openDiagramDetail) // ASYNC!
    }

    DiagramDetail.generateNewDiagramIdAndOpenDetail = function (editedDiagram) {
        
        function assignIdToNewDiagramAndOpenModal(newId) {
            editedDiagram.id = newId
            
            DiagramDetail.openDiagramDetailFunction()
        }
        generateNewId(assignIdToNewDiagramAndOpenModal) // ASYNC!
    }
    
    return DiagramDetail
}

