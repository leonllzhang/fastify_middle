/**
 * Vue i18n
 *
 * @library
 *
 * http://kazupon.github.io/vue-i18n/en/
 */

// Lib imports
import Vue from 'vue'
import VueI18n from 'vue-i18n'
//import messages from '../lang/index'
import secureLs from 'secure-ls'
Vue.use(VueI18n)

var ls = new secureLs();
const i18n = new VueI18n({
  // locale: window.localStorage.getItem('language') || 'en',
  locale: ls.get('language') || 'en',
  fallbackLocale: 'en',
  //messages,
  silentTranslationWarn: true
})

export default i18n
