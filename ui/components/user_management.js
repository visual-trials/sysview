function CreateNewUserManagement() {

    let UserManagement = {
        knownUsersEditor: {
            editedKnownUsers: null,
            currentlyShowingTeamChoiceForKnownUserId : null,
        },
        openKnownUsersFunction: null,
        closeKnownUsersFunction: null,
    }

    UserManagement.setEditedKnownUsers = function (knownUsers) {
        UserManagement.knownUsersEditor.editedKnownUsers = JSON.parse(JSON.stringify(knownUsers))
    }

    // Authorization

    UserManagement.userAuthorization = {
        currentUser : null,
        isRootUser : false
    }

    UserManagement.saveKnownUsers = function (editedKnownUsers) {
        storeChangesBetweenKnownUsers(NLC.nodesAndLinksData.knownUsers, editedKnownUsers) // ASYNC!
        UserManagement.closeKnownUsersFunction()
    }

    UserManagement.isAllowedTo = function(action) {
        let currentUser = UserManagement.userAuthorization.currentUser
        
        if (UserManagement.userAuthorization.isRootUser) {
            return true
        }
        
        if (action === 'edit') {
            if (currentUser && currentUser.userPermissions && currentUser.userPermissions.isAdmin) {
                return true
            }
        }
        return false
    }

    UserManagement.getUserEditableTeamIds = function() {
        let editableTeamIds = []
        
        let currentUser = UserManagement.userAuthorization.currentUser
        if (currentUser && 'userPermissions' in currentUser) {
            if ('memberOfTeamIds' in currentUser['userPermissions']) {
                // If you are a member if a team, you are allowed to edit it
                // TODO: we could also simply make a CLONE here...
                for (let memberOfTeamIdIndex in currentUser['userPermissions']['memberOfTeamIds']) {
                    let memberOfTeamId = currentUser['userPermissions']['memberOfTeamIds'][memberOfTeamIdIndex]
                    editableTeamIds.push(memberOfTeamId)
                }
            }
            if ('editableTeamIds' in currentUser['userPermissions']) {
                // If you have explicit permissions to edit a team, you may do so
                for (let editableTeamIdIndex in currentUser['userPermissions']['editableTeamIds']) {
                    let editableTeamId = currentUser['userPermissions']['editableTeamIds'][editableTeamIdIndex]
                    if (!(editableTeamIds.includes(editableTeamId))) {
                        editableTeamIds.push(editableTeamId)
                    }
                }
            }
        }
        return editableTeamIds
    }

    UserManagement.getUserInitials = function() {
        let initials = null
        
        let currentUser = UserManagement.userAuthorization.currentUser
        if (currentUser && 'concatName' in currentUser) {
            let nameParts = currentUser.concatName.split(', ')
            if (nameParts.length == 2) {
                initials = nameParts[1].substring(0,1).toUpperCase() + nameParts[0].substring(0,1).toUpperCase()
            }
            else {
                initials = currentUser.concatName.substring(0,2).toUpperCase()
            }
        }
        return initials
    }

    UserManagement.getUserLogin = function() {
        let login = null
        
        let currentUser = UserManagement.userAuthorization.currentUser
        if (currentUser && 'login' in currentUser) {
            login = currentUser.login
        }
        return login
    }

    UserManagement.getUserFullName = function() {
        let fullName = null
        
        let currentUser = UserManagement.userAuthorization.currentUser
        if (currentUser && 'concatName' in currentUser) {
            let nameParts = currentUser.concatName.split(', ')
            if (nameParts.length == 2) {
                fullName = nameParts[1] + ' ' + nameParts[0]
            }
            else {
                fullName = currentUser.concatName
            }
        }
        return fullName
    }

    UserManagement.getUserTeamId = function() {
        let teamId = null
        
        let currentUser = UserManagement.userAuthorization.currentUser
        if (currentUser && 'teamId' in currentUser) {
            teamId = currentUser.teamId
        }
        return teamId
    }
    
    return UserManagement
}
