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
 
// FIXME: make this available as data
let containerShapes = {
    'rectangle4points' : {
        'points' : {
            'top' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1 * Math.PI,
            },
            'bottom' : {
                positioning : 'relative',
                fromPoint : 'left-bottom',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 1.5 * Math.PI,
            },
            'right' : {
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
    'roundedRectangleManyConnections' : {
        'points' : {
            'left-top-r' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-top-b' : {
                positioning : 'absolute',
                fromPoint : 'left-top',
                offset : { x: 0, y: 200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-top-l' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: -200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-top-b' : {
                positioning : 'absolute',
                fromPoint : 'right-top',
                offset : { x: 0, y: 200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: 0, y: -200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'right-bottom-l' : {
                positioning : 'absolute',
                fromPoint : 'right-bottom',
                offset : { x: -200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-bottom-r' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 200, y: 0 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'left-bottom-t' : {
                positioning : 'absolute',
                fromPoint : 'left-bottom',
                offset : { x: 0, y: -200 },
                fraction : 0.1,
                isConnectionPoint : false,
            },
            'top-0.1' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.2' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.3' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.4' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.5' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.6' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.7' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.8' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'top-0.9' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'right-top',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.1' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.1,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.2' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.3' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.4' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.5' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.6' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.7' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.8' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'right-0.9' : {
                positioning : 'relative',
                fromPoint : 'right-top',
                toPoint : 'right-bottom',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
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
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.2' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.2,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.3' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.3,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.4' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.4,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.5' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.5,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.6' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.6,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.7' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.7,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.8' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.8,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
                // TODO: add something like data/arrow-direction : 'input' / 'output' / 'intput+output'
            },
            'left-0.9' : {
                positioning : 'relative',
                fromPoint : 'left-top',
                toPoint : 'left-bottom',
                fraction : 0.9,
                isConnectionPoint : true,
                rightAngle : 0.5 * Math.PI,
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

