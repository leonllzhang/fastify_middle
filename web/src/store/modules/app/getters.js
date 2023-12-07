import i18n from "../../../i18n/index";

export default {
  cdnHostAndVersionPath(state) {
    if(state.enableCDN){
      return state.cdnHost+"/"+state.version;
    }else{
      const isEnableCdn = (window.enableCdn.toLowerCase() === 'true');
      let result = ""
      if(isEnableCdn){
        result = window.cdnHost + "/" +window.version
      }
      return result
    }
  },
  getBreadcrumbsData(state) {
    let breadcrumbsData = []
    state.breadcrumbsData.map(m => {
      var newItem = {};
      newItem.text = window.appp.$te('menu.' + m.code) ? window.appp.$t('menu.' + m.code) : m.name;
      newItem.disabled = false;
      newItem.code = m.code;
      newItem.name = m.name;
      breadcrumbsData.push(newItem);
    });
    //console.log('breadcrumbsData update', breadcrumbsData);
    return breadcrumbsData;
  }
}
