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

client.on('messageCreate', async message => {
	if ( message.author.id == POKETWO_ID || DEBUG) {
		if ( message.content.startsWith(HINTSTART) ) {
			var text = check(message.content,message.guild.id)
			message.channel.send(text)
			}
		}
	let args;
	if (message.guild) {
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
Commands: help, ping, invite\n
Source: <https://github.com/Tsunder/pokecord-hint-solver>`)
	} else if (command === "invite") {
		message.channel.send("Invite me to your server!\n" +
			INVITEURL)
	}
});

client.once( 'ready', () => { //run getpage on a timed loop, if fail then logirthimically increase duration between checking
	console.log("poke hint solver bot ready");
});

//returns a string
function check (text,guildId) {
	text = text.substring(15,text.length-1)
	//replacing _ for regex
	text = text.replace(/(\\_|_)/g,".")
	var reg = new RegExp(text)
	var validmons = POKEMONLIST[text.length].filter((mon) => {return mon.match(reg)})
	if (validmons.length == 0) {
		if (text.length > 14) {
			text = text.substr(text.lastIndexOf(" ")+1)
			text = text.split(":")[0]
		}
		reg = new RegExp(text.replace(/\\_/g,"."))
		validmons = POKEMONLIST[text.length].filter((mon) => {return mon.match(reg)})
	}
	
	if (validmons.length == 0) {
		return "Sorry! Hint parser failed!"
	}
	var joiner = guildId == HOMEGUILD ? `\n${HOMECATCHFIX} `:`\n`;
	if (validmons.length > 20 ) {
		var out = validmons.slice(0,10).join(joiner)
		return `${joiner}${out}\nShowing first 10/${validmons.length} matches.`
	}
	else  {
		var out = validmons.join(joiner)
		return `${joiner}${out}`
	}
	return "Error really badly."
}

client.login(token)