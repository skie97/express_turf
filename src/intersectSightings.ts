import turf from '@turf/turf';
import { Feature, Polygon, Point, MultiPolygon } from 'geojson';

export function lineOfSightKm(elevationInMeters: number): number {
    return Math.sqrt(elevationInMeters) * 3.57
}

export function correctBearingToGeoJSON(bearingInDeg: number) : number {
    var corrected = bearingInDeg % 360;
    if (corrected < -180)
        corrected += 360;
    if (corrected > 180)
        corrected -= 360;
    return corrected;
}

function getPolyCone(position: Feature<Point>, bearingInDeg: number, degreeOfUncertainty: number): Feature<Polygon> {
    var altitudeInMeters = position.geometry.coordinates[2] || 1.7; // If no elevation, assume it to be a human being of 1.7 meters
    var losDistanceKm = lineOfSightKm(altitudeInMeters);
    var leftEndPoint = turf.destination(position, 
                                        losDistanceKm, 
                                        correctBearingToGeoJSON(bearingInDeg - degreeOfUncertainty),
                                        {"units": "kilometers"});
    var rightEndPoint = turf.destination(position, 
                                         losDistanceKm, 
                                         correctBearingToGeoJSON(bearingInDeg + degreeOfUncertainty),
                                         {"units": "kilometers"});
    return turf.polygon(
        [
            [
                // Need to take care that the coordinates need to run counterclockwise.
                // Otherwise, it defines a hole in a polygon covering the whole world.
                position.geometry.coordinates,
                rightEndPoint.geometry.coordinates,
                leftEndPoint.geometry.coordinates,
                position.geometry.coordinates
            ]
        ]
    )
}

function getPolyWithTimeLapsed(poly: Feature<Polygon>, avgSpeedInKmh: number, timeInHours: number): Feature<Polygon|MultiPolygon> {
    return turf.buffer(poly, avgSpeedInKmh * timeInHours);
}

module.exports = { correctBearingToGeoJSON, lineOfSightKm };