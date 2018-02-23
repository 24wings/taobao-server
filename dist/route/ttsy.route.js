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
let ttsyRouter = new Router();
exports.ttsyRouter = ttsyRouter;
ttsyRouter.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let groups = yield db.resourceGroupModel.find({ isRecommand: true }).exec();
    ctx.state.groups = groups;
    yield next();
}));
ttsyRouter.get('/', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let banners = yield db.bannerModel.find({ active: true }).populate('image').exec();
    let resources = yield db.resourceModel.find({ isRecommand: true }).populate('thumb video').exec();
    console.log(resources);
    yield ctx.render('home', { banners, resources });
}))
    .get('/group', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { groupId } = ctx.query;
    let group = yield db.resourceGroupModel.findById(groupId).exec();
    if (!group) {
        group = yield db.resourceGroupModel.findOne().exec();
        groupId = group._id;
    }
    let resources = yield db.resourceModel.find({ group: group._id }).populate('thumb video').exec();
    yield ctx.render('group', { group, resources, groupId });
}))
    .get('/about', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    yield ctx.render('about');
}));
