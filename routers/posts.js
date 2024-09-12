const router = require('express').Router();
const { PrismaClient } = require('@prisma/client'); // Prismaクライアントのインポート
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const isAuthenticated = require('../middlewares/isAuthenticated');

const prisma = new PrismaClient(); // Prismaクライアントのインスタンスを作成

// つぶやき投稿用API
router.post('/post', isAuthenticated, async (req, res) => {
  const { content } = req.body;
  // contentが無ければ保存しない
  if (!content) {
    return res.status(400).json({ message: '投稿内容がありません' });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        // 今ログインしてるuserのId
        authorId: req.userId, // req.userにユーザー情報があると仮定
      },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.status(201).json(newPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'サーバーエラーです' });
  }
});

// 最新つぶやき取得用API
router.get('/get_latest_post', async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.json(latestPosts);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'サーバーエラーです。' });
  }
});

//その閲覧しているユーザーの投稿内容だけを取得
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const userPosts = await prisma.post.findMany({
      where: {
        authorId: parseInt(userId),
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: true,
      },
    });
    return res.status(200).json(userPosts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'サーバーエラーです。' });
  }
});

// server.jsで呼び出せるようになる
module.exports = router;
