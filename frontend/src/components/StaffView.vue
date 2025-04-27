<template>
    <div>
      <h2>Staff Feedback Management</h2>
      <div v-for="feedback in feedbacks" :key="feedback.id" class="feedback-card">
        <p><strong>ID:</strong> {{ feedback.id }}</p>
        <p><strong>Description:</strong> {{ feedback.description }}</p>
        <p><strong>Status:</strong> {{ feedback.status }}</p>
        <p><strong>File:</strong> <a :href="feedback.fileUrl" target="_blank">View File</a></p>
        <p v-if="feedback.reply"><strong>Reply:</strong> {{ feedback.reply }}</p>
  
        <div v-if="feedback.status === '未处理'">
          <textarea v-model="feedback.replyText" placeholder="Write a reply..."></textarea><br />
          <button @click="sendReply(feedback)">Send Reply</button>
        </div>
        <hr />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import axios from 'axios'
  
  const feedbacks = ref([])
  
  onMounted(async () => {
    const response = await axios.get('http://localhost:5000/feedbacks')
    feedbacks.value = response.data.map(f => ({ ...f, replyText: '' }))
  })
  
  const sendReply = async (feedback) => {
    try {
      await axios.post(`http://localhost:5000/feedback/${feedback.id}/reply`, {
        reply: feedback.replyText
      })
      feedback.status = '已回复'
      feedback.reply = feedback.replyText
      feedback.replyText = ''
    } catch (error) {
      console.error('Reply failed', error)
    }
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
    margin-top: 5px;
  }
  </style>
  