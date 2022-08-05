import fetch_data
from flask import Flask, render_template
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def home():
    return render_template('home.html')

app.add_url_rule('/', view_func=home)

app.add_url_rule('/calculateBleuScore', view_func=fetch_data.calculateBleuScore, methods = ['POST'])
app.add_url_rule('/calculateMeteorScore', view_func=fetch_data.calculateMeteorScore, methods = ['POST'])
app.add_url_rule('/calculateWerScore', view_func=fetch_data.calculateWerScore, methods = ['POST'])
app.add_url_rule('/calculateBertSimilarity', view_func=fetch_data.calculate_bert_similarity, methods = ['POST'])

if __name__ == '__main__':
    app.run(port=8080, debug=True)
