import PocketBase from 'pocketbase'

// PocketBase URL is configurable via POCKETBASE_URL environment variable at build time
const pb = new PocketBase(process.env.POCKETBASE_URL)

export { pb }
