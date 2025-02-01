import pandas as pd
from pymongo import MongoClient
from sklearn.neighbors import NearestNeighbors
import numpy as np
import json
import requests

client = MongoClient(
    "mongodb+srv://bossbabies2025:xbQoRx1mxajAHer8@cluster0.efkt6.mongodb.net/",
    tlsAllowInvalidCertificates=True
)
db = client["Emergency"]
records_collection = db["Records"]
hospitals_collection = db["Hospitals"]
ambulances_collection = db["Ambulances"]
allocated_resources_collection = db["AllocatedResources"]

def fetch_latest_accident_location():
    latest_record = records_collection.find_one({}, sort=[("_id", -1)])  # Get the latest record
    if latest_record and "latitude" in latest_record and "longitude" in latest_record:
        return float(latest_record["latitude"]), float(latest_record["longitude"])
    raise ValueError("⚠️ No valid accident location found in the database.")

def fetch_hospital_data():
    hospitals = list(hospitals_collection.find({}, {"Latitude": 1, "Longitude": 1, "_id": 0}))  # Fetch only required fields
    if not hospitals:
        raise ValueError("No hospital data found in the database.")

    # Convert values to float to avoid type issues
    return np.array([[float(h["Latitude"]), float(h["Longitude"])] for h in hospitals])

def fetch_ambulance_data():
    ambulances = list(ambulances_collection.find({}, {"Latitude": 1, "Longitude": 1, "_id": 0}))  # Fetch only required fields
    if not ambulances:
        raise ValueError("No ambulance data found in the database.")

    return np.array([[float(a["Latitude"]), float(a["Longitude"])] for a in ambulances])

def find_nearest_hospitals(accident_lat, accident_lng, hospital_coords, k=20):
    nbrs = NearestNeighbors(n_neighbors=min(k, len(hospital_coords)), metric="haversine").fit(np.radians(hospital_coords))
    distances, indices = nbrs.kneighbors(np.radians([[float(accident_lat), float(accident_lng)]]))  # Ensure float conversion
    nearest_hospitals = hospital_coords[indices[0]].tolist()
    return {
        "origin_lat": accident_lat,
        "origin_lng": accident_lng,
        "destinations": nearest_hospitals
    }

def find_nearest_ambulances(accident_lat, accident_lng, ambulance_coords, k=20):
    nbrs = NearestNeighbors(n_neighbors=min(k, len(ambulance_coords)), metric="haversine").fit(np.radians(ambulance_coords))
    distances, indices = nbrs.kneighbors(np.radians([[float(accident_lat), float(accident_lng)]]))  # Ensure float conversion
    nearest_ambulances = ambulance_coords[indices[0]].tolist()
    return {
        "origin_lat": accident_lat,
        "origin_lng": accident_lng,
        "destinations": nearest_ambulances
    }

API_KEY = "AIzaSyBcI4KQ1vlpFTS8ku7pJ4pWkdySbbSEAhI"  # Replace with your actual API key

def get_shortest_travel_time(data):
    try:
        print("🔄 Getting shortest travel time...")

        origin_lat = data["origin_lat"]
        origin_lng = data["origin_lng"]
        destinations = data["destinations"]

        travel_times = []

        for destination in destinations:
            destination_lat, destination_lng = destination

            url = f"https://maps.googleapis.com/maps/api/distancematrix/json?mode=driving&units=metric&origins={origin_lat},{origin_lng}&destinations={destination_lat},{destination_lng}&key={API_KEY}"

            response = requests.get(url)
            data = response.json()

            if data.get("rows") and data["rows"][0]["elements"][0].get("duration"):
                travel_time = data["rows"][0]["elements"][0]["duration"]["value"]  # Time in seconds
                travel_times.append((destination, travel_time))
            else:
                print(f"⚠️ No travel time found for destination: {destination}")

        travel_times.sort(key=lambda x: x[1])
        return travel_times

    except Exception as e:
        print(f" Error: {str(e)}")
        return None

def allocate_resources(nearest_hospitals, nearest_ambulances, required_beds, required_ambulances):
    allocated_resources = []
    allocated_beds = 0
    allocated_ambulances = 0

    for hospital in nearest_hospitals["destinations"]:
        if allocated_beds >= required_beds:
            break
        hospital_lat, hospital_lng = hospital  # Latitude and Longitude
        hospital_data = hospitals_collection.find_one({"Latitude": hospital_lat, "Longitude": hospital_lng})
        
        if hospital_data is None:
            print(f"⚠️ Hospital with coordinates ({hospital_lat}, {hospital_lng}) not found in the database.")
            continue
        
        available_beds = hospital_data.get("Accomodation", 0)  # Fetch actual available beds

        beds_to_allocate = min(available_beds, required_beds - allocated_beds)
        ambulances_to_allocate = min(beds_to_allocate, required_ambulances - allocated_ambulances)  # Allocate 1 ambulance per bed

        

        allocated_beds += beds_to_allocate
        allocated_ambulances += ambulances_to_allocate

    # Save allocation details to the database
    #allocated_resources_collection.insert_many(allocated_resources)


def fetch_requirements():
    latest_record = records_collection.find_one(sort=[("_id", -1)])  # Fetch the latest record
    if not latest_record:
        raise ValueError("No records found in the database.")
    
    requirements = {
        "Number of Emergency Beds": latest_record.get("Number of Emergency Beds", 0),
        "Number of Ambulances": latest_record.get("Number of Ambulances", 0)
    }
    return requirements

try:
    accident_lat, accident_lng = fetch_latest_accident_location()
    hospital_coords = fetch_hospital_data()
    ambulance_coords = fetch_ambulance_data()
    nearest_hospitals = find_nearest_hospitals(accident_lat, accident_lng, hospital_coords)
    nearest_ambulances = find_nearest_ambulances(accident_lat, accident_lng, ambulance_coords)
    
    global shortest_travel_time_hospitals
    global shortest_travel_time_ambulances
    shortest_travel_time_hospitals = get_shortest_travel_time(nearest_hospitals)
    shortest_travel_time_ambulances = get_shortest_travel_time(nearest_ambulances)
    
    requirements = fetch_requirements()
    required_beds = requirements["Number of Emergency Beds"]
    required_ambulances = requirements["Number of Ambulances"]
    
    # Allocate resources
    allocate_resources(nearest_hospitals, nearest_ambulances, required_beds, required_ambulances)

    output_hospitals_json_path = "nearest_hospitals.json"
    with open(output_hospitals_json_path, "w") as json_file:
        json.dump(nearest_hospitals, json_file, indent=4)

    output_ambulances_json_path = "nearest_ambulances.json"
    with open(output_ambulances_json_path, "w") as json_file:
        json.dump(nearest_ambulances, json_file, indent=4)

except ValueError as e:
    print(str(e))

def fetch_latest_accident_location():
    latest_record = records_collection.find_one({}, sort=[("_id", -1)])  # Get the latest record
    if latest_record:
        return [latest_record["latitude"], latest_record["longitude"]]
    return None

sorted_destinations = shortest_travel_time_hospitals
am_sorted_destinations = shortest_travel_time_ambulances
# Fetch the latest accident location
accident_location = fetch_latest_accident_location()
if not accident_location:
    print(" No accident records found in the database.")
    exit()

def fetch_hospital_details(lat, long):
    return hospitals_collection.find_one({"Latitude": lat, "Longitude": long})

def fetch_ambulance_details(lat, long):
    return ambulances_collection.find_one({"Latitude": lat, "Longitude": long, "Availability": 1})

def allocate_resources(hospitals, ambulances, required_beds, required_amb):
    remaining_beds = required_beds
    remaining_ambs = (required_beds + 1) // 2  # 1 ambulance per 2 people
    allocated_data = []

    for hospital, ambulance in zip(hospitals, ambulances):
        if not hospital or not ambulance:
            continue  # Skip if hospital/ambulance is missing

        hospital_id = hospital["_id"]
        ambulance_id = ambulance["_id"]

        available_beds = hospital["Accomodation"]
        available_ambulances = ambulance["Availability"]

        # Allocate beds
        allocated_beds = min(remaining_beds, available_beds)
        remaining_beds -= allocated_beds
        hospitals_collection.update_one(
            {"_id": hospital_id},
            {"$inc": {"Accomodation": -allocated_beds}}
        )

        # Allocate ambulances (1 per 2 people)
        allocated_amb = min(remaining_ambs, available_ambulances)
        remaining_ambs -= allocated_amb
        ambulances_collection.update_one(
            {"_id": ambulance_id},
            {"$inc": {"Availability": -allocated_amb}}
        )

        # Store ambulance locations as an array
        ambulance_locations = [[ambulance["Latitude"], ambulance["Longitude"]] for _ in range(allocated_amb)]

        allocated_data.append({
            "Accident_Location": accident_location,
            "Hospital_Location": [hospital["Latitude"], hospital["Longitude"]],
            "Ambulances": ambulance_locations,  # Store as an array of lat-long pairs
            "Allocated_Beds": allocated_beds,
            "Allocated_Ambulances": allocated_amb
        })

        # Stop if all required beds and ambulances are allocated
        if remaining_beds == 0 and remaining_ambs == 0:
            print("✅ All required beds & ambulances have been allocated.")
            break

    if allocated_data:
        allocated_resources_collection.insert_many(allocated_data)
        print("✅ Allocation details saved in 'AllocatedResources' collection.")

    if remaining_beds > 0 or remaining_ambs > 0:
        print(f"⚠️ Not enough resources: {remaining_beds} beds and {remaining_ambs} ambulances still needed.")



hospitals = []
ambulances = []

for hospital_data, ambulance_data in zip(sorted_destinations, am_sorted_destinations):
    lat, long = hospital_data[0]
    lat1, long1 = ambulance_data[0]

    hospital = fetch_hospital_details(lat, long)
    ambulance = fetch_ambulance_details(lat1, long1)

    if hospital:
        hospitals.append(hospital)
    if ambulance:
        ambulances.append(ambulance)

if hospitals and ambulances:
    allocate_resources(hospitals, ambulances, requirements["Number of Emergency Beds"], requirements["Number of Ambulances"])
else:
    print("⚠️ No hospitals or ambulances available for allocation.")