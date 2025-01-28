/**
 * @swagger
 * components:
 *   schemas:
 *     Video:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The video ID
 *         videoId:
 *           type: string
 *           description: The ID of the video from YouTube
 *         title:
 *           type: string
 *           description: The title of the video
 *         channel:
 *           type: string
 *           description: The channel that uploaded the video
 *         notes:
 *           type: string
 *           description: Notes about the video
 *       required:
 *         - videoId
 *         - title
 *         - channel
 */

/**
 * @swagger
 * /videos:
 *   get:
 *     summary: Get all videos for the authenticated user
 *     tags: [Videos]
 *     responses:
 *       200:
 *         description: List of videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Video'
 */

/**
 * @swagger
 * /videos:
 *   post:
 *     summary: Create a new video
 *     tags: [Videos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               videoId:
 *                 type: string
 *               title:
 *                 type: string
 *               channel:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Video created successfully
 *       400:
 *         description: Validation error
 */


import { Router } from 'express';
import { check } from 'express-validator';
import { authenticate } from '../middlewares/auth.js';
import { createVideo, getVideos } from '../controllers/video.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  [
    check('videoId').notEmpty().withMessage('Video ID is required'),
    check('title').notEmpty().withMessage('Title is required'),
    check('channel').notEmpty().withMessage('Channel is required'),
    check('notes').optional().isString().withMessage('Notes must be a string')
  ],
  createVideo
);

router.get('/', getVideos);

export default router;
