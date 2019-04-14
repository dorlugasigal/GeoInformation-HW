app.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');

        $routeProvider.
            when('/Main', {
                templateUrl: 'App/Views/Main/Main.html',
                controller: 'Main',
            }).
            otherwise('/Main');
    }]
);