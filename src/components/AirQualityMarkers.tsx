import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { fetchGlobalMarkers } from '../logic/dataService';
import { getMarkerColor } from '../logic/airQualityService';

// Helper to convert lat/lon to 3D Cartesian coordinates
const latLonToVector3 = (lat: number, lon: number, radius: number) => {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
};

const AirQualityMarkers = () => {
  const [stations, setStations] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchGlobalMarkers();
      setStations(data);
    };
    loadData();
  }, []);

  return (
    <group>
      {stations.map((station: any, idx) => {
        // Handle both DB schema and WAQI JSON schema
        const geo = station.location?.geo || station.coordinates;
        if (!geo) return null;

        const [lat, lon] = geo;
        const position = latLonToVector3(lat, lon, 1.005);
        const pm25 = (station.pollutants?.pm25 || station.pm25) || 0;
        const color = getMarkerColor(pm25);

        return (
          <group key={idx} position={position}>
            {/* Core Point */}
            <mesh>
              <sphereGeometry args={[0.008, 16, 16]} />
              <meshBasicMaterial color={color} />
            </mesh>
            {/* Outer Glow */}
            <mesh>
              <sphereGeometry args={[0.015, 16, 16]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            {/* Atmosphere Spike */}
            <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
               <boxGeometry args={[0.002, 0.002, Math.max(0.01, pm25 / 1000)]} />
               <meshBasicMaterial color={color} transparent opacity={0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

export default AirQualityMarkers;