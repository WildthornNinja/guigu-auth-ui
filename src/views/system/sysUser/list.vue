<template>
  <div class="app-container">
    <!--查询表单-->
 <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="8">
            <el-form-item label="关 键 字">
              <el-input style="width: 95%" v-model="searchObj.keyword" placeholder="用户名/姓名/手机号码"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间">
              <el-date-picker
                v-model="createTimes"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="yyyy-MM-dd HH:mm:ss"
                style="margin-right: 10px;width: 100%;"
                :picker-options="pickerOptions"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="display:flex">
          <el-button type="primary" icon="el-icon-search" size="mini" :disabled="$hasBP('bnt.sysUser.list')===false" @click="fetchData()">搜索</el-button>
          <el-button icon="el-icon-refresh" size="mini" @click="resetData">重置</el-button>
        </el-row>
      </el-form>
    </div>
    <!-- 工具条 -->
    <div class="tools-div">
      <el-button
        type="success"
        icon="el-icon-plus"
        size="mini"
        @click="addAction"
        :disabled="$hasBP('bnt.sysUser.add')  === false"
        >添 加</el-button
      >
    </div>
    <div class="app-container">
      <!-- 表格 -->
      <el-table
        v-loading="listLoading"
        :data="list"
        stripe
        border
        style="width: 100%; margin-top: 10px"
      >
        <el-table-column prop="headUrl" label="头像">
          <template slot-scope="scope">
            <el-avatar shape="square" :size="80" fit="fit" :src="scope.row.headUrl"></el-avatar>
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" width="120"/>
        <el-table-column prop="name" label="姓名" width="110" />
        <el-table-column prop="phone" label="手机" />
        <el-table-column label="状态" width="80">
          <template slot-scope="scope">
            <!-- v-model="scope.row.status === 1" -->
            <el-switch
              @change="switchStatus(scope.row)"
              v-model="scope.row.status === 1">
              <!-- v-model="scope.row.status===1?true:false"> -->
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column prop = "deptId" label="部门" width="80"/>
        <el-table-column prop = "postId" label="岗位" width="80" />
          <el-table-column prop = "description" label="描述" />
         <el-table-column prop="createTime" label="创建时间" />
          <el-table-column label="操作"  width="180" align="center" fixed="right">
            <template slot-scope="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini" :disabled="$hasBP('bnt.sysUser.update')===false" @click="editAction(scope.row.id)" title="修改"/>
              <el-button type="danger" icon="el-icon-delete" size="mini" :disabled="$hasBP('bnt.sysUser.remove')===false" @click="removeDataById(scope.row.id)" title="删除" />
              <el-button type="warning" icon="el-icon-baseball" size="mini" :disabled="$hasBP('bnt.sysUser.assignRole')===false" @click="showAssignRole(scope.row)" title="分配角色"/>
            </template>
          </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        :current-page="page"
        :total="total"
        :page-size="limit"
        :page-sizes="[2,10,20,30,40,50,100]"
        style="padding: 30px 0; text-align: center;"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchData"
        @size-change="changeSize"
      />
    </div>
    <!-- 添加或修改的表单 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="40%" >
        <el-form ref="addUserForm" :model="sysUser" :rules="rules" label-width="100px" size="small" style="padding-right: 40px;">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="sysUser.username"/>
          </el-form-item>
          <el-form-item v-if="!sysUser.id" label="密码" prop="password">
            <el-input v-model="sysUser.password" type="password"/>
          </el-form-item>
          <el-form-item label="姓名" prop="name">
            <el-input v-model="sysUser.name"/>
          </el-form-item>
          <el-form-item label="手机" prop="phone">
            <el-input v-model="sysUser.phone"/>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false" size="small" icon="el-icon-refresh-right">取 消</el-button>
          <el-button type="primary" icon="el-icon-check" @click="saveOrUpdate()" size="small">确 定</el-button>
        </span>
    </el-dialog>
    <!-- 分配角色表单 -->
     <el-dialog title="分配角色" :visible.sync="dialogRoleVisible">
      <el-form label-width="80px">
        <el-form-item label="用户名">
          <el-input disabled :value="sysUser.username"></el-input>
        </el-form-item>

        <el-form-item label="角色列表">
          <el-checkbox :indeterminate="isIndeterminate" v-model="checkAll" @change="handleCheckAllChange">全选</el-checkbox>
          <div style="margin: 15px 0;"></div>
          <el-checkbox-group v-model="userRoleIds" @change="handleCheckedChange">
            <el-checkbox v-for="role in allRoles" :key="role.id" :label="role.id">{{role.roleName}}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button type="primary" @click="assignRole" size="small">保存</el-button>
        <el-button @click="dialogRoleVisible = false" size="small">取消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import api from "@/api/system/sysUser";
import roleApi from "@/api/system/sysRole";
const addUserForm = {
  id: "",
  username: "",
  password: "",
  name: "",
  phone:"",
  status:1,
  deptId: 1010,
  postId: 5,
  description: "工作人员"
};
export default {
  //定义数据类型
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: [], // banner列表
      total: 0, // 总记录数
      page: 1, // 页码
      limit: 5, // 每页记录数
      searchObj: {}, // 查询条件
      sysUser: addUserForm,
      dialogTitle: '',//对话框标题
      dialogVisible: false, //模态框/对话框默认不弹出
      dialogRoleVisible: false,//模态框/对话框默认不弹出
      saveBtnDisabled:false,
      createTimes: [],
      isIndeterminate:false, /// 是否是不确定状态 【全选框 [-]效果】
      allRoles: [], // 所有角色列表
      userRoleIds: [], // 用户的角色ID的列表
      checkAll: false, // 是否全选
      rules:{
         username: [
            // required: 是否为必填项 
            //trigger: 'blur' 失去焦点时 触发
            { required: true, message: '请输入用户名[用户名规则暂未校验]', trigger: 'blur' },
          ],
          password: [
            { required: true, message: '请输入密码[密码规则暂未校验]', trigger: 'blur' }
          ],
          name: [
           { required: true, message: '请输入姓名[姓名规则暂未校验]', trigger: 'blur' }
          ],
          phone: [
            { required: true, message: '请输入联系电话[联系电话规则暂未校验]', trigger: 'blur' }
          ],
      },
      //日期选择组件左侧快捷键
        pickerOptions: {
            shortcuts: [{
              text: '最近一周',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: '最近一个月',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                picker.$emit('pick', [start, end]);
              }
            }, {
              text: '最近三个月',
              onClick(picker) {
                const end = new Date();
                const start = new Date();
                start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                picker.$emit('pick', [start, end]);
              }
            }]
          },
    };
  },
  //页面渲染之前获取数据 ,[生命周期函数：内存准备完毕，页面尚未渲染]
  created() {
    this.fetchData();
  },
  // 定义方法
  methods: {
    fetchData(pageNum=1) {
      console.log("pageNum"+pageNum);
      console.log("实现搜索功能");
      //可用函数参数 默认值写法
      // if(pageNum!=undefined){
      //    this.page=pageNum;
      // }
      this.page=pageNum;
      console.log(this.page);
      //调用api向后端发送请求
      //   console.log(this.searchObj);
      //   console.log(this.searchObj.roleName);
      if(this.createTimes && this.createTimes.length ==2) {
          this.searchObj.createTimeBegin = this.createTimes[0];
          this.searchObj.createTimeEnd = this.createTimes[1];
        };
        console.log("searchObj",this.searchObj);
        console.log("createTimeBegin",this.searchObj.createTimeBegin);
        console.log("createTimeEnd",this.searchObj.createTimeEnd);
      api
        .getPageList(this.page, this.limit, this.searchObj)
        .then((response) => {
          this.listLoading = false;
          this.list = response.data.records;
          console.log("list",this.list);
          this.total = response.data.total;
        });
    },
      //更改分页size
    changeSize(val){
      console.log("更改分页");
      console.log(val);
      this.limit=val;
      console.log("当前页面pagesize="+this.limit);
      this.fetchData();
    },
    //切换[更新]用户状态
    switchStatus(user){
      //获取状态与 1 进行比较 
      //若要更新 则status 与 原值 不同 ，原值为1 修改则为0 ，反之原值为0 ，修改则为1
      user.status = user.status===1?0:1;
      //调用api发送请求
      api.updateStatus(user.id,user.status).then((response)=>{
        if(response.code==200){
          this.$message.success(response.message||"操作成功");
          this.fetchData(this.page);
        }
      })
    },
    //弹出添加的表单
    addAction() {
      //将添加对话框表单 可显示
      this.dialogVisible = true;
      this.dialogTitle="添加用户";
      //清空表单的数据

      this.sysRole = Object.assign({}, addUserForm);

      // var nObj = Object.assign({},obj,obj1);
      // //花括号叫目标对象，后面的obj、obj1是源对象。
      // 对象合并是指：将源对象里面的属性添加到目标对象中去，
      // 若两者的属性名有冲突，后面的将会覆盖前面的
    },
    //弹出修改对话框 数据回显
    editAction(id) {
      this.dialogVisible = true;
      this.dialogTitle="修改用户";
      api.getById(id).then((response) => {
        this.sysUser = response.data;
      });
    },
    //添加或更新
    saveOrUpdate() {
      this.saveBtnDisabled = true; // 防止表单重复提交
      //通过id判断 是添加行为 or 修改行为
      this.$refs['addUserForm'].validate((valid)=>{
        if(valid){
          //校验通过 则发送请求
          //id有值 ，则为true
          this.dialogVisible=false; //隐藏表单
          if(!this.sysUser.id){
            this.saveData();
          }else{
            this.updateData();
          }
        }else{
          //不符合规则
          return false;
        }
      })
    },
    //添加用户信息
    saveData() {
      console.log("//添加save");
      console.log(this.sysUser);
      api.addUser(this.sysUser).then((response) => {
        this.$message.success(response.message || "操作成功");
        this.fetchData(this.page);
      });
    },
    //更新用户信息
    updateData() {
      api.updateById(this.sysUser).then((response) => {
        this.$message.success(response.message || "操作成功");
        this.fetchData(this.page);
      });
    },
    //根据id删除角色数据
    removeDataById(id) {
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 点击确定，远程调用ajax
          return api.removeById(id);
        })
        .then((response) => {
          
          this.$message.success(response.message || "删除成功");
          this.fetchData(this.page);
        })
        .catch(() => {
          this.$message.info("取消删除");
        });
    },
     //弹出分配角色对话框
    showAssignRole(user){
       //将当前行的数据赋值给sysUser
       this.sysUser=user;
       //弹出分配角色的表单
       this.dialogRoleVisible =true;
       //调用roleApi中的方法查询当所有角色及当前用户已分配的角色id
        roleApi.getRolesByUserId(user.id).then(res=>{
        //给所有角色赋值
        this.allRoles = res.data.allRoles;
        //给当前用户已经拥有的角色id赋值
        this.userRoleIds = res.data.userRoleIds;
        //全选复选框的状态
        this.checkAll = (this.userRoleIds.length == this.allRoles.length);
        //设置是否是不确定的值
        this.isIndeterminate = (this.userRoleIds.length > 0 && this.userRoleIds.length < this.allRoles.length)  
      });

    },
    //全选  全选勾选状态发生改变的监听
    handleCheckAllChange(value){// value 当前勾选状态true/false
    // 如果当前全选, userRoleIds就是所有角色id的数组, 否则是空数组
    this.userRoleIds = value? this.allRoles.map(role =>role.id):[];
    // 如果当前不是全选也不全不选时, 指定为false [-]效果
    this.isIndeterminate=false;
    },
    // 角色列表选中项发生改变的监听
    handleCheckedChange(value){
      //定义常量 userRoleIds ，allRoles ，进行判断
      const {userRoleIds, allRoles} = this;
      //确定全选框 效果状态
      this.checkAll = userRoleIds.length === allRoles.length && allRoles.length>0;
      //this.checkAll = userRoleIds.length>0 && userRoleIds.length <allRoles.length;
      //确定[-]状态 效果状态
      this.isIndeterminate = userRoleIds.length>0 && userRoleIds.length<allRoles.length;
      //this.isIndeterminate = userRoleIds.length > 0 && userRoleIds.length < allRoles.length;

    },
    //分配角色
    assignRole(){
      //debugger
      //隐藏分配角色的表单
      this.dialogRoleVisible =false;
      //设置一个变量用来提交数据
      var assignRoleVo = {
        userId : this.sysUser.id,
        roleIdList: this.userRoleIds,
      };
      //调用roleApi中分配角色的方法
      roleApi.assignRoles(assignRoleVo).then((response)=>{
        this.$message.success(response.message||"操作成功");
        this.fetchData(this.page);
      });
    },

    // 重置查询表单
    resetData() {
      console.log('重置查询表单')
      this.searchObj = {};
      this.createTimes = [];
      this.fetchData();
    },
  },
};
</script>
