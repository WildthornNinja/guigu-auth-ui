/**
 * 创建用户管理功能模块相关API请求 
 */
import request from '@/utils/request'

const api_name = '/admin/system/sysUser'

export default {
  /**
   * 获取用户分页列表(带搜索)
   */
  getPageList(current,size,searchObj){
    return request({
      url: api_name+'/'+current+'/'+size,
      method: 'get',
      params: searchObj
    })
  },
  /**
   * 用户添加
   */
   addUser(user){
    return request({
      url: api_name+'/addUser',
      method: 'post',
      data:user,
    })
   },
   /**
    * 根据id删除用户信息
    */
   removeById(id){
    return request({
      url: api_name+'/deleteById/'+id,
      method:"delete",
    })
   },
   /**
    * 查询待修改用户信息，数据回显 
    */
   getById(id){
    return request({
      url: api_name+'/getById/'+id,
      method:'get',
    })
   },
   /**
    * 更新角色信息
    */
   updateById(user){
    return request({
      url:api_name+'/updateUser',
      method:'put',
      data: user,
    })
   },
   /**
    * 更新用户状态
    */
   updateStatus(userId,status){
    return request({
      url:`${api_name}/updateStatus/${userId}/${status}`,
      method: 'get',
    });
   }
}