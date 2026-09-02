import axios from 'axios';

const API = axios.create({
  baseURL: '/api/images'
});

export const fetchImages = () => API.get('/');
export const uploadImage = (formData) => API.post('/', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteImage = (id) => API.delete(`/${id}`);