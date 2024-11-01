import sys
import json
import sqlparse
import re
from difflib import SequenceMatcher
from collections import defaultdict

IGNORAR_COLUMNAS = {"id", "clienteid", "pedidoid", "facturaid", "primary", "foreign"}  # Añade otras columnas comunes que quieras ignorar aquí

def detectar_patrones_nombre_similar(columnas):
    advertencias = []
    columnas_unicas = list(set(columnas))  # Eliminar duplicados para evitar redundancias en las advertencias
    for i, col1 in enumerate(columnas_unicas):
        for j, col2 in enumerate(columnas_unicas):
            if i < j:
                similitud = SequenceMatcher(None, col1, col2).ratio()
                if similitud > 0.7 and col1.lower() not in IGNORAR_COLUMNAS and col2.lower() not in IGNORAR_COLUMNAS:
                    advertencias.append(f"Posible redundancia: '{col1}' y '{col2}' tienen nombres similares.")
    return advertencias

def analizar_redundancia_semantica(tablas):
    advertencias = []
    processed_pairs = set()  # Para evitar mensajes duplicados entre dos tablas
    for table1, columns1 in tablas.items():
        for table2, columns2 in tablas.items():
            if table1 != table2 and (table2, table1) not in processed_pairs:
                processed_pairs.add((table1, table2))
                common_columns = set(columns1).intersection(set(columns2))
                for col in common_columns:
                    if col.lower() not in IGNORAR_COLUMNAS:
                        advertencias.append(f"Redundancia semántica: La columna '{col}' está presente en ambas tablas '{table1}' y '{table2}'.")
    return advertencias

def analizar_datos_duplicados(tablas):
    advertencias = []
    processed_pairs = set()  # Para evitar advertencias duplicadas entre las mismas tablas
    for table1, columns1 in tablas.items():
        for table2, columns2 in tablas.items():
            if table1 != table2 and (table2, table1) not in processed_pairs:
                processed_pairs.add((table1, table2))
                for col1 in columns1:
                    if col1 in columns2 and col1.lower() not in IGNORAR_COLUMNAS:
                        advertencias.append(f"Duplicación de datos: La columna '{col1}' en '{table1}' puede ser redundante y centralizable en '{table2}'.")
    return advertencias

def analizar_script_sql(script_sql):
    parsed = sqlparse.parse(script_sql)
    tablas = defaultdict(list)
    advertencias = []

    for statement in parsed:
        if statement.get_type() == 'CREATE':
            tokens = [token for token in statement.tokens if not token.is_whitespace]
            table_name = ""
            for token in tokens:
                if token.ttype is None and token.get_real_name():
                    table_name = token.get_real_name()
                    break

            if table_name:
                dentro_columnas = False
                for token in tokens:
                    if token.ttype is None and '(' in str(token):
                        dentro_columnas = True
                    elif token.ttype is None and ')' in str(token):
                        dentro_columnas = False
                    if dentro_columnas and token.ttype is None:
                        columnas = re.findall(r"(\w+)\s+\w+", str(token))
                        tablas[table_name].extend(columnas)

    todas_columnas = [col for cols in tablas.values() for col in cols]
    advertencias.extend(detectar_patrones_nombre_similar(todas_columnas))
    advertencias.extend(analizar_redundancia_semantica(tablas))
    advertencias.extend(analizar_datos_duplicados(tablas))

    return advertencias

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    
    advertencias = analizar_script_sql(script_sql)
    
    resultado = {
        "mensaje": "Análisis completado",
        "advertencias": advertencias
    }
    
    print(json.dumps(resultado, indent=2, ensure_ascii=False))
