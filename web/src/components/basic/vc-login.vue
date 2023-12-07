<template>
  <div class="vc-login-wrap">
    <v-form ref="customLogin" lazy-validation>
      <v-row no-gutters justify="center" style="max-width:1100px;margin:120px auto 0">
        <v-col
          cols="6"
          class="hide-img"
          v-if="config.showBanner && config.bannerPosition == 'left'"
        >
        <v-img
        width="100%"
        height="740"
        :src="returnBgUrl(config.bannerImage)"></v-img>
        </v-col>
        <!-- login -->
        <v-col v-if="config.viewType === 'login'" :style="{backgroundColor:bgColor}" :cols="config.showBanner ? 6 : 7" class="out-cols" ref="login">
          <v-row justify="space-between">
            <v-col 
              cols="2"
              class="logo-ml">
              <div style="height:48px" v-html="logo.image.outerHTML"></div>
            </v-col>
            <v-col
              cols="2"
              class="right-lang">
              <vc-multilanguage :schema="this.multiLanguageSchema"></vc-multilanguage>
            </v-col>
          </v-row>
          <v-row justify="center" class="pb-2">
            <v-col               
              cols="12"
              sm="8"
              style="padding: 0 0 10px">
              <v-subheader class="text-h4 fontCtrl">{{getLanVal('title')}}</v-subheader>
            </v-col>
          </v-row>
          <!-- <v-row justify="center">
            <v-col cols="5">
              <v-tabs>
                <v-tab>Account Login</v-tab>
              </v-tabs>
            </v-col>
          </v-row> -->
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
              cols="12"
              sm="8"
            >
              <v-text-field
                ref="email"
                :label="getLanVal('userLabel')"
                :placeholder="getLanVal('userHint')"
                outlined
                v-model="loginData.email"
                class="rounded-lg"
                :rules="[rules.emailRequired,rules.email]"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
              cols="12"
              sm="8"
            >
              <v-text-field
                :label="getLanVal('pwLabel')"
                :placeholder="getLanVal('pwHint')"
                type="password"
                outlined
                v-model="loginData.password"
                class="rounded-lg"
                :rules="[rules.passwordRequired]"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
            cols="12"
            sm="4"
            md="5"
            class="common-cols">
              <v-text-field
                :label="getLanVal('verifyCodeLabel')"
                outlined
                v-model="loginData.verifyCode"
                class="rounded-lg"
                :rules="[rules.captchaIsRequired]"
              ></v-text-field>
            </v-col>
            <v-col
            cols="5"
            sm="4"
            md="3"
            style="text-align:right;"
            >
              <!-- 图片验证码 -->
              <img :src="captchaImg" width="90%" @click="getCaptcha" class="captcha" />
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters v-if="config.enableTwoFactor" class="pd-5">
            <v-col
            cols="12"
            sm="4"
            md="5"
            class="common-cols">
              <v-text-field
                :label="getLanVal('codeLabel')"
                outlined
                class="rounded-lg"
                v-model="loginData.dfaCode"
                :rules="[rules.twoFactorCodeIsRequired]"
              ></v-text-field>
            </v-col>
            <v-col
            cols="5"
            md="3"
            sm="4"
            class="mobile-pl"
            >
              <v-btn
                depressed
                x-large
                width="100%"
                max-width="100%"
                height="56"
                outlined
                color="primary"
                style="font-size:.8rem;"
                :class="{disabled: !this.dfaCanClick}"
                @click="getDfaCode()">
                {{confirmBtn}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="end">
            <v-col cols="5">
              <a href="#" style="text-decoration:none;" @click="goToForgot()">Forgot Password?</a>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col cols="12"
              md="8"
              sm="8">
              <v-btn
                color="primary"
                dark
                block
                x-large
                @click="goToLogin()"
                >
                {{getLanVal('loginBtn')}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col cols="12"
              md="8"
              sm="8"
              style="marginTop:40px;marginBottom:40px">
              <p v-html="html || termsHtml"></p>
            </v-col>
          </v-row>
        </v-col>
        <!-- forgot password -->
        <v-col v-if="config.viewType === 'forgetPassword'" :style="{backgroundColor:bgColor}" :cols="!config.showBanner && 6" class="out-cols" ref="forgot">
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
              cols="12"
              sm="8"
              class="mb-10 mt-12">
              <v-subheader class="text-h4">{{getLanVal('forgetPasswordTitle')}}</v-subheader>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
              cols="12"
              sm="8"
            >
              <v-text-field
                ref="newPassword"
                :label="getLanVal('newPwLabel')"
                :placeholder="getLanVal('newPwHint')"
                type="password"
                outlined
                v-model="loginData.newPassword"
                :rules="[rules.passwordRequired]"
                class="rounded-lg"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
              cols="12"
              sm="8"
            >
              <v-text-field
                ref="confirmPassword"
                :label="getLanVal('newPwAgainLabel')"
                :placeholder="getLanVal('newPwAgainHint')"
                type="password"
                outlined
                v-model="loginData.confirmPassword"
                :rules="[rules.passwordRequired,rules.passwordDiff]"
                class="rounded-lg"
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col
            cols="12"
            sm="4"
            md="5"
            class="common-cols">
              <v-text-field
                ref="forgotVerifyCode"
                :label="getLanVal('fgVerifyCodeLabel')"
                outlined
                v-model="loginData.forgotVerifyCode"
                :rules="[rules.verifyCodeIsRequired]"
                class="rounded-lg"
              ></v-text-field>
            </v-col>
            <v-col
            cols="5"
            md="3"
            sm="4"
            class="mobile-pl"
            >
              <v-btn
                depressed
                x-large
                width="100%"
                max-width="100%"
                height="56"
                color="primary"
                style="font-size:.8rem;"
                :class="{disabled: !this.forgotPasswordCanClick}"
                @click="getVerifyCode()"
                outlined>
                {{fgBtn}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="center" no-gutters class="pd-5">
            <v-col cols="12"
              md="8"
              sm="8">
              <v-btn
                color="primary"
                dark
                block
                x-large
                @click="updatePassword()"
                >
                {{getLanVal('updateBtn')}}
              </v-btn>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-col
              cols="12"
              sm="8"
              class="mt-10">
              <a class="back-login" @click="backToLogin">{{getLanVal('backHomeBtn')}}</a>
            </v-col>
          </v-row>
        </v-col>
        <v-col cols="6" v-if="config.showBanner  && config.bannerPosition == 'right'">
          <v-img width="100%" height="720" :src="returnBgUrl(config.bannerImage)"></v-img>
        </v-col>
      </v-row>
    </v-form>

    <!-- </v-container> -->
    <snackbar v-show="snackbarMessage != ''" :isShowSnackbar="isShowSnackbar" :snackbarMessage="snackbarMessage"
      :snackbarTimeout="snackbarTimeout" :snackbarColor="snackbarColor" />
  </div>
</template>

<script>
import {
mapActions,
mapMutations,
mapState
} from "vuex";
import vcMultilanguage from "./vc-multilanguage.vue";
import base from "../utils/schema-base";
import {
  getApplicationCode
} from "../../utils/appBaseMethods";
import snackbarComponent from "../snackbar"
const COPY_KEY = "Copyright";
const TERMS_KEY = 'Privacy';
export default {
  data() {
    return {
      flag: true,
      loginData:{
        email:'',
        password:'',
        verifyCode:'',
        dfaCode:'',
        newPassword:'',
        confirmPassword:'',
        forgotVerifyCode:''
      },
      termsHtml:"",
      html: "",
      loginBanner: this.$store.getters.cdnHostAndVersionPath + "/static/images/template/login-banner.png",
      multiLanguageSchema: {
          name: "multilanguage",
          component: "vc-multilanguage",
          defaultLanguage: "en",
          show: true,
      },
      enableTwoFactor: false, // 是否开启二次验证
      captchaImg: "", // 二维码base64字符
      isShowSnackbar: false,
      snackbarMessage:"",
      snackbarTimeout: 3000,
      snackbarColor:"",
      dfaCanClick: true, // two-factor获取验证码可点击
      forgotPasswordCanClick: true, //忘记密码获取验证码可点击
      confirmBtn: "",
      fgBtn: "",
      dfaTotalTime: 60,
      forgotTotalTime: 60,
      returnUrl: "",//跳转url
      rules: {
        emailRequired: value => !!value || this.$t("login.accountIsRequired"),
        email: value => {
          const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || this.$t("login.accountFormatError")
        },
        passwordRequired: value => !!value || this.$t("login.passwordIsRequired"),
        captchaIsRequired: value => !!value || this.$t("login.captchaIsRequired"),
        twoFactorCodeIsRequired: value => !!value || this.$t("login.twoFactorCodeIsRequired"),
        passwordDiff: value => {
          if(value !== this.loginData.newPassword){
            return this.$t("login.confirmPasswordNotMatch")
          } else {
            return true
          }
        },
        verifyCodeIsRequired: value => !!value || this.$t("login.verifyCodeIsRequired")
      },
      logo: {
        image: new Image(),
      }
    };
  },
  components: {
    vcMultilanguage,
    snackbar: snackbarComponent
  },
  mixins: [base],
  methods: {
    ...mapActions("app", ["getSyncAppLogo", "getAppPreference"]),
    getTranslateCopy(val) {
      this.html = ""
      let app = this.$store.state.appInfo;
      let key = `${app.OrganizationCode}_${app.AppCode}_${val}`.toLowerCase();
      let lsValue = window.ls.get(key);
      let localeItem = JSON.parse(lsValue ? lsValue : "[]");
      if(localeItem.system && localeItem.system['terms&privacy']){
        this.html = localeItem.system['terms&privacy']
      }
      if(!this.html){
        this.getApplicationTerms();
      }
    },
    getApplicationTerms() {
      this.$axios
        .post("/api/preference/get", {
          key: TERMS_KEY
        })
        .then(({
          data
        }) => {
          if (data) {
            let jsonData = JSON.parse(data);
            if(jsonData.value == ""){
              this.termsHtml = "By clicking 'Log in', you consent to our <a href='https://app.digiqal.com/dgq/digiqal/page/terms' target='_blank'>Terms of Use</a> and <a href='https://app.digiqal.com/dgq/digiqal/page/privacy_statement' target='_blank'>Privacy Statement.</a>";
            } else {
              this.termsHtml = jsonData.value;
            }
          }
        });
    },
    returnBgUrl(backgroundImage) {
      let url
      if (backgroundImage && this.isJSON(backgroundImage)) {
        url = this.$store.getters.baseUrl + JSON.parse(backgroundImage).url;
      } else {
        if (backgroundImage && backgroundImage.startsWith("/static/images")) {
          url = `${this.$store.getters.cdnHostAndVersionPath}${backgroundImage}`
        } else {
          url = backgroundImage
        }
      }
      return url || this.loginBanner
    },
    isJSON(str) {
      if (typeof str == 'string') {
        try {
          var obj = JSON.parse(str);
          if (typeof obj == 'object' && obj) {
            return true;
          } else {
            return false;
          }

        } catch (e) {
          return false;
        }
      }
    },
    goToForgot(){
      if(this.loginData.email !== ''){
        this.config.viewType = 'forgetPassword';
        this.isShowSnackbar = false;
        this.$refs.customLogin.resetValidation();
      } else {
        this.snackbarMessage = this.$t("login.accountIsRequired");
        this.snackbarColor = 'red';
        this.isShowSnackbar = true;
        setTimeout(() => {
          this.snackbarMessage = "";
        }, this.snackbarTimeout);
      }
    },
    goToLogin(){
      if (!this.$refs.customLogin.validate()) {
        return;
      } else {
        this.isShowSnackbar = false;
        let info = {
          email: this.loginData.email,
          password: this.loginData.password,
          captcha: this.loginData.verifyCode,
          dfaCode: this.loginData.dfaCode,
        };
        this.$axios
          .post("/api/SignIn", info)
          .then((res) => {
            this.snackbarMessage = this.$t("login.loginSuccessful");
            this.snackbarColor = 'rgb(41, 157, 143)';
            this.isShowSnackbar = true;
            setTimeout(() => {
              this.snackbarMessage = "";
            }, this.snackbarTimeout);
            //重新获取userInfo
            this.$axios.get("/api/GetCurrentUser").then(({
              data
            }) => {
              if (data) {
                this.$store.commit('constants.setUserInfo', data);
                // let appCode = this.$dm_getRawAppCode();
                // window.ls.set(`${appCode}@userInfo`, JSON.stringify(data));
                if(this.returnUrl !== '' && this.returnUrl !== "undefined"){
                  window.top.location.href = location.origin + this.returnUrl
                } else {
                  let appCode = this.$store.state.appInfo.AppCode;
                  let organizationCode = this.$store.state.appInfo.OrganizationCode;
                  window.top.location.href = location.origin + `/${organizationCode}/${appCode}`
                }
                return data;
              } else {
                return Promise.reject(new Error("cannot retrive userInfo"));
              }
            });
            if(this.returnUrl !== '' && this.returnUrl !== "undefined"){
              window.top.location.href = location.origin + this.returnUrl
            } else {
              let appCode = this.$store.state.appInfo.AppCode;
              let organizationCode = this.$store.state.appInfo.OrganizationCode;
              if(window.urlMode == 'NOTENANTAPPCODE') {
                window.top.location.href = location.origin
              }else{
                window.top.location.href = location.origin + `/${organizationCode}/${appCode}`
              }
              
            }
          })
          .catch(errors => {
            this.getCaptcha();
            // TODO: 发送失败提示
            if(errors.type == "IncorrectCaptcha"){
              this.snackbarMessage = this.$t("login.captchaIsWrong");
            } else if(errors.type == "IncorrectDfaCode"){
              this.snackbarMessage = this.$t("login.twoFactorCodeIsWrong");
            } else if(errors.type == "IncorrectVerificationCode"){
              this.snackbarMessage = this.$t("login.captchaIsWrong");
            } else if(errors.type == "IncorrectEmailOrPassword"){
              this.snackbarMessage = this.$t("login.accountOrPasswordIsWrong");
            } else if(errors.type == "AccountLocked"){
              this.snackbarMessage = this.$t(
                    "login.accountTimesLocked"
                  ).replace("{time}", errors.AllowedAttemptNumber) + this.$t(
                    "login.accountTimeLocked"
                  ).replace("{minutes}", errors.UnlockAfterInterval);
            }else {
              this.snackbarMessage = this.$t("login.networkError");
            } 
            this.snackbarColor = 'red';
            this.isShowSnackbar = true;
            setTimeout(() => {
              this.snackbarMessage = "";
            }, this.snackbarTimeout);
          });
      }
    },
    // 获取二次验证码，发请求传参：当前用户的邮箱
    getDfaCode() {
      //增加验证
      if(this.customLogin.email == ''){
        this.$refs.email.validate(true)
      } else {
        if (!this.dfaCanClick) return;   //改动的是这两行代码
        this.dfaCanClick = false;
        this.$axios
        .post("/api/SendDfaCode",
        { email: this.loginData.email,
          pageCode: this.$route.params.pageView
        }
        )
        .then((res) => {
          // TODO：发送成功提示，目前返回为空
          if(res.status == 200){
            this.dfaCountDown();
            this.snackbarMessage = this.$t("login.sendVerificationCode");
            this.snackbarColor = 'rgb(41, 157, 143)';
            this.isShowSnackbar = true;
            setTimeout(() => {
              this.snackbarMessage = "";
            }, this.snackbarTimeout);
          }
        })
        .catch((error) => {
          // TODO: 发送失败提示
          this.snackbarMessage = this.$t("login.networkError");
          this.snackbarColor = 'red';
          this.isShowSnackbar = true;
          setTimeout(() => {
            this.snackbarMessage = "";
          }, this.snackbarTimeout);
        });
      }
    },
    getVerifyCode(){
      if (!this.forgotPasswordCanClick) return;   //改动的是这两行代码
      this.forgotPasswordCanClick = false;
      this.$axios
      .post("/api/ForgetPassword",
      { email: this.loginData.email,
        pageCode: this.$route.params.pageView
      })
      .then((res) => {
        // TODO：发送成功提示，目前返回为空
        if(res.status == 200){
          this.forgotCountDown();
          this.snackbarMessage = this.$t("login.sendVerificationCode");
          this.snackbarColor = 'rgb(41, 157, 143)';
          this.isShowSnackbar = true;
          setTimeout(() => {
            this.snackbarMessage = "";
          }, this.snackbarTimeout);
        }
      })
      .catch((error) => {
        // TODO: 发送失败提示
        this.snackbarMessage = this.$t("login.networkError");
        this.snackbarColor = 'red';
        this.isShowSnackbar = true;
        setTimeout(() => {
          this.snackbarMessage = "";
        }, this.snackbarTimeout);
      });
    },
    backToLogin(){
      this.$refs.customLogin.resetValidation();
      this.config.viewType = 'login';
    },
    // 获取登录前置信息：验证码 + 是否开启二次验证
    getCaptcha() {
      this.$axios.get("/api/getCaptcha").then(({ data }) => {
        this.captchaImg = `data:image/gif;base64,${data}`;
      });
    },
    updatePassword(){
      // TODO: 对接数据源
      Object.keys(this.customLogin).forEach(f => {
        if (this.customLogin.newPassword =='' || this.customLogin.confirmPassword == '' || this.customLogin.forgotVerifyCode == ''){
          this.$refs[f].validate(true)
        } else {
          if(this.flag) {
            this.flag = false;
            let info = {
              email: this.loginData.email,
              VerificationCode: this.loginData.forgotVerifyCode,
              NewPassword: this.loginData.newPassword,
            };
            this.$axios
              .post("/api/ChangePassword", info)
              .then((res) => {
                // TODO：发送成功提示和逻辑
                if(res.status == 200) {
                  this.snackbarMessage = this.$t("login.changePasswordSuccessful");
                  this.snackbarColor = 'rgb(41, 157, 143)';
                  this.isShowSnackbar = true;
                  this.config.viewType = 'login';
                  this.$refs.customLogin.resetValidation();
                  setTimeout(() => {
                    this.snackbarMessage = "";
                  }, this.snackbarTimeout);
                }
              })
              .catch(errors => {
                if(errors.type == "IncorrectCaptcha"){
                  this.snackbarMessage = this.$t("login.captchaIsWrong");
                } else if(errors.type == "IncorrectDfaCode"){
                  this.snackbarMessage = this.$t("login.twoFactorCodeIsWrong");
                } else if(errors.type == "IncorrectVerificationCode"){
                  this.snackbarMessage = this.$t("login.captchaIsWrong");
                } else if(errors.type == "IncorrectEmailOrPassword"){
                  this.snackbarMessage = this.$t("login.accountOrPasswordIsWrong");
                } else if(errors.type == "AccountLocked"){
                  this.snackbarMessage = this.$t(
                        "login.accountTimesLocked"
                      ).replace("{time}", errors.AllowedAttemptNumber) + this.$t(
                        "login.accountTimeLocked"
                      ).replace("{minutes}", errors.UnlockAfterInterval);
                }else {
                  this.snackbarMessage = this.$t("login.networkError");
                } 
                this.snackbarColor = 'red';
                this.isShowSnackbar = true;
                this.flag = true;
                setTimeout(() => {
                  this.snackbarMessage = "";
                }, this.snackbarTimeout);
              });
          }
          
        }
      });
    },
    //获取验证码倒计时按钮
    dfaCountDown() {
      this.confirmBtn = this.dfaTotalTime + 's';  //这里解决60秒不见了的问题
      let clock = window.setInterval(() => {
        this.isShowSnackbar = false;
        this.dfaTotalTime--;
        this.confirmBtn = this.dfaTotalTime + 's';
        if (this.dfaTotalTime < 0) {         //当倒计时小于0时清除定时器
            window.clearInterval(clock);
            this.confirmBtn = this.getLanVal("confirmBtn");
            this.dfaTotalTime = 60;
            this.dfaCanClick = true   //这里重新开启
            }
      },1000)
    },
    forgotCountDown() {
      this.fgBtn = this.forgotTotalTime + 's';  //这里解决60秒不见了的问题
      let clock = window.setInterval(() => {
        this.isShowSnackbar = false;
        this.forgotTotalTime--;
        this.fgBtn = this.forgotTotalTime + 's';
        if (this.forgotTotalTime < 0) {         //当倒计时小于0时清除定时器
            window.clearInterval(clock);
            this.fgBtn = this.getLanVal('fgBtn');
            this.forgotTotalTime = 60;
            this.forgotPasswordCanClick = true   //这里重新开启
            }
      },1000)
    },
    calculatelogo(imgData) {
      const imageObj = new Image();
      imageObj.src = imgData;
      imageObj.style = "height:48px";
      this.logo.image = imageObj;
    },
  },
  watch: {
    "$i18n.locale": function(val) {
      this.getTranslateCopy(val);
      this.confirmBtn = this.getLanVal("confirmBtn");
      this.fgBtn = this.getLanVal("fgBtn");
    },
  },
  computed: {
      getLanVal() {
        return (key)=>{
          return this.$t(this.localeKey)[key] ?
            this.$t(this.localeKey)[key] :
            this.config[key] || this.$t(`login.${key}`)
        }
      },
      bgColor(){
        // 如果开启了自定义背景色，就使用右侧属性面板的颜色值
        if (this.config.enableCustomBgColor) {
          return this.config.bgColor
        // 否则，如果是深色模式
        } else if (this.$store.state.app.appPerference.theme.currentTheme.dark){
          return '#333'
        } else {
        // 针对浅色模式
          return '#fff'
        }
      },
      config() {
        return this.schema.config
      },
      applicationCode() {
        return getApplicationCode(this.$store.getters.baseUrl)
      },
      rules() {
        let rules = [];
        let schema = this.schema;

        if (schema.show != false) {
          if (this.schema.required) {
            rules.push((val) => {
              return (
                (val && val.length > 0) || this.$t("schema-base.rules.required")
              );
            });
          }
        }
        return rules;
      },
      customLogin () {
        return {
          newPassword: this.loginData.newPassword,
          confirmPassword: this.loginData.confirmPassword,
          forgotVerifyCode: this.loginData.forgotVerifyCode,
          email: this.loginData.email
        }
      }
  },
  created() {
    this.returnUrl = decodeURIComponent(window.top.location.search.split('returnUrl=')[1]);
    this.getTranslateCopy(this.$i18n.locale);
    // 获取登录前置信息：验证码 + 是否开启二次验证
    this.getCaptcha();
    this.confirmBtn = this.getLanVal("confirmBtn");
    this.fgBtn = this.getLanVal("fgBtn");
    // this logo should come from application logo.
    let appcode = this.$store.state.appInfo.ApplicationCode;
    //检查vuex中初始化了没有，没有，看storage里有没有,没有,走接口获取
    let imgData = this.$store.state.app.appLogo; // "/static/images/logo.svg";

    if (!imgData) {
      Promise.all([
        this.getSyncAppLogo({
          appcode,
        }),
      ]).then(() => {
        this.calculatelogo(this.$store.state.app.appLogo);
      });
    } else {
      this.calculatelogo(imgData);
    }

    this.bus.$on("enableNavigationInToolbar", () => {
      this.enbaleToggle = true;
    });
  }
};
</script>

<style lang="scss" scoped>
.vc-login-wrap {
  overflow: hidden;
  background: #f3f3f3;
  height: 96vh;
}
.vc-footer,
.vc-footer.v-footer {
  padding: 10px;
  font-size: 13px;
  font-weight: 300;
  position: fixed;
  bottom: 0;
  z-index: 1001;
}
.vc-footer a{
  color:#fff !important;
}
.back-login{
  display: block;
  font-size: 20px;
  text-align:center;
}
.mobile-pl{
    padding-left: 12px!important;
}
/* 补充样式 by Jason */
.captcha:hover {
  cursor: pointer;
}
.disabled{
  background-color: #ddd;
  border-color: #ddd;
  cursor: not-allowed;
  font-size: 20px;
}

.fontCtrl {
  overflow:hidden; 
  text-overflow:ellipsis;
  display:-webkit-box;
  /* autoprefixer: off */          
  -webkit-box-orient:vertical;
  -webkit-line-clamp:2; 
  word-break: break-all;
  line-height: 44px;
  padding-left: 4px;
}

.logo-ml{
  margin:4px 0 0 6rem;
}


@media screen and (max-width:600px){
  .vc-login-wrap {
    overflow: hidden;
    background: #fff;
    height: 96vh;
  }
  .right-lang {
    text-align: right;
  }
  .v-application .text-h4 {
    font-size: 1.8rem!important;
  }
  .out-cols{
    flex-basis: 0;
    flex-grow: 1;
    max-width: 100%;
    padding: 20px;
  }
  .hide-img {
    display: none;
  }
  .mobile-size{
    flex: 0 0 44%!important;
    max-width: 44%!important;
  }
  .common-cols{
    flex: 0 0 58.3333333333%;
    max-width: 58.3333333333%;
  }

  .fontCtrl {
    font-size: 2rem!important;
    padding: 0 16px;
  }

  .logo-ml{
    margin:0 0 0 10px
  }

  .pd-5{
    padding: 0 5px;
  }
}
.v-application.theme--dark .vc-login-wrap {
  background: unset;
}
</style>
<style>
  .image-size .v-image__image{
    background-size: contain!important;
  }
  .out-cols .v-text-field .v-input__control, .v-text-field .v-input__slot, .v-text-field fieldset {
    border-radius: 4px!important;
  }
</style>