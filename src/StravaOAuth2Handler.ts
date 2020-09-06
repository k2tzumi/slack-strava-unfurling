import * as OAuth2 from "apps-script-oauth2/src/OAuth2";
import {} from "apps-script-oauth2/src/Service";

type Properties = GoogleAppsScript.Properties.Properties;
type HtmlOutput = GoogleAppsScript.HTML.HtmlOutput;
type URLFetchRequestOptions = GoogleAppsScript.URL_Fetch.URLFetchRequestOptions;

interface OauthAccess {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: Athlete;
  granted_time: number;
}

interface Athlete {
  id: number;
  username: string;
  resource_state: number;
  firstname: string;
  lastname: string;
  city: string;
  state: string;
  country: string;
  sex: string;
  premium: boolean;
  summit: boolean;
  created_at: Date;
  updated_at: Date;
  badge_type_id: number;
  profile_medium: string;
  profile: string;
  friend: string;
  follower: string;
}

interface TokenPayload {
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  grant_type: string;
}

class StravaOAuth2Handler {
  public get token(): OauthAccess {
    return this.service.getToken(false);
  }

  public get access_token(): string {
    return this.service.getAccessToken();
  }

  public get authorizationUrl(): string {
    return this.service.getAuthorizationUrl({
      approval_prompt: "force",
      response_type: "code",
      state: "Strava"
    });
  }

  public get redirectUri(): string {
    return this.service.getRedirectUri();
  }

  public get requestURL() {
    const serviceURL = ScriptApp.getService().getUrl();
    return serviceURL.replace("/dev", "/exec");
  }

  public static readonly SCOPE =
    "read,read_all,profile:read_all,activity:read_all";

  private service: Service_;

  public constructor(
    private clientId: string,
    private clientSecret: string,
    private propertyStore: Properties,
    private callbackFunctionName: string,
    private nextOAuthURL: string = null
  ) {
    this.service = OAuth2.createService("Strava")
      .setAuthorizationBaseUrl("https://www.strava.com/oauth/authorize")
      .setTokenUrl("https://www.strava.com/oauth/token")
      .setTokenFormat(OAuth2.TOKEN_FORMAT.JSON)
      .setClientId(this.clientId)
      .setClientSecret(this.clientSecret)
      .setCallbackFunction(this.callbackFunctionName)
      .setRefreshUrl("https://www.strava.com/oauth/token")
      .setPropertyStore(this.propertyStore)
      .setScope(StravaOAuth2Handler.SCOPE)
      .setTokenPayloadHandler(this.tokenPayloadHandler);
  }

  /**
   * Handles the OAuth callback.
   */
  public authCallback(request): HtmlOutput {
    const authorized = this.service.handleCallback(request);
    if (authorized) {
      console.info(
        `authCallback authorized. token: ${JSON.stringify(this.token)}`
      );

      return this.createAuthenSuccessHtml();
    }

    return HtmlService.createHtmlOutput("Denied. You can close this tab.");
  }

  /**
   * Reset the authorization state, so that it can be re-tested.
   */
  public clearService() {
    this.deauthorization();
    this.service.reset();
  }

  public verifyAccessToken(): boolean {
    return this.service.hasAccess();
  }

  private deauthorization(): void {
    const formData = {
      access_token: this.access_token
    };

    const options: URLFetchRequestOptions = {
      contentType: "application/x-www-form-urlencoded",
      method: "post",
      muteHttpExceptions: true,
      payload: formData
    };

    const response = JSON.parse(
      UrlFetchApp.fetch(
        "https://www.strava.com/oauth/deauthorize",
        options
      ).getContentText()
    );

    if (response.errors) {
      console.warn(
        `Deauthorization error. response: ${JSON.stringify(
          response
        )}, payload: ${JSON.stringify(formData)}`
      );
    }
  }

  private tokenPayloadHandler = (tokenPayload: TokenPayload): {} => {
    console.info(`tokenPayloadHandler: ${JSON.stringify(tokenPayload)}`);
    delete tokenPayload.redirect_uri;

    return tokenPayload;
  };

  private createAuthenSuccessHtml(): HtmlOutput {
    if (this.nextOAuthURL) {
      const successMessage = `<script>window.top.location.href='${this.nextOAuthURL}';</script>`;

      const template = HtmlService.createTemplate(successMessage);
      return HtmlService.createHtmlOutput(template.evaluate());
    } else {
      const successMessage = `Success!<br />`;

      const template = HtmlService.createTemplate(successMessage);
      return HtmlService.createHtmlOutput(template.evaluate());
    }
  }
}

export { StravaOAuth2Handler };
