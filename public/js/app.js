var app = angular.module('MyWebsite', [])

app.controller('Ctrl', ['$http', function($http){
    console.log('Kontroler Ctrl startuje')
    var ctrl = this

    ctrl.selected = -1
    
    ctrl.persons = []
    ctrl.history = []

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        yearOfBirth: 2000
    }

    ctrl.transfer={
        delta: 10.00
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

    var refreshHistory = function(){
        if(ctrl.selected < 0) ctrl.history = []
        else {
            $http.get('/transfer?index=' + ctrl.selected).then(
                function(res){
                    ctrl.history = res.data
                },
                function(err){}
            )
        } 
    }

    ctrl.insertNewData = function(){
        $http.post('/person', ctrl.newPerson ).then(
            function(res){
                ctrl.persons.push(res.data)
            },
            function(err){}
        )
    }

    ctrl.doTransfer = function(){
        $http.post('/transfer?index=' + ctrl.selected, ctrl.transfer).then(
            function(res){
                ctrl.persons[ctrl.selected]=res.data
                refreshHistory()
            },
            function(err){}
        )
    }

    ctrl.select = function(index){
        ctrl.selected = index
        refreshPerson()
        refreshHistory()
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

    ctrl.formatDateTime = function(stamp){
        var date = new Date(stamp)
        return date.toLocaleDateString() + ' ' + date.toLocaleDateString()
    }
}])