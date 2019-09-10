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
 
function initExampleData() {
    
    // let exampleContainersAndConnections = { containers: [], connections: [] }
    
    /* FIXME
        We should use identifiers everywhere. Not Ids. I think.
        In createContainer we try to lookup the parent. But if that parent is not yet created, we have a problem of getting
        its Id! So its probably better to use identifier (and store that only)
        
        Either way, we should store children, not parent. We can genrate parent(id/identifier) when we have all the children
        
        If we store parents instead, we can loop through all containers and set the children (by looking at parentId/identifier)
        BUT we will lose the sorting order!
    
    */
    
    let firstServer = {
        type: 'server',
        identifier: 'FirstServer',
        parentContainerIdentifier: 'root',
        name: 'My First Server',
        localPosition: {
            x: 250,
            y: 200
        },
        localScale: 1,
        localSize: {
            width: 200,
            height: 250
        }
    }
    
    // FIXME: remove this: createContainer(firstServer)
    storeContainerData(firstServer)
    
    let firstAPI = {
        type: 'API',
        identifier: 'API1',
        parentContainerIdentifier: 'FirstServer',
        name: 'First API',
        localPosition: {
            x: 20,
            y: 20
        },
        localScale: 1,
        localSize: {
            width: 70,
            height: 50
        }
    }
    
    // FIXME: remove this: createContainer(firstAPI)
    storeContainerData(firstAPI)
    
    let secondServer = {
        type: 'server',
        identifier: 'SecondServer',
        parentContainerIdentifier: 'root',
        name: 'My Second Server',
        localPosition: {
            x: 550,
            y: 200
        },
        localScale: 0.5,
        localSize: {
            width: 150,
            height: 150
        }
    }
    
    // FIXME: remove this: createContainer(secondServer)
    storeContainerData(secondServer)
    
    let secondAPI = {
        type: 'API',
        identifier: 'API2',
        parentContainerIdentifier: 'SecondServer',
        name: 'Second API',
        localPosition: {
            x: 10,
            y: 10
        },
        localScale: 1,
        localSize: {
            width: 70,
            height: 50
        }
    }
    
    // FIXME: remove this: createContainer(secondAPI)
    storeContainerData(secondAPI)
    
    
    // Connections
    
    let firstAPIToSecondAPI = {
        type: 'API2API',
        identifier: '1to2',
        name: 'My connection',
        from: 'API1',
        to: 'API2',
    }
    
    // FIXME: remove this: createConnection(firstAPIToSecondAPI)
    storeConnectionData(firstAPIToSecondAPI)
    
    // FIXME: remove this: setContainerChildren()
    // FIXME: remove this: recalculateAbsolutePositions()
}
