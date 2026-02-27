import api from './axios';

const postApi = {

  getStats: () => api.get('/posts-stats'),

  // Get all posts (paginated)
  getAll: (page = 1, search = '', filterStatus = '') => {
    const params = { page };
    if (search)       params.search = search;
    if (filterStatus) params.status = filterStatus;  // ✅ add this
    return api.get('/posts', { params });
  },

  // Get single post
  getOne: (id) =>
    api.get(`/posts/${id}`),

  // Create post
  create: (data) =>
    api.post('/posts', data),

  // Update post — using POST + _method for form-data support
  update: (id, data) => {
    const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    return api.post(`/posts/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  // Delete post
  delete: (id) =>
    api.delete(`/posts/${id}`),

};

export default postApi;