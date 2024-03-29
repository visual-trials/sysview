function CreateNewInfraDiagramDetail() {

    let InfraDiagramDetail = {
        openInfraDiagramDetailFunction: null,
        closeInfraDiagramDetailFunction: null,
        infraDiagramEditor : {
            editedInfraDiagram: null,
            availableInfraDiagramImages: [],
        }
    }

    InfraDiagramDetail.setEditedInfraDiagramUsingOriginalInfraDiagram = function (originalInfraDiagram) {
        
        if (originalInfraDiagram == null) {
            InfraDiagramDetail.infraDiagramEditor.editedInfraDiagram = null
        }
        else {
            // TODO: right now, we clone the link! Only when we SAVE will it be copied back again!
            InfraDiagramDetail.infraDiagramEditor.editedInfraDiagram = JSON.parse(JSON.stringify(originalInfraDiagram))
        }
    }

    InfraDiagramDetail.setAvailableInfraDiagramImages = function (availableInfraDiagramImages) {
        InfraDiagramDetail.infraDiagramEditor.availableInfraDiagramImages = availableInfraDiagramImages
    }

    InfraDiagramDetail.createNewInfraDiagramAndOpenDetail = function() {
                
        let infraDiagramEditor = InfraDiagramDetail.infraDiagramEditor
        
        let newInfraDiagram = createNewInfraDiagram()
        InfraDiagramDetail.setEditedInfraDiagramUsingOriginalInfraDiagram(newInfraDiagram)
        
        infraDiagramEditor.editedInfraDiagram.isNewInfraDiagram = true
        
        // Creating a new infraDiagram id here and (if succesful) async calling open modal
        InfraDiagramDetail.generateNewInfraDiagramIdAndOpenDetail(infraDiagramEditor.editedInfraDiagram)
    }

    InfraDiagramDetail.removeInfraDiagramAndCloseDetail = function (editedInfraDiagram) {
        removeInfraDiagram(editedInfraDiagram)

    // FIXME: select default infra diagram    InfraDiagramLegendaLodSelector.selectInfraDiagram('default')
        
        InfraDiagramDetail.closeInfraDiagramDetailFunction()
    }

    InfraDiagramDetail.saveInfraDiagramDetail = function (editedInfraDiagram) {
        let infraDiagramsById = NLC.nodesAndLinksData.infraDiagramsById
        if (editedInfraDiagram.id in infraDiagramsById) {
            let selectedInfraDiagram = infraDiagramsById[editedInfraDiagram.id]
            storeChangesBetweenInfraDiagrams(selectedInfraDiagram, editedInfraDiagram) // ASYNC!

            InfraDiagramDetail.closeInfraDiagramDetailFunction()
        }
        else {
            
            // Since editedInfraDiagram.id does not yet exist, we assume this is a new infraDiagram (and its id has already been generated). 
            // So we add and store it as a new new infraDiagram here.
            storeNewInfraDiagram(editedInfraDiagram)
            
            // TODO: we probably want to auto-select the infraDiagram here!
            
            // TODO: InfraDiagramLegendaLodSelector.infraDiagramSelector.selectedInfraDiagramId =
            
            delete editedInfraDiagram.isNewInfraDiagram
            
            InfraDiagramDetail.closeInfraDiagramDetailFunction()
        }
    }

    InfraDiagramDetail.loadInfraDiagramDetailsAndOpenInfraDiagramDetail = function (infraDiagramId) {
        
        // TODO: we are currently not adding _infra information in the infra-diagram_detail-*template*. So effectively we are not loading extra details (like _infra) for this infraDiagram yet. 
        
        function openInfraDiagramDetail (loadedInfraDiagramDetails) {
            let infraDiagramsById = NLC.nodesAndLinksData.infraDiagramsById
            if (loadedInfraDiagramDetails.id in infraDiagramsById) {
                let oldOriginalInfraDiagram = infraDiagramsById[infraDiagramId]
                
                // FIXME: HOW DO WE REPLACE THE ORIGINAL SOURCE DIAGRAM in the infraDiagrams *list*!? Should we get rid of this *list* of infraDiagrams?
                // FIXME: this is a workaround to make sure the infraDiagram in the infraDiagrams-list is also updated with the new information
                oldOriginalInfraDiagram.name = loadedInfraDiagramDetails.name
                oldOriginalInfraDiagram.imageUrl = loadedInfraDiagramDetails.imageUrl
                oldOriginalInfraDiagram.infraPoints = loadedInfraDiagramDetails.infraPoints
                
                // Overwriting the infraDiagram in infraDiagramsById
                infraDiagramsById[loadedInfraDiagramDetails.id] = loadedInfraDiagramDetails
                InfraDiagramDetail.setEditedInfraDiagramUsingOriginalInfraDiagram(loadedInfraDiagramDetails)
            }
            else {
                console.log("ERROR: the details of a infraDiagram is reloaded, but it doesn't exist anymore in the infraDiagramsById!?")
            }
            
            InfraDiagramDetail.openInfraDiagramDetailFunction()
        }
        
        let dataDetailsToLoad = [ 'infraDiagrams' , infraDiagramId ]
        loadNLCDataDetails(dataDetailsToLoad, openInfraDiagramDetail) // ASYNC!
    }

    InfraDiagramDetail.generateNewInfraDiagramIdAndOpenDetail = function (editedInfraDiagram) {
        
        function assignIdToNewInfraDiagramAndOpenModal(newId) {
            editedInfraDiagram.id = newId
            
            InfraDiagramDetail.openInfraDiagramDetailFunction()
        }
        generateNewId(assignIdToNewInfraDiagramAndOpenModal) // ASYNC!
    }
    
    return InfraDiagramDetail
}