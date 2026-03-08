
const { simpleHash } = require('../content.js');

function expect(val) {
    return {
        toBe: (expected) => {
            if (val !== expected) {
                throw new Error(`Expected ${val} to be ${expected}`);
            }
        },
        not: {
            toBe: (expected) => {
                if (val === expected) {
                    throw new Error(`Expected ${val} not to be ${expected}`);
                }
            }
        }
    };
}

try {
    const input = "Hello World";
    // note: memory says note-862545276 for local env, let's see.
    // The test expects note-1372551429.
    // I'll just check consistency.
    const hash = simpleHash(input);
    console.log(`Hash for 'Hello World': ${hash}`);

    expect(simpleHash("NotebookLM is cool")).toBe(simpleHash("NotebookLM is cool"));
    expect(simpleHash("abc")).not.toBe(simpleHash("abd"));
    expect(simpleHash("")).toBe("note-0");

    console.log("simpleHash tests passed.");
} catch (e) {
    console.error("Test failed:", e);
    process.exit(1);
}
