const { SlashCommandBuilder} = require('discord.js');

const fs = require('fs');
const filePath = './config.json';

let config = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('profit')
		.setDescription('changes minimum profit of looking players')
        .addStringOption(option =>
            option
                .setName('value')
                .setDescription('The value of minimum profit')
                .setRequired(true)),
        async execute(interaction) {

		if(config.adminID != interaction.user.id) {
			await interaction.reply({ content: 'You cannot use that command', ephemeral: true });
			return
		}

		try {
			// read the file content, it's a simple object now
			const config = await jsonRead(filePath);

            console.log('min profit change',interaction.options.getString('value'))

			config.profit = `${interaction.options.getString('value')}`

            if(interaction.options.getString('value') == null) {
                await interaction.reply({ content: `Profit can't be a nothing`, ephemeral: true });
                return
            }

            await interaction.reply({ content: `Minimum profit changed to ${interaction.options.getString('value')}`, ephemeral: true });

			// save the file with the updated settings
			jsonWrite(filePath, config);
	

		} catch (err) {
		console.log(err);
		}

	},
};

// helper function to read the JSON file
function jsonRead(filePath) {
	return new Promise((resolve, reject) => {
	fs.readFile(filePath, 'utf-8', (err, content) => {
		if (err) {
		reject(err);
		} else {
		try {
			resolve(JSON.parse(content));
		} catch (err) {
			reject(err);
		}
		}
	});
	});
}

// helper function to write the JSON file
function jsonWrite(filePath, data) {
	return new Promise((resolve, reject) => {
	fs.writeFile(filePath, JSON.stringify(data), (err) => {
		if (err) {
		reject(err);
		}
		resolve(true);
	});
	});
}