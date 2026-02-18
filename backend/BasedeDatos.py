import sqlite3


def inicializar_db():
    try:
        # Conexión a la base de datos
        conexion = sqlite3.connect("unimex_eventos.db")
        cursor = conexion.cursor()
        
        # 1. Tabla ALUMNOS
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS alumnos (
                matricula TEXT PRIMARY KEY,
                nombre_completo TEXT NOT NULL,
                correo_institucional TEXT UNIQUE NOT NULL,
                telefono TEXT,
                carrera TEXT NOT NULL,
                cuatrimestre INTEGER NOT NULL CHECK(cuatrimestre >= 1 AND cuatrimestre <= 10)
            )
        ''')
        print("Tabla 'alumnos' verificada.")

        # 2. Tabla EVENTOS
       
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS eventos (
                id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
                titulo TEXT NOT NULL,
                tipo TEXT NOT NULL CHECK(tipo IN ('Presencial', 'En línea')),
                fecha_inicio TEXT NOT NULL, 
                fecha_fin TEXT NOT NULL,
                cupo INTEGER NOT NULL DEFAULT 1500
            )
        ''')
        print("Tabla 'eventos' verificada.")

        # 3. Tabla INSCRIPCIONES
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inscripciones (
                id_inscripcion INTEGER PRIMARY KEY AUTOINCREMENT,
                matricula_alumno TEXT NOT NULL,
                id_evento INTEGER NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(matricula_alumno) REFERENCES alumnos(matricula),
                FOREIGN KEY(id_evento) REFERENCES eventos(id_evento),
                UNIQUE(matricula_alumno, id_evento)
            )
        ''')
        print("Tabla 'inscripciones' verificada.")
        
        conexion.commit()
        print("Base de datos creada exitosamente con todas las reglas.")
        
    except sqlite3.Error as e:
        print(f"Error al crear la base de datos: {e}")
    finally:
        if conexion:
            conexion.close()

if __name__ == "__main__":
    inicializar_db()