var app = angular.module('MyWebsite', [])

app.controller('Ctrl', ['$http', function($http){
    console.log('Kontroler Ctrl startuje')
    var ctrl = this

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        yearOfBirth: 2000
    }

    $http.get('/person').then(
        function(res){
            ctrl.person = res.data
        },
        function(err){}
    )

    ctrl.dataChanged = function(){
        $http.put('/person', ctrl.person).then(
            function(res){},
            function(err){}
        )
    }

    ctrl.sendNewData = function(){
        $http.put('/person', ctrl.newPerson ).then(
            function(res){ctrl.person=res.data},
            function(err){}
        )
    }
}])