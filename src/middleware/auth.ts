import koa = require('koa');

/**管理员 */
export let checkAdminLogin: koa.Middleware = async (ctx, next) => {
    let admin = (ctx.session as any).fruitAdmin;
    console.log(ctx.session);
    console.log('管理员:`', admin)
    if (admin) {
        await next();
    } else {
        ctx.body = { ok: false, data: '尚未登录' };
    }
}