<?php

$action = $_GET['action'] ?? 'get_project_data';

if ($action === 'get_projects') {
    $projects = [];
    $dataDir = 'data';
    $dataDirContents = scandir($dataDir);
    if ($dataDirContents !== false) {
        foreach ($dataDirContents as $dataDirContent) {
            if (($dataDirContent == '..') || ($dataDirContent == '.')) {
                continue;
            }
            $fullPathDataDirContent = $dataDir . '/' . $dataDirContent;

            if (is_dir($fullPathDataDirContent)) {
                $projects[] = $dataDirContent;
            }
        }
    }
    echo json_encode($projects);
}
else if ($action === 'get_project_data') {
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
    
    $visualDataToStore = array_replace_recursive($visualData, $visualDataToChange);
    
    file_put_contents($filenameVisual, json_encode($visualDataToStore, JSON_PRETTY_PRINT));
}
else if ($action === 'get_source_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $sourceFile = $_GET['source'] ?? 'sources/example_source.json';

    $filenameSource = "data/$projectDir/$sourceFile";

    $sourceData = json_decode(file_get_contents($filenameSource), true);

    echo json_encode([ 
        'sourceData' => $sourceData,
    ]);
}
else if ($action === 'set_source_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $sourceFile = $_GET['source'] ?? 'sources/example_source.json';
    
    $filenameSource = "data/$projectDir/$sourceFile";
    
    $sourceDataToStore = json_decode(file_get_contents('php://input'), true);
    
    file_put_contents($filenameSource, json_encode([ 'sourceData' => $sourceDataToStore ], JSON_PRETTY_PRINT));
}
else if ($action === 'get_conversion_code') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $conversionFile = $_GET['conversion'] ?? 'conversions/example_conversion.js';

    $filenameConversion = "data/$projectDir/$conversionFile";

    $conversionCode = file_get_contents($filenameConversion);

    echo $conversionCode;
}
