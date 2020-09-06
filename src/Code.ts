import { SlackHandler } from "./SlackHandler";
import { DuplicateEventError } from "./CallbackEventHandler";
import { JobBroker } from "./JobBroker";
import { SlackOAuth2Handler } from "./SlackOAuth2Handler";
import { StravaOAuth2Handler } from "./StravaOAuth2Handler";
import { Slack } from "./slack/types/index.d";
import { SlackApiClient } from "./SlackApiClient";
import { StravaApiClient, DetailedActivity } from "./StravaApiClient";

type TextOutput = GoogleAppsScript.Content.TextOutput;
type HtmlOutput = GoogleAppsScript.HTML.HtmlOutput;
type LinkSharedEvent = Slack.CallbackEvent.LinkSharedEvent;

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
let stravaOAuth2Handler: StravaOAuth2Handler;

const slackHandleCallback = (request): HtmlOutput => {
  initializeOAuth2Handler();
  return slackOAuth2Handler.authCallback(request);
};

const stravaHandleCallback = (request): HtmlOutput => {
  initializeOAuth2Handler();
  return stravaOAuth2Handler.authCallback(request);
};

function initializeOAuth2Handler(): void {
  slackOAuth2Handler = new SlackOAuth2Handler(
    SLACK_CLIENT_ID,
    SLACK_CLIENT_SECRET,
    PropertiesService.getUserProperties(),
    slackHandleCallback.name
  );
  stravaOAuth2Handler = new StravaOAuth2Handler(
    STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET,
    PropertiesService.getUserProperties(),
    stravaHandleCallback.name,
    slackOAuth2Handler.authorizationUrl
  );
}

/**
 * Authorizes and makes a request to the Slack API.
 */
function doGet(request): HtmlOutput {
  initializeOAuth2Handler();

  // Clear authentication by accessing with the get parameter `?logout=true`
  if (request.parameter.logout) {
    slackOAuth2Handler.clearService();
    stravaOAuth2Handler.clearService();
    const template = HtmlService.createTemplate(
      'Logout<br /><a href="<?= requestUrl ?>" target="_blank">refresh</a>.'
    );
    template.requestUrl = slackOAuth2Handler.requestURL;
    return HtmlService.createHtmlOutput(template.evaluate());
  }

  if (!stravaOAuth2Handler.verifyAccessToken()) {
    const template = HtmlService.createTemplate(
      'RedirectUri:<?= redirectUrl ?> <br /><a href="<?= authorizationUrl ?>" target="_blank">Authorize Strava</a>.'
    );
    template.authorizationUrl = stravaOAuth2Handler.authorizationUrl;
    template.redirectUrl = stravaOAuth2Handler.redirectUri;
    return HtmlService.createHtmlOutput(template.evaluate());
  }
  if (!slackOAuth2Handler.verifyAccessToken()) {
    const template = HtmlService.createTemplate(
      'RedirectUri:<?= redirectUrl ?> <br /><a href="<?= authorizationUrl ?>" target="_blank">Authorize Slack</a>.'
    );
    template.authorizationUrl = slackOAuth2Handler.authorizationUrl;
    template.redirectUrl = slackOAuth2Handler.redirectUri;
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
  event.links.forEach(link => {
    new JobBroker().enqueue(chatUnfurl, {
      channel: event.channel,
      message_ts: event.message_ts,
      url: link.url
    });
  });
};

const chatUnfurl = (): void => {
  initializeOAuth2Handler();
  const client = new SlackApiClient(slackOAuth2Handler.access_token);

  const jobBroker: JobBroker = new JobBroker();
  jobBroker.consumeJob(
    (parameter: { channel: string; message_ts: string; url: string }) => {
      client.chatUnfurl(
        parameter.channel,
        parameter.message_ts,
        createUnfurls(parameter.url)
      );
    }
  );
};

function createUnfurls(url: string): {} {
  const unfurls = {};
  const client = new StravaApiClient(stravaOAuth2Handler.access_token);
  const activityId = getActivityId(url);

  if (activityId) {
    unfurls[url] = createStravaBlocks(client.getActivityById(activityId));
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

function createStravaBlocks(detail: DetailedActivity): {} {
  const { firstname, lastname } = stravaOAuth2Handler.token.athlete;

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<https://www.strava.com/activities/${detail.id}|${detail.name}> via @ <https://www.strava.com/athletes/${detail.athlete.id}|${firstname} ${lastname}>`
        },
        fields: [
          {
            type: "mrkdwn",
            text: "*Type*"
          },
          {
            type: "mrkdwn",
            text: "*Distance*"
          },
          {
            type: "plain_text",
            text: detail.type
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
            type: "mrkdwn",
            text: "*Total elevation gain*"
          },
          {
            type: "plain_text",
            text: convertTimeUnit(detail.moving_time)
          },
          {
            type: "plain_text",
            text: `${detail.total_elevation_gain} m`
          }
        ],
        accessory: {
          type: "image",
          image_url: detail.photos.primary.urls["100"],
          alt_text: "primary-photos"
        }
      }
    ]
  };
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

export {
  initializeOAuth2Handler,
  executeLinkSharedEvent,
  createUnfurls,
  getActivityId
};
