// import classes
import { pool, connectToDb } from './connections.js';
import Cli from "./classes/Cli.js";

await connectToDb();

// // create a new instance of the Cli class
const cli = new Cli();

// start the cli
cli.performActions();
