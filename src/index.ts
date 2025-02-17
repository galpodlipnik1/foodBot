import { Client, IntentsBitField, EmbedBuilder, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import { Job, scheduleJob } from 'node-schedule';
import { fetchMenus } from './scraper';
import { restaurants } from './scraper';
import { type FoodOptions } from './scraper/types';
import fs from 'node:fs';

dotenv.config();

let menuUpdateJob: Job | null = null;

function createMenuEmbed(restaurant: string, menuData: FoodOptions) {
  const embed = new EmbedBuilder()
    .setTitle(`${restaurant} Menu`)
    .setColor('#0099ff')
    .setTimestamp();

  const restaurantInfo = restaurants.find(r => r.name === restaurant);
  if (restaurantInfo) {
    embed.setURL(restaurantInfo.scrapeUrl);
  }

  const items = menuData[restaurant];
  if (!items) return embed;

  const groupedItems = items.reduce((acc: { [key: string]: string[] }, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(`${item.emoji} **${item.number}.** ${item.name}\n*${item.additions.join(', ')}*`);
    return acc;
  }, {});

  Object.entries(groupedItems).forEach(([type, items]) => {
    embed.addFields({
      name: type || 'Other',
      value: items.join('\n'),
    });
  });

  return embed;
}

async function getCurrentMenu(): Promise<FoodOptions | null> {
  const date = new Date();
  const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
  const FILE_PATH = `history/menu-${formattedDate}.json`;

  if (!fs.existsSync(FILE_PATH)) return null;
  
  const data = fs.readFileSync(FILE_PATH, 'utf-8');
  return JSON.parse(data);
}

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  switch (interaction.commandName) {
    case 're-fetch': {
      await interaction.reply('Refetching the menu...');
      await fetchMenus();
      const menu = await getCurrentMenu();
      
      if (!menu) {
        await interaction.editReply('Failed to fetch the menu.');
        return;
      }

      await interaction.editReply({ content: 'Menu updated!', embeds: [
        createMenuEmbed('Barjan', menu),
        createMenuEmbed('Spar', menu)
      ]});
      break;
    }

    case 'menu': {
      const menu = await getCurrentMenu();
      
      if (!menu) {
        await interaction.reply('No menu available for today. Try using /re-fetch first.');
        return;
      }

      await interaction.reply({ embeds: [
        createMenuEmbed('Barjan', menu),
        createMenuEmbed('Spar', menu)
      ]});
      break;
    }

    case 'restaurant': {
      const restaurantChoice = interaction.options.getString('restaurant', true);
      const menu = await getCurrentMenu();
      
      if (!menu) {
        await interaction.reply('No menu available for today. Try using /re-fetch first.');
        return;
      }

      const restaurantName = restaurantChoice === 'barjan' ? 'Barjan' : 'Spar';
      await interaction.reply({ embeds: [createMenuEmbed(restaurantName, menu)] });
      break;
    }
  }
});

async function scheduleMenuUpdate(client: Client) {
  if (menuUpdateJob) {
    console.log('Cancelling existing menu update job');
    menuUpdateJob.cancel();
  }

  try {
    menuUpdateJob = scheduleJob('0 8 * * *', async () => {
      console.log(`Running scheduled menu update at ${new Date().toISOString()}`);

      try {
        await fetchMenus();
        const menu = await getCurrentMenu();

        if (!menu) {
          console.log('Failed to fetch the menu.');
          return;
        }

        const channel = client.channels.cache.get(process.env.DISCORD_MENU_CHANNEL_ID!) as TextChannel;
        if (!channel) {
          console.error('Channel not found.');
          return;
        }

        await channel.send({ 
          content: '🍽️ Today\'s Menu:', 
          embeds: [
            createMenuEmbed('Barjan', menu),
            createMenuEmbed('Spar', menu)
          ]
        });
        console.log('Menu update completed successfully');
      } catch (error) {
        console.error('Error in scheduled menu update:', error);
      }
    });
    console.log('Menu update job scheduled successfully');
  } catch (error) {
    console.error('Error scheduling menu update:', error);
  }
}

client.once('ready', (c) => {
  console.log(`Logged in as ${c.user?.tag}`);
  scheduleMenuUpdate(c);
});

client.login(process.env.DISCORD_TOKEN);