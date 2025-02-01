from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

API_KEY = 'AIzaSyBcI4KQ1vlpFTS8ku7pJ4pWkdySbbSEAhI'

@app.route('/get_shortest_travel_time', methods=['POST'])
def get_shortest_travel_time():
    print("Getting shortest travel time...")
    data = request.get_json()
    origin_lat = data['origin_lat']  
    origin_lng = data['origin_lng'] 
    destinations = data['destinations']  

    travel_times = []

    for destination in destinations:
        destination_lat, destination_lng = destination
        url = f'https://maps.googleapis.com/maps/api/distancematrix/json?mode=driving&units=imperial&origins={origin_lat},{origin_lng}&destinations={destination_lat},{destination_lng}&key={API_KEY}'

        response = requests.get(url)
        data = response.json()
        print(data)

        travel_time = data['rows'][0]['elements'][0]['duration']['value'] 
        travel_times.append((destination, travel_time))

    travel_times.sort(key=lambda x: x[1])

    result = {
        'sorted_destinations': travel_times
    }

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)