import { IEarthquakeDetection } from '@/entities/IEarthquakeDetection';
import React from 'react';

// Create a context
const EarthquakeDetectionContext = React.createContext<IEarthquakeDetection | null>(null);

export default EarthquakeDetectionContext;
