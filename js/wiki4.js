const wikiApp = new Vue({
    el: '#wiki',
    data: { 
        wikiTerms : [],
        currentTerm : {
            term: "Term",
            examples: [],
            definitions: [],
        },
        currentTermIndex : 0
    },
    methods: {
        previousTerm : function() {
            wikiApp.currentTermIndex--
            if (wikiApp.currentTermIndex < 0) {
                wikiApp.currentTermIndex = wikiApp.wikiTerms.length - 1
            }
            wikiApp.currentTerm = wikiApp.wikiTerms[wikiApp.currentTermIndex]
        },
        nextTerm : function() {
            wikiApp.currentTermIndex++
            if (wikiApp.currentTermIndex >= wikiApp.wikiTerms.length) {
                wikiApp.currentTermIndex = 0
            }
            wikiApp.currentTerm = wikiApp.wikiTerms[wikiApp.currentTermIndex]
        },
    }
})

function init() {
    
    loadWikiData() // ASYNC!
}

function loadWikiData() {
    let url = 'api.php?action=get_source_data&project=ClientLive&source=sources/wikitermen.json'
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let wikiData = JSON.parse(xmlhttp.responseText)
            wikiApp.wikiTerms = wikiData.sourceData
            
            wikiApp.currentTermIndex = 0
            wikiApp.currentTerm = wikiApp.wikiTerms[wikiApp.currentTermIndex]
            
console.log(wikiApp.currentTerm)
        }
    }
    
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}
