import sys
import json
import sqlparse
import pydot
from io import BytesIO
import base64

def obtener_nombre_tabla(tokens):
    for token in tokens:
        if token.ttype is None and token.value.upper() == 'TABLE':
            next_token_index = tokens.index(token) + 1
            if next_token_index < len(tokens):
                table_name_token = tokens[next_token_index]
                return table_name_token.value.strip()
    return None

def generar_diagrama_er(script_sql, modo="claro"):
    node_color = "black" if modo == "claro" else "white"
    text_color = "black" if modo == "claro" else "white"
    graph = pydot.Dot(graph_type='digraph', rankdir="LR", bgcolor="transparent")

    tables = {}

    for statement in sqlparse.parse(script_sql):
        if statement.get_type() == 'CREATE':
            tokens = [token for token in statement.tokens if not token.is_whitespace]
            table_name = obtener_nombre_tabla(tokens)

            if table_name:
                table_html = f"""<<table border="0" cellborder="1" cellspacing="0" color="{node_color}">
                                  <tr><td bgcolor="{node_color}" colspan="2"><font color="{text_color}"><b>{table_name}</b></font></td></tr>"""

                columns = []
                for token in tokens:
                    if token.ttype is None and '(' in str(token):
                        columns = str(token).split(',')
                        break

                for col in columns:
                    col_details = col.strip().split()
                    col_name = col_details[0]
                    col_type = col_details[1] if len(col_details) > 1 else ""
                    is_primary = "PRIMARY KEY" in col or "PK" in col
                    is_foreign = "FOREIGN KEY" in col or "FK" in col

                    if is_primary:
                        table_html += f"""<tr><td port="{col_name}" align="left"><font color="{text_color}"><b>PK</b> {col_name}</font></td><td>{col_type}</td></tr>"""
                    elif is_foreign:
                        table_html += f"""<tr><td port="{col_name}" align="left"><font color="{text_color}"><i>FK</i> {col_name}</font></td><td>{col_type}</td></tr>"""
                    else:
                        table_html += f"<tr><td align='left'><font color='{text_color}'>{col_name}</font></td><td>{col_type}</td></tr>"

                table_html += "</table>>"

                table_node = pydot.Node(table_name, shape="plaintext", label=table_html)
                graph.add_node(table_node)
                tables[table_name] = table_node

    png_output = graph.create(format="png")
    base64_diagram = base64.b64encode(png_output).decode('utf-8')
    return base64_diagram

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    modo = data.get("modo", "claro")  # Se espera el modo del frontend
    diagrama = generar_diagrama_er(script_sql, modo)
    resultado = {
        "mensaje": "Diagrama generado exitosamente",
        "diagrama": diagrama
    }
    print(json.dumps(resultado))

