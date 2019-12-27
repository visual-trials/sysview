let myVue = new Vue({
    el: '#app',
    data: {
        projectName: '',
        applications : [],
        conversionList : []
    },
    mounted () {
        let projectIdentifier = 'ClientLive'
        let sourceIdentifier = 'sources/live_applications.csv'
        loadSourceData(projectIdentifier, sourceIdentifier)
        loadConversionTree(projectIdentifier)
    }
})

function loadConversionTree(projectIdentifier) {
    let url = 'index.php?action=get_conversion_tree&project=' + projectIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let conversionTreeData = JSON.parse(xmlhttp.responseText)
            let conversionList = []
            for (conversionName in conversionTreeData.conversionTree) {
                let conversion = conversionTreeData.conversionTree[conversionName]
                conversion.name = conversionName

                conversionList.push(conversion)
            }
            myVue.conversionList = conversionList
            myVue.projectName = projectIdentifier
            
//console.log(myVue.conversionList)
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}

function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            
            // FIXME: hardcoded to 'applications'
            myVue.applications = sourceData.sourceData
            
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}