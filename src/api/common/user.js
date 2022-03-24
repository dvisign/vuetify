import request from '@/api/common/createApi';

export const userRequest = (options) => {
  const { url, method, config } = options;
  return request({
    url,
    method,
    headers : config.headers
  })
};

export const loginRequest = (options) => {
  const { url, method, params } = options;
  return request({
    url,
    method,
    data : params
  })
}

export const logoutRequest = (options) => {
  const { url } = options;
  return request({
    url,
    method : 'post'
  })
}