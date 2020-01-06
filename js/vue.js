
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
    },
    mounted () {
        initVisualView()
        
        let projectIdentifier = 'ClientLive' // FIXME: hardcoded!
        let sourceIdentifier = 'sources/integration_db.json'
        loadSourceData(projectIdentifier, sourceIdentifier) // ASYNC!
    },
    methods : {
        selectBaseNode : function (baseNode) {
            myVue.selectedBaseNode = baseNode
            myVue.selectedNode = null
        },
        selectNode : function(node) {
            myVue.selectedNode = node
        },
        selectNodeByOutputLink : function (outputLink) {
            let node = myVue.integrationData.nodesById[outputLink.toNodeId]
            myVue.selectedNode = node
            myVue.selectedBaseNode = myVue.integrationData.baseNodesById[node.baseNodeId]
        },
        selectNodeByInputLink : function (inputLink) {
            let node = myVue.integrationData.nodesById[inputLink.fromNodeId]
            myVue.selectedNode = node
            myVue.selectedBaseNode = myVue.integrationData.baseNodesById[node.baseNodeId]
        }
    }
})

function initVisualView () {
    
    let vueCanvasElement = document.getElementById('canvas')
    setCanvas(vueCanvasElement)

    initIcons()
    initMenu()
    
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
    drawCanvas(resizeCanvas)
    
}


function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
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
                }
            }
            
            // TODO: is there a better moment/way of adding tooltips?
            $(function () {
              $('[data-toggle="tooltip"]').tooltip()
            })
            
            
    
            // TODO: maybe store this somewhere or simply lowercase the baseNodeType? Or change the ContainerTypes?
            let baseNodetypeToContainerType = {
                "Mediation" : "mediation",
                "Application" : "application",
                "Topic" : "topic"
            }
            // FIXME: get environmentId from selectedEnvironment!
            // if (selectedNode) {
                let selectedEnvironmentId = 4 // FIXME: selectedNode.environment.id
                
                // Removing all connections and containers
                initContainersAndConnections()

                let nodesInEnvironment = myVue.integrationData.nodesByEnvironment[selectedEnvironmentId]
                for (let node of nodesInEnvironment) {
                    let position = { x: 100, y: 100}
                    if (node.visualInfo) {
                        position = node.visualInfo.position
                    }
                    
                    let containerInfo = {
                        type: baseNodetypeToContainerType[node.baseData.type],
                        identifier: node.baseData.id, // TODO: should we use node.id here??
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
                        

                setContainerChildren()
                recalculateWorldPositionsAndSizes()    
                // FIXME: we should watch the underlying data and draw each time it changes!
                drawVisualView()            

            // }
    
        }
    }
    
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
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
        
        let link = Object.assign({}, sourceLink)
        let sourceDataType = dataTypesById[link.dataTypeId]
        let baseDataType = baseDataTypesById[sourceDataType.baseDataTypeId]
        
        let dataType = Object.assign({}, sourceDataType)
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
        
        let node = Object.assign({}, sourceNode)
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
    for (let listElement of listWithIds) {
        elementsById[listElement.id] = listElement
    }
    return elementsById
}
