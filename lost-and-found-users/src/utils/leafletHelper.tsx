import { Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Map container style
export const mapContainerStyle = {
  height: "400px",
  width: "100%",
  borderRadius: "0.5rem",
  zIndex: 1,
};

// Default center (Kathmandu)
export const defaultCenter: [number, number] = [27.7172, 85.324]; // [lat, lng]

// Custom component for map click handling
export function LocationMarker({ position, onPositionChange }: any) {
  useMapEvents({
    click(e) {
      onPositionChange([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          onPositionChange([
            e.target.getLatLng().lat,
            e.target.getLatLng().lng,
          ]);
        },
      }}
    />
  ) : null;
}
