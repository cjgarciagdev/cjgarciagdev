import sqlite3
import os

db_path = r'c:\Users\USER\Documents\VSCODE2\GlucoAmigo\instance\glucoamigo.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE heroe ADD COLUMN especialista_id INTEGER")
        conn.commit()
        print("SUCCESS: Column 'especialista_id' added to table 'heroe'.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("INFO: Column already exists.")
        else:
            print(f"ERROR: {e}")
    finally:
        conn.close()
else:
    print(f"ERROR: Database not found at {db_path}")
