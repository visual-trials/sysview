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
 
let menuButtons = []
let menuIcons = {}

function initIcons() {

    let menuIconsRaw = {}
    // see: https://ezgif.com/image-to-datauri
    menuIconsRaw['view'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAp0lEQVRYR+3W4QqAIAwE4Pn+D10ICTISvdvhCvRfYPZ52rRYcivJ37cD+FUCl5l+yZAEKqA25J3pHkcGawlIk2AAdVYyBAuQISIACSIKCCMUgBBCBaARSgCFUANghArQqmRf+ZbGXur0jOqLT/9MFyYW4M+FrYDRzCkEmoA/DcPLgALe+ocQCGB0tqcD/L8P7QVFAp8ANAR8ZVMlML37jTocwEkgPYEbdmUtIUAAjAQAAAAASUVORK5CYII='
    menuIconsRaw['move'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAApUlEQVRYR+2V4QrAIAiE7f0feqOBEFtqepAN7Odw3pde2ij5tGR9KoCqAFqBiwjzEQLQxfmE80R/HMUhiAjATDwMEQEYZ1eqBzrINgBJyPv9M/lXWsA9n8VqAF3MzG8FWE/NAjAhNADN7d4lKuocXQG+ZaoHRgivCa3qPrmXgpSGb5sDEkMKwBG7IHUbvl8H5KXfm9A7EUPLCBbREqAtgOEKoCpwA2MJHyFyeKK8AAAAAElFTkSuQmCC'
    menuIconsRaw['connect'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAA60lEQVRYR+2WsQ2EIBSGn7UNE9HTOIWtqzgBoaCxt3ENC1awo2ECLpDY3Omh8MBCSCgICd/HD+HRwMOteZgPVeAdCYzjaKWUsK7rz4azJeCgQghQSvl7zhiDZVnKCQzDYKdpAq21F+CcQ9/35QQclBBi27aFbdvc8DDtbEfg4F3XAaUU5nl2vZzADpdSeijn3B7FfxpLyuv4DQ+thXoEd+GoCcTA0QRi4SgCKfBkgVR4kgAGPFoACx4lgAm/LYANvyWQA35ZIBf8kkBOeFAgN/yvQAn4qYD7ThljYK/noZKaMo9ajmNEqkBN4AOo0XEhIBB/ywAAAABJRU5ErkJggg=='
    menuIconsRaw['isoMetric'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAjElEQVRYR+2VwQrAIAxD9f8/ervMS6Uk6YRuEK+2yTMVnaN5zWb/YQAn4AR+n8D1vCPlg1Qbo3EZRAVARmh/e3hZAFWYrkcAtFDyp8D+DAA2ip9YqhcBThtHzk3/cwlA4lPRLx10CVedOhq6ngVgQWhjNQE0Gtn4LQCbCLwy6gigoFpgACfgBJxAewI3vSgYIdYpy48AAAAASUVORK5CYII='
    menuIconsRaw['square'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAW0lEQVRYR+2WQQoAIAgE9f+PTnpArWSgh+mabeNApFvz8ub7DQAMjDewPr2SY6PKwAZQNYrxmqHCAcAABjCAAQxgYIQB9d9n9p8Hkkx4qUYNJKXwzGEAMNBuIABaPSIhIHxqIwAAAABJRU5ErkJggg=='
    menuIconsRaw['grid'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFiUAABYlAUlSJPAAAABeSURBVEhL7dFBCgAhDEPROve/VQ+mgxFxUwLFLoS8lVmJfusHd1+n6cr8rFj5Be1/yzoWwU9B7pchmu83UOQtmopMKTKlyBxSQC4jRFORKUWmFJlDCshlhGi+3sBsAB2ejdkSVbdvAAAAAElFTkSuQmCC'
    // menuIconsRaw['grid'] = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAALUlEQVRYR+3QQREAAAABQfqXFsNnFTizzXk99+MAAQIECBAgQIAAAQIECBAgMBo/ACHo7lH9AAAAAElFTkSuQmCC'
    
    for (let mode in menuIconsRaw) {
        let iconImage = new Image
        iconImage.src = menuIconsRaw[mode]
        iconImage.onload = function(){
            menuIcons[mode] = iconImage
            // FIXME: there is probably a better way to do this!
            // drawCanvas(true, true)
        }
    }
}

function initMenu() {
    menuButtons = [
        {
            mode: "view",
        },
        {
            mode: "move",
        },
        {
            mode: "connect",
        },
        {
            toggle: "isoMetric",
        },
        /*
        {
            toggle: "grid",
        }
        */
    ]
    
    let buttonPosition = { x: 20, y: 20 }
    let buttonSize = { width: 32, height: 32 }
    for (let buttonIndex = 0; buttonIndex < menuButtons.length; buttonIndex++) {
        let buttonData = menuButtons[buttonIndex]
        buttonData.position = {}
        // FIXME: ugly HACK!
        if (buttonIndex == 3) {
            buttonPosition.x = canvasElement.width - buttonSize.width - 20
            buttonPosition.y = canvasElement.height - buttonSize.height /* *2 */ - 20
        }
        buttonData.position.x = buttonPosition.x
        buttonData.position.y = buttonPosition.y
        buttonData.size = {}
        buttonData.size.width = buttonSize.width
        buttonData.size.height = buttonSize.height
        
        buttonPosition.y += buttonSize.height
    }
}
