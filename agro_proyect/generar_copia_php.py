import sqlite3
import os

def crear_dump_mysql(db_name, output_name):
    if not os.path.exists(db_name):
        print(f"Error: El archivo {db_name} no existe.")
        return

    conn = sqlite3.connect(db_name)
    try:
        with open(output_name, 'w', encoding='utf-8') as f:
            # Configuraciones iniciales para que phpMyAdmin no tenga problemas
            f.write("-- AGRO-MASTER: EXPORTACIÓN PARA PHP-MYADMIN (MYSQL)\n")
            f.write("-- Generado para copia de seguridad\n\n")
            f.write("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n")
            f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
            f.write("SET NAMES utf8mb4;\n\n")
            
            for line in conn.iterdump():
                # Reemplazar comillas dobles por backticks (estándar MySQL)
                line = line.replace('"', '`')
                
                # Reemplazar AUTOINCREMENT (SQLite) por AUTO_INCREMENT (MySQL)
                line = line.replace('AUTOINCREMENT', 'AUTO_INCREMENT')
                
                # Filtrar comandos específicos de SQLite que rompen en MySQL
                if line.startswith('BEGIN TRANSACTION') or line.startswith('COMMIT') or 'PRAGMA' in line:
                    continue
                
                # Ajuste para tipos de datos específicos si es necesario
                # SQLite usa INTEGER PRIMARY KEY para autoincrementales
                if 'PRIMARY KEY AUTO_INCREMENT' in line:
                    line = line.replace('PRIMARY KEY AUTO_INCREMENT', 'INT AUTO_INCREMENT PRIMARY KEY')

                f.write('%s\n' % line)
                
            f.write("\nSET FOREIGN_KEY_CHECKS = 1;\n")
        print(f"Éxito: Se ha creado el archivo '{output_name}' listo para phpMyAdmin.")
    except Exception as e:
        print(f"Error durante la generación: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    crear_dump_mysql('instance/ganado.db', 'copia_para_php.sql')
