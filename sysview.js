/*

   Copyright 2019 Jeffrey Hullekes

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

 */
 
 
let databaseData = { visual: null, source: null }

 
function init() {
    
    initIcons()
    initMenu()
    
    initContainersAndConnections()
    
    // TODO: replace this eventually
    // initExampleData()
    
    addInputListeners()
    drawCanvas()
    
    // NOTE: this is loaded async!!
    loadContainerAndConnectionData()
}

function integrateContainerAndConnectionData () {
    
    // TODO: should we also reset the interaction-info? Or at least check if its still valid?
    //       note that we should use identifiers in there INSTEAD of actual containers/connections!!
    
    // Removing all connections and containers
    initContainersAndConnections()
    
    // We then recreate all containers and connections using the databaseData
    let containers = databaseData.visual.containers
    for (let containerIdentifier in containers) {
        createContainer(containers[containerIdentifier])
    }
    setContainerChildren()
    recalculateAbsolutePositions()
    
    let connections = databaseData.visual.connections
    for (let connectionIdentifier in connections) {
        createConnection(connections[connectionIdentifier])
    }
    
    drawCanvas()
}

function loadContainerAndConnectionData() {
    
    // FIXME: hardcoded!
    let project = 'ExampleProject'
    
    let url = 'index.php?action=get_project_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let projectData = JSON.parse(xmlhttp.responseText)

            // FIXME: also load the other data! (apart from visual)
            
            databaseData.visual = projectData.visual
            integrateContainerAndConnectionData()
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function storeContainerData(containerData) {
    
    // FIXME: hardcoded!
    let project = 'ExampleProject'
    
    let url = 'index.php?action=set_visual_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    let visualData = { 'containers' : {} }
    visualData['containers'][containerData.identifier] = containerData
    xmlhttp.send(JSON.stringify(visualData))
    
    databaseData.visual.containers[containerData.identifier] = containerData
    integrateContainerAndConnectionData()
}

function storeConnectionData(connectionData) {
    
    // FIXME: hardcoded!
    let project = 'ExampleProject'
    
    let url = 'index.php?action=set_visual_data&project=' + project
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    let visualData = { 'connections' : {} }
    visualData['connections'][connectionData.identifier] = connectionData
    xmlhttp.send(JSON.stringify(visualData))
    
    databaseData.visual.connections[connectionData.identifier] = connectionData
    integrateContainerAndConnectionData()
}