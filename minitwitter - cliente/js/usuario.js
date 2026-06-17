const API_URL = "http://localhost:3000";
// Inicializamos la aplicación de Angular
angular.module('minitwitterApp', [])

// CONTROLADOR DEL LA PAGINA DE USUARIOS
// Le inyectamos $scope (variables de la vista), $http (hablar con el servidor) y $window (usar sessionStorage)
.controller('UserController', function($scope, $http, $window, $sce) {
    
    // Comprobamos si el usuario tiene el pase
    $scope.token = $window.sessionStorage.getItem('token');
    $scope.comprobarToken = function() {
        if (!$scope.token) {
            alert("No estás logueado.");
            $window.location.href = "index.html"; // Lo echamos fuera
            return;
        }
    };
    $scope.comprobarToken();

    $scope.miId = $window.sessionStorage.getItem("id");
    $scope.modalVisible = false;

    // Variable donde Angular guardará la lista de tuits
    $scope.tuits = [];

    // FUNCIÓN PARA LEER LOS TUITS (El GET)
    $scope.cargarTuits = function() {
        $http.get(API_URL + '/tuits').then(function(respuesta) {
           // Recorrer tuits para decir a Angular que confíe en las URLs multimedia
            $scope.tuits = respuesta.data.map(function(tuit) {
                // Versión segura de la URL
               if (tuit.url_media) {
                 tuit.url_segura = $sce.trustAsResourceUrl(tuit.url_media);
               }
               return tuit;
            });
        });
    };

    // FUNCIÓN PARA CREAR UN TUIT (El POST)
    $scope.crearTuit = function() {
        const datosTuit = {
            texto: $scope.nuevoTexto,
            usuario_id: $scope.miId,
            tipo_media : $scope.tipoMedia || '', // image, video o youtube
            url_media: $scope.urlMedia || '0'
        };

        $http.post(API_URL + '/tuit', datosTuit).then(function(respuesta) {
            $scope.nuevoTexto = ""; // Vaciamos la caja de texto
            $scope.tipoMedia = ""; // Vaciar selector
            $scope.urlMedia = ""; // Limpiar URL
            $scope.cargarTuits();   // Recargamos la lista para ver el nuevo tuit
        });
    };

    // FUNCIÓN PARA BORRAR UN TUIT (El "DELETE")
    $scope.borrarTuit = function(idTuit) {
        if(confirm("¿Seguro que quieres borrar este tuit?")) {
            $http({
                method: 'DELETE',
                url: API_URL + '/tuit/' + idTuit,
                data: {
                    usuario_id: sessionStorage.getItem("id")
                },
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                }
            })
            .then(function(respuesta) {
                $scope.cargarTuits(); // Recargamos la lista tras borrar
            });
        }
    };

    // CERRAR SESIÓN
    $scope.cerrarSesion = function() {
        $window.sessionStorage.removeItem('token');
        $window.location.href = "index.html";
    };

    // Al entrar a la página, llamamos a la función pa cargar los tuits
    $scope.cargarTuits();
});