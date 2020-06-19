"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
function isClauseEditable(clause) {
    if (clause.not)
        return false;
    if (clause instanceof filter_clause_1.StringFilterClause && clause.action !== filter_clause_1.StringFilterAction.IN)
        return false;
    return true;
}
exports.isClauseEditable = isClauseEditable;
//# sourceMappingURL=is-clause-editable.js.map