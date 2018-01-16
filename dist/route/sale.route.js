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
const fruit_order_1 = require("../model/app-fruit/fruit-order");
let saleRouter = new Router();
exports.saleRouter = saleRouter;
let checkUserLogin = (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let saleUser = ctx.session.saleUser;
    console.log(saleUser);
    if (saleUser) {
        console.log('用户已经登录', ctx.path, saleUser);
        yield next();
    }
    else {
        console.log('用户尚未denglu');
        yield ctx.redirect('/login');
    }
});
saleRouter.get('/', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let groupId = ctx.query.groupId;
    let groups = yield db.fruitProductGroupModel.find().exec();
    if (!groupId)
        groupId = groups[0]._id;
    let products = yield db.fruitProductModel.find({ group: groupId }).populate('images').exec();
    yield ctx.render('home', { groups, products, groupId });
}))
    .get('/detail', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { productId } = ctx.query;
    let product = yield db.fruitProductModel.findById(productId).populate('images').exec();
    yield ctx.render('detail', { product });
}))
    .get('/login', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    yield ctx.render('login');
}))
    .get('/sale.isUserLogin.get', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    ctx.body = { ok: !!(ctx.session.saleUser), data: {} };
}))
    .post('/login', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { phone, password } = ctx.request.body;
    let user = yield db.fruitUserModel.findOne({ phone, password }).exec();
    if (user) {
        ctx.session.saleUser = user;
        yield ctx.redirect('/');
    }
    else {
        yield ctx.render('login', { error: '用户名或密码错误' });
    }
}))
    .post('/sale.createOrder.post', checkUserLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { productId, num, address } = ctx.request.body;
    let orderUser = ctx.session.saleUser._id;
    if (productId && num && address) {
        let newOrder = yield new db.fruitOrderModel({ product: productId, orderUser, num, address, state: fruit_order_1.FruitOrderState.UnConfirm }).save();
        ctx.body = { ok: true, data: '订购成功,请到个人中心查看' };
    }
    else {
        ctx.body = { ok: false, data: '请填写收货地址' };
    }
    // let data = db.FruitOrderState
    // ctx.body = { ok: true, productId, num, address };
}))
    .get('/person-center', checkUserLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let saleUser = ctx.session.saleUser;
    let unConfirmProductsNum = yield db.fruitOrderModel.find({ orderUser: saleUser._id, state: fruit_order_1.FruitOrderState.UnConfirm }).count().exec();
    let sendingProductsNum = yield db.fruitOrderModel.find({ orderUser: saleUser._id, state: fruit_order_1.FruitOrderState.SendProduct }).count().exec();
    let finishOrdersNum = yield db.fruitOrderModel.find({ orderUser: saleUser._id }).count().exec();
    yield ctx.render('person-center', { saleUser, unConfirmProductsNum, finishOrdersNum, sendingProductsNum });
}))
    .get('/order', checkUserLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let saleUser = ctx.session.saleUser;
    let mode = ctx.query.mode;
    let orders = [];
    switch (mode) {
        case 'unconfirm':
            orders = yield db.fruitOrderModel.find({ orderUser: saleUser._id, state: fruit_order_1.FruitOrderState.UnConfirm }).exec();
            break;
        case 'sendProduct':
            orders = yield db.fruitOrderModel.find({ orderUser: saleUser._id, state: fruit_order_1.FruitOrderState.SendProduct }).exec();
            break;
        // 已完结
        case 'finish':
            orders = yield db.fruitOrderModel.find({ orderUser: saleUser._id, state: fruit_order_1.FruitOrderState.Finish }).exec();
            break;
        // 所有订单
        default:
            orders = yield db.fruitOrderModel.find({ orderUser: saleUser._id, }).exec();
            break;
    }
    for (let order of orders) {
        order.product = yield db.fruitProductModel.findById(order.product).populate('images').exec();
    }
    console.log(orders);
    yield ctx.render('order', { orders, FruitOrderState: fruit_order_1.FruitOrderState, mode });
}))
    .get('/logout', (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    delete ctx.session.saleUser;
    yield ctx.redirect('/login');
}))
    .del('/sale.cancelOrder.del', checkUserLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let saleUser = ctx.session.saleUser;
    let { orderId } = ctx.query;
    let order = yield db.fruitOrderModel.findOne({ _id: orderId, state: fruit_order_1.FruitOrderState.UnConfirm }).exec();
    if (order) {
        if (order.orderUser == saleUser._id) {
            order.update({ state: fruit_order_1.FruitOrderState.SendProduct }).exec();
            ctx.body = {
                ok: true,
                data: '已经取消订单'
            };
        }
        else {
            ctx.body = { ok: false, data: '非法的订单' };
        }
    }
    else {
        ctx.body = { ok: false, data: '订单不存在' };
    }
}))
    .post('/sale.confirmOrder.post', checkUserLogin, (ctx, next) => __awaiter(this, void 0, void 0, function* () {
    let { orderId } = ctx.request.body;
    yield db.fruitOrderModel.findByIdAndUpdate(orderId, { state: fruit_order_1.FruitOrderState.SendProduct });
    ctx.body = { ok: true, data: '已经确认订单,等待发货' };
}));
