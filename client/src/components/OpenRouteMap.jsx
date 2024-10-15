import { useEffect, useRef } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon } from 'ol/style';

const OpenRouteMap = ({ driverLocation, pickupLocation, dropoffLocation }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef(null);
  const driverFeatureRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // Initialize the map
      const map = new Map({
        target: mapRef.current,
        layers: [
          new TileLayer({
            source: new XYZ({
              url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            }),
          }),
        ],
        view: new View({
          center: fromLonLat([0, 0]), // Default center point
          zoom: 2, // Default zoom level
        }),
      });
      mapInstanceRef.current = map;
    }

    // Set up initial markers if pickup and drop-off locations are available
    if (pickupLocation && dropoffLocation) {
      setupMap();
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    // Update driver location in real time
    if (driverLocation && driverFeatureRef.current) {
      const newPosition = fromLonLat([driverLocation.longitude, driverLocation.latitude]);
      driverFeatureRef.current.getGeometry().setCoordinates(newPosition);

      // Center the map on the new driver location
      mapInstanceRef.current.getView().animate({
        center: newPosition,
        duration: 500,
      });
    }
  }, [driverLocation]);

  const setupMap = () => {
    const map = mapInstanceRef.current;

    // Clear existing markers layer if it exists
    if (markersLayerRef.current) map.removeLayer(markersLayerRef.current);

    // Create pickup and drop-off markers
    const pickupFeature = createMarkerFeature(pickupLocation, 'https://cdn-icons-png.flaticon.com/512/684/684908.png');
    const dropoffFeature = createMarkerFeature(dropoffLocation, 'https://cdn-icons-png.flaticon.com/512/684/684908.png');
    
    // Create the driver feature (initial location is either pickup or current location)
    driverFeatureRef.current = createMarkerFeature(driverLocation || pickupLocation, 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png');

    // Create a vector source with all markers (pickup, drop-off, driver)
    const markersSource = new VectorSource({
      features: [pickupFeature, dropoffFeature, driverFeatureRef.current],
    });

    // Create a vector layer for the markers
    const markersLayer = new VectorLayer({
      source: markersSource,
    });

    // Add markers layer to the map
    map.addLayer(markersLayer);
    markersLayerRef.current = markersLayer;

    // Fit the map view to show all markers with some padding
    const extent = markersSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });
  };

  // Helper function to create a marker feature
  const createMarkerFeature = (location, iconUrl) => {
    const feature = new Feature({
      geometry: new Point(fromLonLat([location.longitude, location.latitude])),
    });
    feature.setStyle(new Style({
      image: new Icon({
        anchor: [0.5, 1],
        src: iconUrl,
        scale: 0.07,
      }),
    }));
    return feature;
  };

  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
  );
};

export default OpenRouteMap;
