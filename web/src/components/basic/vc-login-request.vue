<template>
  <div>
    <v-container class="grey lighten-5">
      <v-row justify="end">
        <v-col cols="2" class="mobile-size">
          <v-select v-model="defaultLanguage" :items="languages" size="20" menu-props="auto" label="Select" hide-details prepend-icon="pwc-globe-outline" single-line></v-select>
        </v-col>
      </v-row>
      <v-row no-gutters justify="center" style="max-width:1100px;margin:0 auto">
        <v-col cols="6" class="hide-img">
          <v-img max-width="520" width="100%" height="720" :src="loginBanner"></v-img>
        </v-col>
        <!-- login -->
        <v-col v-if="isLogin">
          <v-row justify="center" style="marginBottom:48px">
            <v-col cols="2">
              <v-img width="210" height="60" :src="loginLogo"></v-img>
            </v-col>
            <v-col cols="2">
              <v-subheader class="text-h4">Login</v-subheader>
            </v-col>
          </v-row>
          <!-- <v-row justify="center">
            <v-col cols="5">
              <v-tabs>
                <v-tab>Account Login</v-tab>
              </v-tabs>
            </v-col>
          </v-row>-->
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8">
              <v-text-field v-model="message4" label="User name" outlined class="rounded-lg"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8">
              <v-text-field v-model="message4" label="Password" outlined class="rounded-lg"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="4" md="5" class="common-cols">
              <v-text-field v-model="message4" label="Verification Code" outlined class="rounded-lg"></v-text-field>
            </v-col>
            <v-col cols="5" sm="4" md="3" style="fontSize:40px;text-align:center;">
              <!-- 图片验证码 -->
              <img :src="captchaImg" width="128" @click="getCaptcha" class="captcha" />
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="4" md="5" class="common-cols">
              <v-text-field v-model="message4" label="Two-factor code" outlined class="rounded-lg"></v-text-field>
            </v-col>
            <v-col cols="5" md="3" sm="4" class="mobile-pl">
              <!-- 获取二次验证码 -->
              <v-btn depressed x-large width="114" max-width="114" outlined @click="getTFCode">Get Code</v-btn>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="5">
              <a href="#" @click="goToForgot">Forgot Password?</a>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" md="8" sm="8" style="marginTop:36px">
              <!-- 登录按钮 -->
              <v-btn color="primary" dark block x-large @click="sigin">Login</v-btn>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" md="8" sm="8" style="marginTop:40px">
              <p>
                By clicking ‘Log in’, you consent to our
                <a href="#">Terms of Use</a> and
                <a href="#">Privacy Statement</a>.
              </p>
            </v-col>
          </v-row>
        </v-col>
        <!-- forgot password -->
        <v-col class="align-self-center" v-else>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8" class="mb-10">
              <v-subheader class="text-h4">Forgot Password</v-subheader>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8">
              <v-text-field v-model="message4" label="New Password" outlined class="rounded-lg"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="8">
              <v-text-field v-model="message4" label="Confirm Password" outlined class="rounded-lg"></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters>
            <v-col cols="12" sm="4" md="5" class="common-cols">
              <v-text-field v-model="message4" label="Two-factor code" outlined class="rounded-lg"></v-text-field>
            </v-col>
            <v-col cols="5" md="3" sm="4" class="mobile-pl">
              <!-- 获取忘记密码的验证码 -->
              <v-btn depressed x-large width="114" max-width="114" outlined @click="getFGCode">Get Code</v-btn>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" md="8" sm="8">
              <!-- 更新密码按钮 -->
              <v-btn color="primary" dark block x-large @click="changePassword">Update Password</v-btn>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col cols="12" sm="8" class="mt-10">
              <a class="back-login" @click="backToLogin">Back to Login</a>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import base from "../utils/schema-base";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      defaultHtml: "",
      html: "",
      loginBanner:
        "https://" +
        window.location.host +
        "/static/images/template/login-banner.png",
      loginLogo:
        "https://" + window.location.host + "/static/images/template/home.png",
      defaultLanguage: "English",
      languages: ["English", "简体中文", "繁體中文"],
      isLogin: true,
      enableTwoFactor: false, // 是否开启二次验证
      captchaImg: "", // 二维码base64字符
    };
  },
  mixins: [base],
  methods: {
    goToForgot() {
      this.isLogin = false;
    },
    backToLogin() {
      this.isLogin = true;
    },
    // 获取登录前置信息：验证码 + 是否开启二次验证
    getCaptcha() {
      this.$axios.get("api/GetCaptcha").then(({ data }) => {
        this.captchaImg = `data:image/gif;base64,${data}`;
      });
    },
    // 获取二次验证码，发请求传参：当前用户的邮箱
    getTFCode() {
      this.$axios
        .post("api/SendDfaCode", { email: this.$store.state.userInfo.email })
        .then((res) => {
          // TODO：发送成功提示，目前返回为空
        })
        .catch((error) => {
          // TODO: 发送失败提示
        });
    },
    // 获取忘记密码验证码，发请求传参：当前用户的邮箱
    getFGCode() {
      this.$axios
        .post("api/ForgetPassword", { email: this.$store.state.userInfo.email })
        .then((res) => {
          // TODO：发送成功提示，目前返回为空
        })
        .catch((error) => {
          // TODO: 发送失败提示
        });
    },
    // 登录逻辑
    sigin() {
      // TODO: 对接数据源
      let info = {
        email: "",
        password: "",
        captcha: "",
        dfaCode: "",
      };
      this.$axios
        .post("api/SignIn", info)
        .then((res) => {
          // TODO：发送成功提示和逻辑
        })
        .catch(({ errors }) => {
          // TODO: 发送失败提示
          let tip1 = errors.email ? errors.email[0] : "";
          let tip2 = errors.password ? errors.password[0] : "";
          let tip3 = errors.captcha ? errors.captcha[0] : "";
          let tip4 = errors.dfaCode ? errors.dfaCode[0] : "";
          // console.log(`${tip1}\n${tip2}\n${tip3}\n${tip4}`);
          alert(`${tip1}\n${tip2}\n${tip3}\n${tip4}`);
        });
    },
    // 忘记密码页面最后一步：更新密码
    changePassword() {
      // TODO: 对接数据源
      let info = {
        email: "",
        VerificationCode: "",
        NewPassword: "",
      };
      this.$axios
        .post("api/ChangePassword", info)
        .then((res) => {
          // TODO：发送成功提示和逻辑
        })
        .catch(({ errors }) => {
          // TODO: 发送失败提示
          let tip1 = errors.email ? errors.email[0] : "";
          let tip2 = errors.newPassword ? errors.newPassword[0] : "";
          let tip3 = errors.verificationCode ? errors.verificationCode[0] : "";
          // console.log(`${tip1}\n${tip2}\n${tip3}`);
          alert(`${tip1}\n${tip2}\n${tip3}`);
        });
    },
  },
  watch: {
    "$i18n.locale": function (val) {
      this.getTranslateCopy(val);
    },
  },
  created() {
    // 获取登录前置信息：验证码 + 是否开启二次验证
    this.getCaptcha();
  },
};
</script>

<style>
.vc-footer,
.vc-footer.v-footer {
  padding: 10px;
  font-size: 13px;
  font-weight: 300;
  position: fixed;
  bottom: 0;
  z-index: 1001;
}
.vc-footer a {
  color: #fff !important;
}
.back-login {
  display: block;
  font-size: 20px;
  text-align: center;
}
.mobile-pl {
  padding-left: 28px !important;
}
@media screen and (max-width: 375px) {
  .hide-img {
    display: none;
  }
  .mobile-size {
    flex: 0 0 44% !important;
    max-width: 44% !important;
  }
  .common-cols {
    flex: 0 0 58.3333333333%;
    max-width: 58.3333333333%;
  }
}

/* 补充样式 by Jason */
.captcha:hover {
  cursor: pointer;
}
</style>
