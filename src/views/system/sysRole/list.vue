<template>
  <div class="app-container">
    <!--查询表单-->
    <div class="search-div">
      <el-form label-width="70px" size="small">
        <el-row>
          <el-col :span="24">
            <el-form-item label="角色名称">
              <el-input
                style="width: 100%"
                v-model="searchObj.roleName"
                placeholder="角色名称"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row style="display: flex">
          <el-button
            type="primary"
            icon="el-icon-search"
            size="mini"
            @click="fetchData()"
            :disabled="$hasBP('bnt.sysRole.list')  === false"
            >搜索</el-button
          >
          <el-button icon="el-icon-refresh" size="mini" @click="resetData"
            >重置</el-button
          >
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
        :disabled="$hasBP('bnt.sysRole.add')  === false"
        >添 加</el-button
      >
      <el-button class="btn-add" size="mini" @click="batchRemove()"
      :disabled="$hasBP('bnt.sysRole.remove')  === false"
        >批量删除</el-button
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
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" />
        <el-table-column label="序号" width="70" align="center">
          <template slot-scope="scope">
            {{ (page - 1) * limit + scope.$index + 1 }}
          </template>
        </el-table-column>

        <el-table-column prop="roleName" label="角色名称" />
        <el-table-column prop="roleCode" label="角色编码" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="createTime" label="创建时间" width="160" />
        <el-table-column label="操作" width="200" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="editAction(scope.row.id)"
              :disabled="$hasBP('bnt.sysRole.update')  === false"
              title="修改"
            />
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeDataById(scope.row.id)"
              :disabled="$hasBP('bnt.sysRole.remove')  === false"
              title="删除"
            />
            <el-button type="warning" icon="el-icon-baseball" size="mini" :disabled="$hasBP('bnt.sysRole.assignAuth')===false" @click="showAssignAuth(scope.row)" title="分配权限"/>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页组件 -->
      <el-pagination
        :current-page="page"
        :total="total"
        :page-size="limit"
        :page-sizes="[5,10,20,30,40,50,100]"
        style="padding: 30px 0; text-align: center;"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="fetchData"
        @size-change="changeSize"
      />
    </div>
    <!-- 添加或修改的表单 -->
    <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="40%">
      <el-form
        ref="addRoleForm"
        :model="sysRole"
        :rules="rules"
        label-width="150px"
        size="small"
        style="padding-right: 40px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="sysRole.roleName" />
        </el-form-item>
        <el-form-item label="角色编码"  prop="roleCode">
          <el-input v-model="sysRole.roleCode" />
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="sysRole.description" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button
          @click="dialogVisible = false"
          size="small"
          icon="el-icon-refresh-right"
          >取 消</el-button
        >
        <el-button
          type="primary"
          icon="el-icon-check"
          @click="saveOrUpdate()"
          size="small"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>
<script>
import api from "@/api/system/sysRole";
const addRoleForm = {
  id: "",
  roleName: "",
  roleCode: "",
  description: "",
};
export default {
  //定义数据类型
  data() {
    return {
      listLoading: true, // 数据是否正在加载
      list: [], // 角色列表
      total: 0, // 总记录数
      page: 1, // 页码
      limit: 5, // 每页记录数
      searchObj: {
         roleName: '',
      }, // 查询条件
      sysRole: addRoleForm,
      dialogTitle:"",//对话框标题
      dialogVisible: false, //模态框/对话框默认不弹出
      multipleDeleteSelection: [], // 批量删除选中的记录列表
      //设置表单校验规则
      rules:{
            roleName: [
              // required: 是否为必填项 
              //trigger: 'blur' 失去焦点时 触发
              { required: true, message: "请输入角色名称", trigger: 'blur' },
            ],
            roleCode:[
               // required: 是否为必填项 
              //trigger: 'blur' 失去焦点时 触发
              { required: true, message: "请输入角色编码", trigger: 'blur' },
            ]
      },
    };
  },
  //页面渲染之前获取数据
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
      api
        .getPageList(this.page, this.limit, this.searchObj)
        .then((response) => {
          this.listLoading = false;
          this.list = response.data.records;
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
    //弹出添加的表单
    addAction() {
      //将添加对话框表单 可显示
      this.dialogTitle="添加角色";
      this.dialogVisible = true;
      //清空表单的数据
      console.log("addRoleForm前",addRoleForm);
      console.log("sysRole前",this.sysRole);
      this.sysRole = Object.assign({}, addRoleForm);
      console.log("sysRole后",this.sysRole);
      console.log("addRoleForm后",addRoleForm);
      // var nObj = Object.assign({},obj,obj1);
      // //花括号叫目标对象，后面的obj、obj1是源对象。
      // 对象合并是指：将源对象里面的属性添加到目标对象中去，
      // 若两者的属性名有冲突，后面的将会覆盖前面的
    },
    //弹出修改对话框 数据回显
    editAction(id) {
       this.dialogTitle="修改角色";
      this.dialogVisible = true;
      api.getById(id).then((response) => {
        this.sysRole = response.data;
      });
    },
    //添加或更新
    saveOrUpdate() {
      this.saveBtnDisabled = true; // 防止表单重复提交
      
      //通过id判断 是添加行为 or 修改行为
      //进行表单校验
            //(valid) => {} 等价于 function(valid){}
            //validate()对整个表单进行校验的方法，参数为一个回调函数。
            //该回调函数会在校验结束后被调用，并传入两个参数：
            //是否校验成功和未通过校验的字段。若不传入回调函数，则会返回一个 promise
      this.$refs['addRoleForm'].validate((valid)=>{
          if(valid){
              //校验通过 则 发送请求
              //id 有值 则为true ，
              this.dialogVisible = false; //隐藏表单
              if (!this.sysRole.id) {
                  this.saveData();
              } else {
                  this.updateData();
              }
        }else{
          //不符合规则
          return false;
        }
      })
    
    },
    //添加角色信息
    saveData() {
      console.log("//添加save");
      console.log(this.sysRole);
      api.addRole(this.sysRole).then((response) => {
        this.$message.success(response.message || "操作成功");
        this.fetchData(this.page);
      });
    },
    //更新角色信息
    updateData() {
      api.updateById(this.sysRole).then((response) => {
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
    //当多选选项发生变化的时候调用
    handleSelectionChange(selection) {
      console.log(selection);
      this.multipleDeleteSelection = selection;
    },
    //批量删除角色
    batchRemove() {
      if (this.multipleDeleteSelection.length === 0) {
        this.$message.warning("请选择要删除的记录！");
        return;
      }
      this.$confirm("此操作将永久删除该记录, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          // 点击确定，远程调用ajax
          // 遍历selection，将id取出放入id列表
          var idList = [];
          this.multipleDeleteSelection.forEach((item) => {
            idList.push(item.id);
          });
          //调用axios
          return api.batchRemove(idList);
        })
        .then((response) => {
          this.fetchData();
          this.$message.success(response.message || "删除成功");
        })
        .catch((error) => {
          if (error === "cancel") {
            this.$message.info("取消删除");
          }
        });
    },
    showAssignAuth(row){
      this.$router.push("/system/assignAuth?id="+row.id+"&roleName="+row.roleName);
    },
  
    // 重置表单
    resetData() {
      console.log("重置查询表单");
      this.searchObj = {};
      this.fetchData();
    },
  },
};
</script>
