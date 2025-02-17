import axios from 'axios'
import * as cheerio from 'cheerio'
import type { MenuItems } from './types'

export function typeToEmojiMap(type: string): string {
  const emojiMap: Record<string, string> = {
    'Juha': '🥣',
    'Glavna jed': '🍲',
    'Solata': '🥗',
    'Sladica': '🍨',
    'Priloga': '🍚',
    'Pijača': '🥤',
    'Sendvič': '🥪',
    'Kosilo': '🍽️',
    'Malica': '🍽️',
    'Meso': '🥩',
    'Riba': '🐟',
    'Brezmesno': '🥬',
    'Mešano': '🍲',
    'Pizza': '🍕',
    'Hitra hrana': '🍟',
    '': '🍽️'
  }

  return emojiMap[type] || '🍽️';
}

export async function scrapeData(url: string): Promise<MenuItems> {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);
  const menuItems: MenuItems = [];

  $('#menu-list .shadow-wrapper').each((_, element) => {
    const titleEl = $(element).find('h5 strong');
    const title = titleEl.text().trim();
    const [number, ...nameParts] = title.split(/\s+/);
    
    const additions = $(element).find('ul.list-unstyled li i')
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text !== '');

    const type = $(element).find('img').attr('title') || '';
    const emoji = typeToEmojiMap(type);

    menuItems.push({
      number: parseInt(number),
      name: nameParts.join(' ').trim(),
      additions,
      type,
      emoji
    });
  });
  
  return menuItems;
}