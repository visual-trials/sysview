let SourceDocumentManagement = {
    sourceDocumentsEditor: {
        editedSourceDocuments: null,
    },
    openSourceDocumentsFunction : null,
    closeSourceDocumentsFunction : null,
}

SourceDocumentManagement.setEditedSourceDocuments = function (sourceDocuments) {
    SourceDocumentManagement.sourceDocumentsEditor.editedSourceDocuments = JSON.parse(JSON.stringify(sourceDocuments))
}

SourceDocumentManagement.compareSourceDocuments = function (a, b) {
    if ( a.type < b.type ){
        return -1
    }
    else if ( a.type > b.type ){
        return 1
    }
    else {
        if ( a.basicData.fileName < b.basicData.fileName ){
            return -1
        }
        else if ( a.basicData.fileName > b.basicData.fileName ){
            return 1
        }
        else {
            return 0
        }
    }
}


// FIXME: also add/remove from sourceDocumentsById!!
// FIXME: also add/remove from sourceDocumentsById!!
// FIXME: also add/remove from sourceDocumentsById!!
SourceDocumentManagement.removeSourceDocument = function (sourceDocumentToBeRemoved) {
    // We are first removing the sourceDocument from the editedSourceDocuments
    // If the user chooses to "save" the deleted sourceDocument, it will also be removed from the backend/NLC data
    let sourceDocumentIndexToDelete = null    
    for (let sourceDocumentIndex in  SourceDocumentManagement.sourceDocumentsEditor.editedSourceDocuments) {    
        let sourceDocument = SourceDocumentManagement.sourceDocumentsEditor.editedSourceDocuments[sourceDocumentIndex]    
        if (sourceDocument.id === sourceDocumentToBeRemoved.id) {    
            sourceDocumentIndexToDelete = sourceDocumentIndex    
        }    
    }    
    if (sourceDocumentIndexToDelete != null) {    
        SourceDocumentManagement.sourceDocumentsEditor.editedSourceDocuments.splice(sourceDocumentIndexToDelete, 1)    
    }    
    else {    
        console.log("ERROR: could not find sourceDocument to be deleted (in editedSourceDocuments)!")
    }
}

SourceDocumentManagement.createNewSourceDocumentAndAddToEditedSourceDocuments = function() {
    
    let newSourceDocument = createNewSourceDocument()
    
    // Creating a new sourceDocument id here and (if succesful) async adding to editedSourceDocuments
    SourceDocumentManagement.generateNewSourceDocumentIdAndAddToEditedSourceDocuments(newSourceDocument)
}

SourceDocumentManagement.generateNewSourceDocumentIdAndAddToEditedSourceDocuments = function (newSourceDocument) {
    
    function assignIdToNewSourceDocumAndAddToEditedSourceDocuments(newId) {
        newSourceDocument.id = newId
        
        SourceDocumentManagement.sourceDocumentsEditor.editedSourceDocuments.push(newSourceDocument)
    }
    generateNewId(assignIdToNewSourceDocumAndAddToEditedSourceDocuments) // ASYNC!
}
