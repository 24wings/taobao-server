"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
var cloudinary = require('cloudinary');
const path = require("path");
const fs = require("fs");
const model_1 = require("../model");
const db = require("../model");
let uploadDir = path.resolve(__dirname, '../../www/upload');
cloudinary.config({
    cloud_name: 'dnf1ydl7w',
    api_key: '688229757297621',
    api_secret: 'D-7VrFqtn6ayg6ItFNXSm52jcS0'
});
// See Configuration Options for more details and additional configuration methods.
function uploadImage(base64) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            cloudinary.v2.uploader.upload(base64, function (err, result) {
                if (err)
                    console.log(err);
                resolve(result);
            });
        });
    });
}
exports.uploadImage = uploadImage;
/** 讲base64图片上传,并返回数据 cloudinary 数据库对象 */
function storeImage(base64) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = yield uploadImage(base64);
        return yield new model_1.cloudinaryImageModel(result).save();
    });
}
exports.storeImage = storeImage;
function storeImages(base64Arr, adminId, appName) {
    return __awaiter(this, void 0, void 0, function* () {
        let imageItems = [];
        for (let base64 of base64Arr) {
            /** old image object */
            if (base64['_id']) {
                let imageItem = yield db.cloudinaryImageModel.findById(base64['_id']).exec();
                imageItems.push(imageItem);
            }
            else {
                let imageItem = yield storeImage(base64);
                imageItems.push(imageItem);
            }
        }
        return imageItems;
    });
}
exports.storeImages = storeImages;
function storeVideo(base64) {
    let data = parseBase64(base64);
    let filename = Math.random() + '.' + data.mediaType;
    let filepath = path.resolve(__dirname, '../../www/upload/' + filename);
    var dataBuffer = new Buffer(data.content, 'base64');
    fs.writeFileSync(filepath, dataBuffer, { encoding: 'binary' });
    console.log('上传文件已完成', filepath);
    return uploadVideo(filepath);
}
exports.storeVideo = storeVideo;
function uploadVideo(filepath) {
    return new Promise(resolve => {
        cloudinary.uploader.upload(filepath, function (result) {
            resolve(result);
        }, { resource_type: "video" });
    });
}
function parseBase64(base64) {
    let prefixNum = base64.indexOf(',');
    let prefix = base64.slice(0, prefixNum + 1);
    var reg = /data:\w+\/\w+/g;
    let matches = base64.match(reg);
    if (matches && matches[0]) {
        // ["data:video/mp4"]
        let seg = matches[0].replace('data:', '').split('/');
        let content = base64.substring(prefixNum + 1);
        console.log(base64.slice(0, 100), content.slice(0, 100));
        if (seg.length = 2) {
            return {
                mediaType: seg[1],
                content,
                prefix
            };
        }
        else {
            return 'unkown';
        }
    }
    else {
        return false;
    }
}
function deleteVideo(public_id) {
    return new Promise(resolve => { cloudinary.uploader.destroy(public_id, function (result) { resolve(result), { resource_type: "video" }; }); });
}
exports.deleteVideo = deleteVideo;
function deleteImage(public_id) {
    return new Promise(resolve => {
        cloudinary.v2.uploader.destroy(public_id, function (error, result) {
            // console.log(result) 
            resolve(result);
        });
    });
}
exports.deleteImage = deleteImage;
//# sourceMappingURL=cloudinary.js.map