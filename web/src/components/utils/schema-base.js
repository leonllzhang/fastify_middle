import evalable from "./evalable";
import { exportEnvUrl } from "../../utils/env"
// import { transformToRGBA, getPropertiesValue, getThemes } from "../../../AdminManagement/components/utils/panelFunction";
import {
    mapState
} from 'vuex';
var _extends =
    Object.assign ||
    function(target) {
        for (var i = 1; i < arguments.length; i++) {
            var source = arguments[i];
            for (var key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };
export default {
    mixins: [evalable],
    inject: {
        popupWrapper: {
            default: {
                close() {},
                outerFn() {}
            },
        },
    },
    props: {
        schema: {
            type: Object,
            required: true
        },
        model: {
            type: Object
        },
        options: {
            type: Object,
            // default () {
            //   return {
            //     color: "#dc6900",
            //     direction: "vertical"
            //   };
            // }
        }
    },
    computed: {
        ...mapState(['userInfo']),
        getPropertiesValue() {
            return (optionName, propertiesName, subPropertiesName, reference) => {
                return (
                    getPropertiesValue(
                        this.schema,
                        optionName,
                        propertiesName,
                        subPropertiesName,
                        reference
                    )
                );
            };
        },
        // getRGBA() {
        //     return (color, opacity) => {
        //         return transformToRGBA(color, opacity);
        //     }
        // },
        // computeLayoutStyle() {
        //     return (propertyName, schema) => {
        //         if (!schema || !schema.revampSchema) return {};
        //         const styleSchema = schema.revampSchema.find(option => option.name === 'Style').members;
        //         if (!styleSchema) return {};
        //         const propertySchema = (propertyName && styleSchema.find(property => property.name === propertyName)) ? 
        //             styleSchema.find(property => property.name === propertyName).members : styleSchema;
        //         const styleMap = {
        //             'inline': {
        //                 'padding': 'padding',
        //                 'margin': 'margin',
        //                 'backgroundColor': 'backgroundColor',
        //                 'borderWidth': 'borderWidth',
        //                 'borderStyle': 'borderStyle',
        //                 'borderColor': 'borderColor',
        //             }
        //         }
        //         const themeMap = {
        //             radiusTheme: { 
        //               "radius": "borderRadius" 
        //             },
        //             shadowTheme: {
        //               "boxShadow": "boxShadow",
        //             },
        //             borderTheme: {
        //               "border": "--c-border",
        //             }
        //         };
        //         let style = {};
        //         for (let i = 0, j = propertySchema.length; i < j; i++) {
        //             const subPropertyName = propertySchema[i].name;
        //             const themes = getThemes(this.$store.state.app.appPerference.theme);
        //             const defaultColorTheme = themes.currentTheme.find(theme => theme.name === 'primary');
        //             let subPropertyValue = propertyName ? this.getPropertiesValue('Style', propertyName, subPropertyName, themes) : this.getPropertiesValue('Style', subPropertyName, null, themes);
        //             if (subPropertyValue) {
        //               if (subPropertyName === 'radiusTheme' || subPropertyName === 'shadowTheme' || subPropertyName === 'borderTheme') {
        //                 const themeStyle = themeMap[subPropertyName];
        //                 for (let key in themeStyle) {
        //                     if (typeof (subPropertyValue) === 'string') {
        //                         const theme = themes[subPropertyName].find(themes => themes.name === subPropertyValue).value;
        //                         switch (subPropertyName) {
        //                             case 'radiusTheme':
        //                                 style[themeStyle[key]] = theme + 'px';
        //                                 break;
        //                             case 'shadowTheme':
        //                                 style[themeStyle[key]] = `${theme.offsetX}px ${theme.offsetY}px ${theme.blur}px ${transformToRGBA(theme.color, theme.opacity)}`;
        //                                 break;
        //                             case 'borderTheme':
        //                                 style[styleMap['inline']['borderWidth']] = `${theme.width}px`;
        //                                 style[styleMap['inline']['borderStyle']] = theme.style;
        //                                 style[styleMap['inline']['borderColor']] = transformToRGBA(theme.color, theme.opacity);
        //                                 break;
        //                         }
        //                     } else {
        //                       if (subPropertyName == 'shadowTheme') {
        //                           style[themeStyle[key]] = subPropertyValue['boxShadow'];
        //                       } else if(subPropertyName == 'borderTheme'){
        //                           style[styleMap['inline']['borderWidth']] = `${subPropertyValue.borderWidth}px`;
        //                           style[styleMap['inline']['borderStyle']] = subPropertyValue.borderStyle;
        //                           style[styleMap['inline']['borderColor']] = subPropertyValue.borderColor;
        //                       } else {
        //                           style[themeStyle[key]] = subPropertyValue[key];
        //                       }
        //                   }
        //                 }
        //               } 
        //               else if(subPropertyName === 'padding'|| subPropertyName === 'margin'){
        //                 style[styleMap[propertyName ? propertyName : 'inline'][subPropertyName]] = subPropertyValue + ' !important';
    
        //               }else {
        //                 if (subPropertyName === 'backgroundColor') {
        //                   if (typeof (subPropertyValue) === 'string') {
        //                     const colorTheme = themes.currentTheme.find(theme => theme.name === subPropertyValue);
        //                     subPropertyValue = { color: colorTheme ? colorTheme.value : defaultColorTheme.value, opacity: 100 };
        //                   }
        //                   subPropertyValue = transformToRGBA(subPropertyValue.color, subPropertyValue.opacity);
        //                 } 
        //                 style[styleMap[propertyName ? propertyName : 'inline'][subPropertyName]] = subPropertyValue;
        //               }
        //             }
        //         }
        //         if(propertyName == 'Label'){
        //             style['display'] = 'inline-block';
        //         }
        //         return style;
        //     }
        // },
        // computeStyle() {
        //     return (propertyName, schema) => {
        //         if (!schema.revampSchema) return {};
        //         const styleSchema = schema.revampSchema.find(option => option.name === 'Style').members;
        //         if (!styleSchema) return {};
        //         const propertySchema = (propertyName && styleSchema.find(property => property.name === propertyName)) ?
        //             styleSchema.find(property => property.name === propertyName).members : styleSchema;
        //         const styleMap = {
        //             'Label': {
        //                 'fontFamily': 'fontFamily',
        //                 'fontSize': 'fontSize',
        //                 'fontColor': 'color',
        //                 'color': 'color',
        //                 'lineHeight': 'lineHeight',
        //                 'fontWeight': 'fontWeight',
        //                 'letterSpacing': 'letterSpacing',
        //                 'padding': 'padding',
        //                 'margin': 'margin',
        //                 'shadow': 'textShadow',
        //                 'backgroundColor': 'background',
        //                 'outlined': 'border',
        //                 'buttonColor': 'borderColor'
        //             },
        //             'Field': {
        //                 'fontFamily': '--c-fontFamily',
        //                 'fontSize': '--c-fontSize',
        //                 'fontColor': '--c-color',
        //                 'color': '--c-color',
        //                 'fontWeight': '--c-fontWeight',
        //                 'letterSpacing': '--c-letterSpacing',
        //                 'padding': '--c-padding',
        //                 'margin': '--c-margin',
        //                 'shadow': '--c-shadow',
        //                 'borderWidth': '--c-borderWidth',
        //                 'borderStyle': '--c-borderStyle',
        //                 'borderColor': '--c-borderColor',
        //                 'radius': '--c-borderRadius',
        //                 'backgroundColor': '--c-background',
        //                 'bgColor':'--c-background'
        //             }
        //         }
        //         const themeMap = {
        //             textTheme: {
        //                 "fontFamily": propertyName === "Field" ? "--c-fontFamily" : "fontFamily",
        //                 "fontSize": propertyName === "Field" ? "--c-fontSize" : "fontSize",
        //                 "lineHeight": propertyName === "Field" ? "--c-lineHeight" : "lineHeight",
        //                 "fontWeight": propertyName === "Field" ? "--c-fontWeight" : "fontWeight"
        //             },
        //             radiusTheme: { "radius": "--c-borderRadius" },
        //             shadowTheme: {
        //                 "boxShadow": "--c-shadow",
        //                 "textShadow": "textShadow"
        //             },
        //             borderTheme: {
        //                 "border": "--c-border",
        //             }
        //         };
        //         let style = {};
        //         for (let i = 0, j = propertySchema.length; i < j; i++) {
        //             const subPropertyName = propertySchema[i].name;
        //             const themes = getThemes(this.$store.state.app.appPerference.theme);
        //             const defaultColorTheme = themes.currentTheme.find(theme => theme.name === 'primary');
        //             let subPropertyValue = propertyName ? this.getPropertiesValue('Style', propertyName, subPropertyName, themes) : this.getPropertiesValue('Style', subPropertyName, null, themes);
        //             let componentName = schema.component;
        //             if (!subPropertyValue && subPropertyName === 'color' && propertyName === "Field") {
        //                 let dark = this.$store.state.app.appPerference.theme.currentTheme.dark;
        //                 subPropertyValue = dark ? { color: "#FFFFFF", opacity: 100 } : { color: "#000000", opacity: 100 };
        //                 let arr = ["vc-peoplepicker", "vc-datapicker", "vc-datetime-picker", "vc-tags"];
        //                 if (arr.indexOf(componentName) > -1) {
        //                     subPropertyValue = "primary";
        //                 }
        //             }
        //             if (subPropertyValue) {
        //                 if (subPropertyName === 'textTheme' || subPropertyName === 'radiusTheme' || subPropertyName === 'shadowTheme' || subPropertyName === 'borderTheme') {
        //                     const themeStyle = themeMap[subPropertyName];
        //                     for (let key in themeStyle) {
        //                         if (typeof (subPropertyValue) === 'string') {
        //                             const theme = themes[subPropertyName].find(themes => themes.name === subPropertyValue).value;
        //                             switch (subPropertyName) {
        //                                 case 'textTheme':
        //                                     if (key === "fontSize") {
        //                                         style[themeStyle[key]] = theme[key] + "px";
        //                                     } else if (key === "fontFamily") {
        //                                         const defaultFontFamily = themes.textTheme.find(theme => theme.name === 'default').value.fontFamily.join(',');
        //                                         style[themeStyle[key]] = theme[key].join(",") + ` ,${defaultFontFamily}`;
        //                                     } else {
        //                                         style[themeStyle[key]] = theme[key];
        //                                     }
        //                                     break;
        //                                 case 'radiusTheme':
        //                                     style[themeStyle[key]] = theme + 'px';
        //                                     break;
        //                                 case 'shadowTheme':
        //                                     if (propertyName == 'Label' || componentName === 'vc-label') {
        //                                         style[themeStyle['textShadow']] = `${theme.offsetX}px ${theme.offsetY}px ${theme.blur}px ${transformToRGBA(theme.color, theme.opacity)}`;
        //                                     } else if (!propertyName || propertyName == 'Field') {
        //                                         style[themeStyle['boxShadow']] = `${theme.offsetX}px ${theme.offsetY}px ${theme.blur}px ${transformToRGBA(theme.color, theme.opacity)}`;
        //                                     }
        //                                     break;
        //                                 case 'borderTheme':
        //                                     style[styleMap['Field']['borderWidth']] = `${theme.width}px`;
        //                                     style[styleMap['Field']['borderStyle']] = theme.style;
        //                                     style[styleMap['Field']['borderColor']] = transformToRGBA(theme.color, theme.opacity);
        //                                     break;
        //                             }
        //                         } else {
        //                             if (subPropertyName == 'shadowTheme' && (propertyName == 'Label' || componentName === 'vc-label')) {
        //                                 style[themeStyle['textShadow']] = subPropertyValue['textShadow'];
        //                             } else if (subPropertyName == 'shadowTheme' && (!propertyName || propertyName == 'Field')) {
        //                                 style[themeStyle['boxShadow']] = subPropertyValue['boxShadow'];
        //                             } else if(subPropertyName == 'borderTheme' &&  propertyName == 'Field'){
        //                                 style[styleMap['Field']['borderWidth']] = `${subPropertyValue.borderWidth}px`;
        //                                 style[styleMap['Field']['borderStyle']] = subPropertyValue.borderStyle;
        //                                 style[styleMap['Field']['borderColor']] = subPropertyValue.borderColor;

        //                             } else {
        //                                 style[themeStyle[key]] = subPropertyValue[key];
        //                             }

        //                         }
        //                     }
        //                 }
        //                 else if (subPropertyName === 'buttonColor') {
        //                     const fontColor = this.getPropertiesValue('Style', 'color', null, themes);
        //                     const outlinedValue = this.getPropertiesValue('Style', 'outlined', null, themes);
        //                     if (fontColor && outlinedValue === null) {
        //                         if (typeof (subPropertyValue) === 'string') {
        //                             const colorTheme = themes.currentTheme.find(theme => theme.name === subPropertyValue);
        //                             subPropertyValue = { color: colorTheme ? colorTheme.value : defaultColorTheme.value, opacity: 100 };
        //                         }
        //                         subPropertyValue = transformToRGBA(subPropertyValue.color, subPropertyValue.opacity);
        //                         style[styleMap['Label']['buttonColor']] = subPropertyValue;
        //                     }
        //                 }
        //                 else if (subPropertyName === 'outlined') {
        //                     let { borderWidth, borderStyle, borderColor } = subPropertyValue;
        //                     if (typeof (borderColor) === 'string') {
        //                         const colorTheme = themes.currentTheme.find(theme => theme.name === borderColor);
        //                         borderColor = { color: colorTheme ? colorTheme.value : defaultColorTheme.value, opacity: 100 };
        //                     }
        //                     borderColor = transformToRGBA(borderColor.color, borderColor.opacity);
        //                     style[styleMap['Label']['outlined']] = `${borderWidth}px ${borderStyle} ${borderColor} !important`;
        //                 }
        //                 else if(subPropertyName === 'radius' ) {
        //                     style[styleMap[propertyName ? propertyName : 'Label'][subPropertyName]] =subPropertyValue+'px';
        //                 }
        //                 else {
        //                     if (subPropertyName === 'fontColor' || subPropertyName === 'borderColor' || subPropertyName === 'backgroundColor' || subPropertyName === 'color' ||  subPropertyName === 'bgColor') {
        //                         if (typeof (subPropertyValue) === 'string') {
        //                             const colorTheme = themes.currentTheme.find(theme => theme.name === subPropertyValue);
        //                             subPropertyValue = { color: colorTheme ? colorTheme.value : defaultColorTheme.value, opacity: 100 };
        //                         }
        //                         subPropertyValue = transformToRGBA(subPropertyValue.color, subPropertyValue.opacity);
        //                         if (subPropertyName === 'color' && propertyName !== "Field") subPropertyValue = subPropertyValue + ' !important'
        //                     } else if (subPropertyName === 'fontSize' || subPropertyName === 'letterSpacing' || subPropertyName === 'borderWidth') {
        //                         subPropertyValue = subPropertyValue + 'px';
        //                     }
        //                     style[styleMap[propertyName ? propertyName : 'Label'][subPropertyName]] = subPropertyValue;
        //                 }

        //             }
        //         }
        //         if(propertyName == 'Label' || !propertyName && !(/button/.test(schema.component))){
        //             style['display'] = 'inline-block';
        //         }
        //         return style;
        //     }
        // },
        pageView() {
            let pageView = this.options && this.options.pageView ? this.options.pageView : this.$route.params.pageView || "home";
            return pageView
        },
        localeKey() {
            //此处需要判断是否在pageobject中，在的话，需要从options 
            if (this.$route && this.$route.name && this.$route.name.toLowerCase() == 'view') {
                return `${(this.options && this.options.pageType ? this.options.pageType : this.$store.state.app.currentpagetype) + "_" + (this.options && this.options.pageCode? this.options.pageCode: this.$store.state.app.navigationDrawerActiveItem.viewAlias.toLowerCase())}.${this.name}`;
            } else {
                return `${(this.options && this.options.pageType ? this.options.pageType : this.$store.state.app.currentpagetype) + "_" + (this.options && this.options.pageCode?  this.options.pageCode: this.pageView.toLowerCase())}.${this.name}`;
            }
        },
        currentLocale() {
            return this.$i18n.locale;
        },
        localeFormKey() {
            let pageView = this.options && this.options.pageView ? this.options.pageView : this.$route.params.pageView || "home";
            return `${this.$store.state.app.currentpagetype + "_" + (pageView ? pageView.toLowerCase() : "")}`;
        },
        name() {
            return (this.schema ? this.schema.name : '') || (this.schema ? this.schema.model : '');
        },
        tooltipName() {
            return this.schema.tooltipName || this.schema.model;
        },
        classes() {
            let c = this.schema.classes || {};


            if (typeof c === "string" && c == "null") {
                return "";
            }

            if (typeof c === "string") {
                c = {
                    [c]: 1
                };
            }
            return _extends({
                    "px-2 px-sm-3": 1
                },
                c
            );
        },
        isNew() {
            return this.$route.name === "Add";
        },
        label() {
            return this.$te(this.localeKey + '.label') && this.$t(this.localeKey + '.label') ?
                this.$t(this.localeKey + '.label') :
                this.schema.label;
        },
        tooltipLabel() {
            // return this.schema.tooltipName && this.$te(`${this.localeKey}.${this.tooltipName}`)
            //   ? this.$te(`${this.localeKey}.${this.tooltipName}`)
            //   : "";
            return this.$te(this.localeKey + '.tooltip') ?
                this.$t(this.localeKey + '.tooltip') :
                this.schema.tooltipName;
        },
        color() {
            return this.schema.color || this.options.color;
        },
        isVertical() {
            return this.direction === "vertical";
        },
        isHorizontal() {
            return this.direction !== "vertical";
        },
        direction() {
            return this.schema.direction || this.options.direction;
        }
    },
    created() {
        //set show    
        if (this.schema && "undefined" === typeof this.schema.show) {
            this.$set(this.schema, "show", true);
        }

        // created callback
        if (this.schema && this.schema.created && Array.isArray(this.schema.created)) {
        this.eval(...this.schema.created);
        }
        this.$root.$on("schema-update", (name, exp) => {
        if (this.schema.name === name && exp && Array.isArray(exp)) {
            return this.eval(...exp);
        }
        });
        if (this.schema && this.schema.watch && typeof this.schema.watch == "object" && this.model) {      
            Object.keys(this.schema.watch).forEach(key => {
                var func = this.generateFunction(this.schema.watch[key]).bind(this);
                this.$watch(key, func, {
                //当值第一次绑定的时候，就会立即触发监听函数
                immediate: !this.schema.notWatchOnCreated,
                //深度监听 || 可以发现对象内部值的变化
                deep: true
                });
            })
        }
    },
    methods: {
        extend: _extends,
        closePopup() {
            this.popupWrapper.close()
        },
        outerFn(data) {
            this.popupWrapper.outerFn(data)
        },
        $raiseEvent() {
            let args = Array.prototype.slice.call(arguments);

            this.$root.$emit(args.shift(), ...args);
        },
        locale(key) {
            return this.$te(key) ? this.$t(key) : key;
        },
        to(url) {
            return this.$dm_toAppUrl(url)
        },
        switchPageMode(pageMode) {
            var params = ["p1", "p2", "p3", "p4", "p5"]
                .map(s => this.$route.params[s])
                .filter(v => v);

            if (this.$route.name === "Add") {
                params = ["form", this.$route.params.pageView, "add"].concat(params);
            } else {
                params = [
                    "form",
                    this.$route.params.pageView,
                    pageMode,
                    this.$route.params.id
                ].concat(params);
            }
            
            let _url = ""
            if(window.urlMode == 'NOTENANTAPPCODE') {
                _url = window.location.pathname
                .split("/")
                .splice(0, 1)
                .concat(params)
                .join("/")
            }else{
               _url = window.location.pathname
                .split("/")
                .splice(0, 3)
                .concat(params)
                .join("/")
            }
            window.top.location.href = exportEnvUrl(_url);
        },
        open(url) {
            window.open(
                this.to(url)
            );
        },
        callApi(apiName, requestobj) {
            return this.$axios.post('/sdk/' + apiName, requestobj).then(({
                data
            }) => {
                return data;
            });
        },
        callApiFile(apiName, requestobj) {
            return this.$axios.post('/sdkFile/' + apiName, requestobj, {
            responseType: 'blob'
            }).then(({
                data
            }) => {
                return data;
            });
        },
        callLoginApi(apiName, requestobj) {
            return this.$axios.post('/sdkLogin/' + apiName, requestobj).then(({
                data
            }) => {
                return data;
            });
        },
        togglePeoplePicker(name, data, callbackFn) {
            let currentComponentCode = name + this.pageView.toLowerCase()
            this.bus.$emit(`toggle_peoplepicker_${currentComponentCode}`, {
                'data': data,
                'callbackFn': callbackFn
            });
        },
        updateComponentStatus(componentName, statusVal) {
            // 简易拷贝
            let _reply = JSON.parse(JSON.stringify(this.$store.state.componentStatus));
            _reply[componentName] = statusVal
            this.$store.commit("SET_ComponentStatus", _reply);
        }
    }
};
