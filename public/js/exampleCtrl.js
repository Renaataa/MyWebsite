var app = angular.module('MyWebsite')

app.controller('ExampleCtrl', ['common', function(common) {
    console.log('Kontroler ExampleCtrl startuje')
    var ctrl = this

    ctrl.click = function(){
        //common.alert('alert-success', 'Klikles!')
        common.confirm({title: 'Co wybierasz?', body: 'Wybierz uwarznie...'}, function(result){
            common.alert('alert-warning', 'Wybrales ' + result)
        })
    }
}])