var app = angular.module('MyWebsite', [])

app.controller('Ctrl', ['$http', function($http){
    console.log('Kontroler Ctrl startuje')
    var ctrl = this

    ctrl.selected = -1
    ctrl.persons = []

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        yearOfBirth: 2000
    }

    ctrl.transfer={
        delta: 10
    }
var refreshPersons = function(){
    $http.get('/person').then(
        function(res){
            ctrl.persons = res.data
        },
        function(err){}
    )
}

var refreshPerson = function(){
    $http.get('/person?index=' + ctrl.selected).then(
        function(res){
            ctrl.person = res.data
        },
        function(err){}
    )
}

refreshPersons();

    ctrl.insertNewData = function(){
        $http.post('/person', ctrl.newPerson ).then(
            function(res){
                // refreshPersons();
                ctrl.persons.push(res.data)
            },
            function(err){}
        )
    }

    ctrl.doTransfer = function(){
        $http.post('/person', ctrl.transfer).then(
            function(res){ctrl.person=res.data},
            function(err){}
        )
    }

    ctrl.select = function(index){
        ctrl.selected = index
        refreshPerson()
    }

    ctrl.updateData = function(){
        $http.put('/person?index=' + ctrl.selected, ctrl.person).then(
            function(res){
                refreshPersons()
            },
            function(err){}
        )
    }

    ctrl.deleteData = function(){
        $http.delete('/person?index=' + ctrl.selected).then(
            function(res){
                refreshPersons()
            },
            function(err){}
        )
    }
}])