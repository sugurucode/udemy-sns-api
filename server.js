const express = require('express');
const router = express.Router();
const app = express();
const authRoute = require('./routers/auth');
const postRoute = require('./routers/posts');
const usersRoute = require('./routers/users');

const cors = require('cors');

//envファイルから変数を読み込める
require('dotenv').config();

const PORT = process.env.PORT || 5000;
//const PORT = process.env.PORT || 5000;

app.use(cors());
// expressでjsonを使用するため
app.use(express.json());
app.use('/api/auth', authRoute);
app.use('/api/posts', postRoute);
app.use('/api/users', usersRoute);

app.listen(PORT, () => console.log(`server is running on Port ${PORT}`));

module.exports = router;
