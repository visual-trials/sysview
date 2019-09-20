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
    
}

// FIXME: hardcoded!
let projectIdentifier = 'ClientLive'
let sourceNamedAs = null
let sourceIdentifier = null
let sourceNamedAs2 = null
let sourceIdentifier2 = null
let conversionIdentifier = null
let destinationIdentifier = null

let do_sysadmin_convert = false
let do_os_convert = false

if (do_sysadmin_convert) {
    projectIdentifier = 'ClientLive'
    sourceNamedAs = 'sysadmin'
    sourceIdentifier = 'sources/client_live_sysadmin.json'
    conversionIdentifier = 'conversions/convert_sysadmin.js'
    destinationIdentifier = 'sources/sysadmin_converted.json'
}
else if (do_os_convert) {
    projectIdentifier = 'ClientLive'
    sourceNamedAs = 'os'
    sourceIdentifier = 'sources/client_live_os.json'
    conversionIdentifier = 'conversions/convert_os.js'
    destinationIdentifier = 'sources/os_converted.json'
}
else {
    projectIdentifier = 'ClientLive'
    sourceNamedAs = 'sysadmin'
    sourceNamedAs2 = 'os'
    sourceIdentifier = 'sources/client_live_os.json'
    sourceIdentifier2 = 'sources/sysadmin_converted.json'
    conversionIdentifier = 'conversions/combine_os_and_sysadmin.js'
    destinationIdentifier = 'source.json'
}


function load() {
    loadSourceData(projectIdentifier, sourceIdentifier)  // ASYNC!
    if (sourceIdentifier2 != null) {
        loadSourceData2(projectIdentifier, sourceIdentifier2)  // ASYNC!
    }
    loadConversionCode(projectIdentifier, conversionIdentifier)  // ASYNC!
}

function run() {
    // TODO: allow for multiple parameters/source into the conversion function!
    let sourceDataElement = document.getElementById('sourceData')
    let sourceDataElement2 = document.getElementById('sourceData2')
    let destinationDataElement = document.getElementById('destinationData')
    let conversionCodeElement = document.getElementById('conversionCode')
    
    let conversionCode = conversionCodeElement.value
    let sources = {}
    sources[sourceNamedAs] = JSON.parse(sourceDataElement.value)
    if (sourceNamedAs2 != null) {
        sources[sourceNamedAs2] = JSON.parse(sourceDataElement2.value)
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

function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            let sourceDataElement = document.getElementById('sourceData')
            
            sourceDataElement.value = JSON.stringify(sourceData.sourceData, null, 4)
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

// FIXME: we should not duplicate this function!
function loadSourceData2(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            let sourceDataElement = document.getElementById('sourceData2') // FIXME
            
            sourceDataElement.value = JSON.stringify(sourceData.sourceData, null, 4)
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function storeDestinationData(destinationData, projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=set_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
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
    let url = 'index.php?action=get_conversion_code&project=' + projectIdentifier + '&conversion=' + conversionIdentifier
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
    let url = 'index.php?action=set_conversion_code&project=' + projectIdentifier + '&conversion=' + conversionIdentifier
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

