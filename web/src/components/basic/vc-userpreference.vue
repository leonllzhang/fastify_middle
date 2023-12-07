<template>
  <v-dialog v-model="preferencesDialog" max-width="800px" persistent scrollable>
    <v-card flat :dark="dark" class="preferencesCard" max-height="584px">
      <v-card-title class="headline card-title primary flex">
        <div class="white--text">{{ cardTitle }}</div>
        <v-spacer></v-spacer>
        <v-btn icon class="white--text close-btn mr-2" @click="closePreference">
          <v-icon>pwc-icon pwc-close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
        <div>
          <v-form ref="form" class="layout flex-nowrap" v-if="!showEditPhone">
            <div class="image-wrapper">
              <img :src="imageSrc" />
               <v-btn color="primary" width="35px" height="35px" min-width="35px"
               class="edit-btn rounded-0" @click="showEditPhone = true">
                <v-icon @click="showEditPhone = true">
                  mdi-pencil
                </v-icon>
              </v-btn>
            </div>
            <div class="layout pl-3">
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.staffCode") }}
                </div>
                <p class="user-text mt-2">{{ userInfo.staffCode }}</p>
              </div>
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.firstName") }}
                </div>
                <v-text-field
                  class="rounded-0"
                  outlined
                  dense
                  :dark="dark"
                  :rules="[
                    (v) => {
                      return (
                        !v ||
                        /^[\u4e00-\u9fa5\w\s._-]*$/.test(v) ||
                        $t(`schema-base.rules.pattern`)
                      );
                    },
                  ]"
                  v-model="eUserInfo.FirstName"
                />
              </div>
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.email") }}
                </div>
                <p class="user-text mt-2">{{ userInfo.email }}</p>
              </div>
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.lastName") }}
                </div>
                <v-text-field
                  class="rounded-0"
                  outlined
                  dense
                  :dark="dark"
                  :rules="[
                    (v) => {
                      return (
                        !v ||
                        /^[\u4e00-\u9fa5\w\s._-]*$/.test(v) ||
                        $t(`schema-base.rules.pattern`)
                      );
                    },
                  ]"
                  v-model="eUserInfo.LastName"
                />
              </div>
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.userName") }}
                </div>
                <p class="user-text mt-2">{{ userInfo.userName }}</p>
              </div>
              <div class="flex xs12 md6 px-3">
                <div class="user-title">
                  {{ $t("toolBar.userPreference.phone") }}
                </div>
                <v-text-field
                  class="rounded-0"
                  outlined
                  dense
                  :dark="dark"
                  :rules="[
                    (v) => {
                      return (
                        !v ||
                        /^[\d\s\+\(\)-]*$/.test(v) ||
                        $t(`schema-base.rules.pattern`)
                      );
                    },
                  ]"
                  v-model="eUserInfo.Phone"
                />
              </div>
            </div>
          </v-form>
          <div v-else>
            <div class="file-upload">
              <div class="file-upload-input v-btn primary">
                <span class="white--text">
                  {{ $t("toolBar.userPreference.choosePhoto") }}
                </span>
                <input
                  type="file"
                  name="imgUpl"
                  class
                  @change="selectImage"
                  style="margin-bottom: 10px"
                  accept=".jpg, .png, .jpeg"
                />
              </div>
              <div class="file-upload-text">
                {{ $t("toolBar.userPreference.uploadTip") }}
              </div>
            </div>
            <div class="aw align-start">
              <div class="flex-1">
                <p>{{ $t("toolBar.userPreference.selector") }}:</p>
                <div class="ac" :style="{ width: `${imageWidth}px` }">
                  <img :src="imageNew" ref="imgSelect" class="img" />
                  <div
                    class="ac-select"
                    :class="{ active: select.active, 'd-none': crop.active }"
                    ref="select"
                  >
                    <div
                      class="select-zone"
                      :class="{ 'd-none': !select.active }"
                      :style="{
                        left: `${select.x}px`,
                        top: `${select.y}px`,
                        width: `${select.w}px`,
                        height: `${select.h}px`,
                      }"
                    >
                      <img
                        :src="imageNew"
                        class="img"
                        :style="{
                          left: `-${select.x}px`,
                          top: `-${select.y}px`,
                          width: `${imageWidth}px`,
                        }"
                      />
                    </div>
                  </div>
                  <div
                    class="ac-crop"
                    :class="{ 'd-none': !crop.active }"
                    @click="clearCrop"
                    ref="crop"
                    :style="{
                      width: `${crop.nativeWidth}px`,
                      height: `${crop.nativeHeight}px`,
                    }"
                  >
                    <div
                      class="crop-zone"
                      :style="{
                        left: `${crop.x}px`,
                        top: `${crop.y}px`,
                        width: `${crop.w}px`,
                        height: `${crop.h}px`,
                      }"
                    >
                      <img
                        :src="imageNew"
                        class="img"
                        :style="{
                          left: `-${crop.x}px`,
                          top: `-${crop.y}px`,
                          width: `${imageWidth}px`,
                        }"
                      />
                      <div class="n line"></div>
                      <div class="w line"></div>
                      <div class="s line"></div>
                      <div class="e line"></div>
                    </div>
                    <div
                      class="crop-handle"
                      :style="{
                        left: `${crop.x}px`,
                        top: `${crop.y}px`,
                        width: `${crop.w}px`,
                        height: `${crop.h}px`,
                      }"
                      ref="handler"
                    >
                      <div class="move"></div>
                      <div class="resize n"></div>
                      <div class="resize w"></div>
                      <div class="resize s"></div>
                      <div class="resize e"></div>
                      <div class="resize n e"></div>
                      <div class="resize s e"></div>
                      <div class="resize s w"></div>
                      <div class="resize n w"></div>
                    </div>
                  </div>
                  <div
                    class="resize-cover"
                    :class="{ 'd-none': !resize.active }"
                  ></div>
                </div>
              </div>
              <div class="canvas flex-1">
                <p>{{ $t("toolBar.userPreference.preview") }}:</p>
                <canvas
                  :width="imageWidth"
                  :height="imageWidth / ratio"
                  ref="preview"
                  style="background: #eee"
                ></canvas>
              </div>
            </div>
          </div>
        </div>
        <div v-if="false">
          <v-card flat :dark="$route.path.indexOf('dashboard') < 0">
            <v-card-text class="pa-6">
              <div class="d-flex align-center">
                <span style="font-size: 16px"
                  >{{ $t("toolBar.userPreference.emailNotification") }}:</span
                >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon v-bind="attrs" v-on="on">
                      pwc-icon pwc-information
                    </v-icon>
                  </template>
                  <span>{{ $t("toolBar.userPreference.emailTip") }}</span>
                </v-tooltip>
                <v-switch
                  hide-details
                  color="primary"
                  class="mt-0 pt-0 ml-8 enable-switch"
                  v-model="EmailSwitch"
                  label="Enable"
                ></v-switch>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <template v-if="tabName == 0">
          <div v-if="showEditPhone">
            <v-btn
              color="primary"
              @click="commit"
              depressed
              tile
              :disabled="!imageUpdate"
            >
              {{ $t("schema-base.defaultBtns.apply") }}
            </v-btn>
            <v-btn
              color="black"
              outlined
              @click="dismiss"
              depressed
              tile
            >
              {{ $t("schema-base.defaultBtns.cancel") }}
            </v-btn>
          </div>
          <v-btn
            color="primary"
            v-else
            depressed
            tile
            @click="updateUser"
            >{{ $t("schema-base.defaultBtns.save") }}</v-btn
          >
        </template>
        <v-btn
          v-else
          elevation="0"
          color="primary"
          class="black--text mt-12"
          tile
          >{{ $t("schema-base.defaultBtns.save") }}</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import draggable from "../utils/draggable";
const prefix = "data:image/png;base64,";
export default {
  name: "user_preferencen",
  props: {
    preferencesDialog: {
      type: Boolean,
      require: true,
      default: false,
    },
  },
  data() {
    var r = {
      imageWidth: 300,
      imageUpdate: false,
      ratio: 1,
      move: { x: 0, y: 0 },
      imageNew: "",
      imageOld: "",
      eUserInfo: {},
      showEditPhone: false,
      EmailSwitch: false,
      tabName: 0,
    };

    ["crop", "resize", "select"].forEach((n) => {
      r[n] = { active: false };
      ["x", "y", "w", "h"].forEach((k) => {
        r[n][k] = 0;
      });
    });

    return r;
  },
  computed: {
    ...mapState(["appInfo", "appLogo", "baseURL", "userInfo", "showMenu"]),
    ...mapMutations(["mutationsUserInfo"]),
    cardTitle() {
      if (!this.showEditPhone) {
        return this.$t("toolBar.userPreference.userPreferences");
      } else {
        return this.$t("toolBar.userPreference.photoAvatar");
      }
    },
    colorFlag() {
      if (this.dark) {
        return "primary";
      } else {
        return "black";
      }
    },
    dark() {
      return false;
    },
    imageSrc() {
      return (
        this.imageOld ||
        this.$store.getters.cdnHostAndVersionPath + "/static/images/user.svg"
      );
    },
  },
  inject: {
    messageDialog: {
      default: {},
    },
  },
  methods: {
    updateUser() {
      if (this.$refs.form.validate()) {
        let appCode = this.$dm_getRawAppCode() + "@userInfo";
        this.$axios
          .post("/api/UpdateUserByID", {
            ...this.eUserInfo,
            UserID: this.userInfo.userID,
          })
          .then(() => {
            return this.$axios.post("/api/vp/UpdateUserAvatar", {
              UserID: this.userInfo.userID,
              WithAvatar: this.imageOld.replace(prefix, ""),
            });
          })
          .then((result) => {
            this.messageDialog.showMsg("");
            this.userInfo.phone = this.eUserInfo.Phone;
            this.userInfo.firstName = this.eUserInfo.FirstName;
            this.userInfo.lastName = this.eUserInfo.LastName;
            this.userInfo.avatar = this.imageOld.replace(prefix, "");
            window.ls.set(appCode, JSON.stringify(this.userInfo));
          })
          .catch(() => {
            this.messageDialog.showMsg({
              message: this.$t("error.systemErrorDetail"),
              mode: "error",
            });
          })
          .finally(() => {
            this.closePreference();
          });
      }
    },
    init() {
      var handler = this.$refs.handler;
      var move = handler.querySelector(".move"),
        resizes = handler.querySelectorAll(".resize");
      var select = this.$refs.select,
        img = this.$refs.imgSelect;
      var cropOpt = this.crop,
        selectOpt = this.select,
        resizeOpt = this.resize;
      img.addEventListener(
        "load",
        function setHeight() {
          this.calcH = img.height;
          img.removeEventListener("load", setHeight);
        }.bind(this)
      );

      draggable(select, {
        start: (e) => {
          selectOpt.active = true;
          selectOpt.startX = selectOpt.x = e.offsetX;
          selectOpt.startY = selectOpt.y = e.offsetY;
          selectOpt.w = 0;
          selectOpt.h = 0;
        },
        move: (e) => {
          if (e.target == select) {
            if (selectOpt.active) {
              var x = e.offsetX - selectOpt.startX,
                y = e.offsetY - selectOpt.startY;
              var mx = x < 0 ? selectOpt.startX : this.imageWidth - selectOpt.x,
                my = y < 0 ? selectOpt.startY : this.calcH - selectOpt.y;
              var v = Math.min(mx, my, Math.max(Math.abs(x), Math.abs(y)));

              if (v < 0) {
                throw new Error("v cannot be negtive");
              }

              if (x < 0) {
                selectOpt.x = Math.max(selectOpt.startX - v, 0);
              }
              if (y < 0) {
                selectOpt.y = Math.max(selectOpt.startY - v, 0);
              }
              selectOpt.w = v;
              selectOpt.h = selectOpt.w / this.ratio;
            }
          }
        },
        end: () => {
          if (this.select.w > 32 && this.select.h > 32) {
            ["x", "y", "w", "h"].forEach((k) => {
              cropOpt[k] = this.select[k];
            });
            cropOpt.active = true;
            this.draw(cropOpt);
          }
          this.select.active = false;
        },
      });

      draggable(move, {
        start: (e) => {
          var opt = this.move;
          opt.x = e.x;
          opt.y = e.y;
        },
        move: (e) => {
          var x = e.clientX,
            y = e.clientY;
          var opt = this.move;

          cropOpt.x = Math.min(
            Math.max(x - opt.x + cropOpt.x, 0),
            this.imageWidth - cropOpt.w
          );
          cropOpt.y = Math.min(
            Math.max(y - opt.y + cropOpt.y, 0),
            this.calcH - cropOpt.h
          );
          opt.x = x;
          opt.y = y;
        },
        end: () => {
          this.draw(cropOpt);
        },
      });

      resizes.forEach((resize) => {
        draggable(resize, {
          start: (e) => {
            resizeOpt.active = true;
            resizeOpt.d = e.target.className
              .split(" ")
              .filter((s) => s !== "resize")
              .join("");
            ["x", "y", "w", "h"].forEach((k) => {
              resizeOpt[k] = this.crop[k];
            });
            resizeOpt.startX = e.clientX;
            resizeOpt.startY = e.clientY;
          },
          move: (e) => {
            var w = /w$/.test(resizeOpt.d),
              n = /^n/.test(resizeOpt.d);
            var x = w
                ? resizeOpt.startX - e.clientX
                : e.clientX - resizeOpt.startX,
              y = n
                ? resizeOpt.startY - e.clientY
                : e.clientY - resizeOpt.startY,
              dx = w
                ? resizeOpt.x
                : this.imageWidth - resizeOpt.x - resizeOpt.w,
              dy = n ? resizeOpt.y : this.calcH - resizeOpt.y - resizeOpt.h,
              r = this.ratio;

            if (/^[news]{2}$/.test(resizeOpt.d)) {
              if ((x == 0 && y <= 0) || (y == 0 && x <= 0)) {
                return;
              }
            }
            var v = 0;
            var calc_v = (s) =>
              Math.max(Math.min(s, Math.min(dx, dy * r)), 32 - resizeOpt.w);
            switch (resizeOpt.d) {
              case "n":
              case "s":
                v = calc_v(y);
                break;
              case "w":
              case "e":
                v = calc_v(x);
                break;
              case "nw":
              case "ne":
              case "se":
              case "sw":
                v = calc_v(Math.max(x, y));
                break;
              default:
                break;
            }
            if (w) {
              cropOpt.x = resizeOpt.x - v;
            }
            if (n) {
              cropOpt.y = resizeOpt.y - v / r;
            }
            cropOpt.w = resizeOpt.w + v;
            cropOpt.h = resizeOpt.h + v / r;
          },
          end: () => {
            resizeOpt.active = false;
            this.draw(cropOpt);
          },
        });
      });
    },
    clearCrop(e) {
      if (e.target === this.$refs.crop) {
        this.crop.active = this.select.active = false;
      }
    },
    dismiss() {
      this.showEditPhone = false;
      this.imageUpdate = false;
    },
    commit() {
      if (this.imageUpdate) {
        this.imageOld = this.$refs.preview.toDataURL();
        this.dismiss();
      }
    },
    selectImage(e) {
      let input = e.currentTarget;
      if (input.files && input.files.length) {
        let file = input.files[0];

        if (file.size < 1000 * 1000 && file.type.indexOf("image") === 0) {
          let fr = new FileReader();

          fr.onloadend = (e) => {
            if (e.target.readyState == FileReader.DONE) {
              this.imageNew = e.target.result;
              setTimeout(() => {
                this.calcH = this.$refs.imgSelect.height;
              });
            }
          };

          fr.readAsDataURL(file);
          this.crop.active = this.select.active = false;
        } else {
          this.messageDialog.showMsg({
            message: this.$t("toolBar.userPreference.uploadimgtip"),
            mode: "error",
          });
        }
      }
    },
    draw({ x, y, w, h }) {
      let canvas = this.$refs.preview;
      let context = canvas.getContext("2d");
      let image = new Image();
      image.onload = () => {
        x = (x / this.imageWidth) * this.$refs.imgSelect.naturalWidth;
        y = (y / this.calcH) * this.$refs.imgSelect.naturalHeight;
        w = (w / this.imageWidth) * this.$refs.imgSelect.naturalWidth;
        h = w / this.ratio;

        context.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
        this.imageUpdate = true;
      };
      image.src = this.imageNew;
    },
    closePreference() {
      this.$emit("closeDialog");
      this.showEditPhone = false;
      this.imageUpdate = false;
    },
  },
  watch: {
    tabName(val, old) {
      // console.log(val, old);
    },
    showEditPhone(val) {
      if (val) {
        this.crop.active = this.select.active = false;
        this.imageNew = this.imageSrc;
        this.$nextTick(() => {
          this.init();
        });
      }
    },
    preferencesDialog(val) {
      if (val) {
        this.eUserInfo = {
          Phone: this.userInfo.phone,
          FirstName: this.userInfo.firstName,
          LastName: this.userInfo.lastName,
        };

        this.imageOld = this.userInfo.avatar
          ? prefix + this.userInfo.avatar
          : "";
      }
    },
  },
};
</script>
<style lang="scss">
.v-dialog {
  .preferencesCard.v-card {
    position: relative;
    z-index: 9999;
    .v-tabs-slider-wrapper {
      height: 0 !important;
    }
    .v-card__text {
      padding-top: 20px;
    }
    .v-card__actions {
      padding: 8px 16px;
    }
    .theme--light.v-tabs-items {
      background: transparent;
    }
    .image-wrapper {
      position: relative;
      background: #e4e4e4;
      height: 240px;
      width: 240px;
      flex: 1 0 240px;
      border: solid 1px rgba(0, 0, 0, 0.12);
      img {
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
      .edit-btn {
        text-align: center;
        line-height: 35px;
        position: absolute;
        right: 5px;
        bottom: 5px;
        font-size: 22px;
      }
    }
    .user-title {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 1px;
    }
  }
}
</style>
<style>
.vc-image-cropper-display {
  display: flex;
  align-items: center;
  padding-left: 56px;
  padding-right: 24px;
}
.file-upload {
  display: flex;
  padding: 12px 0;
}
.file-upload-input {
  height: 36px;
  min-width: 64px;
  padding: 0 16px;
  border-radius: 0;
}
.file-upload-input > input[type="file"] {
  position: absolute;
  top: 0;
  right: 0;
  margin: 0;
  padding: 0;
  z-index: 9;
  font-size: 20px;
  cursor: pointer;
  height: 36px;
  opacity: 0;
}
.file-upload-text {
  font-size: 12px;
  line-height: 36px;
  padding-left: 16px;
}
.aw {
  display: flex;
  align-items: center;
}
.aw .ac {
  position: relative;
}
.ac > .img {
  width: 100%;
  cursor: crosshair;
  display: block;
}
.ac-select,
.ac-crop,
.resize-cover {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 21;
}
.resize-cover {
  z-index: 22;
}
.ac-select {
  cursor: crosshair;
}
.ac-select.active,
.ac-crop {
  background-color: rgba(0, 0, 0, 0.4);
}
.select-zone {
  position: absolute;
  z-index: 22;
  pointer-events: none;
  overflow: hidden;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.4);
}
.crop-zone {
  position: absolute;
  z-index: 22;
  pointer-events: none;
  overflow: hidden;
}
.select-zone > img,
.crop-zone .line,
.crop-zone > img {
  position: absolute;
}
.crop-zone .line:after {
  content: "";
  position: absolute;
  background: #fff url("data:image/gif;base64,R0lGODlhCAAIAJEAAKqqqv///wAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQJCgAAACwAAAAACAAIAAACDZQFCadrzVRMB9FZ5SwAIfkECQoAAAAsAAAAAAgACAAAAg+ELqCYaudeW9ChyOyltQAAIfkECQoAAAAsAAAAAAgACAAAAg8EhGKXm+rQYtC0WGl9oAAAIfkECQoAAAAsAAAAAAgACAAAAg+EhWKQernaYmjCWLF7qAAAIfkECQoAAAAsAAAAAAgACAAAAg2EISmna81UTAfRWeUsACH5BAkKAAAALAAAAAAIAAgAAAIPFA6imGrnXlvQocjspbUAACH5BAkKAAAALAAAAAAIAAgAAAIPlIBgl5vq0GLQtFhpfaIAACH5BAUKAAAALAAAAAAIAAgAAAIPlIFgknq52mJowlixe6gAADs=");
}
.crop-zone .line.n {
  top: 1px;
  left: 0;
  width: 100%;
  height: 6px;
}
.crop-zone .line.n:after {
  top: -1px;
  height: 1px;
  width: 100%;
  left: 0;
}
.crop-zone .line.e {
  top: 0;
  right: 1px;
  height: 100%;
  width: 6px;
}
.crop-zone .line.e:after {
  right: -1px;
  width: 1px;
  height: 100%;
  top: 0;
}
.crop-zone .line.s {
  bottom: 1px;
  left: 1px;
  width: 100%;
  height: 6px;
}
.crop-zone .line.s:after {
  width: 100%;
  bottom: -1px;
  left: 0;
  height: 1px;
}
.crop-zone .line.w {
  top: 0;
  left: 1px;
  height: 100%;
  width: 6px;
}
.crop-zone .line.w:after {
  left: -1px;
  width: 1px;
  height: 100%;
  top: 0;
}
.crop-handle {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 23;
}
.crop-handle .move {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: auto;
  cursor: move;
}
.crop-handle .resize {
  width: 6px;
  height: 6px;
  background-color: rgba(51, 51, 51, 0.6);
  border: 1px #eee solid;
  position: absolute;
  pointer-events: auto;
  z-index: 200;
}
.crop-handle .n,
.crop-handle .s {
  left: 50%;
  margin-left: -2px;
}
.crop-handle .w,
.crop-handle .e {
  top: 50%;
  margin-top: -2px;
}
.crop-handle .n,
.crop-handle .s {
  cursor: ns-resize;
}
.crop-handle .w,
.crop-handle .e {
  cursor: ew-resize;
}
.crop-handle .n {
  top: -2px;
}
.crop-handle .e {
  right: -2px;
}
.crop-handle .s {
  bottom: -2px;
}
.crop-handle .w {
  left: -2px;
}
.crop-handle .n.e,
.crop-handle .n.w,
.crop-handle .s.e,
.crop-handle .s.w {
  margin: 0;
}
.crop-handle .n.w {
  cursor: nwse-resize;
}
.crop-handle .n.e {
  left: auto;
  cursor: nesw-resize;
}
.crop-handle .s.w {
  top: auto;
  cursor: nesw-resize;
}
.crop-handle .s.e {
  top: auto;
  left: auto;
  cursor: nwse-resize;
}
</style> 
<style lang="scss" scoped>
.card-title {
  .backIcon {
    width: 38px;
    margin-left: -5px;
    margin-right: 15px;
    color: #000 !important;
    &::before {
      margin: 0;
    }
  }
}
.preferencesCard {
  user-select: none;
  min-height: 400px;
  .v-tabs-slider-wrapper {
    height: 0;
  }
  .canvas {
    margin-left: 40px;
  }
  .file-input-load {
    width: 0;
    height: 0;
    visibility: hidden;
  }
  .enable-switch {
    .v-label {
      // color: #fff;
    }
  }
  .user-text {
    margin-bottom: 20px;
    min-height: 22px;
  }
  .preview-wrap {
    background-color: #fff;
  }
  .preview-wrap.lightStyle {
    background-color: #000;
  }
}
</style>

