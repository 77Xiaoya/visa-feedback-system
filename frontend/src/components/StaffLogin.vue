
<template>
    <div class="login-container">
      <h2>Staff Login</h2>
      <input v-model="username" placeholder="Username" />
      <input v-model="password" type="password" placeholder="Password" />
      <button @click="login">Login</button>
  
      <p v-if="errorMessage" style="color: red;">{{ errorMessage }}</p>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  import axios from 'axios'
  
  const username = ref('')
  const password = ref('')
  const errorMessage = ref('')
  const response = await axios.post('https://visa-feedback-system.onrender.com/login', {
  username: username.value,
  password: password.value
})

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        username: username.value,
        password: password.value
      })
      const token = response.data.token
      localStorage.setItem('token', token) // 保存 Token
      window.location.href = '/staff-dashboard' // 跳转
    } catch (err) {
      errorMessage.value = 'Login failed. Please check credentials.'
    }
  }
  </script>
  
  <style scoped>
  .login-container {
    max-width: 300px;
    margin: auto;
    padding: 20px;
  }
  input {
    display: block;
    margin-bottom: 10px;
    padding: 8px;
    width: 100%;
  }
  button {
    padding: 8px 12px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  </style>
  