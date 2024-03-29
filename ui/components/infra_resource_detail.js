function CreateNewInfraResourceDetail() {

    let InfraResourceDetail = {
        openInfraResourceDetailFunction: null,
        closeInfraResourceDetailFunction: null,
        infraResourceEditor : {
            editedInfraResource: null
        }
    }

    InfraResourceDetail.setEditedInfraResourceUsingOriginalInfraResource = function (originalInfraResource) {
        
        if (originalInfraResource == null) {
            InfraResourceDetail.infraResourceEditor.editedInfraResource = null
        }
        else {
            // TODO: right now, we clone the link! Only when we SAVE will it be copied back again!
            InfraResourceDetail.infraResourceEditor.editedInfraResource = JSON.parse(JSON.stringify(originalInfraResource))
        }
    }

    InfraResourceDetail.createNewInfraResourceAndOpenDetail = function() {
                
        let infraResourceEditor = InfraResourceDetail.infraResourceEditor
        
        let newInfraResource = createNewInfraResource()
        InfraResourceDetail.setEditedInfraResourceUsingOriginalInfraResource(newInfraResource)
        
        infraResourceEditor.editedInfraResource.isNewInfraResource = true
        
        // Creating a new infraResource id here and (if succesful) async calling open modal
        InfraResourceDetail.generateNewInfraResourceIdAndOpenDetail(infraResourceEditor.editedInfraResource)
    }

    InfraResourceDetail.removeInfraResourceAndCloseDetail = function (editedInfraResource) {
        removeInfraResource(editedInfraResource)

    // FIXME: select default infra resource    InfraResourceLegendaLodSelector.selectInfraResource('default')
        
        InfraResourceDetail.closeInfraResourceDetailFunction()
    }

    InfraResourceDetail.saveInfraResourceDetail = function (editedInfraResource) {
// FIXME: this WONT WORK!
// FIXME: this WONT WORK!
// FIXME: this WONT WORK!
        let infraResourcesById = NLC.nodesAndLinksData.infraResourcesById
        if (editedInfraResource.id in infraResourcesById) {
            let selectedInfraResource = infraResourcesById[editedInfraResource.id]
            storeChangesBetweenInfraResources(selectedInfraResource, editedInfraResource) // ASYNC!

            InfraResourceDetail.closeInfraResourceDetailFunction()
        }
        else {
            
            // Since editedInfraResource.id does not yet exist, we assume this is a new infraResource (and its id has already been generated). 
            // So we add and store it as a new new infraResource here.
            storeNewInfraResource(editedInfraResource)
            
            // TODO: we probably want to auto-select the infraResource here!
            
            // TODO: InfraResourceLegendaLodSelector.infraResourceSelector.selectedInfraResourceId =
            
            delete editedInfraResource.isNewInfraResource
            
            InfraResourceDetail.closeInfraResourceDetailFunction()
        }
    }

    InfraResourceDetail.openInfraResourceDetail = function (infraDiagram, infraResourceId) {
        
        // TODO: we are currently not adding _infra information in the infra-resource_detail-*template*. So effectively we are not loading extra details (like _infra) for this infraResource yet. 
        
//        function openInfraResourceDetail (loadedInfraResourceDetails) {
// FIXME: this WONT WORK!
// FIXME: this WONT WORK!
// FIXME: this WONT WORK!
//            let infraResourcesById = NLC.nodesAndLinksData.infraResourcesById
//            if (loadedInfraResourceDetails.id in infraResourcesById) {
//                let oldOriginalInfraResource = infraResourcesById[infraResourceId]
                
                // FIXME: HOW DO WE REPLACE THE ORIGINAL INFRA RESOURCE in the infraResources *list*!? Should we get rid of this *list* of infraResources?
                // FIXME: this is a workaround to make sure the infraResource in the infraResources-list is also updated with the new information
//                oldOriginalInfraResource.name = loadedInfraResourceDetails.name
                
                // Overwriting the infraResource in infraResourcesById
//                infraResourcesById[loadedInfraResourceDetails.id] = loadedInfraResourceDetails

        let originalInfraResource = null
        for (let infraResourceIndex in infraDiagram.infraResources) {
            let infraResource = infraDiagram.infraResources[infraResourceIndex]
            if (infraResource.id == infraResourceId) {
                originalInfraResource = infraResource
            }
        }
            
        InfraResourceDetail.setEditedInfraResourceUsingOriginalInfraResource(originalInfraResource)
//            }
//            else {
//                console.log("ERROR: the details of a infraResource is reloaded, but it doesn't exist anymore in the infraResourcesById!?")
//            }
            
            InfraResourceDetail.openInfraResourceDetailFunction()
//        }
        
//        let dataDetailsToLoad = [ 'infraResources' , infraResourceId ]
//        loadNLCDataDetails(dataDetailsToLoad, openInfraResourceDetail) // ASYNC!
    }

// FIXME: DONT open a MODAL!!
// FIXME: DONT open a MODAL!!
// FIXME: DONT open a MODAL!!
    InfraResourceDetail.generateNewInfraResourceIdAndOpenDetail = function (editedInfraResource) {
        
        function assignIdToNewInfraResourceAndOpenModal(newId) {
            editedInfraResource.id = newId
            
            InfraResourceDetail.openInfraResourceDetailFunction()
        }
        generateNewId(assignIdToNewInfraResourceAndOpenModal) // ASYNC!
    }
    
    return InfraResourceDetail
}