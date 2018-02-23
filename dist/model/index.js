"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
mongoose.connect('mongodb://118.31.72.227:27017/tutu');
// 通用
var cloudinary_image_1 = require("./common/cloudinary-image");
exports.cloudinaryImageModel = cloudinary_image_1.cloudinaryImageModel;
var cloudniary_video_1 = require("./common/cloudniary-video");
exports.cloudinaryVideoModel = cloudniary_video_1.cloudinaryVideoModel;
// 管理系统
var admin_1 = require("./common/admin");
exports.adminModel = admin_1.adminModel;
// 资源管理
var resource_group_1 = require("./resource-group");
exports.resourceGroupModel = resource_group_1.resourceGroupModel;
var resource_1 = require("./resource");
exports.resourceModel = resource_1.resourceModel;
// banner管理
var banner_1 = require("./banner");
exports.bannerModel = banner_1.bannerModel;
