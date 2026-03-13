import sqlite3
import os

db_path = r'c:\Users\USER\Documents\VSCODE2\GlucoAmigo\instance\glucoamigo.db'

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    try:
        # 1. Find the specialist/admin user ID
        cursor.execute("SELECT id FROM usuario WHERE rol = 'especialista' LIMIT 1")
        admin_id = cursor.fetchone()
        
        if admin_id:
            aid = admin_id[0]
            # 2. Update existing heroes to point to this specialist
            cursor.execute("UPDATE heroe SET especialista_id = ?", (aid,))
            conn.commit()
            print(f"SUCCESS: Assigned especialista_id={aid} to all existing heroes.")
        else:
            print("WARNING: No specialist user found in the database. Heroes not updated.")
            
    except sqlite3.OperationalError as e:
        print(f"ERROR: {e}")
    finally:
        conn.close()
else:
    print(f"ERROR: Database not found at {db_path}")
