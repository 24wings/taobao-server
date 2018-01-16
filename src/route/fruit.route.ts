import Router = require('koa-router');
import { auth } from '../middleware';
import db = require('../model');
import service = require('../service');
import { FruitOrderState, fruitOrderModel } from '../model/app-fruit/fruit-order';




let fruitRouter = new Router();


fruitRouter
    .post('/fruit.login.post', async (ctx, next) => {
        let { username, password } = ctx.request.body;
        let admin = await db.adminModel.findOne({ phone: username, password }).exec();
        if (admin) {
            (ctx.session as any).fruitAdmin = admin;
            console.log(admin);
            console.log(ctx.session);
            ctx.body = { ok: true, data: '登录成功' };
        } else {
            ctx.body = { ok: false, data: '用户名或密码错误' };
        }
    })
    .get('/fruit.todayOrders.get', auth.checkAdminLogin, async (ctx, next) => {
        let { orderState } = ctx.query;
        let adminId = (ctx.session as any).fruitAdmin._id;
        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5, 0, 0, 0);
        let today24HourAfter = new Date(today.getTime() + 24 * 60 * 60 * 1000 * 5);
        let query: any = { admin: adminId, createDt: { $lt: today24HourAfter, $gt: today } };
        if (orderState && orderState != 'null') query.state = orderState
        let todayOrders = await db.fruitOrderModel.find(query).exec();
        ctx.body = { ok: true, data: todayOrders };
    })
    .get('/fruit.mainInfo.get', auth.checkAdminLogin, async (ctx, next) => {
        let adminId = (ctx.session as any).fruitAdmin._id;
        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        let today24HourAfter = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        let todayOrdersNum = await db.fruitOrderModel.find({ admin: adminId, createDt: { $lt: today24HourAfter, $gt: today } }).count().exec();
        ctx.body = { ok: true, data: { todayOrdersNum } };

    })
    .get('/fruit.todayOrdersNum.get', auth.checkAdminLogin, async (ctx, next) => {
        let adminId = (ctx.session as any).fruitAdmin._id;
        let now = new Date();
        let today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        let today24HourAfter = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        let todayOrdersNum = await db.fruitOrderModel.find({ admin: adminId, createDt: { $lt: today24HourAfter, $gt: today } }).count().exec();
        ctx.body = { ok: true, data: todayOrdersNum };

    })
    .get('/fruit.adminLogout.get', async (ctx, next) => {
        delete (ctx.session as any).fruitAdmin;
        ctx.body = { ok: true, data: '登出成功' };
    })
    .get('/fruit.adminInfo.get', auth.checkAdminLogin, async (ctx, next) => {
        let admin = (<any>ctx.session).fruitAdmin;
        console.log(admin, ctx.session);
        ctx.body = { ok: true, data: admin };
    })
    .get('/fruit.sendProductOrdersNum.get', auth.checkAdminLogin, async (ctx, next) => {
        let admin = (ctx.session as any).fruitAdmin;
        let num = await db.fruitOrderModel.find({ admin: admin._id, state: FruitOrderState.SendProduct }).count().exec();
        ctx.body = { ok: true, data: num };
    })
    .get('/fruit.userlist.get', async (ctx, next) => {
        let { adminId } = ctx.query;
        let users = await db.fruitUserModel.find({ admin: adminId }).exec();
        ctx.body = { ok: true, data: users };
    })
    .post('/fruit.createUser.post', async (ctx, next) => {
        let { adminId, nickname, password, phone } = ctx.request.body;
        // 查看是否含有该管理员的手机号的用户
        let count = await db.fruitUserModel.find({ phone, admin: adminId }).count().exec();
        if (count > 0) {
            ctx.body = { ok: false, data: '该用户已经添加' }
        } else {
            let newFruitUser = await new db.fruitUserModel({ admin: adminId, nickname, password, phone }).save();
            ctx.body = { ok: true, data: newFruitUser };
        }
    })
    .del('/fruit.deleteFruitUser.del', async (ctx, next) => {

        let { adminId, userId } = ctx.request.query;
        let count = await db.fruitUserModel.find().count();
        let fruitUser = await db.fruitUserModel.findOne({ admin: adminId, _id: userId }).exec();
        if (fruitUser) {
            await fruitUser.remove();
        }
        ctx.body = { ok: true, data: count };
    })
    //
    .get('/fruit.searchUserlist.get', async (ctx, next) => {
        let { keyword, adminId } = ctx.query;

        if (adminId) {
            let users = [];
            if (!keyword) {
                users = <any>await db.fruitUserModel.find({ admin: adminId }).exec()
            } else {
                users = <any>await db.fruitUserModel.find({ $or: [{ nickname: new RegExp(keyword, 'g') }, { phone: new RegExp(keyword, 'g') }], admin: adminId }).exec();
            }

            ctx.body = { ok: true, data: users }
        } else {
            ctx.body = { ok: true, data: [] };
        }
    })
    .put('/fruit.updateUser.put', async (ctx, next) => {
        let { userId, adminId } = ctx.query;
        let newUser = ctx.request.body;
        if (newUser && adminId && userId) {
            let exit = await db.fruitUserModel.findOne({ admin: adminId, phone: newUser.phone }).exec();
            if (exit) {
                ctx.body = { ok: false, data: '该手机号已经注册' };
            } else {
                let updateAction = db.fruitUserModel.findOneAndUpdate({ admin: adminId, userId: userId }, newUser).exec();
                ctx.body = { ok: true, data: updateAction }

            }

        } else {
            ctx.body = { ok: false, data: '参数不全' };
        }

    })

    // 产品管理
    .get('/fruit.productGroups.get', async (ctx, next) => {
        let { adminId } = ctx.query;
        let productGroups = await db.fruitProductGroupModel.find({ admin: adminId }).populate('image').exec();
        ctx.body = { ok: true, data: productGroups };
    })
    .post('/fruit.createProductGroup.post', async (ctx, next) => {
        let { adminId } = ctx.query;
        let { image, name, isRecommand } = ctx.request.body;
        if (name && image) {
            // let admin  = await db.adminModel.findById(adminId).exec()

            let result = await service.cloud.uploadImage(image);
            result.admin = adminId;
            result.appName = 'fruit';

            let newImage = await new db.cloudinaryImageModel(result).save();
            let newProductGroup = await new db.fruitProductGroupModel({ name: name, admin: adminId, image: newImage._id }).save();
            ctx.body = { ok: true, data: newProductGroup };

        } else {
            ctx.body = { ok: false, data: '参数不全' }
        }

    })
    //  更新产品组
    .put('/fruit.updateProductGroup.put', async (ctx, next) => {
        let { adminId, groupId } = ctx.query;
        let newGroup = ctx.request.body;
        if (newGroup.image.length > 200) {
            let result = await service.cloud.uploadImage(newGroup.image);
            result.admin = adminId;
            result.appName = 'fruit';
            let newImage = await new db.cloudinaryImageModel(result).save();
            newGroup.image = newImage._id;

        }
        let updateAction = await db.fruitProductGroupModel.findOneAndUpdate({ admin: adminId, _id: groupId }, newGroup);
        ctx.body = { ok: true, data: updateAction };

    })

    // 删除产品组

    .del('/fruit.deleteProductGroup.del', async (ctx, next) => {
        let { adminId, groupId } = ctx.query;
        let removeAction = await db.fruitProductGroupModel.findOne({ _id: groupId, admin: adminId }).remove();
        ctx.body = { ok: true, data: removeAction };
    })
    // 产品详情组,列举子产品
    .get('/fruit.productGroupProducts.get', async (ctx, next) => {
        let { adminId, groupId } = ctx.query;
        let group = await db.fruitProductGroupModel.findOne({ admin: adminId, _id: groupId }).populate('image').exec();
        let products: any[] = [];
        if (group) {
            products = await db.fruitProductModel.find({ _id: { $in: group.products } }).populate('images').exec();
            group.products = products;
        } else {
        }
        ctx.body = { ok: true, data: group };

    })
    .post('/fruit.createProduct.post', async (ctx, next) => {
        let { adminId, groupId } = ctx.query;
        let newProduct = ctx.request.body;
        /**将产品图片上传 */
        let images = newProduct.images ? newProduct.images : [];
        let imageItems = await service.cloud.storeImages(images, adminId, 'fruit');
        newProduct.images = imageItems.map(item => item._id);
        newProduct.admin = adminId;
        let saveProduct = await new db.fruitProductModel(newProduct).save();
        //更新父亲产品下的产品列表
        await db.fruitProductGroupModel.findOne({ _id: groupId, admin: adminId }).update({ $push: { products: saveProduct._id } }).exec();
        ctx.body = { ok: true, data: saveProduct }
    })
    .del('/fruit.deleteProduct.del', async (ctx, next) => {
        let { adminId, productId } = ctx.query;

        let removeAction = await db.fruitProductModel.findOne({ _id: productId, admin: adminId }).remove();
        ctx.body = { ok: true, data: removeAction };
    })
    .put('/fruit.updateProduct.put', async (ctx, next) => {
        let { adminId, productId } = ctx.query;
        let newProduct = ctx.request.body;
        // newProduct.images = [];
        let images = newProduct.images;
        images = await service.cloud.storeImages(images, adminId, 'fruit');
        newProduct.images = images.map(image => image._id);
        if (newProduct._id) delete newProduct._id;
        let updateAction = await db.fruitProductModel.findOneAndUpdate({ admin: adminId, _id: productId }, newProduct).exec();
        console.log(adminId, productId, newProduct, updateAction);
        ctx.body = { ok: true, data: updateAction };

    })



export { fruitRouter }; 