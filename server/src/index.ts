import { openDb } from './db/connection';
import { migrate } from './db/migrate';
import { createApp } from './app';

const port = Number(process.env.PORT ?? 3001);

const db = openDb();
migrate(db);

const app = createApp(db, { staticDir: process.env.STATIC_DIR });

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
