// Inicializamos la aplicación de Angular
const app = angular.module('minitwitterApp', []);

// Creamos el controlador
// Le inyectamos $scope (variables de la vista), $http (hablar con el servidor) y $window (usar sessionStorage)
app.controller('LoginController', function($scope, $http, $window) {
    
    // Función que se ejecuta al enviar el formulario (el ng-submit)
    $scope.hacerLogin = function() {
        
        // Limpiar errores anteriores
        $scope.mensajeError = "";

        // Preparar los datos
        const datosLogin = {
            user: $scope.usuario,
            passwd: $scope.password
        };

        // Hacemos la petición POST al servidor
        $http({
            method: 'POST',
            url: 'http://localhost:3000/login',
            data: datosLogin
        }).then(function(respuesta) {
            // El servidor nos ha dado el ok y el token
            
            // Guardamos el token en la memoria del navegador 
            $window.sessionStorage.setItem('token', respuesta.data.session_id);
            
            alert("¡Login correcto!");
            
            $window.location.href = "panel.html";

        }).catch(function(error) {
            // ERROR: El servidor nos devuelve un 401 (credenciales incorrectas)
            if (error.status === 401) {
                $scope.mensajeError = "Usuario o contraseña incorrectos.";
            } else {
                $scope.mensajeError = "Error al conectar con el servidor.";
            }
        });
    };
});

// CONTROLADOR DEL PANEL DE ADMINISTRACIÓN
app.controller('PanelController', function($scope, $http, $window, $sce) {
    
    // Comprobamos si el usuario tiene el pase
    const miToken = $window.sessionStorage.getItem('token');
    if (!miToken) {
        alert("No estás logueado.");
        $window.location.href = "index.html"; // Lo echamos fuera
        return;
    }

    // Variable donde Angular guardará la lista de tuits
    $scope.tuits = [];

    // FUNCIÓN PARA LEER LOS TUITS (El GET)
    $scope.cargarTuits = function() {
        $http.get('http://localhost:3000/tuits').then(function(respuesta) {
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
            usuario_id: 1, // Por simplicidad, asumimos que somos el usuario 1 (admin)
            tipo_media : $scope.tipoMedia || '', // foto, video o youtube
            url_media: $scope.urlMedia || '0'
        };

        $http.post('http://localhost:3000/tuit', datosTuit).then(function(respuesta) {
            $scope.nuevoTexto = ""; // Vaciamos la caja de texto
            $scope.tipoMedia = ""; // Vaciar selector
            $scope.urlMedia = ""; // Limpiar URL
            $scope.cargarTuits();   // Recargamos la lista para ver el nuevo tuit
        });
    };

    // FUNCIÓN PARA BORRAR UN TUIT (El "DELETE")
    $scope.borrarTuit = function(idTuit) {
        if(confirm("¿Seguro que quieres borrar este tuit?")) {
            $http.delete('http://localhost:3000/tuit/' + idTuit).then(function(respuesta) {
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