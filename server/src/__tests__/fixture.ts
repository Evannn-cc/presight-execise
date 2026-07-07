import Database from 'better-sqlite3';
import { migrate } from '../db/migrate';

export interface FixtureUser {
  id: number;
  first_name: string;
  last_name: string;
  age: number;
  nationality: string;
  hobbies: string[];
}

// Hand-crafted to exercise every query semantic:
// - three users share first_name "Alex" (sort tie-breaking by id)
// - "Ann"/"Anna"/"Annabelle" (first) and "Mann"/"Ann" (last) share the "ann" substring
// - "Per%cy" contains a literal LIKE wildcard
// - one user with 10 hobbies, two users with 0 hobbies
// - known nationality distribution for OR filtering and facet counts
export const FIXTURE_USERS: FixtureUser[] = [
  {
    id: 1,
    first_name: 'Alex',
    last_name: 'Smith',
    age: 30,
    nationality: 'American',
    hobbies: ['Chess', 'Hiking'],
  },
  {
    id: 2,
    first_name: 'Alex',
    last_name: 'Jones',
    age: 25,
    nationality: 'British',
    hobbies: ['Chess'],
  },
  {
    id: 3,
    first_name: 'Alex',
    last_name: 'Brown',
    age: 30,
    nationality: 'American',
    hobbies: ['Hiking'],
  },
  {
    id: 4,
    first_name: 'Ann',
    last_name: 'Lee',
    age: 40,
    nationality: 'Chinese',
    hobbies: ['Chess', 'Hiking', 'Reading'],
  },
  {
    id: 5,
    first_name: 'Anna',
    last_name: 'Kim',
    age: 35,
    nationality: 'Korean',
    hobbies: ['Reading'],
  },
  {
    id: 6,
    first_name: 'Annabelle',
    last_name: 'Ford',
    age: 28,
    nationality: 'British',
    hobbies: [],
  },
  {
    id: 7,
    first_name: 'Bob',
    last_name: 'Mann',
    age: 50,
    nationality: 'German',
    hobbies: ['Cooking'],
  },
  {
    id: 8,
    first_name: 'Per%cy',
    last_name: 'Zeta',
    age: 60,
    nationality: 'French',
    hobbies: ['Chess'],
  },
  {
    id: 9,
    first_name: 'Dave',
    last_name: 'Stone',
    age: 45,
    nationality: 'American',
    hobbies: [
      'Chess',
      'Hiking',
      'Reading',
      'Cooking',
      'Gaming',
      'Swimming',
      'Running',
      'Yoga',
      'Painting',
      'Fishing',
    ],
  },
  {
    id: 10,
    first_name: 'Eve',
    last_name: 'Ngo',
    age: 22,
    nationality: 'Vietnamese',
    hobbies: ['Hiking', 'Reading'],
  },
  {
    id: 11,
    first_name: 'Zoe',
    last_name: 'Ann',
    age: 33,
    nationality: 'German',
    hobbies: ['Chess', 'Cooking'],
  },
  {
    id: 12,
    first_name: 'Frank',
    last_name: 'Underwood',
    age: 30,
    nationality: 'American',
    hobbies: [],
  },
];

export function makeTestDb(): Database.Database {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');
  migrate(db);

  const hobbyNames = [...new Set(FIXTURE_USERS.flatMap((u) => u.hobbies))].sort();
  const insertHobby = db.prepare('INSERT INTO hobbies (name) VALUES (?)');
  const hobbyIds = new Map<string, number>();
  for (const name of hobbyNames) {
    hobbyIds.set(name, Number(insertHobby.run(name).lastInsertRowid));
  }

  const insertUser = db.prepare(
    `INSERT INTO users (id, avatar, first_name, last_name, age, nationality)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertUserHobby = db.prepare('INSERT INTO user_hobbies (user_id, hobby_id) VALUES (?, ?)');
  for (const user of FIXTURE_USERS) {
    insertUser.run(
      user.id,
      `https://example.com/avatar/${user.id}`,
      user.first_name,
      user.last_name,
      user.age,
      user.nationality,
    );
    for (const hobby of user.hobbies) {
      insertUserHobby.run(user.id, hobbyIds.get(hobby));
    }
  }

  return db;
}
