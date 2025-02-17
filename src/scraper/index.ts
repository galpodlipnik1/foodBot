import { scrapeData } from "./scrape-data";
import type { FoodOptions, Restaurant } from "./types"
import fs from 'node:fs'

export const restaurants: Restaurant[] = [
  {
    name: 'Barjan',
    scrapeUrl: 'https://www.studentska-prehrana.si/sl/restaurant/Details/2248'
  },
  {
    name: 'Spar',
    scrapeUrl: 'https://www.studentska-prehrana.si/sl/restaurant/Details/1370'
  }
]

async function scrapeAllRestaurants(): Promise<FoodOptions> {
  const results = await Promise.all(
    restaurants.map(async restaurant => ({
      name: restaurant.name,
      menu: await scrapeData(restaurant.scrapeUrl)
    }))
  );
  
  return Object.fromEntries(
    results.map(({ name, menu }) => [name, menu])
  );
}

async function saveToHistory(foodOptions: FoodOptions) {
  const date = new Date();
  const formattedDate = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

  const FILE_PATH = `history/menu-${formattedDate}.json`;

  fs.existsSync('history') || fs.mkdirSync('history');

  fs.writeFileSync(FILE_PATH,JSON.stringify(foodOptions, null, 2));

  console.log('Saving to history for', formattedDate);
}

export async function fetchMenus() {
  const foodOptions = await scrapeAllRestaurants();
  await saveToHistory(foodOptions);
}

fetchMenus();