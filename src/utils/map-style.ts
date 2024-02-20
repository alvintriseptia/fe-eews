import type {FillLayer} from 'react-map-gl';

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer: FillLayer = {
  id: 'data',
  type: 'fill',
  paint: {
    'fill-color': "#ff0000",
    'fill-opacity': 0.2
  }
};

export const pWaveLayer: FillLayer = {
  id: 'pWave',
  type: 'fill',
  paint: {
    'fill-outline-color': '#00b7ff',
    "fill-color": "transparent",
  }
};

export const sWaveLayer: FillLayer = {
  id: 'sWave',
  type: 'fill',
  paint: {
    'fill-outline-color': '#ff0000',
    "fill-color": "transparent",
  }
};

export function getIntensityColor(intensity: number) {
	if(intensity < 2) return "bg-tews-mmi-I text-gray-900"
  if(intensity < 3) return "bg-tews-mmi-II text-white"
  if(intensity < 4) return "bg-tews-mmi-III text-white"
  if(intensity < 5) return "bg-tews-mmi-IV text-white"
  if(intensity < 6) return "bg-tews-mmi-V text-white"
  if(intensity < 7) return "bg-tews-mmi-VI text-white"
  if(intensity < 8) return "bg-tews-mmi-VII text-white"
  if(intensity < 9) return "bg-tews-mmi-VIII text-white"
  if(intensity < 10) return "bg-tews-mmi-IX text-white"
  return "bg-tews-mmi-X text-white"
}
