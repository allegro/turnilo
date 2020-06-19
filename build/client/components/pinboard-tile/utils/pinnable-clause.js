"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
function isPinnableClause(clause) {
    return clause instanceof filter_clause_1.StringFilterClause || clause instanceof filter_clause_1.BooleanFilterClause;
}
exports.isPinnableClause = isPinnableClause;
//# sourceMappingURL=pinnable-clause.js.map