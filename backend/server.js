const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');


const app = express();
const PORT = 5000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'visa-feedback-secret-token'; // 密钥可以自定义

// ======== 中间件配置 ========
app.use(cors({
    origin: '*', // 允许所有前端
    credentials: false // JWT 不依赖 Cookie
  }));
  
app.use(express.json());


// ======== 静态文件 ========
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ======== Multer 上传配置 ========
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });

// ======== 登录验证中间件 ========
function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // 提取 Bearer 后的 Token
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
      }
      req.user = decoded; // 保存用户信息
      next();
    });
  }
  

// ======== 上传接口 ========
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `http://localhost:${PORT}/uploads/${file.filename}`;
  res.json({ success: true, fileUrl: fileUrl });
});

// ======== 学生提交反馈 ========
app.post('/submit-feedback', upload.single('file'), (req, res) => {
  const file = req.file;
  const description = req.body.description || '无描述';

  if (!file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const fileUrl = `http://localhost:${PORT}/uploads/${file.filename}`;
  let feedbacks = [];
  if (fs.existsSync('feedback.json')) {
    feedbacks = JSON.parse(fs.readFileSync('feedback.json'));
  }

  const newFeedback = {
    id: feedbacks.length + 1,
    studentName: "匿名",
    description: description,
    fileUrl: fileUrl,
    status: "未处理",
    reply: ""
  };

  feedbacks.push(newFeedback);
  fs.writeFileSync('feedback.json', JSON.stringify(feedbacks, null, 2));

  res.json({ success: true, message: 'Feedback submitted', data: newFeedback });
});

// ======== 获取所有反馈（需登录） ========
app.get('/feedbacks', verifyToken, (req, res) => {
    let feedbacks = [];
    if (fs.existsSync('feedback.json')) {
      feedbacks = JSON.parse(fs.readFileSync('feedback.json'));
    }
    res.json(feedbacks);
  });

// ======== 员工回复反馈（需登录） ========
app.post('/feedback/:id/reply', verifyToken, (req, res) => {
    const feedbackId = parseInt(req.params.id);
    const replyText = req.body.reply;
  
    let feedbacks = [];
    if (fs.existsSync('feedback.json')) {
      feedbacks = JSON.parse(fs.readFileSync('feedback.json'));
    }
  
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
  
    feedback.reply = replyText;
    feedback.status = '已回复';
  
    fs.writeFileSync('feedback.json', JSON.stringify(feedbacks, null, 2));
  
    res.json({ success: true, message: 'Reply saved', feedback: feedback });
  });

// ======== 员工注册 ========
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  let employees = [];
  if (fs.existsSync('employees.json')) {
    employees = JSON.parse(fs.readFileSync('employees.json'));
  }

  const existingUser = employees.find(e => e.username === username);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newEmployee = {
    id: employees.length + 1,
    username: username,
    passwordHash: passwordHash,
    role: 'staff'
  };

  employees.push(newEmployee);
  fs.writeFileSync('employees.json', JSON.stringify(employees, null, 2));

  res.json({ success: true, message: 'Employee registered successfully' });
});

// ======== 员工登录 ========
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    let employees = [];
    if (fs.existsSync('employees.json')) {
      employees = JSON.parse(fs.readFileSync('employees.json'));
    }
  
    const employee = employees.find(e => e.username === username);
    if (!employee) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }
  
    const match = await bcrypt.compare(password, employee.passwordHash);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Invalid username or password' });
    }
  
    // 生成 JWT Token
    const token = jwt.sign({ id: employee.id, username: employee.username }, JWT_SECRET, { expiresIn: '2h' });
  
    res.json({ success: true, message: 'Login successful', token });
  });
  
  function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
  
    // === 👉 在这里加打印！ ===
    console.log('🔍 Token received:', token);
  
    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('❌ Token verification failed:', err.message); // 这里也加打印
        return res.status(401).json({ success: false, message: 'Failed to authenticate token.' });
      }
      req.user = decoded;
      next();
    });
  }
  
  // 获取反馈 - 需要 JWT 验证
app.get('/feedbacks', verifyToken, (req, res) => {
    let feedbacks = [];
    if (fs.existsSync('feedback.json')) {
      feedbacks = JSON.parse(fs.readFileSync('feedback.json'));
    }
    res.json(feedbacks);
  });
  
  // 回复反馈 - 需要 JWT 验证
  app.post('/feedback/:id/reply', verifyToken, (req, res) => {
    const feedbackId = parseInt(req.params.id);
    const replyText = req.body.reply;
  
    let feedbacks = [];
    if (fs.existsSync('feedback.json')) {
      feedbacks = JSON.parse(fs.readFileSync('feedback.json'));
    }
  
    const feedback = feedbacks.find(f => f.id === feedbackId);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }
  
    feedback.reply = replyText;
    feedback.status = '已回复';
  
    fs.writeFileSync('feedback.json', JSON.stringify(feedbacks, null, 2));
  
    res.json({ success: true, message: 'Reply saved', feedback: feedback });
  });
  
// ======== 员工注销 ========
app.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true, message: 'Logged out successfully' });
});

// ======== 启动服务器 ========
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
