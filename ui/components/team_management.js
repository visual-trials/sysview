let TeamManagement = {
    teamsEditor: {
        editedTeams: null,
    },
    openTeamsFunction: null,
    closeTeamsFunction: null,
}

TeamManagement.setEditedTeams = function (teams) {
    TeamManagement.teamsEditor.editedTeams = JSON.parse(JSON.stringify(teams))
}

TeamManagement.saveTeams = function (editedTeams) {
    storeChangesBetweenTeams(NLC.nodesAndLinksData.teams, editedTeams) // ASYNC!

    TeamManagement.closeTeamsFunction()
}

TeamManagement.removeTeam = function (teamToBeRemoved) {
    // We are first removing the team from the editedTeams
    // If the user chooses to "save" the deleted team, it will also be removed from the backend/NLC data
    let teamIndexToDelete = null    
    for (let teamIndex in  TeamManagement.teamsEditor.editedTeams) {    
        let team = TeamManagement.teamsEditor.editedTeams[teamIndex]    
        if (team.id === teamToBeRemoved.id) {    
            teamIndexToDelete = teamIndex    
        }    
    }    
    if (teamIndexToDelete != null) {    
        TeamManagement.teamsEditor.editedTeams.splice(teamIndexToDelete, 1)    
    }    
    else {    
        console.log("ERROR: could not find team to be deleted (in editedTeams)!")
    }
}

TeamManagement.createNewTeamAndAddToEditedTeams = function() {
            
    let teamEditor = TeamManagement.teamsEditor
    
    let newTeam = createNewTeam()
    
    // Creating a new team id here and (if succesful) async adding to editedTeams
    TeamManagement.generateNewTeamIdAndAddToEditedTeams(newTeam)
}

TeamManagement.generateNewTeamIdAndAddToEditedTeams = function (newTeam) {
    
    function assignIdToNewTeamAndAddToEditedTeams(newId) {
        newTeam.id = newId
        
        TeamManagement.teamsEditor.editedTeams.push(newTeam)
    }
    generateNewId(assignIdToNewTeamAndAddToEditedTeams) // ASYNC!
}

TeamManagement.getTeamMembers = function (knownUsers, teamId) {
    let teamMembers = []
    for (knownUserIndex in knownUsers) {
        let knownUser = knownUsers[knownUserIndex]
        if (knownUser.teamId == teamId) {
            teamMembers.push(knownUser)
        }
    }
    return teamMembers
}