// var config = require('../../../../../appsettings.json');
export default {
  popups:[],
  loading: true,
  env: "Prod",
  errorSnack:{
    showErrorSnack:false,
    errorSnackMsg:"",
    snackTimeOut: 5000,
    snackColor: 'red'
  },
  isPCBroswer: true,
  direction: "vertical",
  listQueryCache: {},
  userInfo: {},
  // userInfo: window.localStorage.getItem("userInfo"),
  // appInfo: window.localStorage.getItem("appInfo"),
  appInfo: {},
  // appLogo: window.localStorage.getItem("appLogo"),
  qyerySelectedResult: {},
  appLogo: "",  
  currentpagetype: "",
  workflow:{

  },
  //enableWorkflow: false,
  navigationDrawerActiveItem: {},
  windowWidth: 0,
  breadcrumbsData: [],
  cardListOrderCollation: '',
  qyeryResultFlag:false,
  qyeryResult: {
  },
  viewdataExport: 'datatable',
  dataTableGroupParameter: { id: "", isGroup: false },
  useMock: false,
  currentComponent: {
    displayName: "",
    jsonSchema: {
      name: "",
      model: "",
      component: "",
      classes: "",
      style: ""
    },
    defaultModel: ""
  },
  designCommon: {
    isExpand: true,
    isMobile: false,
    showType: "Dashboard",
    overlay: false,
    componentName: ""
  },
  mapapiloaded: false,
  appPerference: {
    DefaultLanguage: "",
    AvaiableLanguage:[],
    GlobalDateFormat: "",
    NotificationConfig: {
      loadCount: 10,
      enableNotification: true,
      selectDateTimeFormat: "",
      customDateTime: "",
      customDateTimeShow: "",
      dateTimeFormat: "",
      el: ""
    },
    theme:{
      currentTheme: {
        name: "",
        dark: false,
        themeId: "",
        concurrencyStamp: ""
      },
      themeList:{}
    }
  },
  testObj: [],
  uploadOverlayProgress: '',  
  enableCDN: false,
  cdnHost: '',
  version: '',
  buttonLoading: false,
  // enableEditMode: true,
  // showWorkflowButtons: true,
  // isEndState: false,
  // currentActionCodeList: [],
  currentViewMode: 'datatable',
  formFieldsSettings: {},
  sortByDataItems: [],
  floatingButtonItems: [],
  buttinInQueryPage: false,
  fontListItems: []
};
