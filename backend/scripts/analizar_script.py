# backend/scripts/analizar_script.py
import sys
import json
import sqlparse
from transformers import pipeline
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer

def analizar_redundancias(script_sql):
    # Inicializamos el modelo de lenguaje de transformers
    nlp = pipeline("feature-extraction", model="bert-base-uncased", tokenizer="bert-base-uncased")
    
    # Parseamos el SQL para obtener solo el texto relevante de los nombres de las columnas
    parsed = sqlparse.parse(script_sql)
    columnas = []
    for statement in parsed:
        if statement.get_type() == 'CREATE':
            for token in statement.tokens:
                if token.ttype is None and '(' in str(token):
                    for sub_token in token.tokens:
                        if sub_token.ttype is None:
                            columnas.append(sub_token.value.strip())

    # Convertimos las columnas en vectores
    column_embeddings = [nlp(col)[0][0] for col in columnas]
    
    # Calculamos similitud de coseno entre las columnas
    redundancias = []
    for i, emb1 in enumerate(column_embeddings):
        for j, emb2 in enumerate(column_embeddings):
            if i < j:
                sim = cosine_similarity([emb1], [emb2])[0][0]
                if sim > 0.85:  # Umbral para detectar similitud
                    redundancias.append({
                        "column1": columnas[i],
                        "column2": columnas[j],
                        "similitud": sim
                    })
    
    resultado = {
        "mensaje": "Análisis completado",
        "redundancias": redundancias,
        "duplicidades": []  # Puedes agregar lógica adicional aquí para duplicidades
    }
    
    return resultado

if __name__ == "__main__":
    data = json.loads(sys.stdin.read())
    script_sql = data.get("scriptSQL", "")
    resultado = analizar_redundancias(script_sql)
    print(json.dumps(resultado))

