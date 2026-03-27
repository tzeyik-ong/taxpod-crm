import axios from 'axios'

const http = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export const leadsApi = {
  getAll:   (params) => http.get('/leads', { params }),
  getById:  (id)     => http.get(`/leads/${id}`),
  create:   (data)   => http.post('/leads', data),
  update:   (id, data) => http.put(`/leads/${id}`, data),
  remove:   (id)     => http.delete(`/leads/${id}`),
}

export const opportunitiesApi = {
  getAll:   (params)   => http.get('/opportunities', { params }),
  getById:  (id)       => http.get(`/opportunities/${id}`),
  create:   (data)     => http.post('/opportunities', data),
  update:   (id, data) => http.put(`/opportunities/${id}`, data),
  remove:   (id)       => http.delete(`/opportunities/${id}`),
}

export const activitiesApi = {
  getAll:  (params) => http.get('/activities', { params }),
  create:  (data)   => http.post('/activities', data),
  remove:  (id)     => http.delete(`/activities/${id}`),
}

export const dashboardApi = {
  get: () => http.get('/dashboard'),
}

export const copilotApi = {
  query: (message, history) =>
    http.post('/copilot/query', { message, history }),
}

export default http
