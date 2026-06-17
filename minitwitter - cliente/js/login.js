const API_URL = "http://localhost:3000";
// Inicializamos la aplicación de Angular
angular.module('minitwitterApp', [])

// Creamos el controlador
// Le inyectamos $scope (variables de la vista), $http (hablar con el servidor) y $window (usar sessionStorage)
.controller('LoginController', function($scope, $http, $window) {
    
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
            url: API_URL + '/login',
            data: datosLogin
        }).then(function(respuesta) {
            // El servidor nos ha dado el ok y el token
            
            // Guardamos el token en la memoria del navegador 
            $window.sessionStorage.setItem('token', respuesta.data.session_id);
            $window.sessionStorage.setItem("id", respuesta.data.id);
            $window.sessionStorage.setItem("username", respuesta.data.username);
            
            alert("¡Login correcto!");

            if($scope.usuario === "admin"){
                $window.location.href = "admin.html";
            } else{
                $window.location.href = "usuario.html";
            }

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