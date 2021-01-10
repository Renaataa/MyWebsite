var app = angular.module('MyWebsite')

app.controller('TransfersCtrl', [ '$http', 'common', function($http, common) {
    console.log('Kontroler TransfersCtrl startuje')
    var ctrl = this

    ctrl.formatDateTime = common.formatDateTime

    //ctrl.selected = -1 
    ctrl.history = []

    ctrl.recipients = []
    ctrl.recipient = null

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
        $http.post('/transfer?recipient=' + ctrl.recipient._id, ctrl.transfer).then(
            function(res) {
                refreshHistory()
            },
            function(err) {}
        )
    }

    $http.get('/personList').then(
        function(res){
            ctrl.recipients = res.data
            ctrl.recipient = ctrl.recipients[0] 
        },
        function(err){
            ctrl.recipients = []
            ctrl.recipient = null
        }
    )
}])
