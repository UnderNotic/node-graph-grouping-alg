//optimized for performance, since using for,var etc.

const _ = require("lodash");

const audits = [{
        Id: "1",
        Type: "Type1",
        Timestamp: "2017-07-17T12:40:58.070515Z"
    },
    {
        Id: "2",
        Type: "Type1",
        Timestamp: "2017-07-16T12:40:58.070515Z"
    },
    {
        Id: "3",
        Type: "Type1",
        Timestamp: "2017-07-14T12:40:58.070515Z"
    },
    {
        Id: "4",
        Type: "Type1",
        Timestamp: "2017-07-11T12:40:58.070515Z"
    },
    {
        Id: "5",
        Type: "Type1",
        Timestamp: "2017-07-12T12:40:58.070515Z"
    },
    {
        Id: "6",
        Type: "Type1",
        Timestamp: "2017-07-11T12:40:58.070515Z"
    },
    {
        Id: "7",
        Type: "Type2",
        Timestamp: "2017-07-11T12:40:58.070515Z"
    },
    {
        Id: "8",
        Type: "Type2",
        Timestamp: "2017-07-13T12:40:58.070515Z"
    }
];
const lines = [{
    source: audits[0],
    target: audits[1]
}];
squashAuditGraph(audits, lines, 1);

function squashAuditGraph(audits, lines, groupBy) {
    const auditsToSquash = getAuditsToSquash(audits, lines, groupBy);
    const virtualAudits = auditsToSquash.map(a => createVirtualAudit(a));
    const {filteredAudits, filteredLines} = transformD3Structure(audits, lines, virtualAudits);
    return {filteredAudits, filteredLines};
}

function expandAuditGraph(audits, lines, nodeIdToExpand) {

}

function createVirtualAudit(auditToSquash) {
    const newestAudit = auditToSquash.sort((a, b) => Date.parse(a.audit.Timestamp) < Date.parse(b.audit.Timestamp))[0].audit;
    return Object.assign(newestAudit, {
        squashed: auditToSquash,
        vLinesFrom: auditToSquash[0].linesFrom,
        vLinesTo: auditToSquash[0].linesTo
    });
}

function getAuditsToSquash(audits, lines, groupBy) {
    let groupByType = _.groupBy(audits, "Type");
    let types = Object.keys(groupByType);
    const auditsToSquash = [];
    for (let type of types) {
        const group = groupByType[type];
        if (group.length >= groupBy) {
            let auditsWithLinks = group.map(audit => {
                const sources = lines.filter(l => l.source.Id === audit.Id).map(line => line.source);
                const targets = lines.filter(l => l.target.Id === audit.Id).map(line => line.target);
                return {
                    audit,
                    sources,
                    targets
                };
            });


            let groupedLinks = _.groupBy(auditsWithLinks, a => a.sources.sort().reduce((prev, curr) => prev.Id || "" + curr.Id || "", "") + "&&" + a.targets.sort().reduce((prev, curr) => prev.Id || "" + curr.Id || "", ""));
            for (let key of Object.keys(groupedLinks)) {
                const groupedAuditsByTypesAndLines = groupedLinks[key];
                if (groupedAuditsByTypesAndLines.length >= groupBy) {
                    auditsToSquash.push(groupedAuditsByTypesAndLines);
                }
            }

        }
    }
    return auditsToSquash;
}

function transformD3Structure(audits, lines, virtualAudits) {
    const squashedAuditsIds = _.uniq(_.flatten(virtualAudits.map(a => a.squashed)).map(a => a.audit.Id));
    let filteredAudits = audits.filter(a => !squashedAuditsIds.includes(a.Id));
    let filteredLines = lines.filter(l => squashedAuditsIds.includes(l.source.Id) || squashedAuditsIds.includes(l.target.Id));

    for (let vAudit of virtualAudits) {
        filteredAudits.push(vAudit);
        if (vAudit.vLinesFrom) {
            vAudit.vLinesFrom.ForEach(l => filteredLines.push({
                source: vAudit,
                target: l
            }));
        }
        if (vAudit.vLinesTo) {
            vAudit.vLinesTo.ForEach(l => filteredLines.push({
                source: l,
                target: vAudit
            }));
        }
    }

    return {
        filteredAudits,
        filteredLines
    };
}

module.exports = {
    squashAuditGraph,
    expandAuditGraph
};