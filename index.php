<?php

$action = $_GET['action'] ?? 'get_project_data';

if ($action === 'get_project_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';

    $filenameVisual = "data/$projectDir/visual.json";

    $visualData = json_decode(file_get_contents($filenameVisual), true);

    echo json_encode([ 
        'visual' => $visualData,
    ]);
}
else if ($action === 'set_visual_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    
    $filenameVisual = "data/$projectDir/visual.json";
    
    $visualDataToChange = json_decode(file_get_contents('php://input'), true);
    $visualData = json_decode(file_get_contents($filenameVisual), true);
    
    $visualDataToStore = array_merge_recursive($visualData, $visualDataToChange);
    
    file_put_contents($filenameVisual, json_encode($visualDataToStore, JSON_PRETTY_PRINT));
}