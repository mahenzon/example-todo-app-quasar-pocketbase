import PocketBase from 'pocketbase';

// Use localhost for dev, but this should be configurable
const pb = new PocketBase('http://127.0.0.1:8090');

export { pb };
