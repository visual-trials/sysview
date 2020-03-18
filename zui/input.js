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
 
let mouseState = {
    position : { x: 0, y: 0 },
    previousPosition : { x: 0, y: 0 },
    worldPosition : { x: 0, y: 0 },
    previousWorldPosition : { x: 0, y: 0 },
    hasMoved : false,
    
    leftButtonHasGoneDown : false,
    leftButtonHasGoneDownAt : null,
    leftButtonHasGoneDownTwice : false,
    leftButtonIsDown : false,
    leftButtonHasGoneUp : false,
    
    rightButtonHasGoneDown : false,
    rightButtonHasGoneDownAt : null,
    rightButtonHasGoneDownTwice : false,
    rightButtonIsDown : false,
    rightButtonHasGoneUp : false,
    
    mouseWheelHasMoved :  false,
    mouseWheelDelta : null,
    
    mouseStateHasChanged : false,
}

function resetMouseEventData() {
    mouseState.previousPosition.x = mouseState.position.x
    mouseState.previousPosition.y = mouseState.position.y
    mouseState.previousWorldPosition = fromScreenPositionToWorldPosition(mouseState.previousPosition)
    
    mouseState.hasMoved = false
    
    mouseState.leftButtonHasGoneDown = false
    mouseState.leftButtonHasGoneDownTwice = false
    mouseState.leftButtonHasGoneUp = false
    
    mouseState.rightButtonHasGoneDown = false
    mouseState.rightButtonHasGoneDownTwice = false
    mouseState.rightButtonHasGoneUp = false
    
    mouseState.mouseWheelHasMoved = false
    
    mouseState.mouseStateHasChanged = false
}

function updateMousePosition(x, y) {
    mouseState.position.x = x
    mouseState.position.y = y
    mouseState.hasMoved = mouseState.previousPosition.x != mouseState.position.x || 
                          mouseState.previousPosition.y != mouseState.position.y
               
    mouseState.worldPosition = fromScreenPositionToWorldPosition(mouseState.position)
}

function mouseButtonDown (e) {
        
    let now = Date.now()
    
    if (e.button == 0) {
        // left mouse button down
        mouseState.leftButtonHasGoneDown = true
        mouseState.leftButtonIsDown = true
        if (mouseState.leftButtonHasGoneDownAt != null && now - mouseState.leftButtonHasGoneDownAt < 500) {
            mouseState.leftButtonHasGoneDownTwice = true
        }
        mouseState.leftButtonHasGoneDownAt = now        
        
        mouseState.mouseStateHasChanged = true
    }
    else if (e.button == 2) {
        // right mouse button down
        mouseState.rightButtonHasGoneDown = true
        mouseState.rightButtonIsDown = true
        if (mouseState.rightButtonHasGoneDownAt != null && now - mouseState.rightButtonHasGoneDownAt < 500) {
            mouseState.rightButtonHasGoneDownTwice = true
        }
        mouseState.rightButtonHasGoneDownAt = now        
        
        mouseState.mouseStateHasChanged = true
    }

    e.preventDefault()
}

function mouseButtonUp (e) {
    if (e.button == 0) {
        // left mouse button up
        mouseState.leftButtonHasGoneUp = true
        mouseState.leftButtonIsDown = false
        
        mouseState.mouseStateHasChanged = true
    }
    else if (e.button == 2) {
        // right mouse button up
        mouseState.rightButtonHasGoneUp = true
        mouseState.rightButtonIsDown = false
        
        mouseState.mouseStateHasChanged = true
    }

    e.preventDefault()
}

function mouseEntered (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    mouseState.mouseStateHasChanged = true

    e.preventDefault()
}

function mouseMoved (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    mouseState.mouseStateHasChanged = true

    e.preventDefault()
}

function mouseExited (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    mouseState.mouseStateHasChanged = true

    e.preventDefault()
}

function mouseWheelMoved (e) {
    updateMousePosition(e.offsetX, e.offsetY)
    mouseState.mouseWheelHasMoved = true

    // Cross-browser wheel delta (Mac is much more sensitive)
    // A number between -1 and 1
    mouseState.mouseWheelDelta = Math.max(-1, Math.min(1, (e.wheelDelta / 120 || -e.detail)))

    mouseState.mouseStateHasChanged = true
    
    e.preventDefault()
}


// Touch

// Note that IE, Opera, Safari do not support touch!  ( https://developer.mozilla.org/en-US/docs/Web/API/Touch )
    
let touchesState = {}
let touchesStateHasChanged = false

function resetTouchEventData () {

    let touchesToDelete = {}
    for (let touch_identifier in touchesState) {
        
        let touch = touchesState[touch_identifier]
        
        if (touch.hasEnded || touch.wasCanceled) {
            touchesToDelete[touch_identifier] = true
        }
        else {
            touch.previousPosition.x = touch.position.x
            touch.previousPosition.y = touch.position.y
            touch.previousWorldPosition = fromScreenPositionToWorldPosition(touch.previousPosition)
            touch.hasMoved = false
            
            touch.hasStarted = false
            // touch.hasEnded = false // this is irrelevant, since we are going to delete it anyway
            // touch.hasEndedQuickly = false // this is irrelevant, since we are going to delete it anyway
            // touch.wasCanceled = false // this is irrelevant, since we are going to delete it anyway
        }
    }
    
    for (let touch_identifier in touchesToDelete) {
        delete touchesState[touch_identifier]
    }
    
    touchesStateHasChanged = false
}

function updateTouchPosition (touch, x, y, previousX, previousY) {
    touch.position.x = x
    touch.position.y = y
    
    if (previousX != null) {
        touch.previousPosition.x = previousX
    }
    if (previousY != null) {
        touch.previousPosition.y = previousY
    }
    
    touch.hasMoved = touch.previousPosition.x != touch.position.x || 
                     touch.previousPosition.y != touch.position.y
               
    touch.worldPosition = fromScreenPositionToWorldPosition(touch.position)
}
    
function touchStarted (e) {
        
    let changedTouches = e.changedTouches;
    
    let now = Date.now()
        
    for (let touchIndex = 0; touchIndex < changedTouches.length; touchIndex++) {
        let changedTouch = changedTouches[touchIndex]
        
        let newTouch = {}
        newTouch.isActive = true
        newTouch.identifier = changedTouch.identifier
        
        newTouch.position = { x: 0, y: 0 }
        newTouch.previousPosition = { x: 0, y: 0 }
        newTouch.worldPosition = { x: 0, y: 0 }
        newTouch.previousWorldPosition = { x: 0, y: 0 }
        newTouch.hasMoved = false
        
        newTouch.hasStarted = true
        newTouch.startedAt = now
        newTouch.hasEnded = false
        newTouch.hasEndedQuickly = false
        newTouch.wasCanceled = false
        
        touchesState[changedTouch.identifier] = newTouch
        
        updateTouchPosition(newTouch, changedTouch.pageX, changedTouch.pageY, changedTouch.pageX, changedTouch.pageY)
    }
    
    touchesStateHasChanged = true

    e.preventDefault()
}

function touchEnded (e) {
        
    let now = Date.now()
    
    let changedTouches = e.changedTouches;
    
    for (let touchIndex = 0; touchIndex < changedTouches.length; touchIndex++) {
        let changedTouch = changedTouches[touchIndex]

        if (touchesState.hasOwnProperty(changedTouch.identifier)) {
            let endedTouch = touchesState[changedTouch.identifier]
            
            endedTouch.hasEnded = true
            if (endedTouch.startedAt != null && now - endedTouch.startedAt < 500) {
                endedTouch.hasEndedQuickly = true
            }
            // TODO: should we do this?: endedTouch.touchHasStarted = false
            
            updateTouchPosition(endedTouch, changedTouch.pageX, changedTouch.pageY, null, null)
        }
        else {
            console.log("ERROR: touch ended that did not start!")
        }
    }

    touchesStateHasChanged = true
    
    e.preventDefault()
}

function touchCanceled (e) {
    let changedTouches = e.changedTouches;
    
    for (let touchIndex = 0; touchIndex < changedTouches.length; touchIndex++) {
        let changedTouch = changedTouches[touchIndex]

        if (touchesState.hasOwnProperty(changedTouch.identifier)) {
            let canceledTouch = touchesState[changedTouch.identifier]
            canceled.wasCanceled = true
            // TODO: should we do this?: canceled.touchHasStarted = false
        }
        else {
            console.log("ERROR: touch canceled that did not start!")
        }
    }
    
    touchesStateHasChanged = true

    e.preventDefault()
}

function touchMoved (e) {

    let changedTouches = e.changedTouches;
    
    for (let touchIndex = 0; touchIndex < changedTouches.length; touchIndex++) {
        let changedTouch = changedTouches[touchIndex]
        
        if (touchesState.hasOwnProperty(changedTouch.identifier)) {
            let movedTouch = touchesState[changedTouch.identifier]
            
            updateTouchPosition(movedTouch, changedTouch.pageX, changedTouch.pageY, null, null)
        }
        else {
            console.log("ERROR: touch moved that did not start!")
        }
    }
    
    touchesStateHasChanged = true

    e.preventDefault()
}


// Keyboard

let keyboardState = {
    keysThatAreDown : {},
    ctrlIsDown : false,
    shiftIsDown : false,
    altIsDown : false,
    sequenceKeysUpDown : [],
    capsLockIsActive : false,
    keyboardStateHasChanged : false,
}

function resetKeyboardEventData() {
    keyboardState.sequenceKeysUpDown = []
    keyboardStateHasChanged : false
}

function keyDown (e) {
    
    // Using Key Values ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values )
    
    // FIXME: e.keyCode and e.which are deprecated, so we should not use them ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent )
    let keyValue = e.key;
    let keyCode = e.keyCode ? e.keyCode : e.which

    if (keyCode <= 255) {
        
        if (keyboardState.sequenceKeysUpDown.length < 25) {
            keyboardState.sequenceKeysUpDown.push({ "isDown" : true, "keyCode" : keyCode})
        }
        else {
            console.log("ERROR: Too many keys have gone up and down during this frame")
        }
        
        if (!keyboardState.keysThatAreDown[keyCode]) {
            keyboardState.keysThatAreDown[keyCode] = true
            if (keyCode === 16) {  // TODO: hardcoded code for SHIFT!
                keyboardState.shiftIsDown = true
            }
            else if (keyCode === 17) {  // TODO: hardcoded code for CONTROL!
                keyboardState.ctrlIsDown = true
            }
            else if (keyCode === 18) {  // TODO: hardcoded code for ALT!
                keyboardState.altIsDown = true
            }
        }
        else {
            // FIXME: a key is down, but there was already one down. This could be multiple keys pressed at once. Not supported atm.
        }
        
        // TODO: now we always check CapsLock. Can we only check when it is pressed (or can it be pressed outside of our window, so thats not safe?)
        if (e.getModifierState("CapsLock")) {
            keyboardState.capsLockIsActive = true
        }
        else {
            keyboardState.capsLockIsActive = false
        }
        
        keyboardState.keyboardStateHasChanged = true
    }
    else {
        console.log("ERROR: Invalid keyCode (" + keyCode + ") encountered!") 
    }
}

function keyUp (e) {
    // Using Key Values ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values )
    // FIXME: e.keyCode and e.which are deprecated, so we should not use them ( https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent )
    let keyValue = e.key;
    let keyCode = e.keyCode ? e.keyCode : e.which
    
    if (keyCode <= 255) {
        
        if (keyboardState.sequenceKeysUpDown.length < 25) {
            keyboardState.sequenceKeysUpDown.push({ "isDown" : false, "keyCode" : keyCode})
        }
        else {
            console.log("ERROR: Too many keys have gone up and down during this frame")
        }
        
        if (keyboardState.keysThatAreDown[keyCode]) {
            keyboardState.keysThatAreDown[keyCode] = false
            if (keyCode === 16) {  // TODO: hardcoded code for SHIFT!
                keyboardState.shiftIsDown = false
            }
            else if (keyCode === 17) {  // TODO: hardcoded code for CONTROL!
                keyboardState.ctrlIsDown = false
            }
            else if (keyCode === 18) {  // TODO: hardcoded code for ALT!
                keyboardState.altIsDown = false
            }
        }
        else {
            // FIXME: No key was down, but a key went up. What happened?
        }
        
        keyboardState.keyboardStateHasChanged = true
    }
    else {
        console.log("ERROR: Invalid keyCode (" + keyCode + ") encountered!") 
    }
}

function hasKeyGoneDown(keyNameToCheck) {
    if (keyboardState.sequenceKeysUpDown.length) {
        for (let sequenceIndex = 0; sequenceIndex < keyboardState.sequenceKeysUpDown.length; sequenceIndex++) {
            let keyUpDown = keyboardState.sequenceKeysUpDown[sequenceIndex]
            let keyName = keyCodeMap[keyUpDown.keyCode]
            if (keyUpDown.isDown) {
                if (keyName === keyNameToCheck) {
                    return true
                }
            }
        }
    }
    return false
}

function contextMenuDown (e) {
    // TODO: for now preventing the context-menu this way
    e.preventDefault()
}
    
function addInputListeners () {
    canvasElement.addEventListener("mousedown", mouseButtonDown, false)
    // We want to know if the mouse goes up OUTSIDE the canvas, so we attach the eventlistener to the 'window' instead
    window.addEventListener("mouseup", mouseButtonUp, false)
    canvasElement.addEventListener("mousemove", mouseMoved, false)
    // TODO: the mouseenter is not triggered on *page load* for Chrome. It is for FF.
    //       See this link *why* we want to use it: 
    //       https://stackoverflow.com/questions/2601097/how-to-get-the-mouse-position-without-events-without-moving-the-mouse
    canvasElement.addEventListener("mouseenter", mouseEntered, false)
    canvasElement.addEventListener("mouseleave", mouseExited, false)
    // IE9, Chrome, Safari, Opera
    canvasElement.addEventListener("mousewheel", mouseWheelMoved, false)
    // Firefox
    canvasElement.addEventListener("DOMMouseScroll", mouseWheelMoved, false)
    
    canvasElement.addEventListener("touchstart", touchStarted, false)
    canvasElement.addEventListener("touchend", touchEnded, false)
    canvasElement.addEventListener("touchcancel", touchCanceled, false)
    canvasElement.addEventListener("touchmove", touchMoved, false)
        
    document.addEventListener("keydown", keyDown, false)
    document.addEventListener("keyup", keyUp, false)
        
    window.addEventListener("resize", drawCanvas, false)
    
    canvasElement.addEventListener('contextmenu', contextMenuDown, false)
}

// From here: https://stackoverflow.com/questions/1772179/get-character-value-from-keycode-in-javascript-then-trim/5829387#5829387
// TODO: its probably better to use this as basis: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values

// names of known key codes (0-255)

let keyCodeMap = [
  "", // [0]
  "", // [1]
  "", // [2]
  "CANCEL", // [3]
  "", // [4]
  "", // [5]
  "HELP", // [6]
  "", // [7]
  "BACK_SPACE", // [8]
  "TAB", // [9]
  "", // [10]
  "", // [11]
  "CLEAR", // [12]
  "ENTER", // [13]
  "ENTER_SPECIAL", // [14]
  "", // [15]
  "SHIFT", // [16]
  "CONTROL", // [17]
  "ALT", // [18]
  "PAUSE", // [19]
  "CAPS_LOCK", // [20]
  "KANA", // [21]
  "EISU", // [22]
  "JUNJA", // [23]
  "FINAL", // [24]
  "HANJA", // [25]
  "", // [26]
  "ESCAPE", // [27]
  "CONVERT", // [28]
  "NONCONVERT", // [29]
  "ACCEPT", // [30]
  "MODECHANGE", // [31]
  "SPACE", // [32]
  "PAGE_UP", // [33]
  "PAGE_DOWN", // [34]
  "END", // [35]
  "HOME", // [36]
  "LEFT", // [37]
  "UP", // [38]
  "RIGHT", // [39]
  "DOWN", // [40]
  "SELECT", // [41]
  "PRINT", // [42]
  "EXECUTE", // [43]
  "PRINTSCREEN", // [44]
  "INSERT", // [45]
  "DELETE", // [46]
  "", // [47]
  "0", // [48]
  "1", // [49]
  "2", // [50]
  "3", // [51]
  "4", // [52]
  "5", // [53]
  "6", // [54]
  "7", // [55]
  "8", // [56]
  "9", // [57]
  "COLON", // [58]
  "SEMICOLON", // [59]
  "LESS_THAN", // [60]
  "EQUALS", // [61]
  "GREATER_THAN", // [62]
  "QUESTION_MARK", // [63]
  "AT", // [64]
  "A", // [65]
  "B", // [66]
  "C", // [67]
  "D", // [68]
  "E", // [69]
  "F", // [70]
  "G", // [71]
  "H", // [72]
  "I", // [73]
  "J", // [74]
  "K", // [75]
  "L", // [76]
  "M", // [77]
  "N", // [78]
  "O", // [79]
  "P", // [80]
  "Q", // [81]
  "R", // [82]
  "S", // [83]
  "T", // [84]
  "U", // [85]
  "V", // [86]
  "W", // [87]
  "X", // [88]
  "Y", // [89]
  "Z", // [90]
  "OS_KEY", // [91] Windows Key (Windows) or Command Key (Mac)
  "", // [92]
  "CONTEXT_MENU", // [93]
  "", // [94]
  "SLEEP", // [95]
  "NUMPAD0", // [96]
  "NUMPAD1", // [97]
  "NUMPAD2", // [98]
  "NUMPAD3", // [99]
  "NUMPAD4", // [100]
  "NUMPAD5", // [101]
  "NUMPAD6", // [102]
  "NUMPAD7", // [103]
  "NUMPAD8", // [104]
  "NUMPAD9", // [105]
  "MULTIPLY", // [106]
  "ADD", // [107]
  "SEPARATOR", // [108]
  "SUBTRACT", // [109]
  "DECIMAL", // [110]
  "DIVIDE", // [111]
  "F1", // [112]
  "F2", // [113]
  "F3", // [114]
  "F4", // [115]
  "F5", // [116]
  "F6", // [117]
  "F7", // [118]
  "F8", // [119]
  "F9", // [120]
  "F10", // [121]
  "F11", // [122]
  "F12", // [123]
  "F13", // [124]
  "F14", // [125]
  "F15", // [126]
  "F16", // [127]
  "F17", // [128]
  "F18", // [129]
  "F19", // [130]
  "F20", // [131]
  "F21", // [132]
  "F22", // [133]
  "F23", // [134]
  "F24", // [135]
  "", // [136]
  "", // [137]
  "", // [138]
  "", // [139]
  "", // [140]
  "", // [141]
  "", // [142]
  "", // [143]
  "NUM_LOCK", // [144]
  "SCROLL_LOCK", // [145]
  "WIN_OEM_FJ_JISHO", // [146]
  "WIN_OEM_FJ_MASSHOU", // [147]
  "WIN_OEM_FJ_TOUROKU", // [148]
  "WIN_OEM_FJ_LOYA", // [149]
  "WIN_OEM_FJ_ROYA", // [150]
  "", // [151]
  "", // [152]
  "", // [153]
  "", // [154]
  "", // [155]
  "", // [156]
  "", // [157]
  "", // [158]
  "", // [159]
  "CIRCUMFLEX", // [160]
  "EXCLAMATION", // [161]
  "DOUBLE_QUOTE", // [162]
  "HASH", // [163]
  "DOLLAR", // [164]
  "PERCENT", // [165]
  "AMPERSAND", // [166]
  "UNDERSCORE", // [167]
  "OPEN_PAREN", // [168]
  "CLOSE_PAREN", // [169]
  "ASTERISK", // [170]
  "PLUS", // [171]
  "PIPE", // [172]
  "HYPHEN_MINUS", // [173]
  "OPEN_CURLY_BRACKET", // [174]
  "CLOSE_CURLY_BRACKET", // [175]
  "TILDE", // [176]
  "", // [177]
  "", // [178]
  "", // [179]
  "", // [180]
  "VOLUME_MUTE", // [181]
  "VOLUME_DOWN", // [182]
  "VOLUME_UP", // [183]
  "", // [184]
  "", // [185]
  "SEMICOLON", // [186]
  "EQUALS", // [187]
  "COMMA", // [188]
  "MINUS", // [189]
  "PERIOD", // [190]
  "SLASH", // [191]
  "BACK_QUOTE", // [192]
  "", // [193]
  "", // [194]
  "", // [195]
  "", // [196]
  "", // [197]
  "", // [198]
  "", // [199]
  "", // [200]
  "", // [201]
  "", // [202]
  "", // [203]
  "", // [204]
  "", // [205]
  "", // [206]
  "", // [207]
  "", // [208]
  "", // [209]
  "", // [210]
  "", // [211]
  "", // [212]
  "", // [213]
  "", // [214]
  "", // [215]
  "", // [216]
  "", // [217]
  "", // [218]
  "OPEN_BRACKET", // [219]
  "BACK_SLASH", // [220]
  "CLOSE_BRACKET", // [221]
  "QUOTE", // [222]
  "", // [223]
  "META", // [224]
  "ALTGR", // [225]
  "", // [226]
  "WIN_ICO_HELP", // [227]
  "WIN_ICO_00", // [228]
  "", // [229]
  "WIN_ICO_CLEAR", // [230]
  "", // [231]
  "", // [232]
  "WIN_OEM_RESET", // [233]
  "WIN_OEM_JUMP", // [234]
  "WIN_OEM_PA1", // [235]
  "WIN_OEM_PA2", // [236]
  "WIN_OEM_PA3", // [237]
  "WIN_OEM_WSCTRL", // [238]
  "WIN_OEM_CUSEL", // [239]
  "WIN_OEM_ATTN", // [240]
  "WIN_OEM_FINISH", // [241]
  "WIN_OEM_COPY", // [242]
  "WIN_OEM_AUTO", // [243]
  "WIN_OEM_ENLW", // [244]
  "WIN_OEM_BACKTAB", // [245]
  "ATTN", // [246]
  "CRSEL", // [247]
  "EXSEL", // [248]
  "EREOF", // [249]
  "PLAY", // [250]
  "ZOOM", // [251]
  "", // [252]
  "PA1", // [253]
  "WIN_OEM_CLEAR", // [254]
  "" // [255]
]
