var app = angular.module('MyWebsite', [])

app.controller('Ctrl', ['$http', function($http){
    console.log('Kontroler Ctrl startuje')
    var ctrl = this

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        yearOfBirth: 2000
    }

    $http.get('/get').then(
        function(res){
            ctrl.person = res.data
        },
        function(err){}
    )

    ctrl.dataChanged = function(){
        $http.get('/set?firstName=' + ctrl.person.firstName + '&lastName=' + ctrl.person.lastName + '&yearOfBirth=' + ctrl.person.yearOfBirth).then(
            function(res){},
            function(err){}
        )
    }

    ctrl.sendNewData = function(){
        $http.get('/set?firstName=' + ctrl.newPerson.firstName + '&lastName=' + ctrl.newPerson.lastName + '&yearOfBirth=' + ctrl.newPerson.yearOfBirth).then(
            function(res){ctrl.person=res.data},
            function(err){}
        )
    }
}])