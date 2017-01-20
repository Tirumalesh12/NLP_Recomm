var restify = require('restify');
var builder = require('botbuilder');
var session = require('client-sessions');
var https = require('https');

var data = "";

choose_cat = function(gender, type){
	console.log(gender);
	console.log(type);
	    if (gender == "Women" && type == "Atheletic"){
		    category = "5438_1045804_1045806_1228540"
        }else if (gender == "Women" && type == "Casual"){
            category = "5438_1045804_1045806_1228545"
        }else if (gender == "Women" && type == "Formal"){
            category = "5438_1045804_1045806_1228546"
        }else if (gender == "Women" && type == ""){
            category = "5438_1045804_1045806"
        }else if (gender == "Men" && type == "Atheletic"){
            category = "5438_1045804_1045807_1228548"
        }else if (gender == "Men" && type == "Casual"){
            category = "5438_1045804_1045807_1228552"
        }else if (gender == "Men" && type == "Formal"){
            category = "5438_1045804_1045807_1228553"
        }else if (gender == "Men" && type == ""){
            category = "5438_1045804_1045807"
        }else{
		    category = "5438_1045804"}
	return category;
}

capitalize = function(str) {
	if (str != null && str.length > 0 && (str.charAt(str.length-1)=='s')||(str.charAt(str.length-1)=='S')){
	str = str.substring(0, str.length-1);
	}
    str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	return str;
}

var search = session.search;


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
	search = {
		shoe: shoe ? shoe.entity : "",
		gender: gender ? capitalize(gender.entity) : "",
		brand: brand ? capitalize(brand.entity) : "",
		color: color ? capitalize(color.entity) : "",
		type: type ? capitalize(type.entity) : "",
		size: size ? size.entity : "",
		data: "",
		category: ""
		}
	search.category = choose_cat(search.gender,search.type);
	session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',search.brand,search.type,search.color,search.shoe,search.gender,search.size);		
    
	 callingApi = function(callback){
	     var options = {
            host: 'api.walmartlabs.com',
            path: "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ search.category +"&facet=on&facet.filter=gender:"+ search.gender +"&facet.filter=color:"+ search.color +"&facet.filter=brand:"+ search.brand +"&facet.filter=shoe_size:"+ search.size +"&format=json&start=1&numItems=10", 
            method: 'GET'   
         };
         //this is the call
         var request = https.get(options, function(res){
            var body = "";
            res.on('data', function(data1) {
               body += data1;
            });
            res.on('end', function() {
               callback(JSON.parse(body));
            })
            res.on('error', function(e) {
               console.log("Got error: " + e.message);
            });
	      }).end();
     }
    callingApi(function(data){
	console.log(data);
	//session.send(data.items[0].name);
	});
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