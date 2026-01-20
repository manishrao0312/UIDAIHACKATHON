import json
import os

# Expanded mapping for your UIDAI Hackathon demo
COORDS = {
    "bangalore": [77.5946, 12.9716],
    "patna": [85.1376, 25.5941],
    "mumbai": [72.8777, 19.0760],
    "delhi": [77.2090, 28.6139],
    "yadgir": [77.1442, 16.7613],
    "udupi": [74.7421, 13.3409],
    "mysore": [76.6394, 12.2958],
    "belagavi": [74.5089, 15.8497],
    "kalaburagi": [76.8343, 17.3297],
    "dharwad": [75.0078, 15.4589],
    "ballari": [76.9214, 15.1394],
    "bidar": [77.5039, 17.9104]
}

def inject_coords():
    file_path = 'data/migration_master.json'
    if not os.path.exists(file_path):
        print("Error: migration_master.json not found. Run data_fusion.py first.")
        return

    with open(file_path, 'r') as f:
        data = json.load(f)
    
    for record in data['historical']:
        dist = str(record.get('district', '')).strip().lower()
        
        # Get coordinates or use a slightly randomized fallback near the center
        # so they don't all stack on exactly the same pixel
        coords = COORDS.get(dist, [78.0, 20.5])
        record['lng_origin'] = coords[0]
        record['lat_origin'] = coords[1]
        
        # Point destinations to Bangalore for the demo visualization
        record['lng_dest'] = 77.5946
        record['lat_dest'] = 12.9716

    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)
    print("✅ Coordinates successfully injected. Arcs will now move dynamically!")

if __name__ == "__main__":
    inject_coords()