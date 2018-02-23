"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let adminSchema = new mongoose.Schema({
    nickname: String,
    username: String,
    password: String,
    lastLoginDt: { type: Date },
    createDt: { type: Date, default: Date.now },
});
exports.adminModel = mongoose.model('admin', adminSchema);
