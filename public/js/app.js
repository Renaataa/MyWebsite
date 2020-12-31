var app = angular.module('MyWebsite', ['ngRoute', 'ngSanitize'])

// router menu
app.constant('routes', [
	{ route: '/', templateUrl: 'homeView.html', controller: 'HomeCtrl', controllerAs: 'ctrl', menu: '<i class="fa fa-lg fa-home"></i>'},
	{ route: '/example', templateUrl: 'exampleView.html', controller: 'ExampleCtrl', controllerAs: 'ctrl', menu: 'Przyklad'},
    { route: '/persons', templateUrl: 'personsView.html', controller: 'PersonsCtrl', controllerAs: 'ctrl', menu: 'Osoby', mask: 0x03},
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

app.service('common', ['$http', '$location', 'routes', function($http, $location, routes){
    var common = this

    common.menu = []

    common.rebuildMenu = function() {
        common.menu.length = 0

        $http.get('/login').then(
            function(res){
                for (var i in routes) {
                    if(!routes[i].mask || routes[i].mask & res.data.role > 0)
                        common.menu.push({route: routes[i].route, title: routes[i].menu});
                }
                $location.path('/');   
            },
            function(err) {}
        ) 
    }
}])

app.controller('ContainerCtrl', ['$scope', '$location', 'common', function($scope, $location, common) {
    var ctrl = this

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
}])

