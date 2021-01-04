var app = angular.module('MyWebsite')

app.controller('TransfersCtrl', [ '$http', 'common', function($http, common) {
    console.log('Kontroler TransfersCtrl startuje')
    var ctrl = this

    ctrl.formatDateTime = common.formatDateTime

    //ctrl.selected = -1 
    ctrl.history = []

    ctrl.transfer = {
        delta: 10.00
    }

    var refreshHistory = function() {
        if(ctrl.selected < 0) {
            ctrl.history = []
        } else {
            $http.get('/transfer').then(
                function(res) {
                    ctrl.history = res.data
                },
                function(err) {}    
            )
        }
    }
    
    refreshHistory()

    ctrl.doTransfer = function() {
        $http.post('/transfer?recipient=' + ctrl.persons[ctrl.selected]._id, ctrl.transfer).then(
            function(res) {
                ctrl.persons[ctrl.selected] = res.data
                refreshHistory()
            },
            function(err) {}
        )
    }
}])
