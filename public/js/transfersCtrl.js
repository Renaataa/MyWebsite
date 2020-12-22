var app = angular.module('MyWebsite')

app.controller('TransfersCtrl', [ '$http', function($http) {
    console.log('Kontroler TransfersCtrl startuje')
    var ctrl = this

    ctrl.selected = -1

    ctrl.persons = []
    ctrl.history = []

    ctrl.transfer = {
        delta: 10.00
    }


    var refreshPersons = function() {
        $http.get('/person').then(
            function(res) {
                ctrl.persons = res.data
            },
            function(err) {}
        )
    }

    refreshPersons();

    var refreshHistory = function() {
        if(ctrl.selected < 0) {
            ctrl.history = []
        } else {
            $http.get('/transfer?recipient=' + ctrl.persons[ctrl.selected]._id).then(
                function(res) {
                    ctrl.history = res.data
                },
                function(err) {}    
            )
        }
    }
    
    ctrl.doTransfer = function() {
        $http.post('/transfer?recipient=' + ctrl.persons[ctrl.selected]._id, ctrl.transfer).then(
            function(res) {
                ctrl.persons[ctrl.selected] = res.data
                refreshHistory()
            },
            function(err) {}
        )
    }

    ctrl.select = function(index) {
        ctrl.selected = index
        refreshHistory()
    }

    ctrl.formatDateTime = function(stamp) {
        var date = new Date(stamp)
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
    }
}])
