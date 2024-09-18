const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
// パスワードのハッシュ化
const bcrypt = require('bcrypt');
// ログインチケットの発行
const jwt = require('jsonwebtoken');
const generateIdenticon = require('../utils/generateIdenticon');

// 新規ユーザー登録API(エンドポイント、return)
// エンドポイント:特定のリソースや機能にアクセスするためのURL
// エンドポイントが指定されると処理する。要は関数の名前的なもの
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  defaultIconImage = generateIdenticon(email);

  const hashedPassword = await bcrypt.hash(password, 10);

  //schema.prismaを小文字に
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      profile: {
        create: {
          bio: 'はじめまして',
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });

  return res.json({ user });
});

// ユーザーログインAPI
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // DBからemail検索
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(401).json({ error: 'そのユーザーは存在しません。' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  console.log(isPasswordValid);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'そのパスワードは間違っています' });
  }
  // ログインへのチケット（トークン）を発行.発行されたトークンをhttps://jwt.io/で確認するとIDが見れる、
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    // 一日でトークンが消える→トークンが盗まれたらid,passを照合されてしまう。
    expiresIn: '1d',
  });
  return res.json({ token });
});

// server.jsで呼び出せるようになる
module.exports = router;
