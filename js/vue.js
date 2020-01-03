let myVue = new Vue({
    el: '#app',
    data: {
        integrationData : {},
        flatIntegrationData : {}
    },
    mounted () {
        let projectIdentifier = 'ClientLive' // FIXME: hardcoded!
        let sourceIdentifier = 'sources/integration_db.json'
        loadSourceData(projectIdentifier, sourceIdentifier)
    }
})

function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            
            let flatIntegrationData = sourceData.sourceData // TODO: we probably dont want the data to be inside .sourceData
            myVue.integrationData = structureFlatIntegrationData(flatIntegrationData)
            myVue.flatIntegrationData = flatIntegrationData
            
            // TODO: is there a better moment/way of adding tooltips?
            $(function () {
              $('[data-toggle="tooltip"]').tooltip()
            })

        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function structureFlatIntegrationData (flatIntegrationData) {
    let integrationData  = {}
    
    let nodesById = groupById(flatIntegrationData.nodes)
    let baseNodesById = groupById(flatIntegrationData.baseNodes)
    let environmentsById = groupById(flatIntegrationData.environments)
    let linksById = groupById(flatIntegrationData.links)
    let dataTypesById = groupById(flatIntegrationData.dataTypes)
    let baseDataTypesById = groupById(flatIntegrationData.baseDataTypes)
    
    integrationData.linksById = {}
    for (let linkId in linksById) {
        let sourceLink = linksById[linkId]
        
        let link = Object.assign({}, sourceLink)
        let sourceDataType = dataTypesById[link.dataTypeId]
        let baseDataType = baseDataTypesById[sourceDataType.baseDataTypeId]
        
        let dataType = Object.assign({}, sourceDataType)
        dataType.baseData = baseDataType
        
        link.dataType = dataType
        
        // TODO: do we really need linksById in the vue-template?
        integrationData.linksById[linkId] = link
    }
    
    integrationData.nodes = []
    integrationData.nodesById = {}
    for (nodeId in nodesById) {
        let sourceNode = nodesById[nodeId]
        let baseNode = baseNodesById[sourceNode.baseNodeId]
        let environment = environmentsById[sourceNode.environmentId]
        
        let node = Object.assign({}, sourceNode)        
        node.baseData = baseNode
        node.environment = environment
        node.outputLinks = getLinksWithSpecificFromNodeId(integrationData.linksById, node.id)
        node.inputLinks = getLinksWithSpecificToNodeId(integrationData.linksById, node.id)
        
        integrationData.nodes.push(node)
        integrationData.nodesById[nodeId] = node
    }
    
    return integrationData
}

function getLinksWithSpecificFromNodeId(linksById, fromNodeId) {
    let outputLinks = []
    
    for (let linkId in linksById) {
        let link = linksById[linkId]
        
        if (link.fromNodeId === fromNodeId) {
            outputLinks.push(link)
        }
    }
    return outputLinks
}

function getLinksWithSpecificToNodeId(linksById, toNodeId) {
    let inputLinks = []
    
    for (let linkId in linksById) {
        let link = linksById[linkId]
        
        if (link.toNodeId === toNodeId) {
            inputLinks.push(link)
        }
    }
    return inputLinks
}

function groupById (listWithIds) {
    let elementsById = {}
    for (let listElement of listWithIds) {
        elementsById[listElement.id] = listElement
    }
    return elementsById
}
