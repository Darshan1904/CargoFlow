import { useEffect, useRef, useState } from 'react';
import 'ol/ol.css';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import { fromLonLat, transform } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { LineString } from 'ol/geom';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { Style, Icon, Stroke, Fill } from 'ol/style';
import axios from 'axios';

const OpenRouteMap = ({ driverLocation, pickupLocation, dropoffLocation }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef(null);
  const driverFeatureRef = useRef(null);
  const markersLayerRef = useRef(null);
  const routeLayerRef = useRef(null);
  const [error, setError] = useState(null);

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

    if (pickupLocation && dropoffLocation) {
      setupMap();
    }
  }, [pickupLocation, dropoffLocation]);

  useEffect(() => {
    if (driverLocation && driverFeatureRef.current) {
      const newPosition = fromLonLat([driverLocation.longitude, driverLocation.latitude]);
      driverFeatureRef.current.getGeometry().setCoordinates(newPosition);

      mapInstanceRef.current.getView().animate({
        center: newPosition,
        duration: 500,
      });
    }
  }, [driverLocation]);

  const setupMap = async () => {
    const map = mapInstanceRef.current;

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

  const fetchAndDisplayRoute = async (pickup, dropoff) => {
    const API_KEY = import.meta.env.VITE_ORS_API_KEY;

      console.log('Fetching route with params:', {
        start: `${pickup.longitude},${pickup.latitude}`,
        end: `${dropoff.longitude},${dropoff.latitude}`,
      });

      const response = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
        params: {
          api_key: API_KEY,
          start: `${pickup.longitude},${pickup.latitude}`,
          end: `${dropoff.longitude},${dropoff.latitude}`,
        },
      });

      console.log('API Response:', response.data);

      if (!response.data || !response.data.features || response.data.features.length === 0) {
        throw new Error('Invalid response from OpenRouteService API');
      }

      // Transform route coordinates for OpenLayers
      const routeCoordinates = response.data.features[0].geometry.coordinates.map(coord => fromLonLat([coord[0], coord[1]]));

      console.log('Route coordinates:', routeCoordinates);

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
};


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