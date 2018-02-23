"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let pageSchema = new mongoose.Schema({
    url: String,
    html: String,
    createDt: { type: Date, default: Date.now },
    lastModifyDt: { type: Date, default: Date.now }
});
exports.pageModel = mongoose.model("Page", pageSchema);
//# sourceMappingURL=page.js.map