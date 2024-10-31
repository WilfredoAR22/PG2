import sys
import json
import sqlparse
from difflib import SequenceMatcher

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def analizar_redundancias(script_sql):
    resultado = {
        "mensaje": "Análisis completado",
        "redundancias": [],
        "duplicidades": []
    }

    parsed = sqlparse.parse(script_sql)
    columns = []

    for statement in parsed:
        if statement.get_type() == 'CREATE':
            tokens = [str(token).strip() for token in statement.tokens if not token.is_whitespace]
            column_names = [token.split()[0] for token in tokens if 'VARCHAR' in token or 'INT' in token]
            columns.extend(column_names)

            # Detectar duplicidades exactas
            for column in set(column_names):
                if column_names.count(column) > 1:
                    resultado["duplicidades"].append({
                        "mensaje": f"Columna duplicada encontrada: {column}"
                    })

            # Detectar redundancias similares
            for i, col1 in enumerate(column_names):
                for col2 in column_names[i + 1:]:
                    if similar(col1, col2) > 0.7 and col1 != col2:
                        resultado["redundancias"].append({
                            "column1": col1,
                            "column2": col2,
                            "similitud": similar(col1, col2) * 100
                        })

    return resultado

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    resultado = analizar_redundancias(script_sql)
    print(json.dumps(resultado))
