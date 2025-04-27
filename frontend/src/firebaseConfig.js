// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// 你的 Firebase 配置
const firebaseConfig = {
  apiKey: "AIzaSyAsstGnx6_EUJrSe_xE2LnCLKZ8Gw4Mpc",
  authDomain: "visafeedback.firebaseapp.com",
  projectId: "visafeedback",
  storageBucket: "visafeedback.appspot.com", // ✅ 注意这里应该是 .appspot.com
  messagingSenderId: "516966127971",
  appId: "1:516966127971:web:c29d2fff...b56",
  measurementId: "G-V3L432K93N",
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// ✅ 导出 storage 供其他组件使用
export { storage };
