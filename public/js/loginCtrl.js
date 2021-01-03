var app = angular.module('MyWebsite')

app.controller('LoginCtrl', ['$http', '$uibModalInstance', function($http, $uibModalInstance) {
    console.log('Kontroler LoginCtrl startuje')
    var ctrl = this

    ctrl.credentials = {login: '', password: ''}

    ctrl.doLogin = function(){
        $http.post('/login', ctrl.credentials).then(
            function(res) {
                $uibModalInstance.close()
            },
            function(err) {}
        )
    }

    ctrl.cancel = function(){
        $uibModalInstance.dismiss('cancel')    
    }
}])
