import api from "./axiosClient";

/**
 * Builds { list, getOne, create, update, remove, patch } for a REST
 * resource at `basePath`. create/update auto-detect FormData (when a
 * file is attached) vs plain JSON.
 */
export const createResource = (basePath) => ({
  list: (params = {}) => api.get(basePath, { params }),
  getOne: (id) => api.get(`${basePath}/${id}`),
  create: (payload) => api.post(basePath, payload, requestConfig(payload)),
  update: (id, payload) =>
    api.put(`${basePath}/${id}`, payload, requestConfig(payload)),
  remove: (id) => api.delete(`${basePath}/${id}`),
  patch: (path) => api.patch(`${basePath}${path}`),
});

const requestConfig = (payload) =>
  payload instanceof FormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : {};

/** Converts a plain object into FormData (skips null/undefined; JSON-stringifies arrays/objects). */
export const toFormData = (obj) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (value instanceof File) {
      fd.append(key, value);
    } else if (Array.isArray(value) || typeof value === "object") {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, value);
    }
  });
  return fd;
};
