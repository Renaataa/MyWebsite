var app = angular.module('MyWebsite')

app.controller('PersonsCtrl', [ '$http', function($http) {
    console.log('Kontroler PersonsCtrl startuje')
    var ctrl = this

    ctrl.selected = -1

    ctrl.persons = []
    ctrl.history = []

    ctrl.newPerson = {
        firstName: '',
        lastName: '',
        year: 2000
    }

    var refreshPersons = function() {
        $http.get('/person').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    var refreshPerson = function() {
        $http.get('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                ctrl.person = res.data
            },
            function(err) {}
        )
    }

    refreshPersons();

    ctrl.insertNewData = function() {
        $http.post('/person', ctrl.newPerson).then(
            function(res) {
                refreshPersons()
            },
            function(err) {}
        )
    }

    ctrl.select = function(index) {
        ctrl.selected = index
        refreshPerson()
    }

    ctrl.updateData = function() {
        $http.put('/person?_id=' + ctrl.persons[ctrl.selected]._id, ctrl.person).then(
            function(res) {
                refreshPersons();
            },
            function(err) {}
        )
    }

    ctrl.deleteData = function() {
        $http.delete('/person?_id=' + ctrl.persons[ctrl.selected]._id).then(
            function(res) {
                refreshPersons();
            },
            function(err) {}
        )
    }
}])
