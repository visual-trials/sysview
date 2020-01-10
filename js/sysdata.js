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

let conversionTree = {}

let projectIdentifier = null
let source1NamedAs = null
let source1Identifier = null
let source2NamedAs = null
let source2Identifier = null
let conversionIdentifier = null
let destinationIdentifier = null

let do_sysadmin_convert = false
let do_os_convert = false
let do_pim_convert = false
let do_os_and_sysadmin_combine = false

function onConversionSelect(selectConversionElement) {
    let conversionName = selectConversionElement.options[selectConversionElement.selectedIndex].value
    
    let conversionData = conversionTree[conversionName]
    
    conversionIdentifier = conversionData.conversionIdentifier
    source1NamedAs = conversionData.source1NamedAs
    source1Identifier = conversionData.source1Identifier
    source2NamedAs = conversionData.source2NamedAs
    source2Identifier = conversionData.source2Identifier
    destinationIdentifier = conversionData.destinationIdentifier
    
    load()
}
 
function init() {
    projectIdentifier = 'ClientLive'
	
	let urlString = window.location.href
	let url = new URL(urlString)
	let projectOverrule = url.searchParams.get("project")
	if (projectOverrule != null) {
		projectIdentifier = projectOverrule
	}
    
    loadConversionTree(projectIdentifier, 'conversionTree') // ASYNC!
}

function load() {
    document.getElementById('source1Data').value = ""
    document.getElementById('source2Data').value = ""
    document.getElementById('conversionCode').value = ""
    document.getElementById('destinationData').value = ""
    loadSourceData(projectIdentifier, source1Identifier, 'source1Data')  // ASYNC!
    if (source2Identifier != null) {
        loadSourceData(projectIdentifier, source2Identifier, 'source2Data')  // ASYNC!
    }
    loadConversionCode(projectIdentifier, conversionIdentifier)  // ASYNC!
}

function run() {
    let source1DataElement = document.getElementById('source1Data')
    let source2DataElement = document.getElementById('source2Data')
    let destinationDataElement = document.getElementById('destinationData')
    let conversionCodeElement = document.getElementById('conversionCode')
    
    let conversionCode = conversionCodeElement.value
    let sources = {}
    sources[source1NamedAs] = JSON.parse(source1DataElement.value)
    if (source2NamedAs != null) {
        sources[source2NamedAs] = JSON.parse(source2DataElement.value)
    }
    let conversionFunction = new Function('sources', conversionCode)
    
    destinationDataElement.value = JSON.stringify(conversionFunction(sources), null, 4)
}

function saveData() {
    let destinationDataElement = document.getElementById('destinationData')
    // TODO: maybe minify/un-prettify the JSON first
    storeDestinationData(destinationDataElement.value, projectIdentifier, destinationIdentifier)
}

function saveCode() {
    let conversionCodeElement = document.getElementById('conversionCode')
    // TODO: maybe minify/un-prettify the JSON first
    storeConversionCode(conversionCodeElement.value, projectIdentifier, conversionIdentifier)
}

function loadConversionTree(projectIdentifier, selectConversionElementIdentifier) {
    let url = 'api.php?action=get_conversion_tree&project=' + projectIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let conversionTreeData = JSON.parse(xmlhttp.responseText)
            conversionTree = conversionTreeData.conversionTree
            
            let selectConversionElement = document.getElementById(selectConversionElementIdentifier)
            for(let conversionName in conversionTree) {
                let optionElement = document.createElement("option")
                optionElement.textContent = conversionName
                optionElement.value = conversionName
                selectConversionElement.appendChild(optionElement)
            }
            
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function loadSourceData(projectIdentifier, sourceIdentifier, sourceElementIdentifier) {
    let url = 'api.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            let sourceDataElement = document.getElementById(sourceElementIdentifier)
            
            sourceDataElement.value = JSON.stringify(sourceData.sourceData, null, 4)
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function storeDestinationData(destinationData, projectIdentifier, source1Identifier) {
    let url = 'api.php?action=set_source_data&project=' + projectIdentifier + '&source=' + source1Identifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    xmlhttp.send(destinationData)
}

function loadConversionCode(projectIdentifier, conversionIdentifier) {
    let url = 'api.php?action=get_conversion_code&project=' + projectIdentifier + '&conversion=' + conversionIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let conversionCode = JSON.parse(xmlhttp.responseText)
            let conversionCodeElement = document.getElementById('conversionCode')
            
            conversionCodeElement.value = conversionCode.conversionCode
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function storeConversionCode(conversionCode, projectIdentifier, conversionIdentifier) {
    let url = 'api.php?action=set_conversion_code&project=' + projectIdentifier + '&conversion=' + conversionIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            // TODO: if we (un)succesfully stored the data, we should probably notify the user
        }
    }
    xmlhttp.open("PUT", url, true)
    xmlhttp.setRequestHeader("Content-Type", "application/json")
    xmlhttp.send(JSON.stringify({ 'conversionCode' : conversionCode }))
}

