"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let resourceGroupSchme = new mongoose.Schema({ name: String, createDt: { type: Date, default: Date.now }, comment: String, isRecommand: { type: Boolean, default: false } });
exports.resourceGroupModel = mongoose.model('resource-group', resourceGroupSchme);
