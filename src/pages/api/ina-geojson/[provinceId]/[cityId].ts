import fs from 'fs';
import path from 'path';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse){
    const { provinceId, cityId } = req.query;
    const filePath = path.join(process.cwd(), 'src', 'assets', 'data', 'ina-geojson', `${provinceId}`, `${cityId}.json`);
    const geoJSON =  JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!geoJSON) {
        return res.status(404).json({
            error: {
                message: 'GeoJSON not found',
            },
        });
    }

    res.status(200).json(geoJSON);
};