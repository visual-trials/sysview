const wikiApp = new Vue({
    el: '#wiki',
    data: { 
        wikiTerms : [],
        showAnswer : false,
        currentQuestion : {
            term: "Term",
            examples: [],
            possibleDefinitions: [
                { "text" : "Definitie1", "isCorrectAnswer" : false }, 
                { "text" : "Definitie2", "isCorrectAnswer" : true }
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

function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function init() {
    
    loadWikiData() // ASYNC!
}

function generateNewQuestion() {
    
    let nrOfTerms = wikiApp.wikiTerms.length
    
    // TODO: the incorrect ones might be correct!
    let correctTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    let correctDefinitionIndex = getRandomInt(2)
    let correctDefinition = correctTerm['definitions'][correctDefinitionIndex]
    
    let incorrectDefinitions = []
    let incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectDefinitions.push({ "term": incorrectTerm["term"], "definition" : incorrectTerm['definitions'][getRandomInt(2)]})
    incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectDefinitions.push({ "term": incorrectTerm["term"], "definition" : incorrectTerm['definitions'][getRandomInt(2)]})
    incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectDefinitions.push({ "term": incorrectTerm["term"], "definition" : incorrectTerm['definitions'][getRandomInt(2)]})

    let correctQuestionIndex = getRandomInt(4)
    
    let newQuestion = {
        term: correctTerm['term'],
        examples: correctTerm['examples'],
        possibleDefinitions: []
    }
    
    let nrOfIncorrectDefinitionsAdded = 0
    for (let questionIndex = 0 ; questionIndex < 4; questionIndex++) {
        let possibleAnswer = { 'text' : null , "isCorrectAnswer" : false }
        if (questionIndex === correctQuestionIndex) {
            possibleAnswer = {
                'text' : correctDefinition , "isCorrectAnswer" : true, "correctTerm" : correctTerm['term']
            }
        }
        else {
            let incorrectDefinition = incorrectDefinitions[nrOfIncorrectDefinitionsAdded]['definition']
            possibleAnswer = {
                'text' : incorrectDefinition , "isCorrectAnswer" : false, "correctTerm" : incorrectDefinitions[nrOfIncorrectDefinitionsAdded]['term']
            }
            nrOfIncorrectDefinitionsAdded++
        }
        newQuestion.possibleDefinitions.push(possibleAnswer)
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
            
            wikiApp.currentQuestion = generateNewQuestion()
        }
    }
    
    xmlhttp.open("GET", url, true)
    xmlhttp.send()
}
