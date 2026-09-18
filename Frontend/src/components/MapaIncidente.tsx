import { useEffect, useRef } from "react";

declare global {
  interface Window {
    L: any;
  }
}

interface IncidenteMapa {
  id: number;
  lat: number;
  lng: number;
  titulo: string;
  categoria: string;
  barrio: string;
  estado: string;
  apoyos?: number;
}

interface MapaIncidenteProps {
  latSeleccionada?: number;
  lngSeleccionada?: number;
  onUbicacionSeleccionada?: (lat: number, lng: number, direccionTexto: string) => void;
  incidentesExistentes?: IncidenteMapa[];
  readOnly?: boolean;
  height?: string;
}

export default function MapaIncidente({
  latSeleccionada = -34.6508,
  lngSeleccionada = -58.6214,
  onUbicacionSeleccionada,
  incidentesExistentes = [],
  readOnly = false,
  height = "320px",
}: MapaIncidenteProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const selectionMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    if (!mapInstanceRef.current) {
      const L = window.L;
      const map = L.map(mapContainerRef.current).setView(
        [latSeleccionada, lngSeleccionada],
        14
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;

      if (!readOnly && onUbicacionSeleccionada) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          actualizarMarcadorSeleccion(lat, lng);
          onUbicacionSeleccionada(
            lat,
            lng,
            `Coordenadas: ${lat.toFixed(5)}, ${lng.toFixed(5)} (Morón)`
          );
        });
      }
    }

    const L = window.L;
    const map = mapInstanceRef.current;

    if (latSeleccionada && lngSeleccionada && !readOnly) {
      actualizarMarcadorSeleccion(latSeleccionada, lngSeleccionada);
    }

    incidentesExistentes.forEach((inc) => {
      const emojiIcon = obtenerEmojiPorCategoria(inc.categoria);

      const customIcon = L.divIcon({
        className: "custom-map-icon",
        html: `<div style="background: #1e293b; color: white; border: 2px solid #ef4444; border-radius: 50%; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; font-size: 16px; box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;">${emojiIcon}</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: customIcon }).addTo(map);

      const popupContent = `
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <strong style="color: #0f172a; font-size: 14px;">${inc.titulo}</strong>
          <p style="margin: 4px 0; font-size: 12px; color: #64748b;">📍 Barrio: ${inc.barrio || "Morón"}</p>
          <p style="margin: 4px 0; font-size: 12px; color: #2563eb;">Estado: ${inc.estado}</p>
          <div style="margin-top: 8px;">
            <span style="font-size: 12px; color: #475569; display: block; margin-bottom: 4px;">🤝 Apoyos: ${inc.apoyos || 1}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
    });
  }, [incidentesExistentes, readOnly]);

  const actualizarMarcadorSeleccion = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    if (selectionMarkerRef.current) {
      selectionMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const selectIcon = L.divIcon({
        className: "select-map-icon",
        html: `<div style="background: #ef4444; color: white; border: 3px solid white; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8);">📍</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      selectionMarkerRef.current = L.marker([lat, lng], { icon: selectIcon }).addTo(map);
    }
  };

  const obtenerEmojiPorCategoria = (cat: string) => {
    const c = (cat || "").toLowerCase();
    if (c.includes("bache")) return "🕳️";
    if (c.includes("lum") || c.includes("luz") || c.includes("alumbrado")) return "💡";
    if (c.includes("basura") || c.includes("higiene") || c.includes("limpieza")) return "🗑️";
    if (c.includes("semáforo") || c.includes("semaforo") || c.includes("vial")) return "🚦";
    if (c.includes("poda") || c.includes("árbol") || c.includes("arbol")) return "🌳";
    if (c.includes("agua") || c.includes("cloaca")) return "💧";
    return "⚠️";
  };

  return (
    <div style={{ width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #334155" }}>
      <div ref={mapContainerRef} style={{ width: "100%", height }} />
      {!readOnly && (
        <div style={{ background: "#0f172a", color: "#94a3b8", padding: "8px 12px", fontSize: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>🗺️ Hacé clic en cualquier punto del mapa de Morón para marcar la ubicación exacta de la incidencia</span>
          <span style={{ color: "#38bdf8", fontWeight: 600 }}>Leaflet + OpenStreetMap</span>
        </div>
      )}
    </div>
  );
}
