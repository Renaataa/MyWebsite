var app = angular.module('MyWebsite', ['ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap'])

// router menu
app.constant('routes', [
	{ route: '/', templateUrl: 'homeView.html', controller: 'HomeCtrl', controllerAs: 'ctrl', menu: '<i class="fa fa-lg fa-home"></i>'},
	{ route: '/example', templateUrl: 'exampleView.html', controller: 'ExampleCtrl', controllerAs: 'ctrl', menu: 'Przyklad'},
    { route: '/persons', templateUrl: 'personsView.html', controller: 'PersonsCtrl', controllerAs: 'ctrl', menu: 'Osoby', roles: [1, 2]},
    { route: '/transfers', templateUrl: 'transfersView.html', controller: 'TransfersCtrl', controllerAs: 'ctrl', menu: 'Przelewy'},
    { route: '/groups', templateUrl: 'groupsView.html', controller: 'GroupsCtrl', controllerAs: 'ctrl', menu: 'Grupy'}
])

// router installation
app.config(['$routeProvider', '$locationProvider', 'routes', function($routeProvider, $locationProvider, routes) {
    $locationProvider.hashPrefix('')
	for(var i in routes) {
		$routeProvider.when(routes[i].route, routes[i])
	}
	$routeProvider.otherwise({ redirectTo: '/' })
}])

app.service('common', ['$http', '$location', 'routes', '$uibModal', function($http, $location, routes, $uibModal){
    var common = this

    common.sessionData = {}
    common.menu = []

    common.rebuildMenu = function() {
        $http.get('/login').then(
            function(res){
                common.sessionData.login = res.data.login
                common.sessionData.firstName = res.data.firstName
                common.sessionData.role = res.data.role
                common.menu.length = 0
                for (var i in routes) {
                    if(!routes[i].roles || common.sessionData.role in routes[i].roles)
                        common.menu.push({route: routes[i].route, title: routes[i].menu});
                }
                $location.path('/');   
            },
            function(err) {}
        ) 
    }

    common._alert = { text: '', type: 'alert-success' }
    // alert function
    common.alert = function(type, text) {
        common._alert.type = type
        common._alert.text = text
        console.log(type, ':', text)
    }

    common.confirm = function(confirmOptions, nextTick) {

        var modalInstance = $uibModal.open({
            animation: true,
            ariaLabelledBy: 'modal-title-top',
            ariaDescribedBy: 'modal-body-top',
            templateUrl: 'confirmDialog.html',
            controller: 'ConfirmDialog',
            controllerAs: 'ctrl',
            resolve: {
                confirmOptions: function () {
                    return confirmOptions
                }
            }
        })

        modalInstance.result.then(
            function () { nextTick(true) },
            function (ret) { nextTick(false) }
        )
    }
}])

// confirmation dialog controller
app.controller('ConfirmDialog', [ '$uibModalInstance', 'confirmOptions', function($uibModalInstance, confirmOptions) {
    var ctrl = this
    ctrl.opt = confirmOptions

    ctrl.ok = function () { $uibModalInstance.close() }
    ctrl.cancel = function () { $uibModalInstance.dismiss('cancel') }

}])

app.controller('ContainerCtrl', ['$scope', '$location', 'common', function($scope, $location, common) {
    var ctrl = this

    ctrl._alert = common._alert

    ctrl.menu = common.menu
    common.rebuildMenu()

    // controlling collapsed/not collapsed status
    ctrl.isCollapsed = true
    $scope.$on('$routeChangeSuccess', function () {
        ctrl.isCollapsed = true
    })

    // determining which menu position is active
    ctrl.navClass = function(page) {
        return page === $location.path() ? 'active' : ''
    }

    ctrl.closeAlert = function(){
        ctrl._alert.text = ''
    }
}])

