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

if (do_sysadmin_convert) {
    projectIdentifier = 'ClientLive'
    source1NamedAs = 'sysadmin'
    source1Identifier = 'sources/client_live_sysadmin.json'
    conversionIdentifier = 'conversions/convert_sysadmin.js'
    destinationIdentifier = 'sources/sysadmin_converted.json'
}
else if (do_os_convert) {
    projectIdentifier = 'ClientLive'
    source1NamedAs = 'os'
    source1Identifier = 'sources/client_live_os.json'
    conversionIdentifier = 'conversions/convert_os.js'
    destinationIdentifier = 'sources/os_converted.json'
}
else if (do_pim_convert) {
    projectIdentifier = 'ClientLive'
    source1NamedAs = 'pim'
    source1Identifier = 'sources/client_live_pim.json'
    conversionIdentifier = 'conversions/convert_pim.js'
    destinationIdentifier = 'sources/pim_converted.json'
}
else if (do_os_and_sysadmin_combine) {
    projectIdentifier = 'ClientLive'
    source1NamedAs = 'sysadmin'
    source1Identifier = 'sources/sysadmin_converted.json'
    source2NamedAs = 'os'
    source2Identifier = 'sources/os_converted.json'
    conversionIdentifier = 'conversions/combine_os_and_sysadmin.js'
    destinationIdentifier = 'sources/os_and_sysadmin_combined.json'
}
else {
    projectIdentifier = 'ClientLive'
    source1NamedAs = 'os_and_sysadmin'
    source1Identifier = 'sources/os_and_sysadmin_combined.json'
    source2NamedAs = 'pim'
    source2Identifier = 'sources/pim_converted.json'
    conversionIdentifier = 'conversions/combine_os_and_sysadmin_and_pim.js'
    destinationIdentifier = 'source.json'
}


function load() {
    loadSourceData(projectIdentifier, source1Identifier, 'source1Data')  // ASYNC!
    if (source2Identifier != null) {
        loadSourceData(projectIdentifier, source2Identifier, 'source2Data')  // ASYNC!
    }
    loadConversionCode(projectIdentifier, conversionIdentifier)  // ASYNC!
}

function run() {
    let source1DataElement = document.getElementById('source1Data')
    let source2DataElement = document.getElementById('source1Data')
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

function loadSourceData(projectIdentifier, sourceIdentifier, sourceElementIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
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
    let url = 'index.php?action=set_source_data&project=' + projectIdentifier + '&source=' + source1Identifier
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

