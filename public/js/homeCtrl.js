var app = angular.module('MyWebsite')

app.controller('HomeCtrl', ['$http', function($http) {
    console.log('Kontroler HomeCtrl startuje')
    var ctrl = this

    ctrl.credentials = {login: '', password: ''}

    ctrl.doLogin = function(){
        $http.post('/login', ctrl.credentials).then(
            function(res) {ctrl.login = res.data.login},
            function(err) {}
        )
    }

    ctrl.doLogout = function(){
        $http.delete('/login').then(
            function(res) {ctrl.login = res.data.login},
            function(err) {}
        )
    }

    $http.get('/login').then(
        function(res) {ctrl.login = res.data.login},
        function(err) {}
    )
}])
