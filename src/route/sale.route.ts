import koa = require('koa');
import Router = require('koa-router');
import db = require('../model');
import { FruitOrderState } from '../model/app-fruit/fruit-order';
let saleRouter = new Router();
let checkUserLogin: koa.Middleware = async (ctx, next) => {
    let saleUser = (ctx.session as any).saleUser;
    console.log(saleUser);
    if (saleUser) {
        console.log('用户已经登录', ctx.path, saleUser)
        await next();
    } else {
        console.log('用户尚未denglu')
        await ctx.redirect('/login');
    }
}

saleRouter.get('/', async (ctx, next) => {
    let groupId = ctx.query.groupId;
    let groups = await db.fruitProductGroupModel.find().exec();
    if (!groupId) groupId = groups[0]._id;
    let products = await db.fruitProductModel.find({ group: groupId }).populate('images').exec();

    await ctx.render('home', { groups, products, groupId });
})
    .get('/detail', async (ctx, next) => {
        let { productId } = ctx.query;
        let product = await db.fruitProductModel.findById(productId).populate('images').exec();
        await ctx.render('detail', { product });
    })
    .get('/login', async (ctx, next) => {
        await ctx.render('login');
    })
    .get('/sale.isUserLogin.get', async (ctx, next) => {
        ctx.body = { ok: !!((ctx.session as any).saleUser), data: {} }
    })
    .post('/login', async (ctx, next) => {
        let { phone, password } = ctx.request.body;
        let user = await db.fruitUserModel.findOne({ phone, password }).exec();
        if (user) {
            (ctx.session as any).saleUser = user;
            await ctx.redirect('/');
        } else {
            await ctx.render('login', { error: '用户名或密码错误' });
        }

    })
    .post('/sale.createOrder.post', checkUserLogin, async (ctx, next) => {
        let { productId, num, address } = ctx.request.body;
        let orderUser = (ctx.session as any).saleUser._id;
        if (productId && num && address) {
            let newOrder = await new db.fruitOrderModel({ product: productId, orderUser, num, address, state: FruitOrderState.UnConfirm }).save();
            ctx.body = { ok: true, data: '订购成功,请到个人中心查看' }
        } else {
            ctx.body = { ok: false, data: '请填写收货地址' };
        }
        // let data = db.FruitOrderState

        // ctx.body = { ok: true, productId, num, address };
    })
    .get('/person-center', checkUserLogin, async (ctx, next) => {
        let saleUser = (ctx.session as any).saleUser;

        let unConfirmProductsNum = await db.fruitOrderModel.find({ orderUser: saleUser._id, state: FruitOrderState.UnConfirm }).count().exec();
        let sendingProductsNum = await db.fruitOrderModel.find({ orderUser: saleUser._id, state: FruitOrderState.SendProduct }).count().exec();
        let finishOrdersNum = await db.fruitOrderModel.find({ orderUser: saleUser._id }).count().exec();
        await ctx.render('person-center', { saleUser, unConfirmProductsNum, finishOrdersNum, sendingProductsNum });

    })
    .get('/order', checkUserLogin, async (ctx, next) => {
        let saleUser = (ctx.session as any).saleUser;

        let mode = ctx.query.mode;
        let orders: any[] = [];
        switch (mode) {
            case 'unconfirm':
                orders = await db.fruitOrderModel.find({ orderUser: saleUser._id, state: FruitOrderState.UnConfirm }).exec();
                break;
            case 'sendProduct':
                orders = await db.fruitOrderModel.find({ orderUser: saleUser._id, state: FruitOrderState.SendProduct }).exec();
                break;
            // 已完结
            case 'finish':
                orders = await db.fruitOrderModel.find({ orderUser: saleUser._id, state: FruitOrderState.Finish }).exec();
                break;
            // 所有订单
            default:

                orders = await db.fruitOrderModel.find({ orderUser: saleUser._id, }).exec();

                break;
        }
        for (let order of orders) {
            order.product = await db.fruitProductModel.findById(order.product).populate('images').exec();
        }

        console.log(orders);
        await ctx.render('order', { orders, FruitOrderState, mode });
    })
    .get('/logout', async (ctx, next) => {
        delete (ctx.session as any).saleUser;

        await ctx.redirect('/login')
    })
    .del('/sale.cancelOrder.del', checkUserLogin, async (ctx, next) => {
        let saleUser = (ctx.session as any).saleUser;

        let { orderId } = ctx.query;
        let order = await db.fruitOrderModel.findOne({ _id: orderId, state: FruitOrderState.UnConfirm }).exec();
        if (order) {
            if (order.orderUser == saleUser._id) {
                order.update({ state: FruitOrderState.SendProduct }).exec();
                ctx.body = {
                    ok: true,
                    data: '已经取消订单'
                }
            } else {
                ctx.body = { ok: false, data: '非法的订单' };
            }
        } else {
            ctx.body = { ok: false, data: '订单不存在' };
        }
    })
    .post('/sale.confirmOrder.post', checkUserLogin, async (ctx, next) => {
        let { orderId } = ctx.request.body;

        await db.fruitOrderModel.findByIdAndUpdate(orderId, { state: FruitOrderState.SendProduct });
        ctx.body = { ok: true, data: '已经确认订单,等待发货' }
    })




export { saleRouter }