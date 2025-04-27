<template>
  <div>
    <h2>Submit Feedback</h2>
    <form @submit.prevent="submitFeedback">
      <label for="description">Description:</label><br />
      <textarea id="description" v-model="description" rows="4" cols="50"></textarea><br /><br />
      
      <label for="file">Upload File:</label>
      <input type="file" @change="handleFileChange" /><br /><br />
      
      <button type="submit" :disabled="!selectedFile || !description">Submit Feedback</button>
    </form>

    <div v-if="responseMessage">
      <p>{{ responseMessage }}</p>
      <p v-if="feedbackData">
        File: <a :href="feedbackData.fileUrl" target="_blank">{{ feedbackData.fileUrl }}</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const description = ref('')
const selectedFile = ref(null)
const responseMessage = ref('')
const feedbackData = ref(null)

const handleFileChange = (e) => {
  selectedFile.value = e.target.files[0]
}

const submitFeedback = async () => {
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('description', description.value)

  try {
    const response = await axios.post('http://localhost:5000/submit-feedback', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    responseMessage.value = 'Feedback submitted successfully!'
    feedbackData.value = response.data.data
  } catch (error) {
    responseMessage.value = 'Submission failed!'
    console.error(error)
  }
}
</script>

<style scoped>
textarea {
  width: 100%;
  max-width: 400px;
}
button {
  padding: 8px 12px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
