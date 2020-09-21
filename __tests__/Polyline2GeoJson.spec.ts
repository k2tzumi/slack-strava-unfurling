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
            // console.log(actual);

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
                [139.62, 35.8], [139.63, 35.81],
                [139.63, 35.82], [139.58, 35.86],
                [139.58, 35.87], [139.56, 35.91],
                [139.56, 35.92], [139.54, 35.91],
                [139.54, 35.91], [139.53, 35.96],
                [139.53, 35.96], [139.53, 35.96],
                [139.46, 35.96], [139.48, 35.95],
                [139.48, 35.91], [139.44, 35.98],
                [139.44, 35.99], [139.41, 36],
                [139.4, 36.01], [139.41, 36.01],
                [139.42, 36.01], [139.47, 35.98],
                [139.47, 35.98], [139.47, 35.91],
                [139.45, 35.92], [139.44, 35.92],
                [139.48, 35.84], [139.48, 35.84],
                [139.46, 35.84], [139.46, 35.84],
                [139.42, 35.87], [139.41, 35.87],
                [139.36, 35.93], [139.36, 35.93],
                [139.34, 35.91]
            ];
            const actual = Polyline2GeoJson.convert(polyline);
            // console.log(actual);

            expect(actual.type).toEqual("LineString");
            expect(actual.coordinates).toEqual(expected);
        });
    });
});
