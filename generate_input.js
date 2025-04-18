import fs from 'fs';
import { buildPoseidon } from 'circomlibjs';

const poseidon = await buildPoseidon();
const F = poseidon.F;

const password = BigInt(123456);
const hash = F.toString(poseidon([password]));

const input = {
  password: password.toString(),
  passwordHash: hash
};

fs.writeFileSync("inputs.json", JSON.stringify(input, null, 2));
console.log("Following Passwords and their respective Poseidon Hash are written in inputs.json:\n", input);
