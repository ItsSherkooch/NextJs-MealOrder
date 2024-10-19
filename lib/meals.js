import sql from 'better-sqlite3'
import slugify from 'slugify';
import xss from 'xss';
import fs from 'node:fs'

const db = sql('meals.db')

export default async function getMeals() {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return db.prepare('SELECT * FROM meals').all();
}

export function getMeal(slug) {
  return db.prepare('SELECT * FROM meals WHERE slug = ?').get(slug)
}

export async function saveMeal(meal) {
  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  // Check if the slug already exists
  let existingMeal = db.prepare('SELECT * FROM meals WHERE slug = ?').get(meal.slug);
  
  // If slug exists, modify it by appending a number (or some unique identifier)
  let counter = 1;
  while (existingMeal) {
    meal.slug = `${slugify(meal.title, { lower: true })}-${counter}`;
    existingMeal = db.prepare('SELECT * FROM meals WHERE slug = ?').get(meal.slug);
    counter++;
  }

  const extention = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}.${extention}`;

  const stream = fs.createWriteStream(`/images/${fileName}`);
  const bufferedImage = await meal.image.arrayBuffer();

  stream.write(Buffer.from(bufferedImage), (error) => {
    if (error) {
      throw new Error('Something went wrong during uploading the image!');
    }
  });

  meal.image = `/images/${fileName}`;

  db.prepare(`
    INSERT INTO meals
    (title, summary, instructions, creator, creator_email, image, slug)
    VALUES (
      @title, 
      @summary, 
      @instructions, 
      @creator,
      @creator_email, 
      @image, 
      @slug
    )
  `).run(meal);
}
