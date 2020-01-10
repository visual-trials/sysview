
// FIXME: maybe put this in interaction.js?
let centerViewOnWorldCenter = true
// FIXME: maybe put this somewhere else?
let databaseData = {}
databaseData.colorAndShapeMappings = {}
databaseData.colorAndShapeMappings.containerTypeToContainerShapeAndColor = {
    "application": {
        "shape" : "roundedRectangleManyConnections",
        "stroke" : { "color": "blue", "light": 0.2 },
        "fill" : { "color": "blue", "light": 0.6 }
    },
    "topic": { 
        "shape" : "ellipse4Points",
        "stroke" : { "color": "grey", "light": -0.5 },
        "fill" : { "color": "grey", "light": 0.5 }
    },
    "mediation": { 
        "shape" : "rectangle4points",
        "stroke" : { "color": "grey", "light": -0.5 },
        "fill" : { "color": "grey", "light": 0.5 },
        "textBelowContainer" : true
    }    
}
databaseData.colorAndShapeMappings.dataTypeToColor = {}

let myVue = new Vue({
    el: '#app',
    data: {
        integrationData : {},
        flatIntegrationData : {},
        selectedBaseNode : null,
        selectedNode : null,
        environmentTabSelected : false
    },
    mounted : function () {
        initVisualView()
        
        let projectIdentifier = 'ClientLive' // FIXME: hardcoded!
        let sourceIdentifier = 'sources/integration_db.json'
        loadSourceData(projectIdentifier, sourceIdentifier) // ASYNC!
    },
    methods: {
        selectEnvironmentTab : function (environmentTabSelected) {
            myVue.environmentTabSelected = environmentTabSelected
        },
        selectBaseNode : function (baseNode) {
            myVue.selectedBaseNode = baseNode
            myVue.selectedNode = getMostObviouSelectedNode(baseNode, myVue.selectedNode)
            
            setNodesAndLinksAsContainersAndConnections()
        },
        selectNode : function(node) {
            myVue.selectedNode = node
            setNodesAndLinksAsContainersAndConnections()
        },
        selectNodeByOutputLink : function (outputLink) {
            let node = myVue.integrationData.nodesById[outputLink.toNodeId]
            myVue.selectedNode = node
            myVue.selectedBaseNode = myVue.integrationData.baseNodesById[node.baseNodeId]
            setNodesAndLinksAsContainersAndConnections()
        },
        selectNodeByInputLink : function (inputLink) {
            let node = myVue.integrationData.nodesById[inputLink.fromNodeId]
            myVue.selectedNode = node
            myVue.selectedBaseNode = myVue.integrationData.baseNodesById[node.baseNodeId]
            setNodesAndLinksAsContainersAndConnections()
        }
    }
})

function getMostObviouSelectedNode (baseNode, currentlySelectedNode) {
    
    let selectedNode = null
    
    if (currentlySelectedNode) {
        let currentEnvironment = currentlySelectedNode.environment
        // Try to find a node of this baseNode with the same environment (as the previosly selected node)
        for (nodeId in myVue.integrationData.nodesById) {
            let node = myVue.integrationData.nodesById[nodeId]
            if (baseNode.id === node.baseData.id && currentEnvironment.id === node.environment.id) {
                selectedNode = node
                break
            }
        }
    }
    /* TODO: do we want this? 
    if (!selectedNode) {
        // Try to find a node of this baseNode withing ANY environment // FIXME: we probably have a preference for the environemnt here?
        for (nodeId in myVue.integrationData.nodesById) {
            let node = myVue.integrationData.nodesById[nodeId]
            if (baseNode.id === node.baseData.id) {
                selectedNode = node
                break
            }
        }
    }
    */
    
    return selectedNode
}

function initVisualView () {
    
    let vueCanvasElement = document.getElementById('canvas')
    setCanvas(vueCanvasElement)

//    initIcons()
//    initMenu()
    
    initContainersAndConnections()
    
    // FIXME: enable input: addInputListeners()
    
    // FIXME: fill databaseData.colorAndShapeMappings !!
    
}

function drawVisualView () {
    
    // FIXME: enable main loop! (and input handling etc)
    
    
    // Update world
    updateWorld()
    
    // Render world
    let resizeCanvas = false
    let drawMenu = false
    drawCanvas(resizeCanvas, drawMenu)
    
}


function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'api.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            
            let flatIntegrationData = sourceData.sourceData // TODO: we probably dont want the data to be inside .sourceData
            myVue.integrationData = structureFlatIntegrationData(flatIntegrationData)
            myVue.flatIntegrationData = flatIntegrationData
            
            // By default select the first node
            if (!myVue.selectedBaseNode) {
                if (myVue.integrationData.baseNodes.length > 0) {
                    myVue.selectedBaseNode = myVue.integrationData.baseNodes[0]
                    // TODO: do we want to do this? myVue.selectedNode = getMostObviouSelectedNode(myVue.selectedBaseNode, myVue.selectedNode)
                }
            }
            
            // TODO: is there a better moment/way of adding tooltips?
            $(function () {
              $('[data-toggle="tooltip"]').tooltip()
            })
            
            
            setNodesAndLinksAsContainersAndConnections()
    
        }
    }
    
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}


function setNodesAndLinksAsContainersAndConnections() {
    
    // Removing all connections and containers
    initContainersAndConnections()
    
    if (myVue.selectedNode) {
    
        let selectedEnvironmentId = myVue.selectedNode.environment.id

        let nodesInEnvironment = myVue.integrationData.nodesByEnvironment[selectedEnvironmentId]
        let nodesInEnvironmentByNodeId = {}
        for (let nodeIndex = 0; nodeIndex < nodesInEnvironment.length; nodeIndex++) {
            let node = nodesInEnvironment[nodeIndex]
            nodesInEnvironmentByNodeId[node.id] = node // FIXME: group by id?
            
            let position = { x: 100, y: 100}
            if (node.visualInfo) {
                position = node.visualInfo.position
            }
            
            // TODO: maybe store this somewhere or simply lowercase the baseNodeType? Or change the ContainerTypes?
            let baseNodetypeToContainerType = {
                "Mediation" : "mediation",
                "Application" : "application",
                "Topic" : "topic"
            }
            
            let containerInfo = {
                type: baseNodetypeToContainerType[node.baseData.type],
                identifier: node.id, // TODO: should we use node.id here??
                parentContainerIdentifier: 'root', // FIXME: hardcodes for now
                name: node.baseData.name,
                localPosition: {
                    x: position.x,
                    y: position.y
                },
                localScale: 1,
                localSize: {
                    width: 100, // FIXME: change to width of text!
                    height: 100 // FIXME: get from visualInfo or part of shape?
                }
            }

            createContainer(containerInfo)
        }
        

        for (let linkId in myVue.integrationData.linksById) {
            let link = myVue.integrationData.linksById[linkId]
            
            if (nodesInEnvironmentByNodeId.hasOwnProperty(link.fromNodeId) &&
                nodesInEnvironmentByNodeId.hasOwnProperty(link.toNodeId)) {
                // link.dataType = sourceDataType
                // link.dataType.baseData = baseDataType
                let connectionInfo = {
                    "identifier": link.id,
                    "type": "??->??", // FIXME
                    "dataType": "unknown", // FIXME
                    "fromContainerIdentifier": link.fromNodeId,
                    "toContainerIdentifier": link.toNodeId
                }
                
                createConnection(connectionInfo)
            }
        }
                

        // TODO: do this somewhere else!
        interaction.currentlySelectedContainerIdentifiers = {}
        interaction.currentlySelectedContainerIdentifiers[myVue.selectedNode.id] = true
        
        setContainerChildren()
        recalculateWorldPositionsAndSizes(null)
    }
    
    // FIXME: for now we force a re-center the view on the world (since the world size could be 0 in the previous call of this function)
    centerViewOnWorldCenter = true
    
    // FIXME: we should watch the underlying data and draw each time it changes!
    drawVisualView()            

}


function structureFlatIntegrationData (flatIntegrationData) {
    let integrationData  = {}
    
    let nodesById = groupById(flatIntegrationData.nodes)
    let baseNodesById = groupById(flatIntegrationData.baseNodes)
    let baseNodeVisualInfoById = groupById(flatIntegrationData.baseNodeVisualInfo["default"]) // FIXME: hardcoded to "default"!
    let environmentsById = groupById(flatIntegrationData.environments)
    let linksById = groupById(flatIntegrationData.links)
    let dataTypesById = groupById(flatIntegrationData.dataTypes)
    let baseDataTypesById = groupById(flatIntegrationData.baseDataTypes)
    
    integrationData.linksById = {}
    for (let linkId in linksById) {
        let sourceLink = linksById[linkId]
        
        let link = $.extend({}, sourceLink) // Note: Object.assign() doesnt work in IE11, so we use $.extend (from jQuery) instead
        let sourceDataType = dataTypesById[link.dataTypeId]
        let baseDataType = baseDataTypesById[sourceDataType.baseDataTypeId]
        
        let dataType = $.extend({}, sourceDataType) // Note: Object.assign() doesnt work in IE11, so we use $.extend (from jQuery) instead
        dataType.baseData = baseDataType
        
        link.dataType = dataType
        
        // TODO: do we really need linksById in the vue-template?
        integrationData.linksById[linkId] = link
    }
    
    integrationData.baseNodes = []
    integrationData.nodesById = {}
    integrationData.baseNodesById = {}
    integrationData.nodesByEnvironment = {}
    for (nodeId in nodesById) {
        let sourceNode = nodesById[nodeId]
        let baseNode = baseNodesById[sourceNode.baseNodeId]
        let environment = environmentsById[sourceNode.environmentId]
        
        let node = $.extend({}, sourceNode) // Note: Object.assign() doesnt work in IE11, so we use $.extend (from jQuery) instead
        node.baseData = baseNode
        node.environment = environment
        node.outputLinks = getLinksWithSpecificFromNodeId(integrationData.linksById, node.id)
        node.inputLinks = getLinksWithSpecificToNodeId(integrationData.linksById, node.id)
        
        if (baseNodeVisualInfoById.hasOwnProperty(sourceNode.baseNodeId)) {
            node.visualInfo = baseNodeVisualInfoById[sourceNode.baseNodeId] 
        }
        else {
            node.visualInfo = null // TODO: should we use a default position?
        }
        
        if (!integrationData.baseNodesById.hasOwnProperty(baseNode.id)) {
            baseNode.nodes = []
            integrationData.baseNodes.push(baseNode)
            integrationData.baseNodesById[nodeId] = baseNode
        }
        baseNode.nodes.push(node)
        integrationData.nodesById[nodeId] = node
        
        if (!integrationData.nodesByEnvironment.hasOwnProperty(environment.id)) {
            integrationData.nodesByEnvironment[environment.id] = []
        }
        integrationData.nodesByEnvironment[environment.id].push(node)
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
    for (let index = 0; index < listWithIds.length; index++) {
        let listElement = listWithIds[index]
        elementsById[listElement.id] = listElement
    }
    return elementsById
}
