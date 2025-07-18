# Canvas Neon Auth

A collaborative canvas app with Neon Auth authentication and Zero real-time database.

## Features

- **Real-time Collaboration**: Multiple users can work on the same canvas simultaneously
- **Neon Auth Authentication**: Secure user authentication and management
- **Smart Cursors**: See other users' cursors with their name and email
- **Post-it Notes**: Create, edit, and drag colorful post-it notes
- **User Permissions**: Only creators can edit their own notes
- **Zero Database**: Real-time data synchronization with Neon PostgreSQL and Zero

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (recommended) or Node.js
- Neon PostgreSQL database
- Neon Auth project setup

### Installation

1. Clone the repository
2. Install dependencies:

```bash
bun install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
   - `VITE_PUBLIC_SERVER` - Your Zero server URL
   - `VITE_STACK_PROJECT_ID` - Neon Auth project ID
   - `VITE_STACK_PUBLISHABLE_CLIENT_KEY` - Neon Auth publishable key

5. Set up the database schema by running the SQL in `migration.sql`

6. Add the required Zero permissions to your database by running `bunx zero-deploy-permissions --schema-path='./src/schema.ts' --output-file='/tmp/permissions_canvas.sql' && cat /tmp/permissions_canvas.sql | pbcopy`. This will copy the permissions to your clipboard, so you can paste and run them in the SQL editor or psql.

### Development

Start the development server:

```bash
bun dev
```

Start the Zero cache development server:

```bash
bun run dev:zero-cache
```

If you want to run the Zero cache development server instead of using the remote server deployed on Neon, read the guide [here](https://zero.rocicorp.dev/docs/quickstart).

## Database Schema

The app uses two main tables:

- `post_its` - Stores post-it note data
- `user_cursors` - Tracks real-time cursor positions

## Features in Detail

### Real-time Cursors

See other users' cursors in real-time with their unique color.

### Post-it Notes

- Create notes by clicking the add button
- Drag and resize notes (only your own)
- Edit content by double-clicking
- Delete with the trash button
- Color coding with the toolbar

### Collaboration

- Real-time synchronization
- User presence indicators
- Permission-based editing
- Conflict-free collaborative editing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request
