import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import { GeoLocation, Incident, IncidentStatus } from '../types';
import L from 'leaflet';

// Fix for default Leaflet icons in Webpack/React environments
// We use direct CDN links to avoid module import issues with image files
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// --- Helper Components for Map ---

interface LocationMarkerProps {
  position: GeoLocation | null;
  setPosition: (pos: GeoLocation) => void;
  isReadOnly: boolean;
}

const LocationMarker: React.FC<LocationMarkerProps> = ({ position, setPosition, isReadOnly }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);

  useMapEvents({
    click(e) {
      if (!isReadOnly) {
        setPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    },
  });

  return position === null ? null : (
    <Marker position={[position.lat, position.lng]}>
      <Popup>Ubicación seleccionada</Popup>
    </Marker>
  );
};

// --- Main Map Component ---

interface MapComponentProps {
  mode: 'PICKER' | 'VIEWER';
  incidents?: Incident[];
  selectedLocation?: GeoLocation | null;
  onLocationSelect?: (loc: GeoLocation) => void;
  center?: GeoLocation;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  mode, 
  incidents = [], 
  selectedLocation, 
  onLocationSelect,
  center = { lat: -40.2926, lng: -73.0827 } // Default to La Unión, Chile
}) => {
  const [mapCenter] = useState<[number, number]>([center.lat, center.lng]);

  const getStatusColor = (status: IncidentStatus) => {
    switch(status) {
      case IncidentStatus.OPEN: return 'red';
      case IncidentStatus.IN_PROGRESS: return 'orange';
      case IncidentStatus.RESOLVED: return 'green';
      default: return 'blue';
    }
  };

  // Custom DivIcon for status-based markers in Viewer mode
  const createStatusIcon = (status: IncidentStatus) => {
    const color = getStatusColor(status);
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
  };

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border border-slate-200 z-0 relative">
       <MapContainer 
        center={mapCenter} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {mode === 'PICKER' && onLocationSelect && (
          <LocationMarker 
            position={selectedLocation || null} 
            setPosition={onLocationSelect} 
            isReadOnly={false} 
          />
        )}

        {mode === 'VIEWER' && incidents.map((incident) => (
          <Marker 
            key={incident.id} 
            position={[incident.location.lat, incident.location.lng]}
            icon={createStatusIcon(incident.status)}
          >
            <Popup>
              <div className="min-w-[150px]">
                <strong className="block text-sm font-semibold">{incident.aiAnalysis?.category || 'Incidencia'}</strong>
                <span className="text-xs text-gray-500 block mb-1">{incident.id.slice(0,6)}</span>
                <p className="text-sm my-1">{incident.description}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full text-white
                  ${incident.status === IncidentStatus.OPEN ? 'bg-red-500' : 
                    incident.status === IncidentStatus.IN_PROGRESS ? 'bg-orange-500' : 'bg-green-500'}`}>
                  {incident.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;