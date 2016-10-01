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

  let botChannels = getBotChannels(slack.dataStore.channels);

  let channelNames = botChannels.map((channel) => {return channel.name;}).join(', ');
  console.log('The bot is currently a member of: ' +channelNames);

  botChannels.forEach((channel) => {
  	let channelMembers = channel.members.map((id) => {return slack.dataStore.getUserById(id);})
  	let memberNames = channelMembers.map((member) => {return member.name;}).join(', ');
  	console.log('Members of this channel: ', memberNames);})  
});

// Start the login process
slack.start();

function getBotChannels(allChannels){
	let botChannels = [];
	for (let channel_id in allChannels){
		let channel = allChannels[channel_id];
		if(channel.is_member){
			botChannels.push(channel);
		}
	}
	return botChannels;
}