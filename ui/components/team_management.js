function CreateNewTeamManagement() {

    let TeamManagement = {
        teamsEditor: {
            editedTeams: null,
        },
        openTeamsFunction: null,
        closeTeamsFunction: null,
    }

    TeamManagement.setEditedTeams = function (teams) {
        let editedTeams = JSON.parse(JSON.stringify(teams))
        let editedTeamsById = groupById(editedTeams)
        
        // We pre-compute the nrOfTeamMembers for each team here, for performance reasons

        for (let editedTeamId in editedTeamsById) {
            let editedTeam = editedTeamsById[editedTeamId]
            if (!('_helper' in editedTeam)) {
                editedTeam['_helper'] = {}
            }
            if (!('numberOfTeamMembers' in editedTeam['_helper'])) {
                editedTeam['_helper']['numberOfTeamMembers'] = 0
            }
        }

        for (let knownUserIndex in NLC.nodesAndLinksData.knownUsers) {
            let knownUser = NLC.nodesAndLinksData.knownUsers[knownUserIndex]

            if (knownUser.teamId && knownUser.teamId in editedTeamsById) {
                let editedTeam = editedTeamsById[knownUser.teamId]
                editedTeam['_helper']['numberOfTeamMembers'] += 1
            }
        }
        
        TeamManagement.teamsEditor.editedTeams = editedTeams
    }

    TeamManagement.saveTeams = function (editedTeams) {
        storeChangesBetweenTeams(NLC.nodesAndLinksData.teams, editedTeams) // ASYNC!

        TeamManagement.closeTeamsFunction()
    }

    TeamManagement.removeTeam = function (teamToBeRemoved) {
        
        if (editedTeam['_helper']['numberOfTeamMembers'] != 0) {
            console.log('ERROR: cannot remove team because it is still has members!')
            return
        }
        
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

    TeamManagement.createNewTeamAndAddToEditedTeams = function(teamTypeIdentifier) {
                
        let teamEditor = TeamManagement.teamsEditor
        
        let newTeam = createNewTeam(teamTypeIdentifier)
        
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
            if ('userPermissions' in knownUser && 
                'memberOfTeamIds' in knownUser['userPermissions'] && 
                knownUser['userPermissions']['memberOfTeamIds'].includes(teamId)) {
            
                teamMembers.push(knownUser)
            }
        }
        return teamMembers
    }
    
    return TeamManagement
}