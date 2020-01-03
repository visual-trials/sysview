let myVue = new Vue({
    el: '#app',
    data: {
        projectName: '',
        sourceData : {}
    },
    mounted () {
        let projectIdentifier = 'ClientLive'
        let sourceIdentifier = 'sources/integration_db.json'
        loadSourceData(projectIdentifier, sourceIdentifier)
    }
})

function loadSourceData(projectIdentifier, sourceIdentifier) {
    let url = 'index.php?action=get_source_data&project=' + projectIdentifier + '&source=' + sourceIdentifier
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let sourceData = JSON.parse(xmlhttp.responseText)
            
            myVue.sourceData = sourceData.sourceData // TODO: we probably dont want the data to be inside .sourceData
            myVue.projectName = projectIdentifier
        }
    }
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}