<?php

$action = $_GET['action'] ?? 'get_project_data';

if ($action === 'get_projects') {
    $projects = [];
    $projectsDir = 'projects';
    $projects = scandir($projectsDir);
    if ($projects !== false) {
        foreach ($projects as $project) {
            if (($project == '..') || ($project == '.')) {
                continue;
            }
            $fullPathProjectDirContent = $projectsDir . '/' . $project;

            if (is_dir($fullPathProjectDirContent)) {
                $projects[] = $project;
            }
        }
    }
    echo json_encode($projects);
}
else if ($action === 'get_project_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';

    $filenameVisual = "projects/$projectDir/visual.json";
    $filenameSource = "projects/$projectDir/source.json";
    $filenameColorAndShapeMappings = "projects/$projectDir/colorAndShapeMappings.json";

    $visualData = json_decode(file_get_contents($filenameVisual), true);
    $sourceData = json_decode(file_get_contents($filenameSource), true);
    $colorAndShapeMappingsData = json_decode(file_get_contents($filenameColorAndShapeMappings), true);
    

    echo json_encode([ 
        'visual' => $visualData,
        'source' => $sourceData,
        'colorAndShapeMappings' => $colorAndShapeMappingsData,
    ]);
}
else if ($action === 'get_conversion_tree') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';

    $filenameConversionTree = "projects/$projectDir/conversion_tree.json";
    
    $conversionTree = json_decode(file_get_contents($filenameConversionTree), true);

    echo json_encode([ 
        'conversionTree' => $conversionTree,
    ]);
}
else if ($action === 'set_visual_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    
    $filenameVisual = "projects/$projectDir/visual.json";
    
    $visualDataToChange = json_decode(file_get_contents('php://input'), true);
    $visualData = json_decode(file_get_contents($filenameVisual), true);
    
    // If containers have [ 'remove' => true ] as their data, we remove it from the visualData
    if (array_key_exists('containers', $visualDataToChange)) {
        foreach ($visualDataToChange['containers'] as $containerIdentifier => $containerDataToChange) {
            if (array_key_exists('remove', $containerDataToChange) && $containerDataToChange['remove']) {
                if (array_key_exists('containers', $visualData)) {
                    unset($visualData['containers'][$containerIdentifier]);
                    unset($visualDataToChange['containers'][$containerIdentifier]);
                }
            }                
        }
    }
    
    // If connections have [ 'remove' => true ] as their data, we remove it from the visualData
    if (array_key_exists('connections', $visualDataToChange)) {
        foreach ($visualDataToChange['connections'] as $connectionIdentifier => $connectionDataToChange) {
            if (array_key_exists('remove', $connectionDataToChange) && $connectionDataToChange['remove']) {
                if (array_key_exists('connections', $visualData)) {
                    unset($visualData['connections'][$connectionIdentifier]);
                    unset($visualDataToChange['connections'][$connectionIdentifier]);
                }
            }                
        }
    }
    
    // We then overwrite all visual-data with the new data-to-chanre
    $visualDataToStore = array_replace_recursive($visualData, $visualDataToChange);
    
    file_put_contents($filenameVisual, json_encode($visualDataToStore, JSON_PRETTY_PRINT));
}
else if ($action === 'get_source_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $sourceFile = $_GET['source'] ?? 'sources/example_source.json';

    $filenameSource = "projects/$projectDir/$sourceFile";

    $sourceData = json_decode(file_get_contents($filenameSource), true);

    echo json_encode([ 
        'sourceData' => $sourceData,
    ]);
}
else if ($action === 'set_source_data') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $sourceFile = $_GET['source'] ?? 'sources/example_source.json';
    
    $filenameSource = "projects/$projectDir/$sourceFile";
    
    $sourceDataToStore = json_decode(file_get_contents('php://input'), true);
    
    file_put_contents($filenameSource, json_encode($sourceDataToStore, JSON_PRETTY_PRINT));
}
else if ($action === 'get_conversion_code') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $conversionFile = $_GET['conversion'] ?? 'conversions/example_conversion.js';

    $filenameConversion = "projects/$projectDir/$conversionFile";

    $conversionCode = file_get_contents($filenameConversion);

    echo json_encode([ 
        'conversionCode' => $conversionCode,
    ]);
}
else if ($action === 'set_conversion_code') {
    $projectDir = $_GET['project'] ?? 'ExampleProject';
    $conversionFile = $_GET['conversion'] ?? 'conversions/example_conversion.js';
    
    $filenameConversion = "projects/$projectDir/$conversionFile";
    
    $conversionCodeToStore = json_decode(file_get_contents('php://input'), true);
    
    file_put_contents($filenameConversion, $conversionCodeToStore['conversionCode']);
}
