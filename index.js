'use strict';

const RtmClient = require('@slack/client').RtmClient;
const MemoryDataStore = require('@slack/client').MemoryDataStore;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

const token = process.env.SLACK_API_TOKEN;
console.log(process.env.SLACK_API_TOKEN);

let slack = new RtmClient(token, {
  logLevel: 'error', 
  dataStore: new MemoryDataStore(),
  autoReconnect: true,
  autoMark: true 
});

slack.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function() {
  let user = slack.dataStore.getUserById(slack.activeUserId);
  let team = slack.dataStore.getTeamById(slack.activeTeamId);
  console.log('Connected to '+ team.name +' as '+ user.name);
});

// Start the login process
slack.start();