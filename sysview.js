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
 
function init() {
    
    initFirebase()
    
    initIcons()
    initMenu()
    
    initContainersAndConnections()
    
    // TODO: replace this eventually
    initExampleData()
    
    // NOTE: this is loaded async!!
    // loadContainerData()
    
    setContainerChildren()
    
    recalculateAbsolutePositions()

    addInputListeners()
    drawCanvas()
}

function initFirebase () {
    let firebaseConfig = {
        apiKey: "AIzaSyD3aPCuIf856k1-_yzsK-YH1gD8USe-6RU",
        authDomain: "sysview-8c913.firebaseapp.com",
        databaseURL: "https://sysview-8c913.firebaseio.com",
        projectId: "sysview-8c913",
        storageBucket: "",
        messagingSenderId: "741358324352",
        appId: "1:741358324352:web:e249d5539c781a94"
    }

    firebase.initializeApp(firebaseConfig)
}

function loadContainerData() {
    console.log('starting to load data' + Date())
    firebase.database().ref('visual/containers/').once('value').then(function(snapshot) {
        console.log('data was loaded' + Date())
        let containers = snapshot.val()
        
        for (containerIdentifier in containers) {
            createContainer(containers[containerIdentifier])
        }
        drawCanvas()
    })
}

function storeContainerData(containerData) {
    firebase.database().ref('visual/containers/' + containerData.identifier).set({
        // TODO: couldn't we simply use the whole of containerData here?
        identifier: containerData.identifier,
        type: containerData.type,
        name: containerData.name,
        parentContainerIdentifier: containerData.parentContainerIdentifier,
        relativePosition: containerData.relativePosition,
        size: containerData.size
    })
}

function storeConnectionData(connectionData) {
    // TODO: implement this!
}