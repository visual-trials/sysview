const wikiApp = new Vue({
    el: '#wiki',
    data: { 
        wikiTerms : [],
        showAnswer : false,
        currentQuestion : {
            definition: "Definitie",
            possibleTerms: [
                { "text" : "Term1", "isCorrectAnswer" : false }, 
                { "text" : "Term2", "isCorrectAnswer" : true }
            ],
        }
    },
    methods: {
        turnOnShowAnswer : function() {
            wikiApp.showAnswer = true
        },
        createNewQuestion : function() {
            wikiApp.showAnswer = false
            wikiApp.currentQuestion = generateNewQuestion()
        },
    }
})

function init() {
    
    loadWikiData() // ASYNC!
}

function generateNewQuestion() {
    let newQuestion = {
        definition: "Definitie 2",
        possibleTerms: [
            { "text" : "TermA", "isCorrectAnswer" : true }, 
            { "text" : "TermB", "isCorrectAnswer" : false }
        ],
    }
    
    return newQuestion
}

function loadWikiData() {
    let url = 'api.php?action=get_source_data&project=ClientLive&source=sources/wikitermen.json'
    let xmlhttp = new XMLHttpRequest()
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let wikiData = JSON.parse(xmlhttp.responseText)
            wikiApp.wikiTerms = wikiData.sourceData
            
// FIXME: turn this on:            wikiApp.currentQuestion = generateNewQuestion()
            // FIXME: choose a question/term and show it!
        }
    }
    
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}
