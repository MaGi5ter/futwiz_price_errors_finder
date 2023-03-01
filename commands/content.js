const { SlashCommandBuilder} = require('discord.js');

const fs = require('fs');
const filePath = './config.json';

let config = require('../config.json')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('content')
		.setDescription('change what is bot looking for'),
        async execute(interaction) {

		if(config.adminID != interaction.user.id) {
			await interaction.reply({ content: 'You cannot use that command', ephemeral: true });
			return
		}

		try {
			// read the file content, it's a simple object now
			const config = await jsonRead(filePath);

			if(config.content == '1') {
				config.content = '0';
				console.log('changed to 0')

				await interaction.reply({ content: 'Changed to only gold rated', ephemeral: true });

			}else { 
				config.content = '1'
				console.log('changed to 1')

				await interaction.reply({ content: 'Changed to default searching', ephemeral: true });
			}

		
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