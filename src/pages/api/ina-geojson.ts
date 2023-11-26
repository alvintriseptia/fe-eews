import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
    const { provinceId, regencyId } = req.query;

    // Fetch the GeoJSON in the file system with path `src/pages/api/geojson/[provinceId]/[regencyId].json`
    const geoJSON =  require(`/ina-geojson/${provinceId}/${regencyId}.json`);

    if (!geoJSON) {
        return res.status(404).json({
            error: {
                message: 'GeoJSON not found',
            },
        });
    }

    res.json(geoJSON);
};
