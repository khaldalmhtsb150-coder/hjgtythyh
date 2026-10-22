require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const commands = [];

const slashCommandsPath = path.join(__dirname, 'slash-commands');
if (fs.existsSync(slashCommandsPath)) {
  const commandFiles = fs.readdirSync(slashCommandsPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const command = require(`./slash-commands/${file}`);
    if (command.data) {
      commands.push(command.data.toJSON());
    }
  }
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log(`🔄 Started refreshing ${commands.length} application (/) commands.`);

    const data = await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID || 'YOUR_CLIENT_ID_HERE'),
      { body: commands },
    );

    console.log(`✅ Successfully reloaded ${data.length} application (/) commands.`);
  } catch (error) {
    console.error('❌ Error deploying commands:', error);
  }
})();
