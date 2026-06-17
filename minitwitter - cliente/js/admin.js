const API_URL = "http://localhost:3000";
// Inicializamos la aplicación de Angular
angular.module("minitwitterApp", [])

// CONTROLADOR DEL LA PAGINA DEL ADMINISTRADOR
// Le inyectamos $scope (variables de la vista), $http (hablar con el servidor) y $window (usar sessionStorage)
.controller("AdminController", function ($scope, $http, $window) {

    if(!$window.sessionStorage.getItem("token")){
        $window.location.href = "index.html";
    }

    $scope.usuario = {};
    $scope.usuarios = [];
    $scope.tuits = [];    

    $scope.cargarUsuarios = function () {

        $http.get(API_URL + "/usuarios")
        .then(function (response) {
            $scope.usuarios = response.data;
        });
    };

    $scope.usuario = {
        nombre: $window.sessionStorage.getItem("usuario")
    };

    $scope.cargarTuits = function () {

        $http.get(API_URL + "/tuits")
        .then(function (response) {
            $scope.tuits = response.data;
        });
    };

    $scope.crearUsuario = function () {

        $http.post(API_URL + "/usuarios", $scope.nuevoUsuario)
        .then(function () {
            $scope.nuevoUsuario = {};
            $scope.cargarUsuarios();
        })
        .catch(function(err){
            console.log(err);
            alert("Error al crear usuario");
        });
    };

    $scope.editarUsuario = function(usuario){

        $http.put(API_URL + "/usuarios/" + usuario.id, {
            username: usuario.username,
            passwd: usuario.passwd
        })
        .then(function(){            
            alert("Usuario actualizado");
            $scope.cargarUsuarios();
        })
        .catch(function(err){
            console.log(err);
            alert("Error al actualizar usuario");
        });
    };

    $scope.eliminarUsuario = function (id) {

        if (!confirm("¿Eliminar usuario?")) return;

        $http.delete(API_URL + "/usuarios/" + id)
        .then(function () {
            $scope.cargarUsuarios();
        });
    };

    $scope.eliminarTuit = function (id) {
        if (!confirm("¿Seguro que quieres eliminar este tuit?")) return;

        $http({
            method: 'DELETE',
            url: API_URL + '/tuit/' + id,
            data: {
                usuario_id: sessionStorage.getItem("id")
            },
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            }
        })
        .then(function () {
            $scope.cargarTuits();
        })
        .catch(function(err){
            alert("Error al borrar el tuit. Comprueba el servidor.");
        });
    };

    $scope.verTuit = function(tuit) {
        let mensaje = "Autor: " + tuit.usuario + "\nTexto: " + tuit.texto;
        
        if (tuit.tipo_media && tuit.url_media && tuit.url_media !== '0') {
            mensaje += "\n\n[Multimedia - " + tuit.tipo_media.toUpperCase() + "]:\n" + tuit.url_media;
        } else {
            mensaje += "\n\nEste tuit no incluye archivos multimedia.";
        }
        
        alert(mensaje);
    };

    $scope.logout = function () {
        $window.sessionStorage.clear();
        $window.location.href = "index.html";
    };

    $scope.cargarUsuarios();
    $scope.cargarTuits();
});