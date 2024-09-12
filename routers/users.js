const router = require('express').Router();
const { PrismaClient } = require('@prisma/client'); // Prismaクライアントのインポート
const isAuthenticated = require('../middlewares/isAuthenticated');

const prisma = new PrismaClient(); // Prismaクライアントのインスタンスを作成

router.get('/find', isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      res.status(404).json({ error: 'ユーザーがみつかりませんでした' });
    }

    res.status(200).json({
      user: { id: user.id, email: user.email, username: user.name },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!profile) {
      return res.status(404).json({ message: 'プロフィールが見つかりませんでした。' });
    }

    res.status(200).json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
