"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filter_clause_1 = require("../../../../common/models/filter-clause/filter-clause");
function isValidClause(clause) {
    return (clause instanceof filter_clause_1.FixedTimeFilterClause) || (clause instanceof filter_clause_1.NumberFilterClause);
}
exports.isValidClause = isValidClause;
//# sourceMappingURL=is-valid-clause.js.map