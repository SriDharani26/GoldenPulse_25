from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify(message="Welcome to the Flask app!")

@app.route('/api/data', methods=['GET'])
def get_data():
    dummy_data = {
        'id': 1,
        'name': 'Sample Data',
        'description': 'This is some sample data.'
    }
    return jsonify(dummy_data)

@app.route('/api/data', methods=['POST'])
def create_data():
    return jsonify(message="Data created successfully!"), 201

if __name__ == '__main__':
    app.run(debug=True)