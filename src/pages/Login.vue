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
          <el-button type="primary" @click="login()">登录</el-button>
          <el-button @click="register()">注册</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import httpService from "@/service/http.service";
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
    checkValid() {
      return this.$refs["ruleForm"].validate();
    },
    login() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          httpService.login(this.ruleForm.name, this.ruleForm.pswd).then(
            (res) => {
              localStorage.setItem("username", this.ruleForm.name);
              this.$router.push("home/dashboard");
              this.$nextTick(() => {
                this.showSuccess("登录成功", res);
              });
            },
            (err) => {
              this.showReject("登录失败", err.data);
            }
          );
        } else {
          console.log("格式不规范");
        }
      });
    },
    register() {
      this.$refs["ruleForm"].validate((valid) => {
        if (valid) {
          httpService.register(this.ruleForm.name, this.ruleForm.pswd).then(
            (res) => {
              this.showSuccess("注册成功", "正在自动登录");
              this.login();
            },
            (err) => {
              this.showReject("注册失败", err.data);
            }
          );
        } else {
          console.log("格式不规范");
        }
      });
    },
    // login() {
    //   this.$refs["ruleForm"].validate((valid) => {
    //     if (valid) {
    //       localStorage.setItem("username", this.ruleForm.name);
    //       this.$router.push("home/dashboard");
    //       this.$nextTick(() => {
    //         this.showSuccess("登录成功", "");
    //       });
    //     } else {
    //       console.log("登录失败");
    //       return false;
    //     }
    //   });
    // },
    showSuccess(title, msg) {
      this.$notify({
        title: title,
        message: msg,
        type: "success",
      });
    },
    showReject(title, msg) {
      this.$notify.info({
        title: title,
        message: msg,
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
