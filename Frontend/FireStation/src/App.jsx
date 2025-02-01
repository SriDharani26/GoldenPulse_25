import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Dropdown, Avatar, Card } from "flowbite-react";
import "leaflet/dist/leaflet.css";

const alerts = [
  { id: 1, title: "Warehouse Fire", description: "Ongoing fire at industrial area." },
  { id: 2, title: "Apartment Fire", description: "Evacuation in progress." },
];

const App = () => {
  const [incidentLocation] = useState({ lat: 40.7128, lng: -74.006 });

  return (
    <div className="h-screen flex flex-col">
      <nav className="bg-red-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">GoldenPulse</h1>
        <Dropdown label={<Avatar rounded img="https://via.placeholder.com/40" />}>
          <Dropdown.Header>
            <span className="block text-sm">John Doe</span>
          </Dropdown.Header>
          <Dropdown.Item className="text-red-600">Sign Out</Dropdown.Item>
        </Dropdown>
      </nav>

      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        <div className="flex-1 h-96 md:h-auto">
          <MapContainer center={[incidentLocation.lat, incidentLocation.lng]} zoom={13} className="h-full w-full rounded-lg shadow-lg">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[incidentLocation.lat, incidentLocation.lng]}>
              <Popup>Incident Location</Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="flex-1 space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="border border-red-500 shadow-lg">
              <h5 className="text-lg font-bold">{alert.title}</h5>
              <p>{alert.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
