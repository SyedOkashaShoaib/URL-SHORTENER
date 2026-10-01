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

let codeSet = new Set();
for (let i = 0; i < 1000000; i++ ) {
    codeSet.add(generateShortCode());
}
console.log("Total generated codes: 1000000");
console.log("Duplicates generated: ", 1000000 - codeSet.size);