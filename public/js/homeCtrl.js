var app = angular.module('MyWebsite')

app.controller('HomeCtrl', ['$http', 'common', function($http, common) {
    console.log('Kontroler HomeCtrl startuje')
    var ctrl = this

    ctrl.loggedUser = {}
    ctrl.credentials = {login: '', password: ''}

    ctrl.doLogin = function(){
        $http.post('/login', ctrl.credentials).then(
            function(res) {
                ctrl.loggedUser.login = res.data.login
                ctrl.loggedUser.firstName = res.data.firstName
                common.rebuildMenu()
            },
            function(err) {}
        )
    }

    ctrl.doLogout = function(){
        $http.delete('/login').then(
            function(res) {
                ctrl.loggedUser = {}
                common.rebuildMenu()
            },
            function(err) {}
        )
    }

    $http.get('/login').then(
        function(res) {
            ctrl.loggedUser.login = res.data.login
            ctrl.loggedUser.firstName = res.data.firstName
        },
        function(err) {}
    )
}])
