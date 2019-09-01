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

function load() {
    // FIXME: hardcoded!
    let projectIdentifier = 'ClientLive'
    let sourceIdentifier = 'sources/client_live_sysadmin.json'
    let conversionIdentifier = 'conversions/get_machines.js'
    loadSourceData(projectIdentifier, sourceIdentifier)  // ASYNC!
    loadConversionCode(projectIdentifier, conversionIdentifier)  // ASYNC!
}

function run() {
    let sourceDataElement = document.getElementById('sourceData')
    let destinationDataElement = document.getElementById('destinationData')
    let conversionCodeElement = document.getElementById('conversionCode')
    
    let conversionCode = conversionCodeElement.value
    // TODO: allow for multiple parameters/source into the conversion function!
    let conversionFunction = new Function('firstSource', conversionCode)
    
    destinationDataElement.value = JSON.stringify(conversionFunction(JSON.parse(sourceDataElement.value)), null, 4)
}

function save() {
    // FIXME: hardcoded!
    let projectIdentifier = 'ClientLive'
    let destinationIdentifier = 'sources/sysadmin_converted.json'
    let destinationDataElement = document.getElementById('destinationData')
    // TODO: maybe minify/un-prettify the JSON first
    storeDestinationData(destinationDataElement.value, projectIdentifier, destinationIdentifier)
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

function loadConversionCode(projectIdentifier, conversionIdentifier) {
    let url = 'index.php?action=get_conversion_code&project=' + projectIdentifier + '&conversion=' + conversionIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let conversionCode = xmlhttp.responseText
            let conversionCodeElement = document.getElementById('conversionCode')
            
            conversionCodeElement.value = conversionCode
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