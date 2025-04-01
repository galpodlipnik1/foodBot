export type Commands = {
  name: string;
  description: string;
  options?: {
    name: string;
    description: string;
    type: number;
    required: boolean;
    choices?: {
      name: string;
      value: string;
    }[];
  }[];
}[]