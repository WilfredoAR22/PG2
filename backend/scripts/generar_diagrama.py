import sys
import json
import sqlparse
import pydot
import base64

def generar_diagrama_er(script_sql):
    parsed = sqlparse.parse(script_sql)
    graph = pydot.Dot(graph_type='digraph', bgcolor="transparent", rankdir="TB")

    tablas = {}
    relaciones = []

    for statement in parsed:
        if statement.get_type() == 'CREATE':
            tokens = [token for token in statement.tokens if not token.is_whitespace]
            table_name = ""
            atributos = []

            # Identificar el nombre de la tabla
            for idx, token in enumerate(tokens):
                if token.ttype is None and token.get_real_name():
                    table_name = token.get_real_name()
                    break
            
            if table_name:
                dentro_columnas = False
                for token in tokens:
                    if token.ttype is None and '(' in str(token):  # Inicio de columnas
                        dentro_columnas = True
                    elif token.ttype is None and ')' in str(token):  # Fin de columnas
                        dentro_columnas = False

                    # Extraer solo el nombre de las columnas y marcar claves
                    if dentro_columnas and token.ttype is None:
                        columns = str(token).split(',')
                        for col in columns:
                            col_parts = col.strip().split()
                            col_name = col_parts[0] if col_parts else ""

                            # Identificar claves
                            if "PRIMARY KEY" in col:
                                atributos.append((col_name, "PK"))
                            elif "FOREIGN KEY" in col:
                                fk_table = col.split("REFERENCES")[1].split("(")[0].strip()
                                fk_column = col.split("REFERENCES")[1].split("(")[1].replace(")", "").strip()
                                atributos.append((col_name, "FK"))
                                relaciones.append((table_name, fk_table))
                            elif col_name:  # Solo el nombre del campo
                                atributos.append((col_name, ""))

                tablas[table_name] = [attr[0] for attr in atributos]  # Guardar solo nombres de campo

    # Crear nodos para cada tabla
    for table_name, atributos in tablas.items():
        tabla_html = f"""<
            <table border="0" cellborder="1" cellspacing="0">
                <tr><td bgcolor="lightgrey" align="center"><b>{table_name}</b></td></tr>
                {''.join([f'<tr><td align="left">{attr}</td></tr>' for attr in atributos])}
            </table>
        >"""
        node = pydot.Node(table_name, shape="plaintext", label=tabla_html)
        graph.add_node(node)

    # Crear relaciones entre tablas
    for (table_from, table_to) in relaciones:
        edge = pydot.Edge(table_from, table_to, arrowhead="normal")
        graph.add_edge(edge)

    # Generar imagen PNG en base64
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

