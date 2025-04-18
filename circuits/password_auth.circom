// This file creates a zkp circuit where prover can say
// "I know a password such that its Poseidon hash equals this known passwordHash"
// If the prover supplies the correct password, the proof will verify; otherwise, it won’t.

pragma circom 2.0.0;
include "poseidon.circom";

template PasswordAuthCircuit() {
    signal input password; // private circuit input, value is provided by prover during proof generation
    signal input passwordHash; // public circuit input, passed to verifier during proof verification

    component poseidon = Poseidon(1); // creates a new element of Poseidon template with an input aaaray of size 1
    poseidon.inputs[0] <== password; // passes password to 1 and only slot in the poseidon array

    signal computedHash;
    computedHash <== poseidon.out; // computedHash is the output of Poseidon Hash function

    passwordHash === computedHash; // The key constraint in the circuit that enforces the condition: password's computed hash should match computed hash
}

component main = PasswordAuthCircuit(); // this creates an instance of the template as a manin component. This acts as entry point for compiler for compiling the circuit
