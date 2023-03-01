var request = require('request');

var config2 = require('./config.json')
let errcount = 0

let sleep_time = config2.sleep

const { Client, Events, GatewayIntentBits, Collection} = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const { EmbedBuilder } = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

client.on('ready', () => {
  console.log(`[${nowdate()}]`,'Discord Client logged in !');
})

let token = config2.token
let channel_bot_auctions = config2.channel

client.login(token)

getPricesAuctions()
async function getPricesAuctions() {

  await sleep(5000)
  for (let index = 0; index < 100 ; index++) { //THIS NUMBER IS JUST RANDOM 

    try {

        var config = requireUncached('./config.json')

        console.log(`[${nowdate()}]`,'CHECKED ',index,' PAGES')
     

       let found = ''
       let players

      function fetchdata() {
        return new Promise((resolve,reject) => {

          var options = {
            url: `https://www.futwiz.com/en/fifa23/players?page=${index}&minprice=10000`
          };

          if(config.content == '0') {
            options = {
              url: `https://www.futwiz.com/en/fifa23/players?page=${index}&release=raregold&minrating=84&maxrating=89`
            };
          }

          function callback(error, response, body) {
            if (!error && response.statusCode == 200) {
              resolve(body)
            }
            else resolve('error')
          }

          request(options, callback);

        })
      }

      players = await fetchdata()

      await sleep(80)

      players = players.split('\n')
      
      for (const e of players) {
        if(e.includes('" target="_BLANK"><img src="https://cdn.futwiz.com/assets/img/fifa23/faces/')) {
          let a = e.split('/')

          let id = a[5].split('"')

          let photo = e.split('"')

          let towrite = `${id[0]}`
          found = `${found}${towrite}`

          var options = {
              url: `https://www.futwiz.com/en/app/sold23/${id[0]}/pc`
          };

          var optionsConsole = {
            url: `https://www.futwiz.com/en/app/sold23/${id[0]}/console`
          };

          async function callback(error, response, body) {
              if (!error && response.statusCode == 200) {
                let data = JSON.parse(body)

                let currentprice = data.lowestbin.bin

                for (let index = 0; index < data.activepricelist.length; index++) {
                  const element = data.activepricelist[index];

                  if(element.time_expires == '59 min' || element.time_expires == '58 min') {

                    let buy_price = Number(element.bin_price)*0.9
                    let market_price = await currentprice.replace(/,/g,'')

                    let market_placetosend = market_price

                    market_price = Number(market_price)*0.95

                    let profit = market_price-buy_price

                    let link = `https://www.futwiz.com/en/fifa23/player/${data.player.urlname}/${id[0]}`

                    let conf = config.profit

                    if(profit > conf) {
                      console.log(`[${nowdate()}]`,'PC',market_price,buy_price,data.player.common_name,link,photo[5],profit)
                      sendAlertAuctions('PC',market_placetosend,buy_price,data.player.common_name,link,photo[5],profit)

                    }
                  }
                  
                }

              }
          }

          async function callbackConsole(error, response, body) {
            if (!error && response.statusCode == 200) {
              let data = JSON.parse(body)

              let currentprice = data.lowestbin.bin

              for (let index = 0; index < data.activepricelist.length; index++) {
                const element = data.activepricelist[index];

                if(element.time_expires == '59 min' || element.time_expires == '58 min') {

                  let buy_price = Number(element.bin_price)*0.9
                    let market_price = await currentprice.replace(/,/g,'')

                    let market_placetosend = market_price

                    market_price = Number(market_price)*0.95

                    let profit = market_price-buy_price

                    let link = `https://www.futwiz.com/en/fifa23/player/${data.player.urlname}/${id[0]}`

                    let conf = config.profit

                  if(profit > conf) {
                    console.log(`[${nowdate()}]`,'Console',market_price,buy_price,data.player.common_name,link,photo[5],profit)
                    sendAlertAuctions('Console',market_placetosend,buy_price,data.player.common_name,link,photo[5],profit)

                  }
                }
                
              }

            }
        }

          request(options, callback);
          request(optionsConsole, callbackConsole);
          await sleep(20)

        }


      }

      if(found == '') {
        console.log(`[${nowdate()}]`,`NOTHING FOUND ON PAGE ${index}`)

        errcount += 1

        if(errcount > 10) {
          errcount =0

          if(config.content == '0'){
            console.log(`[${nowdate()}]`,`WAITING ${config.sleep_content} MINS TO START AGAIN`)
          } else console.log(`[${nowdate()}]`,`WAITING ${sleep_time} MINS TO START AGAIN`)

          if(config.content == '0') {
            await sleep(config.sleep_content * 60000)
          }else await sleep(sleep_time * 60000)

          index = 0
        }
      }
      else errcount = 0

      if(index == 99) {
        if(config.content == '0'){
          console.log(`[${nowdate()}]`,`WAITING ${config.sleep_content} MINS TO START AGAIN`)
        } else console.log(`[${nowdate()}]`,`WAITING ${sleep_time} MINS TO START AGAIN`)


        if(config.content == '0') {
          await sleep(config.sleep_content * 60000)
        }else await sleep(sleep_time * 60000)
        index = 0
      }

    } catch (error) {
      if(error){console.log(`[${nowdate()}]\n`,error)}
    }
  }
}


/////////////// DISCORD //////////////////////

function sendAlertAuctions(platform,market_price,buy_price,player,url,player_image,profit){

  const profitEmbed = new EmbedBuilder()
	.setColor('#c9df8a')
	.setTitle('FutBin Error Found 🔎')
  .setURL(url)
  .addFields(
		{ name: '**Player**', value: `${player}`, inline: true },
		{ name: '**Platform**', value: `${platform}`, inline: true },
		{ name: '**Market Price**', value: `${market_price}`, inline: false },
		{ name: '**Buy Price**', value: `${buy_price}`, inline: true },
    { name: '**Profit**', value: `${profit}`, inline: true },
	)
	.setThumbnail(player_image)
	.setTimestamp()

  client.channels.cache.get(channel_bot_auctions).send({embeds : [profitEmbed]})

}


client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

client.on(Events.InteractionCreate, async interaction => {

	if (interaction.isChatInputCommand()){
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});




//OTHER STUFF
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function nowdate() {
  var d = new Date();
  var n = d.toLocaleTimeString();
  return n
}

function requireUncached(module) {
  delete require.cache[require.resolve(module)];
  return require(module);
}