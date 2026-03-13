const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const dbPath = path.join(__dirname, 'pharmacore.db');
const db = new sqlite3.Database(dbPath);

// --- API ROUTES ---

// CLIENTES
app.get('/api/clientes', (req, res) => {
    db.all('SELECT * FROM clientes', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/clientes', (req, res) => {
    const { numero_consulta, nombre, apellido, edad, telefono, identificacion, fecha_ingreso, proxima_cita, departamento, condicion, razon_visita, historial, resultado_revision, tratamiento } = req.body;
    const sql = `INSERT INTO clientes (numero_consulta, nombre, apellido, edad, telefono, identificacion, fecha_ingreso, proxima_cita, departamento, condicion, razon_visita, historial, resultado_revision, tratamiento) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [numero_consulta, nombre, apellido, edad, telefono, identificacion, fecha_ingreso, proxima_cita, departamento, condicion, razon_visita, historial, resultado_revision, tratamiento], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

app.put('/api/clientes/:id', (req, res) => {
    const { id } = req.params;
    const fields = Object.keys(req.body).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(req.body), id];
    const sql = `UPDATE clientes SET ${fields} WHERE id = ?`;
    db.run(sql, values, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ updated: this.changes });
    });
});

// PRODUCTOS
app.get('/api/productos', (req, res) => {
    db.all('SELECT * FROM productos', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/productos', (req, res) => {
    const { codigo, nombre, stock, precio, vencimiento, historial } = req.body;
    db.run('INSERT INTO productos (codigo, nombre, stock, precio, vencimiento, historial) VALUES (?, ?, ?, ?, ?, ?)',
        [codigo, nombre, stock, precio, vencimiento, historial], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
});

// PERSONAL
app.get('/api/personal', (req, res) => {
    db.all('SELECT * FROM personal', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        // Parse availability back to object if needed, but for simplicity we'll keep it as strings
        res.json(rows);
    });
});

app.post('/api/personal', (req, res) => {
    const { id, nombre, apellido, especializacion, departamento, disponibilidad_dias, disponibilidad_horario } = req.body;
    const sql = `INSERT INTO personal (id, nombre, apellido, especializacion, departamento, disponibilidad_dias, disponibilidad_horario) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [id, nombre, apellido, especializacion, departamento, disponibilidad_dias, disponibilidad_horario], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`PharmaCore API running at http://localhost:${port}`);
});
