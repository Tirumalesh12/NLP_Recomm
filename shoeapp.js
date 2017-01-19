var restify = require('restify');
var builder = require('botbuilder');
var session = require('client-sessions');

var category = ""; 
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
	 gender.entity = capitalize(gender.entity);
	 color.entity = capitalize(color.entity);
	 type.entity = capitalize(type.entity);
	 search = {
		 shoe: shoe ? shoe.entity : "",
		 gender: gender ? gender.entity : "",
		 brand: brand ? brand.entity : "",
		 color: color ? color.entity : "",
		 type: type ? type.entity : "",
		 size: size ? size.entity : "",
		 data: data ? data : "",
		 category: category ? choose_cat(gender.entity,type.entity) : choose_cat(gender.entity,type.entity)
	 }
	 callingApi = function(path1){
	     var options = {
            host: 'api.walmartlabs.com',
            path: path1, 
            method: 'GET'   
         };
         //this is the call
         var request = http.get(options, function(res){
            var body = "";
            res.on('data', function(data1) {
               body += data1;
            });
            res.on('end', function() {
               search.data = JSON.parse(body);
            })
            res.on('error', function(e) {
               console.log("Got error: " + e.message);
            });
	      }).end();
     }
	session.send(search.category);
	session.send('Hello there! I am the shoe search bot. You are looking for %s %s %s %s for %s of size %s',search.brand,search.type,search.color,search.shoe,search.gender,search.size);		
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