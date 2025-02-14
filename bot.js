//
// todo:
// slash commands? or mentions?
// - help - list commands and their descriptions
// - invite - DM the user with an invite? or post as a response
// light database to store catchfixes per server
// - catchfix - sets the server's catchfix

const {token, HOMEGUILD, HOMECATCHFIX, GLOBALPREFIX, HINTSTART, INVITEURL, POKETWO_ID, DEBUG} = require("./config.json");
const {POKEMONLIST} = require("./pokemon.json")

const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES] });

const underscore = /(\\_|_)/g

client.on('messageCreate', async message => {
	if ( message.author.id == POKETWO_ID || DEBUG) {
		if ( message.content.startsWith(HINTSTART) ) {
			var texts = check(message.content.substring(15,message.content.length-1),message.guild.id)
			texts.forEach(text => {message.channel.send(text)})
			}
		}
	let args;
	if (message.guild) {
		if (!message.content.startsWith(GLOBALPREFIX)) { return; }
		args = message.content.slice(GLOBALPREFIX.length).trim().split(/\s+/);
	} else {
		const slice = message.content.startsWith(GLOBALPREFIX) ? GLOBALPREFIX.length : 0;
		args = message.content.slice(slice).split(/\s+/);
	}

	const command = args.shift().toLowerCase();
	if(command === "ping")	{
		message.channel.send(`${client.ws.ping}ms.`);
		console.log(`pinged! ${client.ws.ping}ms`);
	} else if (command === "help") {
		message.channel.send(`The bot will automatically respond to poketwo's messages that start with the hint message ("The pokémon is" by default).\n
Commands: help, invite, ping, solve\n
Source: <https://github.com/Tsunder/pokecord-hint-solver>`)
	} else if (command === "invite") {
		message.channel.send("Invite me to your server!\n" +
			INVITEURL)
	} else if (command === "solve") {
		var texts = check(args.join(" "), message.guild.id)
		texts.forEach(text => {message.channel.send(text)})
	}
});

client.once( 'ready', () => { //run getpage on a timed loop, if fail then logirthimically increase duration between checking
	console.log("poke hint solver bot ready");
});

//returns an array of string
function check (texto,guildId) {
	//replacing _ for regex
	texto = texto.toLowerCase();
	var text = texto.replace(underscore,".")
	var reg = new RegExp(text)
	var validmons = POKEMONLIST[text.length].filter((mon) => {return mon.match(reg)})
	if (validmons.length == 0) {
		if (text.length > 14) {
			text = texto.substr(texto.lastIndexOf(" ")+1)
		}
		reg = new RegExp(text.replace(underscore,"."))
		validmons = POKEMONLIST[text.length].filter((mon) => {return mon.match(reg)})
		if (validmons.length == 0) {
			text = text.substring(0,text.length-1);
			reg = new RegExp(text.replace(underscore,"."))
			validmons = POKEMONLIST[text.length].filter((mon) => {return mon.match(reg)})
		}
	}
	
	var response = []
	if (validmons.length == 0) {
		response.push("No matches found!")
		console.log(`No matches found for: ${texto}`)
		return response
	}
	var joiner = guildId == HOMEGUILD ? `${HOMECATCHFIX} `:``;
	var out = validmons.slice(0,4)

	out.forEach(line => {response.push(`${joiner}${line}`)})
	if (validmons.length > 4) {
		response.push(`Showing first 4/${validmons.length} matches.`)
	}
	if (response.length == 0) {
		response.push("Error'd really badly.")
	}
	return response
}

client.login(token)