import { correctBearingToGeoJSON, getSector, getIntersection, sightingData } from './intersectSightings';
import * as turf from '@turf/turf';

test('correctBearingToGeoJSON', () => {
    expect(correctBearingToGeoJSON(50)).toBe(50);
    expect(correctBearingToGeoJSON(360)).toBe(0);
    expect(correctBearingToGeoJSON(190)).toBe(-170);
    expect(correctBearingToGeoJSON(400)).toBe(40);
    expect(correctBearingToGeoJSON(-10)).toBe(-10);
    expect(correctBearingToGeoJSON(-200)).toBe(160);
    expect(correctBearingToGeoJSON(-370)).toBe(-10);
});

// TODO: to test with excel values.
// It's easier to run tests by running through getIntersection and passing various arrays
test('getIntersection: getSector with single position and no boundary', () => {
    const currentTime: Date = new Date();
    const firstSighting: sightingData = {
        sightingDateTime: currentTime,
        avgSpeedInKmh: 0,
        position: turf.point([0,0,17]),
        bearingInDeg: 90,
        degreeOfUncertainty: 3
    }
    const secondSighting: sightingData = {
        sightingDateTime: currentTime,
        avgSpeedInKmh: 0,
        position: turf.point([0,0,17]),
        bearingInDeg: 90,
        degreeOfUncertainty: 3
    }
    const result = getIntersection([firstSighting, secondSighting], currentTime)
    // console.log(result.geometry.coordinates);
})