const wikiApp = new Vue({
    el: '#wiki',
    data: { 
        wikiTerms : [],
        showAnswer : false,
        currentQuestion : {
            term: "Term",
            definitions: [],
            possibleExamples: [
                { "text" : "Voorbeeld1", "isCorrectAnswer" : false }, 
                { "text" : "Voorbeeld2", "isCorrectAnswer" : true }
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
    let correctExampleIndex = getRandomInt(2)
    let correctExample = correctTerm['examples'][correctExampleIndex]
    
    let incorrectExamples = []
    let incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectExamples.push({ "term": incorrectTerm["term"], "example" : incorrectTerm['examples'][getRandomInt(2)]})
    incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectExamples.push({ "term": incorrectTerm["term"], "example" : incorrectTerm['examples'][getRandomInt(2)]})
    incorrectTerm = wikiApp.wikiTerms[getRandomInt(nrOfTerms)]
    incorrectExamples.push({ "term": incorrectTerm["term"], "example" : incorrectTerm['examples'][getRandomInt(2)]})

    let correctQuestionIndex = getRandomInt(4)
    
    let newQuestion = {
        term: correctTerm['term'],
        definitions : correctTerm['definitions'],
        possibleExamples: []
    }
    
    let nrOfIncorrectExamplesAdded = 0
    for (let questionIndex = 0 ; questionIndex < 4; questionIndex++) {
        let possibleAnswer = { 'text' : null , "isCorrectAnswer" : false }
        if (questionIndex === correctQuestionIndex) {
            possibleAnswer = {
                'text' : correctExample , "isCorrectAnswer" : true, "correctTerm" : correctTerm['term']
            }
        }
        else {
            let incorrectExample = incorrectExamples[nrOfIncorrectExamplesAdded]['example']
            possibleAnswer = {
                'text' : incorrectExample , "isCorrectAnswer" : false, "correctTerm" : incorrectExamples[nrOfIncorrectExamplesAdded]['term']
            }
            nrOfIncorrectExamplesAdded++
        }
        newQuestion.possibleExamples.push(possibleAnswer)
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
