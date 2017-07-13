//optimized for performance, since using for,var etc.

const _ = require("lodash");



function squashAuditGraph(audits, lines, groupBy) {

}


function expandAuditGraph(audits, lines, nodeIdToExpand) {

}

function getAuditsToSquash(audits, lines, groupBy) {
    const toGrouping = {};
    const fromGrouping = {};
    for (var i = 0, length = lines.length; i < length; i++) {
        const source = lines[i].source;
        const target = lines[i].target;

        if (!toGrouping[source.Id]) {
            toGrouping[source.Id] = [];
        }
        if (!fromGrouping[source.Id]) {
            fromGrouping[source.Id] = [];
        }

        toGrouping[source.Id].push(target);
        fromGrouping[source.Id].push(source);
    }

    const auditsGroupsToBeSquashedTo = [];
    for (var key in toGrouping) {
        const groupped = _.groupBy(toGrouping[key], "Type");
        const filterTypes = Object.keys(groupped).filter(k => groupped[k].length >= groupBy);

        for (var i = 0, length = filterTypes.length; i < length; i++) {
            const type = filterTypes[i];
            auditsGroupsToBeSquashedTo.push({
                type,
                auditsToSquash: groupped[type],
                link: key
            });
        }
    }

    const auditsGroupsToBeSquashedFrom = [];
    for (var key in fromGrouping) {
        const groupped = _.groupBy(fromGrouping[key], "Type");
        const filterTypes = Object.keys(groupped).filter(k => groupped[k].length >= groupBy);

        for (var i = 0, length = filterTypes.length; i < length; i++) {
            const type = filterTypes[i];
            auditsGroupsToBeSquashedFrom.push({
                type,
                auditsToSquash: groupped[type],
                link: key
            });
        }
    }
}

function squashAuditsTo(audits, lines, auditsGroupsToBeSquashedTo){
    const toDelete = _.flatMap(auditsGroupsToBeSquashedTo, "auditsToSquash");
    for(var i, length = lines.length; i < length; i++){
        if(toDelete.includes(lines[i].target)){
            delete lines[i];
        }
    }
}

function squashAuditsFrom(audits, lines, auditsGroupsToBeSquashedFrom){
}


module.exports = {
    squashAuditGraph,
    expandAuditGraph
};