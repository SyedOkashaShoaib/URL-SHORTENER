import { randomInt } from "node:crypto";
const LIMIT = 6; //put this in .env as well.
const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; //put this in .env later?
export function generateShortCode() {
    let string = '';
    for (let i = 0; i < LIMIT; i++) {
        string += alphabet[randomInt(0, alphabet.length)];
    }
    return string;
}
