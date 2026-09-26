import { MapContainer, TileLayer, Polyline, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom orange marker for route points
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Haversine formula
const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const MapClickHandler = ({ addPoint }) => {
  useMapEvents({
    click(e) {
      addPoint([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
};

const MapPicker = ({ route, setRoute, distance, setDistance, elevationGain, setElevationGain }) => {
  const addPoint = (point) => {
    const newRoute = [...route, point];
    setRoute(newRoute);

    if (newRoute.length > 1) {
      let dist = 0;
      for (let i = 0; i < newRoute.length - 1; i++) {
        dist += haversineDistance(newRoute[i][0], newRoute[i][1], newRoute[i + 1][0], newRoute[i + 1][1]);
      }
      setDistance(dist);
      setElevationGain(Math.floor(dist * 85));
    } else {
      setDistance(0);
      setElevationGain(0);
    }
  };

  const resetRoute = () => {
    setRoute([]);
    setDistance(0);
    setElevationGain(0);
  };

  return (
    <div className="map-wrapper">
      <MapContainer
        center={[43.12, 76.85]}
        zoom={12}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        {/* === OpenStreetMap — free, no API key === */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
        />
        <MapClickHandler addPoint={addPoint} />

        {route.length > 0 && (
          <Polyline
            positions={route}
            pathOptions={{ color: '#CC4900', weight: 4.5, opacity: 0.85 }}
          />
        )}

        {route.map((point, index) => (
          <Marker key={index} position={point} icon={orangeIcon} />
        ))}
      </MapContainer>

      {/* Top-left route info overlay */}
      <div className="map-top-left">
        <div className="active-label">
          <span className="dot"></span> АКТИВНЫЙ ТРЕК
        </div>
        <div className="map-route-title">
          {route.length > 0 ? 'Ваш маршрут' : 'Кликните по карте'}
        </div>
        <div className="map-route-stats">
          <span>{distance.toFixed(1)} КМ</span>
          <span>•</span>
          <span>+{elevationGain} М НАБОР</span>
          <span>•</span>
          <span>{route.length} ТОЧЕК</span>
        </div>
      </div>

      {/* Top-right map mode buttons */}
      <div className="map-btn-group">
        <button className="map-btn active">ТОПО</button>
        <button className="map-btn">СПУТНИК</button>
      </div>

      {/* Bottom-left reset */}
      <div className="map-controls-bottom">
        <button className="map-reset-btn" onClick={resetRoute}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px', verticalAlign: 'middle', marginRight: '4px' }}>restart_alt</span>
          Сбросить маршрут
        </button>
      </div>
    </div>
  );
};

export default MapPicker;
