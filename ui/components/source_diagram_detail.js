let SourceDiagramDetail = {
    openSourceDiagramDetailFunction: null,
    closeSourceDiagramDetailFunction: null,
    sourceDiagramEditor : {
        editedSourceDiagram: null,
        availableSourceDiagramImages: [],
    }
}

SourceDiagramDetail.setEditedSourceDiagramUsingOriginalSourceDiagram = function (originalSourceDiagram) {
    
    if (originalSourceDiagram == null) {
        SourceDiagramDetail.sourceDiagramEditor.editedSourceDiagram = null
    }
    else {
        // TODO: right now, we clone the link! Only when we SAVE will it be copied back again!
        SourceDiagramDetail.sourceDiagramEditor.editedSourceDiagram = JSON.parse(JSON.stringify(originalSourceDiagram))
    }
}

SourceDiagramDetail.setAvailableSourceDiagramImages = function (availableSourceDiagramImages) {
    SourceDiagramDetail.sourceDiagramEditor.availableSourceDiagramImages = availableSourceDiagramImages
}

SourceDiagramDetail.createNewSourceDiagramAndOpenDetail = function() {
            
    let sourceDiagramEditor = SourceDiagramDetail.sourceDiagramEditor
    
    let newSourceDiagram = createNewSourceDiagram()
    SourceDiagramDetail.setEditedSourceDiagramUsingOriginalSourceDiagram(newSourceDiagram)
    
    sourceDiagramEditor.editedSourceDiagram.isNewSourceDiagram = true
    
    // Creating a new sourceDiagram id here and (if succesful) async calling open modal
    SourceDiagramDetail.generateNewSourceDiagramIdAndOpenDetail(sourceDiagramEditor.editedSourceDiagram)
}

SourceDiagramDetail.removeSourceDiagramAndCloseDetail = function (editedSourceDiagram) {
    removeSourceDiagram(editedSourceDiagram)

// FIXME: select default source diagram    SourceDiagramLegendaLodSelector.selectSourceDiagram('default')
    
    SourceDiagramDetail.closeSourceDiagramDetailFunction()
}

SourceDiagramDetail.saveSourceDiagramDetail = function (editedSourceDiagram) {
    let sourceDiagramsById = NLC.nodesAndLinksData.sourceDiagramsById
    if (editedSourceDiagram.id in sourceDiagramsById) {
        let selectedSourceDiagram = sourceDiagramsById[editedSourceDiagram.id]
        storeChangesBetweenSourceDiagrams(selectedSourceDiagram, editedSourceDiagram) // ASYNC!

        SourceDiagramDetail.closeSourceDiagramDetailFunction()
    }
    else {
        
        // Since editedSourceDiagram.id does not yet exist, we assume this is a new sourceDiagram (and its id has already been generated). 
        // So we add and store it as a new new sourceDiagram here.
        storeNewSourceDiagram(editedSourceDiagram)
        
        // TODO: we probably want to auto-select the sourceDiagram here!
        
        // TODO: SourceDiagramLegendaLodSelector.sourceDiagramSelector.selectedSourceDiagramId =
        
        delete editedSourceDiagram.isNewSourceDiagram
        
        SourceDiagramDetail.closeSourceDiagramDetailFunction()
    }
}

SourceDiagramDetail.loadSourceDiagramDetailsAndOpenSourceDiagramDetail = function (sourceDiagramId) {
    
    // TODO: we are currently not adding _source information in the source-diagram_detail-*template*. So effectively we are not loading extra details (like _source) for this sourceDiagram yet. 
    
    function openSourceDiagramDetail (loadedSourceDiagramDetails) {
        let sourceDiagramsById = NLC.nodesAndLinksData.sourceDiagramsById
        if (loadedSourceDiagramDetails.id in sourceDiagramsById) {
            let oldOriginalSourceDiagram = sourceDiagramsById[sourceDiagramId]
            
            // FIXME: HOW DO WE REPLACE THE ORIGINAL SOURCE DIAGRAM in the sourceDiagrams *list*!? Should we get rid of this *list* of sourceDiagrams?
            // FIXME: this is a workaround to make sure the sourceDiagram in the sourceDiagrams-list is also updated with the new information
            oldOriginalSourceDiagram.name = loadedSourceDiagramDetails.name
            oldOriginalSourceDiagram.imageUrl = loadedSourceDiagramDetails.imageUrl
            oldOriginalSourceDiagram.sourcePoints = loadedSourceDiagramDetails.sourcePoints
            
            // Overwriting the sourceDiagram in sourceDiagramsById
            sourceDiagramsById[loadedSourceDiagramDetails.id] = loadedSourceDiagramDetails
            SourceDiagramDetail.setEditedSourceDiagramUsingOriginalSourceDiagram(loadedSourceDiagramDetails)
        }
        else {
            console.log("ERROR: the details of a sourceDiagram is reloaded, but it doesn't exist anymore in the sourceDiagramsById!?")
        }
        
        SourceDiagramDetail.openSourceDiagramDetailFunction()
    }
    
    let dataDetailsToLoad = [ 'sourceDiagrams' , sourceDiagramId ]
    loadNLCDataDetails(dataDetailsToLoad, openSourceDiagramDetail) // ASYNC!
}

SourceDiagramDetail.generateNewSourceDiagramIdAndOpenDetail = function (editedSourceDiagram) {
    
    function assignIdToNewSourceDiagramAndOpenModal(newId) {
        editedSourceDiagram.id = newId
        
        SourceDiagramDetail.openSourceDiagramDetailFunction()
    }
    generateNewId(assignIdToNewSourceDiagramAndOpenModal) // ASYNC!
}

