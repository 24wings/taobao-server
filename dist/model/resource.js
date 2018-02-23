"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
let resourceSchema = new mongoose.Schema({
    name: String,
    thumb: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-image' },
    comment: String,
    video: { type: mongoose.Schema.Types.ObjectId, ref: 'cloudinary-video' },
    isRecommand: { type: Boolean, default: false },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'resource-group' },
    createDt: { type: Date, default: Date.now }
});
exports.resourceModel = mongoose.model('resource', resourceSchema);
//# sourceMappingURL=resource.js.map