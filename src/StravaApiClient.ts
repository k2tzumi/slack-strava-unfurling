import { NetworkAccessError } from "./NetworkAccessError";

type URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;
type HttpMethod = GoogleAppsScript.URL_Fetch.HttpMethod;

// see. http://developers.strava.com/docs/reference/#api-models-Fault
interface Response {
  errors?: {
    code: string;
    field: string;
    resource: string;
  };
  message?: string;
}

// see. http://developers.strava.com/docs/reference/#api-models-DetailedActivity
interface DetailedActivity extends Response {
  id: number;
  external_id: string;
  upload_id: string;
  athlete: MetaAthlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high: number;
  elev_low: number;
  type: ActivityType;
  start_date: Date;
  start_date_local: Date;
  timezone: string;
  start_latlng: LatLng;
  end_latlng: LatLng;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: PolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type: number;
  upload_id_str: string;
  average_speed: number;
  max_speed: number;
  has_kudoed: boolean;
  gear_id: string;
  kilojoules: number;
  average_watts: number;
  device_watts: boolean;
  max_watts: number;
  weighted_average_watts: string;
  description: string;
  photos: PhotosSummary;
  gear: SummaryGear;
  calories: number;
  segment_efforts: DetailedSegmentEffort[];
  device_name: string;
  embed_token: string;
  splits_metric: Split;
  splits_standard: Split;
  laps: Lap[];
  best_efforts: DetailedSegmentEffort[];
}

// see. http://developers.strava.com/docs/reference/#api-models-MetaAthlete
interface MetaAthlete {
  id: number;
  resource_state: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-MetaActivity
interface MetaActivity {
  id: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-ActivityType
enum ActivityType {
  AlpineSki = "AlpineSki",
  BackcountrySki = "BackcountrySki",
  Canoeing = "Canoeing",
  Crossfit = "Crossfit",
  EBikeRide = "EBikeRide",
  Elliptical = "Elliptical",
  Golf = "Golf",
  Handcycle = "Handcycle",
  Hike = "Hike",
  IceSkate = "IceSkate",
  InlineSkate = "InlineSkate",
  Kayaking = "Kayaking",
  Kitesurf = "Kitesurf",
  NordicSki = "NordicSki",
  Ride = "Ride",
  RockClimbing = "RockClimbing",
  RollerSki = "RollerSki",
  Rowing = "Rowing",
  Run = "Run",
  Sail = "Sail",
  Skateboard = "Skateboard",
  Snowboard = "Snowboard",
  Snowshoe = "Snowshoe",
  Soccer = "Soccer",
  StairStepper = "StairStepper",
  StandUpPaddling = "StandUpPaddling",
  Surfing = "Surfing",
  Swim = "Swim",
  Velomobile = "Velomobile",
  VirtualRide = "VirtualRide",
  VirtualRun = "VirtualRun",
  Walk = "Walk",
  WeightTraining = "WeightTraining",
  Wheelchair = "Wheelchair",
  Windsurf = "Windsurf",
  Workout = "Workout",
  Yoga = "Yoga"
}

// see. http://developers.strava.com/docs/reference/#api-models-LatLng
type LatLng = number[];

// see. http://developers.strava.com/docs/reference/#api-models-PolylineMap
interface PolylineMap {
  id: string;
  polyline: string;
  summary_polyline: string;
}

// see. http://developers.strava.com/docs/reference/#api-models-PhotosSummary
interface PhotosSummary {
  count: number;
  primary: PhotosSummaryPrimary;
}

// see. http://developers.strava.com/docs/reference/#api-models-PhotosSummary_primary
interface PhotosSummaryPrimary {
  id: number;
  source: number;
  unique_id: string;
  urls: {
    "100": string;
    "600": string;
  };
}

// see. http://developers.strava.com/docs/reference/#api-models-SummaryGear
interface SummaryGear {
  id: string;
  resource_state: number;
  primary: boolean;
  name: string;
  distance: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-DetailedSegmentEffort
interface DetailedSegmentEffort {
  id: number;
  elapsed_time: number;
  distance: number;
  name: string;
}

// see. http://developers.strava.com/docs/reference/#api-models-Split
interface Split {
  average_speed: number;
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  pace_zone: number;
  moving_time: number;
  split: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-Lap
interface Lap {
  id: number;
  activity: MetaActivity;
  athlete: MetaAthlete;
  average_cadence: number;
  average_speed: number;
  distance: number;
  elapsed_time: number;
  start_index: number;
  end_index: number;
  lap_index: number;
  max_speed: number;
  moving_time: number;
  name: string;
  pace_zone: number;
  split: number;
  start_date: Date;
  start_date_local: Date;
  total_elevation_gain: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-DetailedAthlete
interface DetailedAthlete extends Response {
  id: number;
  resource_state: number;
  firstname: string;
  lastname: string;
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  private: string;
  member_count: number;
  featured: string;
  verified: boolean;
  url: string;
  membership: string;
  admin: string;
  owner: boolean;
  following_count: number;
}

// see. http://developers.strava.com/docs/reference/#api-models-SummaryActivity
interface SummaryActivity extends Response {
  id: number;
  external_id: string;
  upload_id: number;
  athlete: MetaAthlete;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  elev_high: number;
  elev_low: number;
  type: ActivityType;
  start_date: Date;
  start_date_local: Date;
  timezone: string;
  start_latlng: LatLng;
  end_latlng: LatLng;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  total_photo_count: number;
  map: PolylineMap;
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type: number;
  upload_id_str: string;
  average_speed: number;
  max_speed: number;
  has_kudoed: boolean;
  gear_id: string;
  kilojoules: number;
  average_watts: number;
  device_watts: boolean;
  max_watts: number;
  weighted_average_watts: number;
}

class StravaApiClient {
  static readonly BASE_URI = "https://www.strava.com/api/v3";

  public constructor(private token: string) {}

  public getActivityById(
    id: string,
    include_all_efforts: boolean = false
  ): DetailedActivity {
    const endPoint =
      StravaApiClient.BASE_URI +
      `/activities/${id}?include_all_efforts=${include_all_efforts}`;
    const payload: {} = {};

    const response = this.invokeAPI(endPoint, payload) as DetailedActivity;

    if (response.errors) {
      throw new Error(
        `getActivityById faild. response: ${JSON.stringify(
          response
        )}, id: ${id}, payload: ${JSON.stringify(payload)}`
      );
    }

    return response;
  }

  public getLoggedInAthlete(): DetailedAthlete {
    const endPoint = StravaApiClient.BASE_URI + `/athlete`;
    const payload: {} = {};

    const response = this.invokeAPI(endPoint, payload) as DetailedAthlete;

    if (response.errors) {
      throw new Error(
        `getLoggedInAthlete faild. response: ${JSON.stringify(
          response
        )}, payload: ${JSON.stringify(payload)}`
      );
    }

    return response;
  }

  public getLoggedInAthleteActivities(
    page: number = 1,
    per_page: number = 30
  ): SummaryActivity[] {
    const endPoint = StravaApiClient.BASE_URI + `/athlete/activities`;
    const payload: {} = {
      page,
      per_page
    };

    const response = this.invokeAPI(endPoint, payload);

    if (response.errors) {
      throw new Error(
        `getLoggedInAthlete faild. response: ${JSON.stringify(
          response
        )}, payload: ${JSON.stringify(payload)}`
      );
    }

    return { ...response } as SummaryActivity[];
  }

  private postRequestHeader() {
    return {
      "content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${this.token}`
    };
  }

  private getRequestHeader() {
    return {
      "content-type": "application/x-www-form-urlencoded",
      Authorization: `Bearer ${this.token}`
    };
  }

  private postRequestOptions(payload: string | {}): URLFetchRequestOptions {
    const options: URLFetchRequestOptions = {
      method: "post",
      headers: this.postRequestHeader(),
      muteHttpExceptions: true,
      payload: payload instanceof String ? payload : JSON.stringify(payload)
    };

    return options;
  }

  private getRequestOptions(): URLFetchRequestOptions {
    const options: URLFetchRequestOptions = {
      method: "get",
      headers: this.getRequestHeader(),
      muteHttpExceptions: true
    };

    return options;
  }

  /**
   * @param endPoint Slack API endpoint
   * @param options
   * @throws NetworkAccessError
   */
  private invokeAPI(endPoint: string, payload: {}): Response {
    let response;

    try {
      switch (this.preferredHttpMethod(endPoint)) {
        case "post":
          response = UrlFetchApp.fetch(
            endPoint,
            this.postRequestOptions(payload)
          );
          break;
        case "get":
          response = UrlFetchApp.fetch(
            this.formUrlEncoded(endPoint, payload),
            this.getRequestOptions()
          );
          break;
      }
    } catch (e) {
      console.warn(`DNS error, etc. ${e.message}`);
      throw new NetworkAccessError(500, e.message);
    }

    switch (response.getResponseCode()) {
      case 200:
        return JSON.parse(response.getContentText());
      default:
        console.warn(
          `Strava API error. endpoint: ${endPoint}, status: ${response.getResponseCode()}, content: ${response.getContentText()}`
        );
        throw new NetworkAccessError(
          response.getResponseCode(),
          response.getContentText()
        );
    }
  }

  private preferredHttpMethod(endPoint: string): HttpMethod {
    switch (true) {
      case /(.)*\/activities\/.(.)*$/.test(endPoint):
      case /(.)*\/athlete$/.test(endPoint):
      case /(.)*\/athlete\/activities$/.test(endPoint):
        return "get";
      default:
        return "post";
    }
  }

  private formUrlEncoded(endPoint: string, payload: {}): string {
    const query = Object.entries<string>(payload)
      .map(([key, value]) => `${key}=${encodeURI(value)}`)
      .join("&");

    return `${endPoint}?${query}`;
  }
}

export { StravaApiClient, DetailedActivity, DetailedAthlete };
