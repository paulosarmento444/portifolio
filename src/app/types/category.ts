import { Products } from "./product";

export type Category = {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
};

export type Categories = Category[];
