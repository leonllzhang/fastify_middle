import { getEnv } from '../../utils/appBaseMethods';

export default {
  data() {
    return {
      currentActionCodeList: [],
      editControl: false,
      stateCode: "",
      visitControl: "Public",
      visitRoleList: [],
      isEndState: false,
      isRelevantUser: false,
      currentWorkflowUsers: [],
      isCurrentWorkflowUser: false,
      currentWorkflowRole: [],
      currentWorkflowDoneUser: [],
    }
  },
  computed: {
    enableEditMode() {
      //开启了workflow 才 判断        
      if (this.$store.state.app.enableWorkflow) {
        if (this.isCurrentWorkflowRole()) {
          if (!this.currentWorkflowDoneUser || (this.currentWorkflowDoneUser.length > 0 && this.currentWorkflowDoneUser.indexOf(this.$store.state.userInfo.userID) < 0)) {
            return this.editControl;
          }
        } else if (this.isCurrentWorkflowUser && (!this.currentWorkflowDoneUser || this.currentWorkflowDoneUser.length == 0 || (this.currentWorkflowDoneUser.length > 0 && this.currentWorkflowDoneUser.indexOf(this.$store.state.userInfo.userID) < 0))) {
          return this.editControl;
        } else if (!this.isCurrentWorkflowUser && !this.isCurrentWorkflowRole() && this.isRelevantUser) {
          // 有workflow 的  form 的 第一次操作
          return this.editControl;
        } else {
          return false;
        }
      } else {
        return true;
      }
    },
    showWorkflowButtons() {
      return (this.isCurrentWorkflowUser || (this.isCurrentWorkflowRole() && (!this.currentWorkflowDoneUser || (this.currentWorkflowDoneUser.length > 0 && this.currentWorkflowDoneUser.indexOf(this.$store.state.userInfo.userID) < 0))) ||
        (!this.currentWorkflowUsers && !this.currentWorkflowRole) || (this.currentWorkflowUsers && this.currentWorkflowUsers.length == 0 && this.currentWorkflowRole.length == 0));
    },
  },
  methods: {
    isCurrentWorkflowRole() {
      var self = this;
      if (this.currentWorkflowRole && this.currentWorkflowRole.length > 0) {
        let intersection = this.$store.state.userInfo.roles.filter(function (
          val
        ) {
          return self.currentWorkflowRole.indexOf(val) > -1;
        });

        return intersection.length > 0;
      } else {
        return false;
      }
    },
    async initWorkflow() {
      var self = this;
      if (self.$store.state.app.enableWorkflow) {
        self.isEndState = self.model["Ng_WorkflowIsEndState"] && self.model["Ng_WorkflowIsEndState"] == true;
        self.$store.state.app.isEndState = self.isEndState;
        self.isRelevantUser = self.model["Ng_RelevantUsers"] && self.model["Ng_RelevantUsers"].indexOf(self.$store.state.userInfo.userID) >= 0;
        self.currentWorkflowUsers = self.model["Ng_CurrentWorkflowUsers"];
        self.isCurrentWorkflowUser = self.model["Ng_CurrentWorkflowUsers"] && (self.model["Ng_CurrentWorkflowUsers"].indexOf(self.$store.state.userInfo.userID) >= 0 || self.model["Ng_CurrentWorkflowUsers"].filter(function (item) { return self.$store.state.userInfo.groups.indexOf(item.substring(1)) > -1 }).length > 0);
        self.currentWorkflowRole = self.model["Ng_CurrentWorkflowRoles"];
        self.currentWorkflowDoneUser = self.model["Ng_CurrentWorkflowDoneUsers"];
        var wfobj = {
          workflowCode: self.options.pageView,
          StateCode: self.model["Ng_WorkflowState"],
          environmentType: getEnv(),
        };
        if (self.model && !self.model["Ng_WorkflowState"]) {
          wfobj.StateCode = "Start";
        }
        if (!wfobj.environmentType) {
          wfobj.environmentType = "";
        }
        let _postWorkflowJArrayResult = await self.$axios.asynPost("/api/PostWorkflowJArrayResult", {
          requestURL: "GetStateBindAction",
          wfobj,
        });
        if (_postWorkflowJArrayResult && _postWorkflowJArrayResult.length > 0) {
          self.currentActionCodeList = _postWorkflowJArrayResult[0].actionCodeList;
          self.$store.state.app.currentActionCodeList = self.currentActionCodeList;
          self.editControl = _postWorkflowJArrayResult[0].editControl;
          self.stateCode = _postWorkflowJArrayResult[0].stateCode;
          self.visitControl = _postWorkflowJArrayResult[0].visitControl;
          self.visitRoleList = _postWorkflowJArrayResult[0].visitRoleList;
        }
        if (self.visitControl == "Private") {
          if (!self.isCurrentWorkflowUser && !self.isRelevantUser && !self.isCurrentWorkflowRole()) {
            //没权限
            self.$parent.$router.push({
              name: "error",
              params: {
                errorCode: 402
              },
              path: "/systemmessage/:errorCode",
            });
          }
        } else if (self.visitControl == "Public" && self.visitRoleList && self.visitRoleList.length > 0) {
          var self = self;
          let intersecarray = self.$store.state.userInfo.roles.filter(
            function (val) {
              return self.visitRoleList.indexOf(val) > -1;
            }
          );
          if ((!intersecarray || intersecarray.length == 0) &&!self.isCurrentWorkflowUser &&!self.isRelevantUser &&!self.isCurrentWorkflowRole()) {
            //没权限
            self.$parent.$router.push({
              name: "error",
              params: {
                errorCode: 402
              },
              path: "/systemmessage/:errorCode",
            });
          }
        }
        self.$store.state.app.enableEditMode = self.enableEditMode;
        //处理 如果没有开enableEditMode，那么不应该能切换到 edit
        let inedit = false;
        if (self.options && self.options.pageMode && self.options.pageMode.toLowerCase() === "edit") {
          inedit = true;
        } else if (self.$route.name.toLowerCase() == "edit") {
          inedit = true;
        }
        if (!self.enableEditMode && inedit) {
          self.$parent.$router.push({
            name: "error",
            params: {
              errorCode: 402
            },
            path: "/systemmessage/:errorCode",
          });
        }
        self.$store.state.app.showWorkflowButtons = self.showWorkflowButtons;
      }
    }
  }
};
