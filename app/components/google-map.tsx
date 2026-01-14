"use client";

import { useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Paper, Typography } from "@mui/material";

export interface MapMarker {
     id: string | number;
     position: { lat: number; lng: number };
     title: string;
     description?: string;
}

export interface GoogleMapProps {
     apiKey?: string; // Optional if using NEXT_PUBLIC_GOOGLE_MAP_API_KEY
     center?: { lat: number; lng: number };
     zoom?: number;
     markers?: MapMarker[];
     height?: string | number;
     width?: string | number;
     onMarkerClick?: (marker: MapMarker) => void;
}

declare global {
     interface Window {
          google: any;
     }
}

export default function GoogleMap({
     apiKey,
     center = { lat: 45.2671, lng: 19.8335 }, // Default to Novi Sad Serbia
     zoom = 12,
     markers = [],
     height = 400,
     width = "100%",
     onMarkerClick,
}: GoogleMapProps) {

     const mapRef = useRef<HTMLDivElement>(null);
     const [map, setMap] = useState<google.maps.Map | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);

     useEffect(() => {
          if (!mapRef.current || !apiKey) return;

          const loadGoogleMapsApi = () => {
               if (window.google?.maps) {
                    initMap();
                    return;
               }
               const script = document.createElement("script");
               script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
               script.async = true;
               script.defer = true;
               script.onload = initMap;
               script.onerror = () => {
                    setError("Failed to load Google Maps API");
               };
               document.head.appendChild(script);
          };

          const initMap = () => {
               try {
                    const mapInstance = new window.google.maps.Map(mapRef.current!, {
                         center,
                         zoom,
                         mapTypeControl: true,
                         streetViewControl: true,
                         fullscreenControl: true,
                         zoomControl: true,
                         mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                         styles: [
                              {
                                   featureType: "poi",
                                   elementType: "labels",
                                   stylers: [{ visibility: "off" }],
                              },
                         ],
                    });
                    const infoWindowInstance = new window.google.maps.InfoWindow();
                    setInfoWindow(infoWindowInstance);
                    setMap(mapInstance);

               } catch (err) {
                    console.error("Error initializing map:", err);
                    setError("Failed to initialize map");
               }
          };

          loadGoogleMapsApi();

          return () => infoWindow?.close();
     }, [apiKey, center, zoom]);

     useEffect(() => {
          if (!map || !infoWindow || !markers.length) return;

          // Center map and add markers
          map.setCenter(center);

          const googleMarkers = markers.map((marker) => {
               const googleMarker = new window.google.maps.Marker({
                    position: marker.position,
                    map,
                    title: marker.title,
                    animation: window.google.maps.Animation.DROP,
                    icon: {
                         path: window.google.maps.SymbolPath.CIRCLE,
                         fillColor: "#4285F4",
                         fillOpacity: 1,
                         strokeColor: "#ffffff",
                         strokeWeight: 2,
                         scale: 8,
                    },
               });

               googleMarker.addListener("click", () => {
                    infoWindow.close();
                    infoWindow.setContent(`
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px;">${marker.title}</h3>
            ${marker.description
                              ? `<p style="margin: 0; font-size: 14px;">${marker.description}</p>`
                              : ""
                         }
          </div>
        `);
                    infoWindow.open(map, googleMarker);
                    if (onMarkerClick) onMarkerClick(marker);
               });
               return googleMarker;
          });

          return () => {
               googleMarkers.forEach((m) => m.setMap(null));
          };
     }, [map, infoWindow, markers, center, onMarkerClick]);

     if (error) {
          return (
               <Paper
                    sx={{
                         height,
                         width,
                         display: "flex",
                         alignItems: "center",
                         justifyContent: "center",
                         p: 2,
                         bgcolor: "error.light",
                         color: "error.contrastText",
                    }}
               >
                    <Typography variant="body1">{error}</Typography>
               </Paper>
          );
     }

     return (
          <Box
               sx={{
                    height,
                    width,
                    position: "relative",
                    borderRadius: 1,
                    overflow: "hidden",
               }}
          >
               <Box
                    ref={mapRef}
                    sx={{
                         height: "100%",
                         width: "100%",
                    }}
                    aria-label="Google Map"
                    role="application"
               />
          </Box>
     );
}
