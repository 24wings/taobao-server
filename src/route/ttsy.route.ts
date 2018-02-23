import koa = require('koa');
import Router = require('koa-router');
import db = require('../model');
import service = require('../service');
let ttsyRouter = new Router();
ttsyRouter.use(async (ctx, next) => {
    let groups = await db.resourceGroupModel.find({ isRecommand: true }).exec();
    ctx.state.groups = groups
    await next();
})
ttsyRouter.get('/', async (ctx, next) => {

    let banners = await db.bannerModel.find({ active: true }).populate('image').exec();
    let resources = await db.resourceModel.find({ isRecommand: true }).populate('thumb video').exec();
    console.log(resources);
    await ctx.render('home', { banners, resources });
})
    .get('/group', async (ctx, next) => {
        let { groupId } = ctx.query;
        let group = await db.resourceGroupModel.findById(groupId).exec();

        if (!group) {
            group = await db.resourceGroupModel.findOne().exec();
            groupId = (group as any)._id;
        }
        let resources = await db.resourceModel.find({ group: (group as any)._id }).populate('thumb video').exec();
        await ctx.render('group', { group, resources, groupId })
    })
    .get('/about', async (ctx, next) => {
        await ctx.render('about');
    })
export { ttsyRouter };