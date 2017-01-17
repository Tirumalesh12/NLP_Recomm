var restify = require('restify');
var builder = require('botbuilder');

// Create bot and add dialogs
var bot = new builder.BotConnectorBot({ appId: 'aae0da7b-0f18-40ec-aab4-0646b6500a24', appSecret: 'EeaYHcv2OWrhDcn87pedTCR' });

var recognizer = new builder.LuisRecognizer('https://api.projectoxford.ai/luis/v2.0/apps/c592677c-d9ec-435d-bada-77008d9fc147?subscription-key=412111898d6f49a0b22467676f123ecb&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.add('/', dialog);

// Handling the Greeting intent. 
dialog.matches('ShoeSearch', function (session, args, next) {
	console.log ('in shoesearch intent ');
	 var shoe = builder.EntityRecognizer.findEntity(args.entities, 'Shoe');
	 var gender = builder.EntityRecognizer.findEntity(args.entities, 'Gender');
	 var brand = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_brand');
	 var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	 var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	 var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	 
	 var sessionsearch = session.dialogData.search = {
		 shoe: shoe ? shoe.entity : null,
		 gender: gender ? gender.entity : null,
		 brand: brand ? brand.entity : null,
		 color: color ? color.entity : null,
		 type: type ? type.entity : null,
		 size: size ? size.entity : null
	 }
	session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',brand.entity,type.entity,color.entity,shoe.entity,gender.entity,size.entity);		
});

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");			
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 5001, function () {
    console.log('%s listening to %s', server.name, server.url); 
});