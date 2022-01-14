let DiagramLegendaLodSelector = {}

DiagramLegendaLodSelector.diagramSelector = {
    selectedDiagramId: null,
    defaultDiagramId: null,
}

DiagramLegendaLodSelector.diagramChanged = function() {
    // TODO: is this the right way? or should we change the name of dataHasChanged?
    
    // TODO: change the query parameter aswell! (so the user can copy-paste the url for this diagram)
    
    NLC.dataHasChanged = true
    ZUI.interaction.centerViewOnWorldCenter = true
    
    let diagramId = DiagramLegendaLodSelector.diagramSelector.selectedDiagramId
    
    // Set editedDiagram
    if (diagramId in NLC.nodesAndLinksData.diagramsById) {
        let diagram = NLC.nodesAndLinksData.diagramsById[diagramId]
        // TODO: we also do this when opening the DiagramDetail-window. Can we get rid of this call here? (but when we do this, we somehow can't close the DiagramDetail window...)
        DiagramDetail.setEditedDiagramUsingOriginalDiagram(diagram)
    }
    else {
        console.log("ERROR: changed to diagram that doesn't exist!")
        // DiagramDetail.diagramEditor.editedDiagram = null
        // DiagramLegendaLodSelector.diagramSelector.selectedDiagramId = null
    }
}

// TODO: maybe create a separate function: DiagramLegendaLodSelector.getDefaultDiagram() (instead of determining the default diagram within selectDiagram)

DiagramLegendaLodSelector.selectDiagram = function(diagramIdToSelect) {
    
    let diagramSelector = DiagramLegendaLodSelector.diagramSelector
    
    // FIXME: do a better job determining which diagram is default for this user!
    if (diagramIdToSelect == 'default') {
		if (DiagramLegendaLodSelector.diagramSelector.defaultDiagramId == null) {
			// FIXME: maybe we should reset defaultDiagramId when diagrams are removed or inserted?
			if (NLC.nodesAndLinksData.diagrams && NLC.nodesAndLinksData.diagrams.length > 0)  {
				DiagramLegendaLodSelector.diagramSelector.defaultDiagramId = NLC.nodesAndLinksData.diagrams[0].id
			}
		}
        diagramIdToSelect = DiagramLegendaLodSelector.diagramSelector.defaultDiagramId
    }

    // Deselect the selected diagram if it doesn't exist in the current db 
    if (diagramIdToSelect != null && !(diagramIdToSelect in NLC.nodesAndLinksData.diagramsById)) {
        console.log("ERROR: cannot select diagram that does not exists! Unknown diagramId: " + diagramIdToSelect)
        diagramIdToSelect = null
    }

    if (diagramIdToSelect == null) {
        // FIXME: what to do when effectively no diagram is selected? Revert to the default?
        
        DiagramLegendaLodSelector.legendaSelector.selectedLegendaId = 0 // FIXME: hardcoded! (should probably be null)
        diagramSelector.selectedDiagramId = null
        // TODO: probably we should remove the queryParameter if it contains a diagram that doesn't exist and/or give the user a notice that the selected diagram doesnt exist
        DiagramLegendaLodSelector.diagramChanged()
    }
    else {
        diagramSelector.selectedDiagramId = diagramIdToSelect
        DiagramLegendaLodSelector.diagramChanged()
    }
  
    // TODO: check if selectedLegendaId exist and deselect if it doesnt!
    // TODO: select first available legendaId if no one has been selected
    
    // TODO: adjust the url so it contains the right diagramId / legendaId etc   
}


DiagramLegendaLodSelector.legendaSelector = {
    selectedLegendaId: 0,  // FIXME: HARDCODED! 
}

DiagramLegendaLodSelector.lodSelector = {
    selectedLevelOfDetail: "auto",
}


DiagramLegendaLodSelector.dateSelector = {
    selectedDateISO: getCurrentDateISO(), // TODO: we might want this to be set to the first of the month or something
    selectedDataIndex: 0,
    selectableDates: [],
}

DiagramLegendaLodSelector.fillSelectableDates = function () {
    let dateSelector = DiagramLegendaLodSelector.dateSelector
    
    dateSelector.selectableDates = []
    let nrOfMonthInFuture = 40 // FIXME: make this a parameter/configurable
    let dateNow = new Date()
    let year = dateNow.getFullYear() 
    let month = dateNow.getMonth()
    for (let monthIndex = 0; monthIndex < nrOfMonthInFuture; monthIndex++) {
        let dateISO = year + "-" + ("0" + (month+1)).slice(-2) + "-" + "01"
        dateSelector.selectableDates.push({ "dateISO" : dateISO })
        
        month++
        if (month > 11) {
            month = 0
            year++
        }
    }
}

DiagramLegendaLodSelector.shouldShowSelectableDates = function () {
    let showSelectableDates = false
    
    if ('legendasById' in NLC.nodesAndLinksData) {
        let legenda = NLC.nodesAndLinksData.legendasById[DiagramLegendaLodSelector.legendaSelector.selectedLegendaId]
        if ('showSelectableDates' in legenda && legenda.showSelectableDates) {
            showSelectableDates = true
        }
    }
    return showSelectableDates
}

DiagramLegendaLodSelector.selectedDateChanged = function() {
    DiagramLegendaLodSelector.dateSelector.selectedDateISO = DiagramLegendaLodSelector.dateSelector.selectableDates[DiagramLegendaLodSelector.dateSelector.selectedDataIndex].dateISO
    // TODO: we should not do this?! this will reload all containers and connections! Or should we?
    NLC.dataHasChanged = true
}
