class Line {
  public constructor(private p1: number[], private p2: number[]) {}

  public perpendicularDistance(point: number[]): number {
    if (this.isVertical()) {
      return this.perpendicularDistanceVertical(point);
    } else if (this.isHorizontal()) {
      return this.perpendicularDistanceHorizontal(point);
    } else {
      return this.perpendicularDistanceHasSlope(point);
    }
  }

  public isVertical(): boolean {
    return !isFinite(this.slope());
  }

  public slope(): number {
    return this.rise() / this.run();
  }

  public rise(): number {
    return this.p2[1] - this.p1[1];
  }

  public run(): number {
    return this.p2[0] - this.p1[0];
  }

  private perpendicularDistanceVertical(point: number[]): number {
    return Math.abs(this.p1[0] - point[0]);
  }

  public isHorizontal(): boolean {
    return this.p1[1] === this.p2[1];
  }

  private perpendicularDistanceHorizontal(point: number[]) {
    return Math.abs(this.p1[1] - point[1]);
  }

  private perpendicularDistanceHasSlope(point: number[]): number {
    const slope = this.slope();
    const y_intercept = this.yIntercept();

    return (
      Math.abs(slope * point[0] - point[1] + y_intercept) /
      Math.sqrt(Math.pow(slope, 2) + 1)
    );
  }

  public yIntercept(): number {
    // return this.p1[1] - (this.p1[0] * this.slope(this.p1, this.p2));
    return this.p1[1] - this.p1[0] * this.slope();
  }
}

class Polyline2GeoJson {
  public static convert(
    polyline: string
  ): { type: string; coordinates: [number, number][] } {
    const coords = this.flipped(this.decode(polyline));

    // Calculating calculation accuracy
    let precision = 5;
    const threshold = [95, 90, 85, 80, 75, 70];
    let lenght = coords.length;
    let coefficient = 0;
    let tolerance = 0;
    let simplifyCoords = coords;
    while (lenght > threshold[precision]) {
      tolerance = (1 + 0.1 * coefficient) / Math.pow(10, precision);
      simplifyCoords = this.simplify(coords, tolerance);
      lenght = simplifyCoords.length;
      if (lenght > threshold[precision] * 2) {
        precision--;
      } else {
        coefficient++;
      }
    }

    return {
      type: "LineString",
      coordinates: this.round(simplifyCoords, precision)
    };
  }

  public static simplify(
    points: [number, number][],
    tolerance: number
  ): [number, number][] {
    let dmax = 0;
    let index = 0;

    for (let i = 1; i <= points.length - 2; i++) {
      const d = new Line(
        points[0],
        points[points.length - 1]
      ).perpendicularDistance(points[i]);
      if (d > dmax) {
        index = i;
        dmax = d;
      }
    }

    if (dmax > tolerance) {
      const results_one = this.simplify(points.slice(0, index), tolerance);
      const results_two = this.simplify(
        points.slice(index, points.length),
        tolerance
      );

      return results_one.concat(results_two);
    } else if (points.length > 1) {
      return [points[0], points[points.length - 1]];
    } else {
      return [points[0]];
    }
  }

  private static flipped(coords: [number, number][]): [number, number][] {
    const ret = [];
    for (const coord of coords) {
      const latLng = coord.slice();
      ret.push([latLng[1], latLng[0]]);
    }
    return ret;
  }

  private static round(
    coords: [number, number][],
    precision: number
  ): [number, number][] {
    const ret = [];
    for (const coord of coords) {
      const latLng = coord.slice();
      ret.push([
        Number(latLng[0].toFixed(precision)),
        Number(latLng[1].toFixed(precision))
      ]);
    }
    return ret;
  }

  public static decode(polyline: string): [number, number][] {
    let index: number = 0;
    let lat: number = 0;
    let lng: number = 0;
    const coordinates: [number, number][] = [];
    const factor: number = Math.pow(10, 5);

    while (index < polyline.length) {
      let byte: number = null;
      let shift: number = 0;
      let result: number = 0;

      /* tslint:disable:no-bitwise */
      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const latitude_change: number = result & 1 ? ~(result >> 1) : result >> 1;

      shift = result = 0;

      do {
        byte = polyline.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      const longitude_change: number =
        result & 1 ? ~(result >> 1) : result >> 1;
      /* tslint:enable:no-bitwise */

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
  }
}

export { Polyline2GeoJson };
