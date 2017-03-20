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
	} else if (myDate.getHours() >= 12 && myDate.getHours() <= 17 ) { 
	return "Good Afternoon!"; 
	} else if ( myDate.getHours() > 17 && myDate.getHours() <= 24 ) { 
	return "Good Evening!";
	}else {
		return "I guess it is very late now, Anyway"
	} 
};

promptThis = function(session){ 
        if(session.userData.gender==""){
			builder.Prompts.choice(session, "Please select the gender.",['Men','Women']);
		}else if(session.userData.type==""){
			builder.Prompts.choice(session, "Please select the type of shoe.",['Dress','Casual','Athletic']);
		}else if(session.userData.brand==""){
			session.beginDialog('/Brand');
		}else if(session.userData.color==""){
			builder.Prompts.choice(session, "Please select the color.",session.userData.colors);
		}else if(session.userData.size==""){
			builder.Prompts.choice(session, "Please select the size.",session.userData.sizes);
		}
}

deleteSpace = function(string){
	var i = 1;
	while(i>0){
    i = string.indexOf(' ');
    if(i>0){
    string = string.substring(0, i) + string.substring(i+1, string.length);
    }
	}
	return string
}

removeSpace = function(string){
    var i = string.indexOf(' ');
    if(i>0){
    string = string.substring(0, i) + "%20" + string.substring(i+1, string.length);
    }
    var j = string.indexOf('\'');
	if(j>0){
		string = string.substring(0, j) + "%27" + string.substring(j+1, string.length);
	}
    return string;
}

choose_cat = function(gender, type){
	    if (gender == "Women" && type == "Athletic"){
		    category = "5438_1045804_1045806_1228540"
	    }else if (gender == "Women" && type == "Casual"){
		    category = "5438_1045804_1045806_1228545"
	    }else if (gender == "Women" && ((type == "Formal")||(type == "Dress"))){
		    category = "5438_1045804_1045806_1228546"
	    }else if (gender == "Women" && type == ""){
		    category = "5438_1045804_1045806"
	    }else if (gender == "Men" && type == "Athletic"){
		    category = "5438_1045804_1045807_1228548"
	    }else if (gender == "Men" &&  type == "Casual"){
		    category = "5438_1045804_1045807_1228552"
	    }else if (gender == "Men" && ((type == "Formal")||(type == "Dress"))){
		    category = "5438_1045804_1045807_1228553"
	    }else if (gender == "Men" && type == ""){
		    category = "5438_1045804_1045807"
	    }else{
		    category = "5438_1045804"}
	return category;
}

capitalize = function(str) {
    if(str != "dress"){
	if (str !== null && str.length > 0 && (str.charAt(str.length-1)=='s')||(str.charAt(str.length-1)=='S')){
	str = str.substring(0, str.length-1);
	}}
	str = str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
	return str;
}

addCart = function(session, data){	
    session.userData.remove = sess.number + "removeitem" ;
	sess.maincart[sess.number] = { "title"    : data.name,
					               "subtitle" : data.salePrice + '$',
					               "image_url": data.thumbnailImage ,
								   "buttons":[
                                             {
                                                "type":"postback",
												"payload": data.salePrice + "removeitem",
                                                "title":"Remove item"
                                             }  ]
	               }
  	session.userData.cartItem = sess.maincart;
	sess.number += 1;
	
	session.send("item added to cart");
}

showItem = function(session, data){
	session.send("Sure, Have a look here");
	var item = new builder.Message(session)
				.attachments([
				new builder.HeroCard(session)
		               .title(data.name)
					   .subtitle(data.salePrice + '$' )
				       .images([
					      builder.CardImage.create(session, data.largeImage),
				         ])
				       .buttons([
					       builder.CardAction.postBack(session, "additem "+ parseInt(data.itemId) +" to cart","Add to Cart"),
						   builder.CardAction.postBack(session, "Show more", "Show more"),
						])
				       ]);
	session.send(item);
}

showoutput = function(session,data){
	session.sendTyping();
	var i=0;
	var card = [];
	if(!data.items){
		session.send("Try another search. No product exists.")
		session.endDialog();
	}else{
		while(data.items[i]){
		card[i] =  new builder.HeroCard(session)
		               .title(data.items[i].name)
					   .subtitle(data.items[i].salePrice + '$')
				       .images([
					       builder.CardImage.create(session, data.items[i].thumbnailImage) 
				       ])
				       .buttons([
					       builder.CardAction.postBack(session, "showitem  "+ parseInt(data.items[i].itemId),"Show item"),
				       ])
				i++;
				}
		if(data.items[9] !== undefined){	
		card[i] = new builder.HeroCard(session)
                      .subtitle('Want to see Similar kind of shoes? Click below')
                      .buttons([
					       builder.CardAction.imBack(session, "Show more", "Show more"),
				       ])
		}
		session.userData.colors = colorsArray(session, data);
		session.userData.brands = brandsArray(session, data);
		session.userData.sizes = sizesArray(session, data);
		var msg = new builder.Message(session)
				.attachmentLayout(builder.AttachmentLayout.carousel)
				.attachments(card);
				session.send(msg);
	}			
}

brandsArray = function(session,data){
    brands = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "brand"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			brands[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	brands.push("Any Brand");
	return brands;
}

sizesArray = function(session,data){
    sizes = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "shoe_size"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			sizes[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	sizes.push("Any Size");
	return sizes;
}

colorsArray = function(session,data){
    colors = [];	
	var j=0;
	var k=0;
	while(data.facets[j]){
	if(data.facets[j].name == "color"){
		while((data.facets[j].facetValues[k])&&(k<9)){
			colors[k] = data.facets[j].facetValues[k].name;
			k++;						
			}
		break;
	}
	j++;
	}
	colors.push("Any Color");
	return colors;
}

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
	console.log ('in ocassion intent ');
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
 
bot.dialog('/Ask Place', function (session, args) {
		console.log("in Ask place dialog");
	    session.send(session.userData.ocassion);
		session.send("That's nice. Where are you going to?");
		session.endDialog();
});

dialog.matches('Office', function (session, args, next) {
	console.log ('in ocassion intent ');
	var office = builder.EntityRecognizer.findEntity(args.entities, 'office');
	var place = builder.EntityRecognizer.findEntity(args.entities, 'Vacation::country'); 
	session.userData = {
		office: office ? office.entity : "",
		place: place ? place.entity : "",
		ocassion: "office"
    };
	session.send("Then You should look formal in your " +session.userData.office+".");
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

bot.dialog('/vacation', function (session, args) {
	if(session.userData.temp == "cold"){
		session.send("1. Base layer shirt with long-sleeves,");
		session.send("2. Woollen Socks,"); 
		session.send("3. Boots,"); 
		session.send("4. Winter Coat/Jacket,"); 
		session.send("5. Other accessories like gloves, a scarf and a hat");
		if(session.userData.vacation == "treking"){session.send("6. Treking shoe");}
		session.endDialog();
	}else if(session.userData.temp == "hot"){
		session.send("1. Sun Glasses,");
		session.send("2. Light and thin Scarf,"); 
		session.send("3. Sun Hat,"); 
		session.send("4. Dress/Running Shoes and Sandals,"); 
		session.send("5. Other accessories like Sunscreen, Insulated Water Bottle, Light material clothes");
		session.endDialog();
	}
})

bot.dialog('/office', function (session, args) {
	if(session.userData.office == "office"||"work"){
		session.send("1. Base layer shirt with long-sleeves,");
		session.send("2. Woollen Socks,"); 
		session.send("3. Boots,"); 
		session.send("4. Winter Coat/Jacket,"); 
		session.send("5. Other accessories like gloves, a scarf and a hat");
		if(session.userData.vacation == "treking"){session.send("6. Treking shoe");}
		session.endDialog();
	}else if(session.userData.temp == "hot"){
		session.send("1. Sun Glasses,");
		session.send("2. Light and thin Scarf,"); 
		session.send("3. Sun Hat,"); 
		session.send("4. Dress/Running Shoes and Sandals,"); 
		session.send("5. Other accessories like Sunscreen, Insulated Water Bottle, Light material clothes");
		session.endDialog();
	}
})


dialog.matches('Type', function (session, args) {
	var type = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_type');
	session.userData.type = type ? capitalize(type.entity) : "",
	session.userData.page = 0;
	session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	promptThis(session);
	if(session.userData.brand != ""){
		session.endDialog();
	}
	})
})

dialog.matches('Color', function (session, args, results) {
	console.log("in color intent");
	var color = builder.EntityRecognizer.findEntity(args.entities, 'Color');
	session.userData.color = color ? capitalize(color.entity) : "";
	session.userData.page = 0;
	session.send("Cool. You have got a good taste.")
	if(session.userData.color == "Any"){
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}else {
	        session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	promptThis(session);
	    session.endDialog();
	})
})

dialog.matches('Size', function (session, args, results) {
	console.log("in size intent");
	var size = builder.EntityRecognizer.findEntity(args.entities, 'Shoe::Shoe_size');
	session.userData.size = size ? deleteSpace(size.entity) : "";
	session.userData.page = 0;
	session.send("Wow, Let me see what we have got");
	if(session.userData.size == "any"){
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=1&numItems=10";
	}else {
	        session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=1&numItems=10";
	}
	callingApi(session.userData.path, function(data){	
	showoutput(session,data);
	if(!data.items){
		session.endDialog();
	}else if(data.items[9] === undefined){
		session.send("End of Results");
		session.endDialog();
			    }
	promptThis(session);
	session.endDialog();
	})
})

dialog.matches('Show Item', function (session, args, results) {
	console.log("in show item intent");
	var itemId = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	session.userData.itemId = itemId ? itemId.entity : "";
	session.userData.path = "/v1/items/" + session.userData.itemId + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
	callingApi(session.userData.path, function(data){	
	showItem(session,data);
	if(session.userData.cartItem !== undefined){
	sess.maincart = session.userData.cartItem ;
	sess.number = session.userData.cartItem.length;
	}
	session.endDialog();
	})
})

dialog.matches('Add Cart', function (session, args, results) {
	console.log("in add cart intent");
	session.send("in add cart intent");
	var itemId = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	session.userData.itemId = itemId ? itemId.entity : "";
	session.userData.path = "/v1/items/" + session.userData.itemId + "?apiKey=ve94zk6wmtmkawhde7kvw9b3&format=json"
	if(session.userData.cartItem.length > 4){
		session.send("Maximum 4 items can be added in cart once");
		builder.Prompts.choice(session, "Check your cart",['showcart']);
		session.endDailog();
	}else {
		callingApi(session.userData.path, function(data){	
		addCart(session,data);
		builder.Prompts.choice(session, "Check your cart",['showcart']);
		session.endDialog();
		})
	}
})

dialog.matches('Show Cart', function (session, args, results) {
	console.log("in show cart intent");
	session.send("in show cart intent");
	if(session.userData.cartItem.length === 0){
		session.userData.cartItem = sess.maincart;
	}
	var tax = 0, total = 0, shipping = 0, subtotal = 0, i = 0;
	var str = "";
	while(session.userData.cartItem[i]){
		str = session.userData.cartItem[i].subtitle;
		str = str.substring(0, str.length-1);
		subtotal += parseInt(str);
		i++;
	}
	if(subtotal <= 35){
		shipping = 5.99;
	}
	tax = (0.085 * subtotal);
	total = (subtotal+tax+shipping);
	session.userData = {
		subtotal: subtotal,
		shipping: shipping,
		tax: tax,
		total: total
	}
	session.userData.cartItem[session.userData.cartItem.length] = { "title"    : "Total: " +total.toString()+ "$",
					                                                "subtitle" : "subtotal: " +subtotal.toString()+ "$ /r/n shipping: " +shipping.toString()+ "$ /r/n tax: " +tax.toString()+ "$",
	                                                              }
	if(session.userData.cartItem.length == 1) { 
		var message = new builder.Message(session)
		             .attachments([
				      new builder.HeroCard(session)
		                 .title("Your shopping cart is empty")
					     .buttons([
					         builder.CardAction.postBack(session, "Hii","Continue shopping")
						  ])
					])
     	session.send(message);					
	}else if(session.userData.cartItem.length == 2){
		var message = new builder.Message(session)
                      .sourceEvent({
				        facebook: {
                          "attachment":{
                             "type":"template",
                             "payload":{
                                "template_type":"generic",
                                "elements":JSON.stringify(session.userData.cartItem, null, 4)
					         }
				         }
			          }
			       })
	    var message2 = new builder.Message(session)
		               .attachments([
				        new builder.HeroCard(session)
						  .subtitle("Click on the buy button to buy thos item")
						  .buttons([
					         builder.CardAction.postBack(session, "Check out","Check out"),
						   ])
					   ])
	    session.send(message);
		session.send(message2);
	}else {
	    var message = new builder.Message(session)
                      .sourceEvent({
				        facebook: {
                          "attachment":{
                             "type":"template",
                             "payload":{
                                "template_type":"list",
								 "top_element_style": "compact",
                                "elements":JSON.stringify(session.userData.cartItem, null, 4),
								"buttons": [
                                               {
                                                "type":"postback",
                                                "title":"Check out all items",
                                                "payload":"Check out"
                                             } 
                                ]  
					         }
				         }
			          }
			       })
		session.send(message);
    }
    session.userData.cartItem.splice(-1,1);	
	session.endDialog();
})

dialog.matches('Remove Cart', function (session, args, results) {
	console.log("in remove item cart intent");
	session.send("in remove cart intent");
	var num = builder.EntityRecognizer.findEntity(args.entities, 'builtin.number');
	var arrayNum = num ? num.entity : "";
	var i = 0;
	if(session.userData.cartItem[0] == null){
		session.send("No item in your cart");
	}else{
        while(session.userData.cartItem){
			if(session.userData.cartItem[i].subtitle == (arrayNum+'$')){
				console.log("iffff");
				session.userData.cartItem.splice(i,1);
				sess.maincart.splice(i,1);
				sess.number -= 1;
				session.send("Item removed");
	            builder.Prompts.choice(session, "Check our cart.",['showcart']);
				break;
			}
			i++;
		}
	}
	session.endDialog();
})
	
dialog.matches('Show more', function (session, args) {
	session.userData.page += 1;
	session.send("Of course, These are some more similar kind of shoes");
	        if(session.userData.size == "any"){
				if(session.userData.color == "any"){
					session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=" +session.userData.page+ "1&numItems=10";
			    }else {
			          session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:&format=json&start=" +session.userData.page+ "1&numItems=10";
			    }
			}else if(session.userData.color == "any"){
					session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start=" +session.userData.page+ "1&numItems=10";
			}else {
			session.userData.path = "/v1/search?apiKey=ve94zk6wmtmkawhde7kvw9b3&query=shoes&categoryId="+ choose_cat(session.userData.gender,session.userData.type) +"&facet=on&facet.filter=gender:"+ session.userData.gender +"&facet.filter=color:"+ session.userData.color +"&facet.filter=brand:"+ session.userData.brand +"&facet.filter=shoe_size:"+ session.userData.size +"&format=json&start="+ session.userData.page +"1&numItems=10";
			}
			callingApi(session.userData.path, function(data){
				showoutput(session,data);
				if(!data.items){
		            session.endDialog();
	            }else if(data.items[9] === undefined){
					session.send("End of Results");
					session.endDialog();
			    }
				promptThis(session);
				session.endDialog();
			})
})

// Handling Greeting intent.
dialog.matches('Greeting', function (session, args) {
	console.log ('in greeting intent');	
	if(session.userData.cartItem !== undefined){
	sess.maincart = session.userData.cartItem ;
	sess.number = session.userData.cartItem.length;
	}
	session.send("Greetings, Welcome to the Walmart Digital Shoe Bot!!!");
    session.send("What are you looking for today?");
	session.userData = {
		shoe:  "",
		gender:"",
		brand: "",
		color: "",
		type:  "",
		size:  "",
		path:  "",
		num:   0,
		subtotal: 0,
		shipping: 0,
		tax: 0,
		total: 0,
		brands: [],
		colors: [],
		sizes: [],
		cartItem: []
	};
	session.endDialog();
});

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