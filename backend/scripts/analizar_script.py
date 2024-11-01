import sys
import json
import sqlparse

def extraer_columnas_y_tablas(script_sql):
    tablas = {}
    parsed = sqlparse.parse(script_sql)
    for statement in parsed:
        if statement.get_type() == 'CREATE':
            nombre_tabla = None
            columnas = []
            for token in statement.tokens:
                if token.ttype is None:
                    # Detecta el nombre de la tabla
                    if not nombre_tabla and "TABLE" in token.value.upper():
                        nombre_tabla = token.get_name()
                    # Extrae las columnas
                    elif '(' in token.value:
                        for sub_token in token.tokens:
                            if sub_token.ttype is None and "INT" in sub_token.value.upper():
                                columnas.append(sub_token.get_name())
            if nombre_tabla:
                tablas[nombre_tabla] = columnas
    return tablas

def analizar_redundancias_y_duplicidades(tablas):
    redundancias = []
    nombres_columnas = {}

    # Recorre cada tabla y sus columnas
    for tabla, columnas in tablas.items():
        for columna in columnas:
            # Si la columna ya existe en otra tabla, identifica la redundancia
            if columna in nombres_columnas:
                redundancias.append(f"Redundancia detectada en columna '{columna}' en tablas '{nombres_columnas[columna]}' y '{tabla}'")
            else:
                nombres_columnas[columna] = tabla

    return redundancias

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    
    tablas = extraer_columnas_y_tablas(script_sql)
    redundancias = analizar_redundancias_y_duplicidades(tablas)

    resultado = {
        "mensaje": "Análisis completado",
        "redundancias": redundancias if redundancias else ["No se encontraron redundancias."],
    }
    print(json.dumps(resultado))
