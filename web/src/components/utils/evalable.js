export default {
  methods: {
    generateFunction(args) {
      if (typeof args === "string") {
        args = [args];
      }
      if (Array.isArray(args)) {
        return function() {
          return this.eval(...args);
        }.bind(this);
      }

      return null;
    },
    eval() {
      var args = Array.prototype.slice.call(arguments);
      var str = args.pop();

      if (str) {
        args = ["model", "schema", "options", "moment", "$store", "bus", "$vuetify", "$route", "$refs", "$set", "$i18n", "$te", "$t", "$emit", "$watch", "$event", "$nextTick", "$dm", "outerFn", "callApi", "callApiFile", "callLoginApi", "$dialog"]
          .concat(args)
          .filter((o, i, a) => a.indexOf(o) == i);
        return Function(...args, str).apply(null, args.map(arg => this[arg]));
      }
    },
    proxyEval(args, func) {
      if (!(args && typeof args === "object")) return;
      if (!(func && Array.isArray(func))) return;
      func = func.slice(0);
      args = JSON.parse(JSON.stringify(args));
      var str = func.pop();

      //统一在使用的时候注入公用变量
      func = ["model", "schema", "options", "moment", "$store", "bus", "$vuetify", "$route", "$refs", "$set", "$i18n", "$te", "$t", "$emit", "$watch", "$event", "$nextTick", "$dm", "outerFn", "callApi", "callApiFile", "callLoginApi", "$dialog"]
        .concat(func)
        .concat(Object.keys(args))
        .filter((o, i, a) => a.indexOf(o) == i);

      if (str) {
        func.forEach(s => {
          args[s] = args[s] || this[s];
        })
        return Function(...func, str).apply(null, func.map(s => args[s]));
      }
    }
  }
};
