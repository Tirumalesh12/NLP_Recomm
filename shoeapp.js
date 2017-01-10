var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: '0ff6befd-526d-4bd1-a8d4-ba2351d4fabe', appSecret: 'jGuCQczXEi34Pb51DwdLpMy' });

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/56cb79d3-1f50-45fe-bee6-a7820ffe67ff?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.add('/', dialog);

// Handling the Greeting intent. 
dialog.matches('ShoeSearch', function (session, args, next) {
	console.log ('in shoesearch intent ');
	 var shoe = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
	 var gender = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
	 var brand = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
	 var color = builder.EntityRecognizer.findEntity(args.entities, 'builtin.alarm.title');
	session.send('Hello there! I am the shoe search bot. I can notify about the urgent orders');		
});

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");			
});