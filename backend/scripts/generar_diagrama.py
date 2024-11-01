import sys
import json
import sqlparse
import pydot
import base64

def generar_diagrama_er(script_sql):
    parsed = sqlparse.parse(script_sql)
    graph = pydot.Dot(graph_type='digraph', bgcolor="transparent", rankdir="TB")  # Cambié a "TB" para top-to-bottom

    tablas = {}
    relaciones = []

    for statement in parsed:
        if statement.get_type() == 'CREATE':
            tokens = [token for token in statement.tokens if not token.is_whitespace]
            table_name = tokens[2].get_real_name()
            atributos = []
            for token in tokens:
                if token.ttype is None and '(' in str(token):
                    columns = str(token).split(',')
                    for col in columns:
                        col_parts = col.strip().split()
                        col_name = col_parts[0]
                        col_type = col_parts[1] if len(col_parts) > 1 else ""
                        if "PRIMARY KEY" in col:
                            atributos.append((col_name, col_type, "PK"))
                        elif "FOREIGN KEY" in col:
                            fk_table = col.split("REFERENCES")[1].split("(")[0].strip()
                            fk_column = col.split("REFERENCES")[1].split("(")[1].replace(")", "").strip()
                            atributos.append((col_name, col_type, "FK"))
                            relaciones.append((table_name, col_name, fk_table, fk_column))
                        else:
                            atributos.append((col_name, col_type, ""))

            tablas[table_name] = atributos

    for table_name, atributos in tablas.items():
        tabla_html = f"""<
            <table border="0" cellborder="1" cellspacing="0">
                <tr><td bgcolor="lightgrey" align="center"><b>{table_name}</b></td></tr>
                {''.join([f'<tr><td align="left">{attr[0]} {attr[1]} {"<b>(PK)</b>" if attr[2] == "PK" else "<i>(FK)</i>" if attr[2] == "FK" else ""}</td></tr>' for attr in atributos])}
            </table>
        >"""
        node = pydot.Node(table_name, shape="plaintext", label=tabla_html)
        graph.add_node(node)

    for (table_from, column_from, table_to, column_to) in relaciones:
        edge = pydot.Edge(f"{table_from}:{column_from}", f"{table_to}:{column_to}", arrowhead="normal")
        graph.add_edge(edge)

    png_data = graph.create_png()
    base64_diagram = base64.b64encode(png_data).decode('utf-8')
    return base64_diagram

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    diagrama = generar_diagrama_er(script_sql)
    resultado = {
        "mensaje": "Diagrama generado exitosamente",
        "diagrama": diagrama
    }
    print(json.dumps(resultado))
