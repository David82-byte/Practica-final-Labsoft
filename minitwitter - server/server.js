const express = require('express');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.static(path.join(__dirname, '../minitwitter - cliente')));
app.use(cors());
app.use(express.json());

// BASE DE DATOS
const db = new sqlite3.Database('./minitwitter.sqlite');

db.serialize(() => {
    // Creamos la tabla de usuarios y la de tuits
    db.run("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, passwd TEXT TEXT DEFAULT 'user')");
    db.run("CREATE TABLE IF NOT EXISTS tuits (id INTEGER PRIMARY KEY AUTOINCREMENT, texto TEXT, usuario_id INTEGER, tipo_media TEXT, url_media TEXT)");
    
    // Metemos el usuario admin de prueba si no existe
    db.get("SELECT * FROM usuarios WHERE username = 'admin'", (err, row) => {
        if (!row) {
            db.run("INSERT INTO usuarios (username, passwd) VALUES ('admin', 'patata')");
            console.log("Usuario creado -> admin : patata");
        }
    });
});

// RUTAS DE LA API (El panel de administración / MiniTwitter)

// LOGIN (Devuelve el token)
app.post('/login', (req, res) => {
    const { user, passwd } = req.body;
    db.get("SELECT * FROM usuarios WHERE username = ? AND passwd = ?", [user, passwd], (err, row) => {
        if (!row) return res.status(401).json({ error: "Credenciales incorrectas" });
        
        const token = jwt.sign({ 
            id: row.id, 
            username: row.username}, 'clave_secreta', { expiresIn: '2h' });
        res.json({ 
            session_id: token,
            id: row.id,
            username: row.username}
        );
    });
});

// LISTAR USUARIOS
app.get('/usuarios', (req, res) => {
    db.all(
        "SELECT id, username, passwd FROM usuarios",
        [],
        (err, rows) => res.json(rows)
    );
});

// CREAR USUARIO
app.post('/usuarios', (req, res) => {

    db.run(
        "INSERT INTO usuarios (username, passwd) VALUES (?, ?)",
        [req.body.username, req.body.passwd],
        function(err) {

            if(err){
                console.error("SQLite:", err);
                console.error("Mensaje:", err.message);

                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                id: this.lastID
            });

        }
    );

});

// EDITAR USUARIO
app.put('/usuarios/:id', (req, res) => {

    db.run("UPDATE usuarios SET username=?, passwd=? WHERE id=?",
        [
            req.body.username,
            req.body.passwd,
            req.params.id
        ],
        () => res.json({status:"ok"})
    );

});

// BORRAR USUARIO
app.delete('/usuarios/:id', (req, res) => {

    db.run(
        "DELETE FROM usuarios WHERE id=?",
        [req.params.id],
        () => res.json({status:"ok"})
    );

});

// TUITS
app.get('/tuits', (req, res) => { 
    // Leer todos los tuits
    db.all("SELECT tuits.id, tuits.texto, tuits.usuario_id, tuits.tipo_media, tuits.url_media,usuarios.username AS usuario FROM tuits JOIN usuarios ON usuarios.id = tuits.usuario_id", 
        [], (err, rows) => res.json(rows));
});

app.post('/tuit', (req, res) => { 
    // Crear tuit
    db.run("INSERT INTO tuits (texto, usuario_id, tipo_media, url_media) VALUES (?, ?, ?, ?)", 
    [req.body.texto, req.body.usuario_id, req.body.tipo_media, req.body.url_media], function(err) {
        if (err) {
            console.error("Error en SQLite:", err.message);
            return res.status(500).json({ error: "Fallo interno en la BBDD" });
        }
        res.json({ id: this.lastID, texto: req.body.texto });
    });
});

app.delete('/tuit/:id', (req, res) => {
    const usuarioId = req.body?.usuario_id;
    
    db.get("SELECT usuario_id FROM tuits WHERE id=?", [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json(err);
        }
        if (!row) {
            return res.status(404).json({
                error: "Tuit no encontrado"
            });
        }
        if(row.usuario_id != usuarioId){
            return res.status(403).json({
                error: "No autorizado"
            });
        }
        // Borrar un tuit
        db.run("DELETE FROM tuits WHERE id = ?", [req.params.id], () => res.json({ status: "Borrado" }));
    });
});



// ARRANCAR SERVIDOR
app.listen(3000, () => {
    console.log('Backend del Sprint 2 corriendo en el puerto 3000');
});