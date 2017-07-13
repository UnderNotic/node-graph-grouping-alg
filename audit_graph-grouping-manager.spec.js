const sum = require('./audit_graph-grouping-manager');

const audits = [
    { Id: 1, Type: "Type1" },
    { Id: 2, Type: "Type1" },
    { Id: 3, Type: "Type1" },
    { Id: 4, Type: "Type1" },
    { Id: 5, Type: "Type1" },
    { Id: 6, Type: "Type1" },
    { Id: 7, Type: "Type2" },
    { Id: 8, Type: "Type2" }
];

const lines = [
    { source: audits[0], target: audits[1]}
];


test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
});