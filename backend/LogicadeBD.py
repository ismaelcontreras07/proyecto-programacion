import sqlite3
from datetime import datetime

DB_Unimex = "unimex_eventos.db"

def conectar():
    return sqlite3.connect(DB_Unimex)

# ---------------------------------------------------------
# FUNCIÓN 1: AGREGAR ALUMNO (Para guardar los datos del formulario)
# ---------------------------------------------------------
def registrar_alumno(matricula, nombre, correo, telefono, carrera, cuatrimestre):
    try:
        conn = conectar()
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO alumnos (matricula, nombre_completo, correo_institucional, telefono, carrera, cuatrimestre)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (matricula, nombre, correo, telefono, carrera, cuatrimestre))
        conn.commit()
        return True, "Alumno registrado exitosamente."
    except sqlite3.IntegrityError:
        return False, "Error: La matrícula o el correo ya existen."
    except sqlite3.OperationalError as e: # Captura errores como el CHECK del cuatrimestre
        return False, f"Error de datos: {e}"
    finally:
        conn.close()

# ---------------------------------------------------------
# FUNCIÓN 2: VALIDAR CHOQUE DE HORARIOS
# ---------------------------------------------------------
def hay_choque_horario(matricula, nuevo_inicio_str, nuevo_fin_str):
    """
    Revisa si el alumno ya tiene un evento que se traslape con el nuevo horario.
    Retorna: True (si hay choque), False (si está libre).
    """
    conn = conectar()
    cursor = conn.cursor()
    
    # Obtenemos los horarios de los eventos donde YA está inscrito el alumno
    query = '''
        SELECT e.fecha_inicio, e.fecha_fin, e.titulo
        FROM inscripciones i
        JOIN eventos e ON i.id_evento = e.id_evento
        WHERE i.matricula_alumno = ?
    '''
    cursor.execute(query, (matricula,))
    eventos_inscritos = cursor.fetchall()
    conn.close()

    # Convertimos las fechas string a objetos datetime para comparar
    nuevo_inicio = datetime.fromisoformat(nuevo_inicio_str)
    nuevo_fin = datetime.fromisoformat(nuevo_fin_str)

    for inicio_existente, fin_existente, titulo in eventos_inscritos:
        existente_inicio = datetime.fromisoformat(inicio_existente)
        existente_fin = datetime.fromisoformat(fin_existente)

        # FÓRMULA DE TRASLAPE: (InicioA < FinB) Y (FinA > InicioB)
        if (nuevo_inicio < existente_fin) and (nuevo_fin > existente_inicio):
            return True, f"Choque de horario con el evento: {titulo}"
            
    return False, "Horario libre"

# ---------------------------------------------------------
# FUNCIÓN 3: INSCRIBIR A EVENTO 
# ---------------------------------------------------------
def inscribir_alumno(matricula, id_evento):
    conn = conectar()
    cursor = conn.cursor()

    try:
        # 1. Obtenemos datos del evento que se quiere inscribir
        cursor.execute("SELECT fecha_inicio, fecha_fin, cupo, titulo FROM eventos WHERE id_evento = ?", (id_evento,))
        evento = cursor.fetchone()
        
        if not evento:
            return "Error: El evento no existe."

        fecha_inicio, fecha_fin, cupo, titulo = evento

        # 2. Verificamos Cupo (Contamos cuántos inscritos hay)
        cursor.execute("SELECT COUNT(*) FROM inscripciones WHERE id_evento = ?", (id_evento,))
        inscritos_actuales = cursor.fetchone()[0]
        
        if inscritos_actuales >= cupo:
            return f"Error: El evento '{titulo}' está lleno."

        # 3. Verificamos Choque de Horarios (Usando la función 2)
        choque, mensaje = hay_choque_horario(matricula, fecha_inicio, fecha_fin)
        if choque:
            return f"Error: Limite maximo de alumnos inscritos. {mensaje}"

        # 4. Si todo está bien, INSCRIBIMOS
        cursor.execute('''
            INSERT INTO inscripciones (matricula_alumno, id_evento)
            VALUES (?, ?)
        ''', (matricula, id_evento))
        
        conn.commit()
        return f"¡Éxito! Inscrito correctamente en '{titulo}'."

    except sqlite3.IntegrityError:
        return "Error: Ya estás inscrito en este evento."
    finally:
        conn.close()