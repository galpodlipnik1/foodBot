export type MenuItem = {
  number: number;
  name: string;
  additions: string[];
  type: string;
  emoji: string;
}

export type Restaurant = {
  name: string;
  scrapeUrl: string;
}

export type MenuItems = MenuItem[];

export type FoodOptions = {
  [key: string]: MenuItems;
}