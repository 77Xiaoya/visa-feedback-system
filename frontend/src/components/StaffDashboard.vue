<template>
    <div>
      <h2>Feedback Management</h2>
      <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
        <p><strong>Description:</strong> {{ feedback.description }}</p>
        <p><strong>Status:</strong> {{ feedback.status }}</p>
        <p><strong>File:</strong> <a :href="feedback.fileUrl" target="_blank">View File</a></p>
        <div v-if="feedback.status === '未处理'">
          <textarea v-model="feedback.replyText" placeholder="Write a reply..."></textarea><br />
          <button @click="sendReply(feedback)">Reply</button>
        </div>
        <p v-if="feedback.reply"><strong>Reply:</strong> {{ feedback.reply }}</p>
        <hr />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const feedbacks = ref([])
  
  onMounted(async () => {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:5000/feedbacks', {
      headers: { Authorization: `Bearer ${token}` }
    })
    feedbacks.value = response.data.map(f => ({ ...f, replyText: '' }))
  })
  
  const sendReply = async (feedback) => {
    const token = localStorage.getItem('token')
    await axios.post(`http://localhost:5000/feedback/${feedback.id}/reply`, {
      reply: feedback.replyText
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    feedback.status = '已回复'
    feedback.reply = feedback.replyText
    feedback.replyText = ''
  }
  </script>
  
  <style scoped>
  .feedback-card {
    border: 1px solid #ccc;
    padding: 10px;
    margin: 10px 0;
  }
  textarea {
    width: 100%;
    max-width: 400px;
  }
  button {
    padding: 5px 10px;
  }
  </style>
  