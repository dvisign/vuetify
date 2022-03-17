import axios from 'axios'

const service = axios.create({
  baseURL: '/BC',
  timeout: 5000, 
})

export default service
