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
  	let channelMembers = channel.members.map((id) => {return slack.dataStore.getUserById(id);});

  	channelMembers = channelMembers.filter((member) => {return !member.is_bot;});

  	let memberNames = channelMembers.map((member) => {return member.name;}).join(', ');
  	console.log('Members of this channel: ', memberNames);
  	slack.sendMessage('Hello '+memberNames+ '!', channel.id);
  });
});


slack.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
	console.log('Logged in as '+ rtmStartData.self.name + ' of team ' 
		+ rtmStartData.team.name + ' but not yet connected to a channel!');
});

slack.on(RTM_EVENTS.MESSAGE, function(message) {
	let messageSender = slack.dataStore.getUserById(message.user);

	if(messageSender && messageSender.is_bot){
		return;
	}

	let channel = slack.dataStore.getChannelGroupOrDMById(message.channel);

	if(message.text) {
		let msgText = message.text.toLowerCase();
		if(/(hello|hi|hey) (bot|sridharbot)/g.test(msgText)) {
			slack.sendMessage('Hello to you too, '+messageSender.name +'!', channel.id);
		}
		if(/uptime/g.test(msgText)){
			if(!messageSender.is_admin){
				slack.sendMessage('Sorry ' + messageSender.name + '! This command is only for admin users!', channel.id);
				return;
			}
			let dm = slack.dataStore.getDMByName(messageSender.name);
			let uptime = process.uptime();
			console.log(uptime);
			let minutes = parseInt(uptime/60, 10),
				hours = parseInt(minutes/60, 10),
				seconds = parseInt(uptime - (minutes * 60) - ((hours*60)*60), 10);
			slack.sendMessage('I have been running for: ' + hours +' hours, ' + minutes + ' minutes, ' + seconds +' seconds!', dm.id);
		}
	}
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