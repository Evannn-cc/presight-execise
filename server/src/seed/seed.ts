import { faker } from '@faker-js/faker';
import { openDb } from '../db/connection';
import { migrate } from '../db/migrate';
import { HOBBIES, NATIONALITIES } from './data';

const USER_COUNT = 10_000;

function main(): void {
  const db = openDb();
  migrate(db);

  const { count } = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  if (count > 0) {
    console.log(`Database already contains ${count} users, skipping seed.`);
    db.close();
    return;
  }

  faker.seed(42);

  const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
  const insertUser = db.prepare(
    `INSERT INTO users (id, avatar, first_name, last_name, age, nationality)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertUserHobby = db.prepare('INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)');

  const seedAll = db.transaction(() => {
    const hobbyIds = new Map<string, number>();
    for (const hobby of HOBBIES) {
      const result = insertHobby.run(hobby.value);
      hobbyIds.set(hobby.value, Number(result.lastInsertRowid));
    }

    for (let id = 1; id <= USER_COUNT; id++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const age = faker.number.int({ min: 18, max: 90 });
      const nationality = faker.helpers.weightedArrayElement(NATIONALITIES);
      const avatar = `https://i.pravatar.cc/150?u=${encodeURIComponent(`${firstName}-${id}`)}`;

      insertUser.run(id, avatar, firstName, lastName, age, nationality);

      const hobbyCount = faker.number.int({ min: 0, max: 10 });
      const chosen = new Set<string>();
      while (chosen.size < hobbyCount) {
        chosen.add(faker.helpers.weightedArrayElement(HOBBIES));
      }
      for (const hobby of chosen) {
        insertUserHobby.run(id, hobbyIds.get(hobby));
      }
    }
  });

  seedAll();

  const users = db.prepare('SELECT COUNT(*) AS count FROM users').get() as { count: number };
  const links = db.prepare('SELECT COUNT(*) AS count FROM user_hobbies').get() as {
    count: number;
  };
  console.log(`Seeded ${users.count} users with ${links.count} hobby links.`);
  db.close();
}

main();
