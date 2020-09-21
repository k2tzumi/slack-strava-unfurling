import { Slack } from "../src/slack/types/index.d";

const properites = {
    getProperty: jest.fn(function () {
        return 'dummy';
    }),
    deleteAllProperties: jest.fn(),
    deleteProperty: jest.fn(),
    getKeys: jest.fn(),
    getProperties: jest.fn(),
    setProperties: jest.fn(),
    setProperty: jest.fn()
};

PropertiesService['getScriptProperties'] = jest.fn(() => properites)
PropertiesService['getUserProperties'] = jest.fn(() => properites)
OAuth2['createService'] = jest.fn();

const response = {
    getResponseCode: jest.fn(function () {
        return 200;
    }),
    getContentText: jest.fn(function () {
        return JSON.stringify({ athlete: { id: 1 }, firstname: "taro", lastname: "momo", map: { summary_polyline: "yttxEm_{sYa@]S_@_@qAUg@s@eASo@Wk@o@I?CTKXe@Pq@P_@?GaAu@" }, photos: {} });
    }),
    getBlob: jest.fn(function () {
        return "";
    }),
}
UrlFetchApp['fetch'] = jest.fn(() => response);

const fileIteraater = {
    hasNext: jest.fn(function () {
        return false;
    }),
}
DriveApp['getFilesByName'] = jest.fn(() => fileIteraater);

const file = {
    setName: jest.fn(),
    setDescription: jest.fn(),
    setSharing: jest.fn(),
    getDownloadUrl: jest.fn(),
}
DriveApp['createFile'] = jest.fn(() => file);
DriveApp['Access'] = jest.fn();
DriveApp['Permission'] = jest.fn();
Utilities['jsonStringify'] = jest.fn();

import { createUnfurls, getActivityId } from "../src/Code";
import { StravaApiClient } from "../src/StravaApiClient";
describe('Code', () => {
    describe('createUnfurls', () => {
        it('success', () => {
            const url = "https://www.strava.com/activities/3749378828";
            const actual = createUnfurls(new StravaApiClient(''), url);

            expect(actual[url]).toHaveProperty('blocks');
        });
    });
    describe('getActivityId', () => {
        it('success', () => {
            const url = "https://www.strava.com/activities/3749378828";
            const actual = getActivityId(url);

            expect(actual).toEqual('3749378828');
        });
        it('not activities', () => {
            const url = "https://www.strava.com/athletes/12435819";
            const actual = getActivityId(url);

            expect(actual).toBeNull();
        });
    });
});
