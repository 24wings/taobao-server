"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let bannerSchema = new mongoose.Schema({
    name: String,
    comment: String,
    active: { type: Boolean, default: true },
    createDt: { type: Date, default: Date.now },
    image: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-image' },
    sort: { type: Number, default: 0 }
});
exports.bannerModel = mongoose.model('banner', bannerSchema);
