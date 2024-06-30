import { correctBearingToGeoJSON } from './intersectSightings';

test('correctBearingToGeoJSON', () => {
    expect(correctBearingToGeoJSON(50)).toBe(50);
    expect(correctBearingToGeoJSON(360)).toBe(0);
    expect(correctBearingToGeoJSON(190)).toBe(-170);
    expect(correctBearingToGeoJSON(400)).toBe(40);
    expect(correctBearingToGeoJSON(-10)).toBe(-10);
    expect(correctBearingToGeoJSON(-200)).toBe(160);
    expect(correctBearingToGeoJSON(-370)).toBe(-10);
})