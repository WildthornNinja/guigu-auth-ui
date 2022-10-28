/**
 * 创建角色管理功能模块相关API请求 
 */
import request from '@/utils/request'

const api_name = '/admin/system/sysRole'

export default {
  /**
   * 获取角色分页列表(带搜索)
   */
  getPageList(current,size,searchObj){
    return request({
      url: api_name+'/'+current+'/'+size,
      method: 'get',
      params: searchObj
    })
  },
  /**
   * 角色添加
   */
   addRole(role){
    return request({
      url: api_name+'/addRole',
      method: 'post',
      data:role,
    })
   },
   /**
    * 根据id删除角色信息
    */
   removeById(id){
    return request({
      url: api_name+'/deleteById/'+id,
      method:"delete"
    })
   },
   /**
    * 查询待修改角色信息，数据回显 
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
   updateById(role){
    return request({
      url:api_name+'/updateSysRole',
      method:'put',
      data: role,
    })
   },
   /**
    * 批量删除角色
    */
   batchRemove(idList){
    return request({
      url: api_name+'/deleteBatch',
      method:'delete',
      data: idList,
    })
   },
   /**
    * 通过用户ID获取角色信息
    */
    getRolesByUserId(userId){
      return request({
        url: api_name+"/getRolesByUserId/"+userId,
        method: 'get',
      })
    },
    /**
     * 给用户分配角色
     */
     assignRoles(assignRoleVo){
      return request({
        url: api_name+"/doAssign",
        method: 'post',
        data: assignRoleVo,
      });
     }

}