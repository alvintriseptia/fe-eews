import { IEarthquakePrediction } from '@/entities/IEarthquakePrediction';
import React from 'react';

// Create a context
const EarthquakePredictionContext = React.createContext<IEarthquakePrediction | null>(null);

export default EarthquakePredictionContext;
