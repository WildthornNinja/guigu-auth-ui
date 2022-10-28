import request from '@/utils/request'

const api_name = '/admin/system/index'

export function login(data) {
  return request({
    url: api_name+'/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: api_name+'/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: api_name+'/logout',
    method: 'post'
  })
}
// export function login(data) {
//   return request({
//     url: '/vue-admin-template/user/login',
//     method: 'post',
//     data
//   })
// }

// export function getInfo(token) {
//   return request({
//     url: '/vue-admin-template/user/info',
//     method: 'get',
//     params: { token }
//   })
// }

// export function logout() {
//   return request({
//     url: '/vue-admin-template/user/logout',
//     method: 'post'
//   })
// }
