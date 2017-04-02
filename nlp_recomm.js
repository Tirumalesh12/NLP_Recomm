var restify = require('restify');
var builder = require('botbuilder');
var http = require('http');
var sess = require('client-sessions')
sess.maincart = [];
sess.number = 0;

WishMe = function(){
	var currentTime = new Date();
	var currentOffset = currentTime.getTimezoneOffset();
	var ISTOffset = 330;   // IST offset UTC +5:30 
	var myDate = new Date(currentTime.getTime() + (ISTOffset + currentOffset)*60000);
    if (myDate.getHours()>4 && myDate.getHours() < 12 ){ 
    return "Good Morning!"
	} else if (myDate.getHours() >= 12 && myDate.getHours() < 16 ) { 
	return "Good Afternoon!"; 
	} else if ( myDate.getHours() >= 16 && myDate.getHours() <= 24 ) { 
	return "Good Evening!";
	}else {
		return "I guess it is very late now, Anyway"
	} 
};

weatherApi = function(place, callback){
    var options = {
		host: 'api.openweathermap.org',
		path: '/data/2.5/weather?q=' +place+ '&appid=13a673ce300c31edc72ac96ecbe062b4',
		method: 'GET'
	};
        //this is the call
	var request = http.request(options, function(res){
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

callingApi = function(path, callback){
	console.log(path);
	var options = {
		host: 'api.walmartlabs.com',
		path: path,
		method: 'GET'
	};
        //this is the call
	var request = http.request(options, function(res){
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

// Create bot and add dialogs
var connector = new builder.ChatConnector({appId:"c60ece39-e97b-4f50-ae77-d0ac24f07a4f", appPassword:"tYQdi0sEppKbFwaFUOOKbJ4"});
var bot = new builder.UniversalBot(connector);
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/7728bcc7-ea06-471d-b189-0c09e796dc66?subscription-key=a544e8e344c947bbb85eb434961aea87&verbose=true&q=');
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', dialog);

// Handling the Greeting intent. 
dialog.matches('Welcome', function (session, args, next) {
	console.log ('in welcome intent');	
	var username = session.message;
	session.send("Hello " +username.address.user.name+ ". " +WishMe());
	session.send("Can I help you in anything. Feel free to ask");
	session.userData.ocassion = "";
	session.endDialog();
})

dialog.matches('Vacation', function (session, args, next) {
	console.log ('in vacation intent ');
	var vacation = builder.EntityRecognizer.findEntity(args.entities, 'Vacation');
	var place = builder.EntityRecognizer.findEntity(args.entities, 'Vacation::country'); 
	session.userData = {
		vacation: vacation ? vacation.entity : "",
		place: place ? place.entity : "",
		ocassion: "vacation"
    };
	if(session.userData.vacation == ""){
	if(session.userData.place != ""){ session.userData.vacation = "vacation"; }}
	if(session.userData.place == ""){
		session.beginDialog("/Ask Place");
	}else {
			session.send(session.userData.place + " is a beautiful place to go for a " +session.userData.vacation+ ".");
			session.beginDialog("/RecommendVac");
	}	
})
 
dialog.matches('Office', function (session, args, next) {
	console.log ('in office intent ');
	var office = builder.EntityRecognizer.findEntity(args.entities, 'Office');
	var place = builder.EntityRecognizer.findEntity(args.entities, 'Vacation::country'); 
	session.userData = {
		office: office ? office.entity : "",
		place: place ? place.entity : "",
		ocassion: "office"
    };
	session.send("Cool, Dressing professionally is vital for success in an office. We will help you look formal in your " +session.userData.office+".");
	session.beginDialog("/Recommend");
})

dialog.matches('Sports', function (session, args, next) {
	console.log ('in sports intent ');
	var sports = builder.EntityRecognizer.findEntity(args.entities, 'Sports');
	var game = builder.EntityRecognizer.findEntity(args.entities, 'Sports::Games'); 
	session.userData = {
		sports: sports ? sports.entity : "",
		game: game ? game.entity : "",
		ocassion: "sports"
    };
	if(session.userData.sports == ""){
	if(session.userData.game != ""){ session.userData.sports = "sports"; }}
	if(session.userData.game == ""){
		session.beginDialog("/Ask Game");
	}
	session.send("Best of luck for the coming competiton. We know what are the required things for the "+session.userData.game+" competition.");
	session.beginDialog("/Recommend");
})

dialog.matches('Gym', function (session, args, next) {
	console.log ('in gym intent ');
	var gym = builder.EntityRecognizer.findEntity(args.entities, 'Gym');
	session.userData = {
		gym: gym ? gym.entity : "",
		ocassion: "gym"
    };
	session.send(session.userData.gym+" is a must to live a healthy and a long life.");
	session.beginDialog("/Recommend");
})

bot.dialog('/Recommend', function (session, args) {
		console.log("in recommend dialog");
		session.send("Would you like me to recommend some necessary things you will be needing?")
		session.endDialog();
});

bot.dialog('/RecommendVac', function (session, args) {
		console.log("in recommend dialog");
		weatherApi(session.userData.place, function(weather){
			var temp = parseInt(parseInt(weather.main.temp_max)-273);
			if(temp<=20){
				session.userData.temp = "cold";
				session.send(session.userData.place+ " is a very cold place. At this time in the year, there the temperature will be usually near to "+(parseInt(temp/10))*10 +'\xB0C');
			    session.send("Would you like me to recommend some necessary things you will be needing?")
		    }else if(temp>=25){
				session.userData.temp = "hot";
				session.send(session.userData.place+ " is a hot place. At this time in the year, there the temperature will be usually near to "+((parseInt((temp/10))*10)+10) +'\xB0C');
			    session.send("Would you like me to recommend some necessary things you will be needing?")
		    }
			
	    });
		session.endDialog();
});

dialog.matches('Yes', function (session, args) {
	session.beginDialog('/' +session.userData.ocassion);
})

dialog.matches('No', function (session, args) {
	session.send('OK, What are you looking for?');
	session.endDialog();
})

bot.dialog('/Ask Place', function (session, args) {
		console.log("in Ask place dialog");
	    session.send("A "+session.userData.ocassion);
		session.send("That's nice. Where are you going to?");
		session.endDialog();
});

bot.dialog('/Ask Game', function (session, args) {
		console.log("in Ask game dialog");
		session.send("Which "+session.UserData.sports+" are you going to play?");
		session.endDialog();
});

bot.dialog('/vacation', function (session, args) {
	session.send("Make your vacation more memorable and safe by taking all the items that are shown below");
	if(session.userData.temp == "cold"){
		session.send("1. Base layer shirt with long-sleeves");
        session.send("2. Winter Coat/Jacket, should be water resistant");		
		session.send("3. Walking/Hiking Boots with Woollen Socks");   
		session.send("4. Other accessories like gloves, a scarf and a hat");
		if(session.userData.vacation == "treking"){session.send("5. A Treking shoe");}
		session.endDialog();
	}else if(session.userData.temp == "hot"){
		session.send("1. Sun Glasses"); 
		session.send("2. Dress/Running Shoes and Sandals"); 
		session.send("3. Sun Hat with light/thin Scarf"); 
		session.send("4. Other accessories like Sunscreen, Insulated Water Bottle, A towel and Light material clothes");
		session.endDialog();
	}
})

bot.dialog('/office', function (session, args) {
	if((session.userData.office == "office")||(session.userData.office =="work")){
		session.send("If your office does not have written dress code, 'Business Casuals' is a better option for work.  \nHave a look at these, just in case you might be needing");
		session.send("1.  Shirts that have collars");
		session.send("2. Dress pants/ Khakis/ Trousers"); 
		session.send("3. Dress shoes with dress socks"); 
		session.send("4. Pairing Sweater vest"); 
		session.send("5. Other accessories like tie, belt and a watch");
		session.endDialog();
	}else if(session.userData.office == "conference"){
		session.send("Firstly Verify whether or not the conference you attend has any guidelines for dress.  \nHere is the list of few things we are thinking that you might need.");
		session.send("1. Blazer / Sports Jacket");
		session.send("2. Dress Pants / Khakis"); 
		session.send("3. Collared shirt or Polo shirt"); 
		session.send("4. Dress Shoes with matching socks"); 
		session.send("5. Other accessories like tie, belt and a watch");
		session.endDialog();
	}
})

bot.dialog('/sports', function (session, args) {
	if((session.userData.office == "office")||(session.userData.office =="work")){
		session.send("If your office does not have written dress code, 'Business Casuals' is a better option for work.  \nHave a look at these, just in case you might be needing");
		session.send("1.  Shirts that have collars");
		session.send("2. Dress pants/ Khakis/ Trousers"); 
		session.send("3. Dress shoes with dress socks"); 
		session.send("4. Pairing Sweater vest"); 
		session.send("5. Other accessories like tie, belt and a watch");
		session.endDialog();
	}else if(session.userData.office == "conference"){
		session.send("Firstly Verify whether or not the conference you attend has any guidelines for dress.  \nHere is the list of few things we are thinking that you might need.");
		session.send("1. Blazer / Sports Jacket");
		session.send("2. Dress Pants / Khakis"); 
		session.send("3. Collared shirt or Polo shirt"); 
		session.send("4. Dress Shoes with matching socks"); 
		session.send("5. Other accessories like tie, belt and a watch");
		session.endDialog();
	}
})

bot.dialog('/gym', function (session, args) {
	    session.send("“It’s dangerous to go alone! Take this.”");
		session.send("1. Light weight and supportive shoe and socks.  you may prefer lifting shoes to traditional cross-trainers or running shoes.");
		session.send("2. Some breathable, well-fitted clothing. Shorts and Tshirts"); 
		session.send("3. A gym bag"); 
		session.send("4. Music Headphones/ipod"); 
		session.send("5. Other accessories like water-bottle, Towel, Sweat bands etc., ");
		session.endDialog();
})

// Handling unrecognized conversations.
dialog.matches('None', function (session, args) {
	console.log ('in none intent');	
	session.send("I am sorry! I am a bot, perhaps not programmed to understand this command");
    session.endDialog();	
});

// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', connector.listen());
server.listen(process.env.port || 5000, function () {
    console.log('%s listening to %s', server.name, server.url); 
});