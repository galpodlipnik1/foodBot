import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
import type { Commands } from './types';

dotenv.config();

const commands: Commands = [
  {
    name: 're-fetch',
    description: 'Refetch the food menu',
  },
  {
    name: 'menu',
    description: 'Get the food menu',
  },
  {
    name: 'restaurant',
    description: 'Get the specific restaurants menu',
    options: [
      {
        name: 'restaurant',
        description: 'The restaurant to get the menu from',
        type: 3,
        required: true,
        choices: [
          {
            name: 'Barjan',
            value: 'barjan',
          },
          {
            name: 'Špar',
            value: 'spar',
          }
        ],
      },
    ],
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID!, process.env.DISCORD_GUILD_ID!),
      { body: commands },
    )

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.log(error);
  }
})()
