import upload from '../config/upload.js';

export const uploadMiddleware = upload.single('file');
