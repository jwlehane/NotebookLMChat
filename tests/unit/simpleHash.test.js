const { simpleHash } = require('../../content.js');

describe('simpleHash', () => {
    test('should return a deterministic hash for a string', () => {
        const input = "Hello World";
        const expected = "note-1372551429"; // Computed manually or assumed stable
        expect(simpleHash(input)).toBe(expected);
    });

    test('should return same hash for same input', () => {
        const input = "NotebookLM is cool";
        expect(simpleHash(input)).toBe(simpleHash(input));
    });

    test('should return different hash for different input', () => {
        expect(simpleHash("abc")).not.toBe(simpleHash("abd"));
    });

    test('should handle empty string', () => {
        expect(simpleHash("")).toBe("note-0");
    });
});
