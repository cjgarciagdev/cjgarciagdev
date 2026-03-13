const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'pharmacore.db');

// Delete existing database if it exists to start fresh
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
}

const db = new sqlite3.Database(dbPath);

const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
const seed = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');

db.serialize(() => {
    console.log('Initializing database schema...');
    db.exec(schema, (err) => {
        if (err) {
            console.error('Error creating schema:', err.message);
            process.exit(1);
        }
        console.log('Schema created successfully.');

        console.log('Seeding initial data...');
        db.exec(seed, (err) => {
            if (err) {
                console.error('Error seeding data:', err.message);
                process.exit(1);
            }
            console.log('Database seeded successfully.');
            db.close();
        });
    });
});
