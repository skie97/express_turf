import * as turf from '@turf/turf';
import { Feature, Polygon, Point, MultiPolygon } from 'geojson';
import { differenceInSeconds } from 'date-fns';

export interface sightingData {
    position: Feature<Point>,
    bearingInDeg: number,
    sightingDateTime: Date,
    avgSpeedInKmh: number,
    degreeOfUncertainty: number
}

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

export function getSector(position: Feature<Point>, bearingInDeg: number, degreeOfUncertainty: number): Feature<Polygon> {
    var altitudeInMeters = position.geometry.coordinates[2] || 1.7; // If no elevation, assume it to be a human being of 1.7 meters
    var losDistanceKm = lineOfSightKm(altitudeInMeters);
    return turf.sector(position,
                       losDistanceKm,
                       correctBearingToGeoJSON(bearingInDeg - degreeOfUncertainty),
                       correctBearingToGeoJSON(bearingInDeg + degreeOfUncertainty),
                       {"units": "kilometers"}
    );
}

// Limitation: This function doesn't draw a segment, but a triangle. This means that as the degree of Uncertainity increases, it
// becomes more and more inaccurate. This is included as a first implementation, but the function getSector returns a sector
// of a circle as expected and should be used instead.
export function getPolyCone(position: Feature<Point>, bearingInDeg: number, degreeOfUncertainty: number): Feature<Polygon> {
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

function getPolyWithTimeLapsed(poly: Feature<Polygon>, avgSpeedInKmh: number, timeInSecs: number): Feature<Polygon|MultiPolygon> {
    return turf.buffer(poly, avgSpeedInKmh * timeInSecs / (60.0 * 60.0));
}

export function getIntersection(data: sightingData[], currentTime: Date): Feature<Polygon|MultiPolygon> {
    if (data.length === 0) {
        return null;
    }
    var result = data.map<Feature<Polygon|MultiPolygon>>(
        (value) => {
            return getPolyWithTimeLapsed(
                getSector(value.position, value.bearingInDeg, value.degreeOfUncertainty),
                value.avgSpeedInKmh,
                differenceInSeconds(value.sightingDateTime, currentTime)
            );
        }
    )
    if (result.length > 1) {
        return turf.intersect(turf.featureCollection(result));
    } else {
        return result[0];
    }
}


// module.exports = { correctBearingToGeoJSON, lineOfSightKm, getIntersection };