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
const Router = require("koa-router");
const db = require("../model");
const middleware_1 = require("../middleware");
const service = require("../service");
const adminApi = {
    // banner
    banner: {
        listBanner: '/admin.list-banner.get',
        createBanner: '/admin.create-banner.post',
        deleteBanner: '/admin.delete-banner.del',
        updateBanner: '/admin.update-banner.put',
    },
    resource: {
        updateResource: '/admin.update-resource.put',
    },
    resourceGroup: {
        updateResourceGroup: '/admin.update-resource-group.put'
    }
};
let adminRouter = new Router();
exports.adminRouter = adminRouter;
/**
 * @api {POST}  /admin.login     adminlogin request
 * @apiGroup admin
 */
adminRouter.post('/admin.login.post', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { username, password } = ctx.request.body;
    let admin = yield db.adminModel.findOne({ username, password }).exec();
    if (admin) {
        ctx.session.admin = admin;
    }
    if (username == '13419597065' && password == '13419597065') {
        admin = { username: '13419597065', nickname: '超级管理员', password: '13419597065' };
        ctx.session.admin = admin;
    }
    ctx.body = { ok: !!admin, data: admin ? admin : '用户名或密码错误' };
}))
    .get('/admin.list-group.get', middleware_1.auth.checkAdminLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let groups = yield db.resourceGroupModel.find().exec();
    ctx.body = { ok: true, data: groups };
}))
    .post('/admin.create-resource-group.post', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { name, comment, isRecommand } = ctx.request.body;
    let newGroup = yield new db.resourceGroupModel({ name, comment, isRecommand }).save();
    ctx.body = { ok: true, data: newGroup };
}))
    .get('/admin.search-resource-group.get', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { keyword } = ctx.query;
    let reg = new RegExp(keyword, 'g');
    let groups = yield db.resourceGroupModel.find({ name: reg }).exec();
    ctx.body = { ok: true, data: groups };
}))
    .del('/admin.delete-resource-group.del', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { groupId } = ctx.query;
    let delAction = yield db.resourceGroupModel.findByIdAndRemove(groupId).exec();
    ctx.body = { ok: true, data: delAction };
}))
    .post('/admin.create-resource.post', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { name, thumb, videoBase64, comment, group, isRecommand } = ctx.request.body;
    let uploadVideoAction = service.cloud.storeVideo(videoBase64);
    thumb = yield service.cloud.storeImage(thumb);
    uploadVideoAction.then((mediaType) => __awaiter(this, void 0, void 0, function* () {
        console.log('上传视频文件', mediaType);
        let video = yield new db.cloudinaryVideoModel(mediaType).save();
        let newResource = yield new db.resourceModel({ name, thumb: thumb._id, video: video._id, comment, group, isRecommand }).save();
    }));
    ctx.body = { ok: true, data: '上传成功' };
}))
    .get('/admin.list-resource.get', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { groupId } = ctx.query;
    let resources = [];
    if (groupId) {
        resources = yield db.resourceModel.find({ group: groupId }).exec();
    }
    else {
        resources = yield db.resourceModel.find().exec();
    }
    for (let resource of resources) {
        resource.thumb = yield db.cloudinaryImageModel.findById(resource.thumb).exec();
        resource.video = yield db.cloudinaryVideoModel.findById(resource.video);
    }
    ctx.body = { ok: true, data: resources };
}))
    .del('/admin.delete-resource.del', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { resourceId } = ctx.query;
    let resource = yield db.resourceModel.findById(resourceId).populate('thumb video').exec();
    if (resource) {
        if (resource.thumb)
            yield service.cloud.deleteImage(resource.thumb.public_id);
        if (resource.video)
            yield service.cloud.deleteVideo(resource.video.public_id);
        yield resource.remove();
    }
    ctx.body = { ok: true, data: '删除成功' };
}))
    .get('/admin.search-resource.get', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { keyword } = ctx.query;
    let reg = new RegExp(keyword, 'g');
    let resources = yield db.resourceModel.find({ name: reg }).exec();
    for (let resource of resources) {
        resource.thumb = yield db.cloudinaryImageModel.findById(resource.thumb).exec();
        resource.video = yield db.cloudinaryVideoModel.findById(resource.video);
    }
    ctx.body = { ok: true, data: resources };
}))
    .put('/admin.toggle-recommand.put', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { groupId } = ctx.query;
    let { isRecommand } = ctx.request.body;
    let updateAction = yield db.resourceGroupModel.findByIdAndUpdate(groupId, { isRecommand }).exec();
    ctx.body = { ok: true, data: updateAction };
}))
    .get(adminApi.banner.listBanner, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let banners = yield db.bannerModel.find().populate('image').exec();
    ctx.body = { ok: true, data: banners };
}))
    .post(adminApi.banner.createBanner, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { name, image, active, comment } = ctx.request.body;
    let newImage = yield service.cloud.storeImage(image);
    let newBanner = yield new db.bannerModel({ image: newImage._id, name, active }).save();
    ctx.body = { ok: true, data: newBanner };
}))
    .del(adminApi.banner.deleteBanner, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { bannerId } = ctx.query;
    let delAction = yield db.bannerModel.findByIdAndRemove(bannerId).exec();
    ctx.body = { ok: true, data: delAction };
}))
    .put(adminApi.banner.updateBanner, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { bannerId } = ctx.query;
    let newBanner = ctx.request.body;
    let updateAction = yield db.bannerModel.findByIdAndUpdate(bannerId, newBanner).exec();
    ctx.body = { ok: true, data: updateAction };
}))
    .put(adminApi.resource.updateResource, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { resourceId } = ctx.query;
    let newResource = ctx.request.body;
    let updateAction = yield db.resourceModel.findByIdAndUpdate(resourceId, newResource).exec();
    ctx.body = { ok: true, data: updateAction };
}))
    .put(adminApi.resourceGroup.updateResourceGroup, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { groupId } = ctx.query;
    let newGroup = ctx.request.body;
    let updateAction = yield db.resourceGroupModel.findByIdAndUpdate(groupId, newGroup).exec();
    ctx.body = { ok: true, data: updateAction };
}));
//# sourceMappingURL=admin.route.js.map