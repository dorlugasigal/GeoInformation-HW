
app.controller('Main', function ($rootScope, $scope, $http, $timeout) {
    // $scope.map .. this exists after the map is initialized
    $scope.markers = [];
    $scope.address = '';
    $scope.getCoords = function () {
        NgMap.getGeoLocation($scope.address).then(function (latlng) {
            console.log(latlng.lat());
            console.log(latlng.lng());
        });
    };
    window.onload = function () {
        var input = document.getElementById('pac-input');
        var searchBox = new google.maps.places.SearchBox(input);
        $scope.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
        $scope.map.addListener('bounds_changed', function () {
            searchBox.setBounds($scope.map.getBounds());
        });
        var markers = [];

        searchBox.addListener('places_changed', function () {
            var places = searchBox.getPlaces();
            if (places.length === 0) {
                return;
            }
            // Clear out the old markers.
            markers.forEach(function (marker) {
                marker.setMap(null);
            });
            markers = [];
            // For each place, get the icon, name and location.
            var bounds = new google.maps.LatLngBounds();
            places.forEach(function (place) {
                if (!place.geometry) {
                    console.log("Returned place contains no geometry");
                    return;
                }
                var icon = {
                    url: place.icon,
                    size: new google.maps.Size(71, 71),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(17, 34),
                    scaledSize: new google.maps.Size(25, 25)
                };
                // Create a marker for each place.
                markers.push(new google.maps.Marker({
                    map: $scope.map,
                    icon: icon,
                    title: place.name,
                    position: place.geometry.location
                }));
                if (place.geometry.viewport) {
                    // Only geocodes have viewport.
                    bounds.union(place.geometry.viewport);
                } else {
                    bounds.extend(place.geometry.location);
                }
            });
            $scope.map.fitBounds(bounds);
        });
    };
    $scope.AddPlace = function () {
        if ($scope.place.includes(",")) {
            $scope.place = $scope.place.replace("(", "");
            $scope.place = $scope.place.replace(")", "");
            var lonlat = $scope.place.split(',');
            if (lonlat.length === 2) {
                try {
                    var marker = new google.maps.Marker({
                        title: "User Added Marker: " + $scope.place,
                        animation: google.maps.Animation.BOUNCE
                    });
                    var lat = Number(lonlat[0]);
                    if (lat > 84.946 || lat < -84.946) {
                        alert("the valid range of latitude in degrees is between -84 and +84");
                        return;
                    }
                    var lng = Number(lonlat[1]);
                    if (lng > 178 || lng < -178) {
                        alert("the valid range of longitude in degrees is between -178 and +178");
                        return;
                    }
                    if (isNaN(lat) || isNaN(lng)) {
                        alert("wrong coordinate syntax , write <Number>,<Number>");
                        return;
                    }
                    for (var i = 0; i < $scope.markers.length; i++) {
                        if ($scope.markers[i].title.includes($scope.place)) {
                            $scope.FlightToMarker(lat, lng);
                            alert("coordinate " + $scope.place + "already included");
                            return;
                        }
                    }
                    var latlng = new google.maps.LatLng(lat, lng);
                    marker.setPosition(latlng);
                    marker.setMap($scope.map);
                    $scope.markers.push(marker);
                    $scope.FlightToMarker(lat, lng);
                } catch (e) {
                    alert("an Error Occured, make sure the coordinate syntax is <Number>,<Number>");
                }
            }
            else {
                alert("make sure the coordinate syntax is <Number>,<Number>");
            }
        }
        else {
            alert("make sure the coordinate syntax is <Number>,<Number>");
            return;
        }
    };
    $scope.calculateDistance = function (lat1, lon1, lat2, lon2) {
        var R = 6371; // km (change this constant to get miles)
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLon = (lon2 - lon1) * Math.PI / 180;
        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c;
        if (d > 1) return Math.round(d) + "km";
        else if (d <= 1) return Math.round(d * 1000) + "m";
        return d;
    }
    $scope.AddJson = function () {
        $scope.Clear();
        $http.get('traffic_lights.json').success(function (traffic) {
            $scope.traffic = traffic;
            $http.get('cameras.json').success(function (cameras) {
                $scope.cameras = cameras.features;
                for (var i = 0; i < $scope.traffic.features.length; i++) {
                    console.log($scope.traffic.features[i]);
                    let coordinates = $scope.traffic.features[i].geometry.coordinates;
                    for (var j = 0; j < $scope.cameras.length; j++) {
                        let CamCoordinates = $scope.cameras[j].geometry.coordinates;
                        console.log($scope.calculateDistance(coordinates[0], coordinates[1], CamCoordinates[0], CamCoordinates[1]));                        
                    }
                }


                //$scope.jsonData = data;
                //for (var i = 0; i < $scope.jsonData.features.length; i++) {
                //    var cor = $scope.jsonData.features[i].geometry.coordinates;
                //    var marker = new google.maps.Marker({
                //        title: $scope.jsonData.features[i].properties.NUMBER,
                //        animation: google.maps.Animation.DROP
                //    });
                //    $scope.markers.push(marker);
                //    var lat = Number(cor[1]);
                //    var lng = Number(cor[0]);
                //    var latlng = new google.maps.LatLng(lat, lng);
                //    marker.addListener('click', function (x) {
                //        $scope.CurrentCoordinates = '(' + lat + ',' + lng + ')';
                //        alert(x.va.currentTarget.title);
                //    });
                //    marker.setPosition(latlng);
                //    marker.setMap($scope.map);
                //}
            });
        });
    };

    $scope.Aerial = function () {
        try {
            if ($scope.map.getMapTypeId() === 'roadmap') {
                $scope.map.setMapTypeId('satellite');
                $scope.IsAerial = true;
            }
            else {
                $scope.map.setMapTypeId('roadmap');
                $scope.IsAerial = false;

            }
        } catch (e) {
            alert(e);
        }
    };
    $scope.Clear = function () {
        for (var i = 0; i < $scope.markers.length; i++) {
            $scope.markers[i].setMap(null);
        }
        $scope.markers = [];
    };

    $scope.FlightToMarker = function (lat, lng) {
        var center = new google.maps.LatLng(lat, lng);
        $timeout(function () {
            $scope.map.panTo(center);
        }, 0);
    };

    $scope.getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    $scope.IsAerial = false;
});

