var app = angular.module('MyWebsite')

app.controller('HomeCtrl', ['$http', 'common', function($http, common) {
    console.log('Kontroler HomeCtrl startuje')
    var ctrl = this

    ctrl.sessionData = common.sessionData
    ctrl.credentials = {login: '', password: ''}

    ctrl.doLogin = function(){
        $http.post('/login', ctrl.credentials).then(
            function(res) {
                common.rebuildMenu()
            },
            function(err) {}
        )
    }

    ctrl.doLogout = function(){
        $http.delete('/login').then(
            function(res) {
                common.rebuildMenu()
            },
            function(err) {}
        )
    }
}])
