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

 // TODO: what about brown? Or is that too close to orange?
let basicColors = {
    white   : {r:255, g:255, b:255, a:1},
    grey    : {r:127, g:127, b:127, a:1},
    black   : {r:  0, g:  0, b:  0, a:1},
    red     : {r:230, g: 25, b: 75, a:1},
    orange  : {r:245, g:130, b: 48, a:1},
    yellow  : {r:255, g:225, b: 25, a:1},
    lime    : {r:210, g:245, b: 60, a:1},
    green   : {r: 60, g:180, b: 75, a:1},
    cyan    : {r: 70, g:240, b:240, a:1},
    blue    : {r:  0, g:130, b:200, a:1},
    purple  : {r:145, g: 30, b:180, a:1},
    magenta : {r:240, g: 50, b:230, a:1}
}
 
// FIXME: make this available as data
let containerShapes = {
    'rectangle4points' : {
        'points' : {
            'top-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom-middle' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
            },
            'right-middle' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-top', type : 'move' },
            { toPoint : 'right-top', type : 'line' },
            { toPoint : 'right-bottom', type : 'line' },
            { toPoint : 'left-bottom', type : 'line' },
            // TODO: for now we always close the path. We might not (always) want to do that!
        ]
    },
    'parallelogram4points' : {
        'points' : {
            'bottom-rightish' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: -10, y: 0 },
                isConnectionPoint : false,
            },
            'bottom-leftish' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 10, y: 0 },
                isConnectionPoint : false,
            },
            'top-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom-middle' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
            },
            'right-middle' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-top', type : 'move' },
            { toPoint : 'right-top', type : 'line' },
            { toPoint : 'bottom-rightish', type : 'line' },
            { toPoint : 'bottom-leftish', type : 'line' },
            // TODO: for now we always close the path. We might not (always) want to do that!
        ]
    },
    'diamond4points' : {
        'points' : {
            'top-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom-middle' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
            },
            'right-middle' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'top-middle', type : 'move' },
            { toPoint : 'right-middle', type : 'line' },
            { toPoint : 'bottom-middle', type : 'line' },
            { toPoint : 'left-middle', type : 'line' },
            // TODO: for now we always close the path. We might not (always) want to do that!
        ]
    },
    'ellipse4Points' : {
        'points' : {
            'top-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-middle' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom-middle' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
            },
            'right-middle' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
            },
            // These connection depend on those above, so we add a ~ (since they are sorted alphabetically)
            // Also see: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas
            // And: https://stackoverflow.com/questions/14169234/the-relation-of-the-bezier-curve-and-ellipse
            '~ctrl-left-half-top' : {
                positioning : 'relative',
                fromPoint : 'left-middle',
                toPoint : 'left-top',
                fraction : .5522848,
            },
            '~ctrl-top-half-left' : {
                positioning : 'relative',
                fromPoint : 'top-middle',
                toPoint : 'left-top',
                fraction : .5522848,
            },
            '~ctrl-top-half-right' : {
                positioning : 'relative',
                fromPoint : 'top-middle',
                toPoint : 'right-top',
                fraction : .5522848,
            },
            '~ctrl-right-half-top' : {
                positioning : 'relative',
                fromPoint : 'right-middle',
                toPoint : 'right-top',
                fraction : .5522848,
            },
            '~ctrl-right-half-bottom' : {
                positioning : 'relative',
                fromPoint : 'right-middle',
                toPoint : 'right-bottom',
                fraction : .5522848,
            },
            '~ctrl-bottom-half-right' : {
                positioning : 'relative',
                fromPoint : 'bottom-middle',
                toPoint : 'right-bottom',
                fraction : .5522848,
            },
            '~ctrl-bottom-half-left' : {
                positioning : 'relative',
                fromPoint : 'bottom-middle',
                toPoint : 'left-bottom',
                fraction : .5522848,
            },
            '~ctrl-left-half-bottom' : {
                positioning : 'relative',
                fromPoint : 'left-middle',
                toPoint : 'left-bottom',
                fraction : .5522848,
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-middle', type : 'move' },
            { toPoint : 'top-middle', controlPoint1: '~ctrl-left-half-top', controlPoint2: '~ctrl-top-half-left', type : 'bezierCurve' },
            { toPoint : 'right-middle', controlPoint1: '~ctrl-top-half-right', controlPoint2: '~ctrl-right-half-top', type : 'bezierCurve' },
            { toPoint : 'bottom-middle', controlPoint1: '~ctrl-right-half-bottom', controlPoint2: '~ctrl-bottom-half-right', type : 'bezierCurve' },
            { toPoint : 'left-middle', controlPoint1: '~ctrl-bottom-half-left', controlPoint2: '~ctrl-left-half-bottom', type : 'bezierCurve' },
        ]
    },
    'roundedRectangleManyConnections' : {
        'points' : {
            'left-top-r' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 20, y: 0 },
                isConnectionPoint : false,
            },
            'left-top-b' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 0, y: 20 },
                isConnectionPoint : false,
            },
            'right-top-l' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: -20, y: 0 },
                isConnectionPoint : false,
            },
            'right-top-b' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: 0, y: 20 },
                isConnectionPoint : false,
            },
            'right-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: 0, y: -20 },
                isConnectionPoint : false,
            },
            'right-bottom-l' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: -20, y: 0 },
                isConnectionPoint : false,
            },
            'left-bottom-r' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 20, y: 0 },
                isConnectionPoint : false,
            },
            'left-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 0, y: -20 },
                isConnectionPoint : false,
            },
            'top-0.1' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.2' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.3' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.4' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.5' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.6' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.7' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.8' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.9' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.1' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.2' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.3' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.4' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.5' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.6' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.7' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.8' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.9' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 0.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.1' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.2' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.3' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.4' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.5' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.6' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.7' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.8' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'bottom-0.9' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.1' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.2' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.3' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.4' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.5' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.6' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.7' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.8' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.9' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 1.0 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
        },
        'strokeAndFillPath' : [
            { toPoint : 'left-top-r', type : 'move' },
            { toPoint : 'right-top-l', type : 'line' },
            { toPoint : 'right-top-b', edgePoint : 'right-top', type : 'arcto' },
            { toPoint : 'right-bottom-t', type : 'line' },
            { toPoint : 'right-bottom-l', edgePoint : 'right-bottom', type : 'arcto' },
            { toPoint : 'left-bottom-r', type : 'line' },
            { toPoint : 'left-bottom-t', edgePoint : 'left-bottom', type : 'arcto' },
            { toPoint : 'left-top-b', type : 'line' },
            { toPoint : 'left-top-r', edgePoint : 'left-top', type : 'arcto' },
        ]
    }
}

