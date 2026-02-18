import sqlite3

# Nombre de tu base de datos
DB_NAME = "unimex_eventos.db"

def cargar_datos_prueba():
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        # 1. LIMPIEZA: Borramos eventos anteriores para no duplicar al probar
        print("Limpiando eventos antiguos...")
        cursor.execute("DELETE FROM eventos") 
        # (Opcional: Si quieres reiniciar los IDs a 1)
        cursor.execute("DELETE FROM sqlite_sequence WHERE name='eventos'")

        # 2. DATOS DE EVENTOS
        # Formato: (Titulo, Tipo, Inicio, Fin)
        # Nota: Las fechas deben ser YYYY-MM-DD HH:MM:SS
        lista_eventos = [
            ("Evento A: Taller exprés de liderazgo y trabajo en equipo", "Presencial", "2026-06-05 09:00:00", "2026-06-05 13:00:00"),
            ("Evento B: Simulación de exportación/importanción de un producto", "En línea", "2026-06-05 10:00:00", "2026-06-05 13:00:00"),
            ("Evento C: Cabina de radio o podcast en vivo", "En línea", "2026-04-11 16:00:00", "2026-04-11 19:00:00"),
            ("Evento D: Escena del crimen simulada para análisis", "Presencial", "2026-04-13 10:00:00", "2026-04-13 15:00:00"),
            ("Evento E: Demostración de apps o videojuegos", "Presencial", "2026-04-22 15:00:00", "2026-04-22 19:00:00"),
            ("Evento F: Taller de inteligencia emocional", "Presencial", "2026-04-19 09:00:00", "2026-04-19 13:00:00"),
            ("Evento G: Atención al cliente en escenarios reales", "Presencial", "2026-04-23 10:00:00", "2026-04-23 16:00:00"),
            ("Evento H: Retos de pronunciación o vocabulario", "En línea", "2026-10-17 11:00:00", "2026-10-17 13:00:00"),
            ("Evento I: Retos de lógica y algoritmos", "Presencial", "2026-06-05 15:00:00", "2026-06-05 19:00:00")
        ]

        # 3. INSERCIÓN MASIVA
        print("Insertando 9 eventos...")
        cursor.executemany('''
            INSERT INTO eventos (titulo, tipo, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, ?)
        ''', lista_eventos)
        
        conn.commit()
        print(f"¡Éxito! Se han cargado {cursor.rowcount} eventos.")
        
        # 4. VERIFICACIÓN (Muestra en pantalla lo que guardó)
        print("\n--- Vista Previa de la Base de Datos ---")
        cursor.execute("SELECT id_evento, titulo, fecha_inicio FROM eventos")
        for row in cursor.fetchall():
            print(row)

    except sqlite3.Error as e:
        print(f"Error en la base de datos: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    cargar_datos_prueba()