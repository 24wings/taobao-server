import mongoose = require('mongoose');

mongoose.connect('mongodb://118.31.72.227:27017/tutu');


// 通用
export { cloudinaryImageModel, CloudinaryImage } from './common/cloudinary-image';
export { cloudinaryVideoModel } from './common/cloudniary-video';


// 管理系统
export { adminModel } from './common/admin';


// 资源管理
export { resourceGroupModel } from './resource-group';
export { resourceModel } from './resource';
// banner管理
export { bannerModel } from './banner';