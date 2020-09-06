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

import { initializeOAuth2Handler, createUnfurls, getActivityId } from "../src/Code";
describe('Code', () => {
    describe('createUnfurls', () => {
        initializeOAuth2Handler();
        it('success', () => {
            const url = "https://www.strava.com/activities/3749378828";
            const actual = createUnfurls(url);

            expect(actual).toHaveProperty('id', '3749378828');
            expect(actual).toHaveProperty(url);
            expect(actual[url][0]).toHaveProperty('section');
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
