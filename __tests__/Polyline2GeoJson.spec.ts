import { Polyline2GeoJson } from "../src/Polyline2GeoJson";
describe('Polyline2GeoJson', () => {
    describe('decode', () => {
        it('success', () => {
            const polyline = "yttxEm_{sYa@]S_@_@qAUg@s@eASo@Wk@o@I?CTKXe@Pq@P_@?GaAu@";
            const expected = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66519, 139.73662],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66555, 139.73691],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const actual = Polyline2GeoJson.decode(polyline);

            expect(actual).toEqual(expected);
        });
        it('set precision', () => {
            const polyline = "yttxEm_{sYa@]S_@_@qAUg@s@eASo@Wk@o@I?CTKXe@Pq@P_@?GaAu@";
            const expected = [
                [35.6643, 139.7351],
                [35.6645, 139.7353],
                [35.6646, 139.7354],
                [35.6647, 139.7358],
                [35.6648, 139.736],
                [35.6651, 139.7364],
                [35.6652, 139.7366],
                [35.6653, 139.7368],
                [35.6656, 139.7369],
                [35.6656, 139.7369],
                [35.6654, 139.737],
                [35.6653, 139.7372],
                [35.6652, 139.7374],
                [35.6651, 139.7376],
                [35.6651, 139.7376],
                [35.6655, 139.7379]
            ];
            const actual = Polyline2GeoJson.decode(polyline);
            console.log(actual);

            expect(actual).toEqual(expected);
        });
    });
    describe('simplify', () => {
        it('success', () => {
            const points: [number, number][] = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66519, 139.73662],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66555, 139.73691],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const expected: [number, number][] = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const actual = Polyline2GeoJson.simplify(points, 0.00002);

            expect(actual.length).toBeLessThan(points.length);
            expect(actual).toEqual(expected);
        });
        it('No change tolerance', () => {
            const points: [number, number][] = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const actual = Polyline2GeoJson.simplify(points, 0.00002);

            expect(actual.length).toEqual(points.length);
        });
        it('Up tolerance', () => {
            const points: [number, number][] = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66519, 139.73662],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66555, 139.73691],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const points2: [number, number][] = [
                [35.66429, 139.73511],
                [35.66446, 139.73526],
                [35.66456, 139.73542],
                [35.66472, 139.73583],
                [35.66483, 139.73603],
                [35.66509, 139.73638],
                [35.66531, 139.73684],
                [35.66555, 139.73689],
                [35.66544, 139.73697],
                [35.66531, 139.73716],
                [35.66522, 139.73741],
                [35.66513, 139.73757],
                [35.66513, 139.73761],
                [35.66546, 139.73788]
            ];
            const actual1 = Polyline2GeoJson.simplify(points, 0.00003);
            const actual2 = Polyline2GeoJson.simplify(points2, 0.00003);

            expect(actual1.length).toBeLessThan(points2.length);
            expect(actual1).toEqual(actual2);
        });
    });
    describe('convert', () => {
        it('success', () => {
            const polyline = "qrnyE_gesYoO_HmJnQkBdGkBq@od@i`@}p@cq@lEeAx@l@FxAyDnFoNlIqBdLoAbCmLxAaNkAuQtCmNxFoFxD}[d]_FgAlBhEkBnE{EcA{CfCoD}DoBBmC|HqGzFyM~GgXlLkRzMoJlJmJnPgYpv@mBbC~@~FxIjWgc@jg@_QjO_TjLwa@lQeFgMwn@ld@`IdRIlAkH|FoQhJy_A~TmSlJ_UnPi@y@JcIqFg@e@uBx@}CkEvDqEdHuDnCcZKk^nRKxB``@dgBlADM|CwAD_CcBeQ`CuILel@lLwmAtHsKrAgHhCe@a@t@OUgCeD{Q_ZbJ}j@jXcXbHeC`BwChGuJ~\cMhRyAfEoIrKiHNsJoFyW{IaFr@eIlGeDnGqIjGuXf[cRl\yFbGwFbCg]zE}JfFeDdDoFpIeLjg@gE`IeTvKaQnDyKxIys@na@_HfCCoG_A{AQuCcR`NwOdC}MgL{PsKab@oLmKDqD|CeTdr@}T~Ume@pYwQbGSjAaAGRr@_@aBo@FbAtABq@bAJSYaAj@z@g@Lr@LgBw@QsUbBoYEePnDkKnMgg@fy@yRbZ}Tn{@_M``@cFdLck@qm@iBvAzI}LfDoYrGaPtOuYlGkXpOcb@jBkKzTiNnj@mQhFgErSm`@bKeMdB_GMsJqA}CsAy@JeDuFaPk@{GhNuIbAuB|AmJfBiD`U}MdEcF~CeIa@tAbHqGr\aK`OaIxNaFfPwDlWcD~VMnm@dGxFWdC`Bl]~E\wHdRL|DjBrNIrFkCtSo@tXkHnCwAQ{DnDyB|JeR~N}FtEcEdBhFzFuAjCrEdCzAjJgDxBkA~`@uYfK{JrJuNlBzApFmKwAgBaA?j@qBrKuO|ByHlNiTjGwEdBmBLoAjD?zBhAdIoCpF{H`@kD`CwFbHa@fGgFrBIm@M|@aEbLBz@^HvA_@s@p@bBi@e@RaCAj@a@SRf@{@eAtBEnBfDrB{AZuBvAFjEgDJjDhUgFjQuOm@mALmAtKmHnAbGdQvCh[}D\][q@hL]xl@lPvUfAfZmBzOoCrp@cTfCsCvCqe@oBoMcGnAxFeF`KgExYJnDgCbFwHfEoD{@zCr@~BhFb@EdJ`@F`SiObUuKv`AcUlK}F|LcLsHwRjo@ed@tFpMhq@q[jQcNlg@_l@qCaGiGqWx@SpAeCbW_s@hKoQfNyMtMsJdQiKdHkBvLqGrGaGfCgHtBSbExD`DoDCr@`B|@fBKpBuDDKqBmDRgF}BlAxe@ee@~LeSrPwIxLuLlNqDhHwE`HzItTdTjz@dx@lYtUXrA|LlGvNcI";
            const expected = [
                [139.624, 35.797], [139.621, 35.802], [139.621, 35.803],
                [139.634, 35.817], [139.635, 35.816], [139.611, 35.851],
                [139.609, 35.853], [139.585, 35.864], [139.582, 35.867],
                [139.559, 35.913], [139.556, 35.918], [139.539, 35.912],
                [139.538, 35.912], [139.531, 35.954], [139.53, 35.958],
                [139.528, 35.959], [139.455, 35.961], [139.477, 35.949],
                [139.476, 35.909], [139.458, 35.93], [139.452, 35.939],
                [139.457, 35.959], [139.457, 35.96], [139.445, 35.967],
                [139.44, 35.973], [139.439, 35.984], [139.438, 35.987],
                [139.405, 36.005], [139.412, 36.013], [139.47, 35.978],
                [139.471, 35.976], [139.469, 35.915], [139.446, 35.918],
                [139.441, 35.917], [139.45, 35.891], [139.451, 35.889],
                [139.475, 35.867], [139.476, 35.866], [139.483, 35.845],
                [139.484, 35.841], [139.464, 35.839], [139.456, 35.839],
                [139.455, 35.85], [139.456, 35.852], [139.438, 35.856],
                [139.427, 35.858], [139.415, 35.874], [139.407, 35.872],
                [139.396, 35.892], [139.394, 35.9], [139.36, 35.93],
                [139.358, 35.931], [139.336, 35.913]
            ];
            const actual = Polyline2GeoJson.convert(polyline);

            expect(actual.type).toEqual("LineString");
            expect(actual.coordinates).toEqual(expected);
        });
    });
});
