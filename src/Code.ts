import { SlackHandler } from "./SlackHandler";
import { DuplicateEventError } from "./CallbackEventHandler";
import { JobBroker } from "./JobBroker";
import { SlackOAuth2Handler } from "./SlackOAuth2Handler";
import { StravaOAuth2Handler } from "./StravaOAuth2Handler";
import { Slack } from "./slack/types/index.d";
import { SlackApiClient } from "./SlackApiClient";
import { SlackWebhooks } from "./SlackWebhooks";
import {
  StravaApiClient,
  DetailedActivity,
  DetailedAthlete
} from "./StravaApiClient";
import { Polyline2GeoJson } from "./Polyline2GeoJson";

type TextOutput = GoogleAppsScript.Content.TextOutput;
type HtmlOutput = GoogleAppsScript.HTML.HtmlOutput;
type LinkSharedEvent = Slack.CallbackEvent.LinkSharedEvent;
type BlockActions = Slack.Interactivity.BlockActions;
type ButtonAction = Slack.Interactivity.ButtonAction;
type InteractionResponse = Slack.Interactivity.InteractionResponse;

const properties = PropertiesService.getScriptProperties();

const SLACK_CLIENT_ID: string = properties.getProperty("SLACK_CLIENT_ID");
const SLACK_CLIENT_SECRET: string = properties.getProperty(
  "SLACK_CLIENT_SECRET"
);
const STRAVA_CLIENT_ID: string = properties.getProperty("STRAVA_CLIENT_ID");
const STRAVA_CLIENT_SECRET: string = properties.getProperty(
  "STRAVA_CLIENT_SECRET"
);
let slackOAuth2Handler: SlackOAuth2Handler;

const slackHandleCallback = (request): HtmlOutput => {
  return createSlackOAuth2Handler().authCallback(request);
};

const stravaHandleCallback = (request): HtmlOutput => {
  const { serviceName, key } = request.parameter;
  const user = serviceName.split("-")[1];
  const channel = key.split("-")[0];
  const message_ts = key.split("-")[1];
  const stravaOAuth2Handler = createStravaOAuth2Handler(user);
  // Authentication
  const output = stravaOAuth2Handler.authCallback(request);

  // Retrieving Unauthenticated Event Information from the Cache.
  const cache = CacheService.getScriptCache();
  const formValue = JSON.parse(cache.get(key));

  if (formValue) {
    // Unfurls now that we've been authenticated.
    doUnfurls(channel, user, message_ts, formValue.url);

    // delete ephemeral message
    const webhook = new SlackWebhooks(formValue.response_url);
    webhook.invoke({ delete_original: true });
  }

  return output;
};

function createSlackApiClient(): SlackApiClient {
  return new SlackApiClient(createSlackOAuth2Handler().access_token);
}

function createStravaOAuth2Handler(user: string): StravaOAuth2Handler {
  return new StravaOAuth2Handler(
    STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET,
    PropertiesService.getUserProperties(),
    stravaHandleCallback.name,
    user
  );
}

function createSlackOAuth2Handler(): SlackOAuth2Handler {
  if (!slackOAuth2Handler) {
    slackOAuth2Handler = new SlackOAuth2Handler(
      SLACK_CLIENT_ID,
      SLACK_CLIENT_SECRET,
      PropertiesService.getUserProperties(),
      slackHandleCallback.name
    );
  }

  return slackOAuth2Handler;
}

/**
 * Authorizes and makes a request to the Slack API.
 */
function doGet(request): HtmlOutput {
  const handler = createSlackOAuth2Handler();

  // Clear authentication by accessing with the get parameter `?logout=true`
  if (request.parameter.logout) {
    const userProperties = PropertiesService.getUserProperties();
    handler.clearService();
    userProperties.deleteAllProperties();
    const template = HtmlService.createTemplate(
      'Logout<br /><a href="<?= requestUrl ?>" target="_blank">refresh</a>.'
    );
    template.requestUrl = slackOAuth2Handler.requestURL;
    return HtmlService.createHtmlOutput(template.evaluate());
  }

  if (!handler.verifyAccessToken()) {
    const template = HtmlService.createTemplate(
      'RedirectUri:<?= redirectUrl ?> <br /><a href="<?= authorizationUrl ?>" target="_blank">Authorize Slack</a>.'
    );
    template.authorizationUrl = handler.authorizationUrl;
    template.redirectUrl = handler.redirectUri;
    return HtmlService.createHtmlOutput(template.evaluate());
  }

  return HtmlService.createHtmlOutput("OK");
}

const asyncLogging = (): void => {
  const jobBroker: JobBroker = new JobBroker();
  jobBroker.consumeJob((parameter: {}) => {
    console.info(JSON.stringify(parameter));
  });
};

const VERIFICATION_TOKEN: string = properties.getProperty("VERIFICATION_TOKEN");

function doPost(e): TextOutput {
  const slackHandler = new SlackHandler(VERIFICATION_TOKEN);

  slackHandler.addCallbackEventListener("link_shared", executeLinkSharedEvent);
  slackHandler.addInteractivityListener("button", executeButton);

  try {
    const process = slackHandler.handle(e);

    if (process.performed) {
      return process.output;
    }
  } catch (exception) {
    if (exception instanceof DuplicateEventError) {
      return ContentService.createTextOutput();
    } else {
      new JobBroker().enqueue(asyncLogging, {
        message: exception.message,
        stack: exception.stack
      });
      throw exception;
    }
  }

  throw new Error(`No performed handler, request: ${JSON.stringify(e)}`);
}

const executeLinkSharedEvent = (event: LinkSharedEvent): void => {
  const stravaOAuth2Handler = createStravaOAuth2Handler(event.user);

  if (!stravaOAuth2Handler.verifyAccessToken()) {
    postAuthenticationMessage(
      event.channel,
      event.user,
      event.message_ts,
      event.links[0].url
    );

    return;
  }

  if (event.links.length === 1) {
    doUnfurls(event.channel, event.user, event.message_ts, event.links[0].url);
  } else {
    event.links.forEach(link => {
      new JobBroker().enqueue(chatUnfurl, {
        channel: event.channel,
        user: event.user,
        message_ts: event.message_ts,
        url: link.url
      });
    });
  }
};

function postAuthenticationMessage(
  channel: string,
  user: string,
  message_ts: string,
  url: string
): void {
  const stravaOAuth2Handler = createStravaOAuth2Handler(user);
  const client = createSlackApiClient();
  const redirectUri = stravaOAuth2Handler.getRedirectUri();
  const cacheKey = `${channel}-${message_ts}`;

  stravaOAuth2Handler.setRedirectUri(
    `${redirectUri}?key=${encodeURI(cacheKey)}`
  );

  client.postEphemeral(
    channel,
    "",
    user,
    createAuthenticationBlocks(stravaOAuth2Handler, message_ts, url)
  );
}

function createAuthenticationBlocks(
  stravaOAuth2Handler: StravaOAuth2Handler,
  message_ts: string,
  url: string
): {}[] {
  const formValue = {
    message_ts,
    url
  };

  let message;
  if (stravaOAuth2Handler.verifyAccessToken()) {
    message =
      "Your credentials appear to be incorrect. Would you like to re-authenticate?";
  } else {
    message =
      "That looks like a Strava link. Would you like to unfurling Strava's URL";
  }

  return [
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: message
        }
      ]
    },
    {
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "Yes, please"
          },
          value: JSON.stringify(formValue),
          url: stravaOAuth2Handler.authorizationUrl,
          style: "primary",
          action_id: "auth"
        },
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "No, thanks"
          },
          value: '{ "no": true }',
          action_id: "no"
        }
      ]
    }
  ];
}

const executeButton = (blockActions: BlockActions): {} => {
  const action = blockActions.actions[0] as ButtonAction;
  const response_url = blockActions.response_url;

  switch (action.action_id) {
    case "auth":
      // Deleting Previous Credentials.
      const user = blockActions.user.id;
      createStravaOAuth2Handler(user).clearService();

      // Store cache for post-authentication
      const formValue = JSON.parse(action.value);
      const channel = blockActions.channel.id;
      const cache = CacheService.getScriptCache();
      const cacheKey = `${channel}-${formValue.message_ts}`;
      const cacheValue = { ...formValue, user, channel, response_url };

      cache.put(cacheKey, JSON.stringify(cacheValue));

      return {};
  }

  const webhook = new SlackWebhooks(response_url);
  const response: InteractionResponse = { delete_original: true };

  if (!webhook.invoke(response)) {
    throw new Error(
      `executeButton faild. event: ${JSON.stringify(blockActions)}`
    );
  }

  return {};
};

const chatUnfurl = (): void => {
  const client = createSlackApiClient();

  const jobBroker: JobBroker = new JobBroker();
  jobBroker.consumeJob(
    (parameter: {
      channel: string;
      user: string;
      message_ts: string;
      url: string;
    }) => {
      const stravaApiClient = createStravaApiClient(parameter.user);
      const unfurls = createUnfurls(stravaApiClient, parameter.url);

      // Resource Not Found
      if (Object.keys(unfurls).length === 0) {
        console.info(`chatUnfurl - Resource Not Found.`);

        postAuthenticationMessage(
          parameter.channel,
          parameter.user,
          parameter.message_ts,
          parameter.url
        );

        return;
      }

      client.chatUnfurl(parameter.channel, parameter.message_ts, unfurls);
    }
  );
};

function doUnfurls(
  channel: string,
  user: string,
  message_ts: string,
  url: string
): void {
  const client = createSlackApiClient();

  const stravaApiClient = createStravaApiClient(user);
  const unfurls = createUnfurls(stravaApiClient, url);

  // Resource Not Found
  if (Object.keys(unfurls).length === 0) {
    console.info(`chatUnfurl - Resource Not Found.`);

    postAuthenticationMessage(channel, user, message_ts, url);

    return;
  }

  client.chatUnfurl(channel, message_ts, unfurls);
}

function createStravaApiClient(user: string): StravaApiClient {
  const stravaOAuth2Handler = createStravaOAuth2Handler(user);

  return new StravaApiClient(stravaOAuth2Handler.access_token);
}

function createUnfurls(stravaApiClient: StravaApiClient, url: string): {} {
  const unfurls = {};
  const activityId = getActivityId(url);

  if (activityId) {
    const activity = stravaApiClient.getActivityById(activityId);
    if (activity) {
      unfurls[url] = createStravaBlocks(stravaApiClient, activity);
    }
  }

  return unfurls;
}

function getActivityId(url: string): string | null {
  const match = url.match(/^https:\/\/www\.strava\.com\/\activities\/([0-9]+)/);

  if (match) {
    return match[1];
  } else {
    return null;
  }
}

function createStravaBlocks(
  stravaApiClient: StravaApiClient,
  detail: DetailedActivity
): {} {
  const athlete: DetailedAthlete = stravaApiClient.getLoggedInAthlete();

  let athleteName;
  if (detail.athlete.id === athlete.id) {
    athleteName = `${athlete.firstname} ${athlete.lastname}`;
  } else {
    athleteName = detail.athlete.id;
  }

  const blocks = {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<https://www.strava.com/activities/${detail.id}|${detail.name}> via @ <https://www.strava.com/athletes/${detail.athlete.id}|${athleteName}>`
        },
        fields: [
          {
            type: "mrkdwn",
            text: "*Type*"
          },
          {
            type: "plain_text",
            text: detail.type
          },
          {
            type: "mrkdwn",
            text: "*Distance*"
          },
          {
            type: "plain_text",
            text: convertDistanceUnit(detail.distance)
          },
          {
            type: "mrkdwn",
            text: "*Moving time*"
          },
          {
            type: "plain_text",
            text: convertTimeUnit(detail.moving_time)
          },
          {
            type: "mrkdwn",
            text: "*Total elevation gain*"
          },
          {
            type: "plain_text",
            text: `${detail.total_elevation_gain} m`
          }
        ],
        accessory: {
          type: "image",
          image_url: athlete.profile_medium,
          alt_text: "profile"
        }
      },
      {
        type: "image",
        image_url: createDonwloadMapImageUrl(
          detail.id,
          detail.map.summary_polyline,
          detail.distance
        ),
        // image_url: createMapImageUrl(
        //   detail.map.summary_polyline,
        //   detail.distance
        // ),
        alt_text: "map"
      }
    ]
  };

  if (detail.photos.primary) {
    blocks.blocks.push({
      type: "image",
      image_url: detail.photos.primary.urls["600"],
      alt_text: "primary-photos"
    });
  }

  return blocks;
}

function createDonwloadMapImageUrl(
  activityId: number,
  summary_polyline: string,
  distance: number
): string {
  const fileName = `strava-map-${activityId}.png`;
  const fileIteraater = DriveApp.getFilesByName(fileName);

  if (fileIteraater.hasNext()) {
    const cache = fileIteraater.next();
    cache.setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    return cache.getDownloadUrl();
  } else {
    const originUrl = createMapImageUrl(summary_polyline, distance);

    try {
      const blob = UrlFetchApp.fetch(originUrl).getBlob();

      const file = DriveApp.createFile(blob);
      file.setName(fileName);
      file.setDescription(`origin: ${originUrl}`);
      file.setSharing(
        DriveApp.Access.ANYONE_WITH_LINK,
        DriveApp.Permission.VIEW
      );

      return file.getDownloadUrl();
    } catch (e) {
      console.warn(`create map image faild. ${e.message}`);
      return "https://placehold.jp/500x300.png?text=414%20URI%20Too%20Long";
    }
  }
}

const MAPBOX_ACCESS_TOKEN = properties.getProperty("MAPBOX_ACCESS_TOKEN");
const MAPBOX_STYLE_ID =
  properties.getProperty("MAPBOX_STYLE_ID") || "mapbox/streets-v11";

function createMapImageUrl(summary_polyline: string, distance: number): string {
  const url = `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE_ID}/static/${getOverlayPath(
    summary_polyline,
    distance
  )}/auto/500x300?access_token=${MAPBOX_ACCESS_TOKEN}`;

  return url;
}

function getOverlayPath(summary_polyline: string, distance: number): string {
  const geoJson = Polyline2GeoJson.convert(summary_polyline);

  return `geojson(${encodeURI(Utilities.jsonStringify(geoJson))})`;
}

function convertTimeUnit(time: number): string {
  switch (true) {
    case time > 60 * 60:
      return `${Math.floor(time / 3600)} hour ${Math.floor(time / 60) %
        60} min`;
    case time > 60:
      return `${Math.floor(time / 60)} min ${(time % 60) % 60} sec`;
    default:
      return `${time} sec`;
  }
}

function convertDistanceUnit(distance: number): string {
  if (distance >= 1000) {
    return `${Math.round(distance / 100) / 10} Km`;
  } else {
    return `${distance} m`;
  }
}

export { executeLinkSharedEvent, createUnfurls, getActivityId };
