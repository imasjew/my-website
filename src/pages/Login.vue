<template>
  <div class="login-page">
    <h1>欢迎登陆我的站点</h1>
    <div class="login-table">
      <el-form
        :model="ruleForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-form-item label="账号" prop="name">
          <el-input v-model="ruleForm.name"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="pswd">
          <el-input v-model="ruleForm.pswd"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm('ruleForm')"
            >登录</el-button
          >
          <el-button>注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "login",
  data() {
    var validatePass = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入密码"));
      } else {
        // 放正则
        callback();
      }
    };
    return {
      ruleForm: {
        name: "",
        pswd: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入账号", trigger: "blur" },
          {
            min: 3,
            max: 18,
            message: "长度在 3 到 18 个字符",
            trigger: "blur",
          },
        ],
        pswd: [{ required: true, validator: validatePass, trigger: "blur" }],
      },
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          localStorage.setItem('username', this.ruleForm.name)
          this.$router.push('home/dashboard')
          console.log('ok')
        } else {
          console.log("登录失败");
          return false;
        }
      });
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less" scoped>
.login-page {
    margin-top: 60px;
}
h1,
h2 {
  font-weight: normal;
}
.login-page {
  position: relative;
  width: 100%;
  .login-table {
    position: relative;
    margin: 0 auto;
    width: 500px;
  }
}
</style>
