import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { LineString } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Stroke } from 'ol/style';
import axios from '../axios';

const OpenRouteMap = ({ driverLocation, pickupLocation, dropoffLocation }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef(null);
  const driverFeatureRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [error, setError] = useState(null);

  // Initialize the map and set up the initial state on component mount
  useEffect(() => {
    if (!mapInstanceRef.current) {
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
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });
      mapInstanceRef.current = map;
    }

    // If pickup and dropoff locations are provided, set up the map
    if (pickupLocation && dropoffLocation) {
      setupMap();
    }
  }, [pickupLocation, dropoffLocation]);

  // Update driver's location 
  useEffect(() => {
    if (driverLocation && driverFeatureRef.current) {
      const newPosition = fromLonLat([driverLocation.longitude, driverLocation.latitude]);
      driverFeatureRef.current.getGeometry().setCoordinates(newPosition);

      // Animate the map to center on the updated driver location and zoom in
      mapInstanceRef.current.getView().animate({
        center: newPosition,
        duration: 500, 
        zoom: 14,      
      });
    }
  }, [driverLocation]);

  // Set up the map with pickup, dropoff markers and route drawing
  const setupMap = async () => {
    const map = mapInstanceRef.current;

    // Remove any existing layers (markers or routes) before adding new ones
    if (markersLayerRef.current) map.removeLayer(markersLayerRef.current);
    if (routeLayerRef.current) map.removeLayer(routeLayerRef.current);

    const pickupFeature = createMarkerFeature(pickupLocation, 'https://cdn-icons-png.flaticon.com/512/684/684908.png');
    const dropoffFeature = createMarkerFeature(dropoffLocation, 'https://cdn-icons-png.flaticon.com/512/684/684908.png');
    
    driverFeatureRef.current = createMarkerFeature(driverLocation || pickupLocation, 'https://cdn-icons-png.flaticon.com/512/3097/3097144.png');

    const markersSource = new VectorSource({
      features: [pickupFeature, dropoffFeature, driverFeatureRef.current],
    });

    const markersLayer = new VectorLayer({
      source: markersSource,
    });

    map.addLayer(markersLayer);
    markersLayerRef.current = markersLayer;

    const extent = markersSource.getExtent();
    map.getView().fit(extent, { padding: [50, 50, 50, 50], duration: 1000 });

    await fetchAndDisplayRoute(pickupLocation, dropoffLocation);
  };

  // Fetch route and display it on the map
  const fetchAndDisplayRoute = async (pickup, dropoff) => {
    try {
      console.log('Fetching route with params:', {
        start: `${pickup.longitude},${pickup.latitude}`,
        end: `${dropoff.longitude},${dropoff.latitude}`,
      });

      let response = await axios.get('/api/geocode/directions', {
        params: {
          start: `${pickup.longitude},${pickup.latitude}`,
          end: `${dropoff.longitude},${dropoff.latitude}`,
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` }
      });
      response = response.data;

      if (!response.data || !response.data.features || response.data.features.length === 0) {
        throw new Error('Invalid response from OpenRouteService API');
      }

      // Transform route coordinates for OpenLayers
      const routeCoordinates = response.data.features[0].geometry.coordinates.map(coord => fromLonLat([coord[0], coord[1]]));

      const routeFeature = new Feature({
        geometry: new LineString(routeCoordinates),
      });

      routeFeature.setStyle(new Style({
        stroke: new Stroke({
          color: 'blue',
          width: 4,
        }),
      }));

      const routeSource = new VectorSource({
        features: [routeFeature],
      });

      const routeLayer = new VectorLayer({
        source: routeSource,
      });

      mapInstanceRef.current.addLayer(routeLayer);
      routeLayerRef.current = routeLayer;

      // Adjust map view to fit the route
      const routeExtent = routeSource.getExtent();
      mapInstanceRef.current.getView().fit(routeExtent, { padding: [50, 50, 50, 50], duration: 1000 });

      setError(null);
    } catch (err) {
      setError('Failed to fetch and display route');
      console.error(err);
    }
  };

  // Create marker features for pickup, dropoff, and driver locations
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
    <div>
      <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
};

export default OpenRouteMap;
