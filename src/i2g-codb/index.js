import { WiTree, WiDroppable, wiLoginClient } from '@revotechuet/misc-component-vue';
import { Vue, wiid as genWiid } from '@revotechuet/misc-component-vue';
// import 'wi-css'
const wiLogin = new wiLoginClient('WI_PROJECT_STORAGE_CLIENT')
const moduleName = 'i2g-codb';
const componentName = "i2gCodb";
export default {
  name: moduleName
};
console.log(process.env.NODE_ENV);
var config = require('../config/config').development;
if (process.env.NODE_ENV === 'development') {
  config = require('../config/config').development
  Object.assign(window.localStorage, config);
} else if (process.env.NODE_ENV === 'production') {
  config = require('../config/config').production;
  Object.assign(window.localStorage, config);
}
var app = angular.module(moduleName, [
  'file-explorer',
  'wiApi',
  'wiTreeViewVirtual',
  'angularModalService',
  'wiDroppable',
  'wiDialog',
  'angularResizable',
  'ngDialog',
  'virtualUl',
  'wiTableView',
  'wiAutocomplete',
  'wiDeviceRequirement',
  'ngVue',
]);
app.run(['wiApi', function (wiApi) {
  wiApi.client('WI_PROJECT_STORAGE_CLIENT').setBaseUrl(window.localStorage.getItem("BASE_URL"));
}]);
app.component(componentName, {
  template: require('./template.html'),
  controller: i2gCodbController,
  style: require('./style.less'),
  controllerAs: 'self',
  bindings: {
    maxTab: '<'
  }
});
i2gCodbController.$inject = ['$rootScope', '$scope', 'wiApi', '$timeout', '$http', 'wiDialog', '$interval', 'ngDialog'];

function i2gCodbController($rootScope, $scope, wiApi, $timeout, $http, wiDialog, $interval, ngDialog) {
  Object.assign($scope, {
    WiTree,
    WiDroppable,
  });
  window.ctrl = this;
  let self = this;
  self.$scope = $scope
  this.fileManager = window.localStorage.getItem("FILE_MANAGER");
  this.previewUrl = window.localStorage.getItem("PREVIEW_URL");
  this.user = null;
  this.currentUser = null;
  this.fromUser = null;
  this.listProjectStorage = [];
  self.verifyStatus = 'unsynced'
  self.unsyncedCount = 0;
  self.currentFontSize = '12px';
  self.selectedFontSize = 12;
  self.autoChangeTheme = true;
  self.storageInfo = {};
  wiLogin.doLogin({ redirectUrl: window.location.origin, whoami: "i2g-data-administrator", loginPage: window.localStorage.getItem("AUTHENTICATION_HOME") });
  setTimeout(() => {
    onInit();
    TimeCtrl();
  }, 1000);
  updateSetting();

  // }

  function TimeCtrl() {
    const hours = new Date().getHours();
    if (self.autoChangeTheme) {
      if ((hours > 5) && (hours < 18)) {
        changeStyle('light');
      } else {
        changeStyle('dark');
      }
    }
  }
  setInterval(TimeCtrl, 60 * 1000);
  async function updateVersion() {
    let oldVersion = localStorage.getItem('VER') || localStorage.getItem('VERSION')
    let newVersion = await new Promise((resolve) => {
      $http({
        method: 'GET',
        url: window.location + 'i2g.version',
        cache: false
      })
        .then(res => {
          res ? resolve(res.data) : resolve(null)
        })
        .catch(err => {
          resolve(null)
        })
    })
    if (!newVersion) return
    if (newVersion != oldVersion) {
      await new Promise((resolve) => {
        let dialog = ngDialog.open({
          template: 'templateVersion',
          className: 'ngdialog-theme-default',
          showClose: false,
          scope: $scope,
          closeByEscape: false,
          closeByDocument: false
        })
        self.acceptRefresh = function () {
          localStorage.setItem('VER', newVersion)
          location.reload(true)
          // resolve()
        }
        self.cancelRefresh = function () {
          dialog.close()
          resolve()
        }
      })

    }
  }
  async function onInit() {
    await updateVersion()
    self.getListUser();
    let interval;
    function getUnsynced() {
      if (!window.localStorage.token) {
        clearInterval(interval);
        return;
      }
      self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/get-status`, null, function (res) {
        if (!res.data.error) {
          self.unsyncedCount = res.data.unsynced;
        }
      }, { silent: true });
      self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/on-premise-storage-info`, null, function (res) {
        if (!res.data.error) {
          self.storageInfo = res.data
        }
      }, { silent: true });
    }
    setTimeout(() => {
      getUnsynced();
      interval = setInterval(getUnsynced, 10000);
    }, 1000);

    if (!window.localStorage.getItem('currentTheme')) {
      window.localStorage.setItem('currentTheme', 'light');
    } else if (window.localStorage.getItem('currentTheme') === 'dark') {
      var element = document.getElementById("app");
      element.classList.add("dark-theme");
      self.activeTheme = 'dark';
    } else if (window.localStorage.getItem('currentTheme') === 'light') {
      self.activeTheme = 'light';
    }
    // self.listProjectStorage.push({
    //     container: null,
    //     dropFn: null,
    //     storageDatabase: null,
    //     label: 'hung'
    // });
    self.verifyTableColHeaders = ['User', 'Project', 'Data', 'Date', 'Status', 'Metadata', 'Select', 'Destination'];
  }

  this.updateSetting = updateSetting;
  function updateSetting(newSetting) {
    self.setting = JSON.parse(window.localStorage.getItem('setting')) || {
      autoChangeTheme: true,
      activeTheme: 'light',
    };
    Object.assign(self.setting, newSetting);
    window.localStorage.setItem('setting', JSON.stringify(self.setting));
    self.autoChangeTheme = self.setting.autoChangeTheme;
    self.activeTheme = self.setting.activeTheme;
    if (self.autoChangeTheme) {
      TimeCtrl();
    } else {
      changeStyle(self.activeTheme);
    }
  }

  this.clickSelectedAllVerify = function () {
    self.verifyList.forEach(item => {
      item.selected = self.selectedAllVerify;
    })
  }
  this.verifyTableValue = ([row, col]) => {
    try {
      switch (self.verifyTableColHeaders[col]) {
        case 'User':
          return self.verifyList[row].username || 'N/A';
        case 'Project':
          return self.verifyList[row].project || 'N/A';
        case 'Data':
          return self.verifyList[row].name.slice(self.verifyList[row].name.indexOf('/')) || 'N/A';
        case 'Date':
          return moment(Number(self.verifyList[row].time)).format('YYYY/MM/DD hh:mm:ss') || 'N/A';
        case 'Status':
          let status = self.verifyList[row].status;
          return status[0].toUpperCase() + status.slice(1) || 'N/A';
        case 'Metadata':
          return {
            type: 'button',
            icon: 'ti ti-view-list-alt',
            text: 'View Metadata',
            onClick: async function (row, col) {
              const item = self.verifyList[row];
              console.log(item);
              const res = await new Promise((resolve => self.adminProjectStorage.httpGet(`${self.adminProjectStorage.getMetadataUrl}?rawPath=true&file_path=${item.path}`, resolve)));
              const metadata = res.data.Metadata;
              metadata && self.adminProjectStorage.previewMetadata(res.data.Metadata, item.name)
            }
          };
        case 'Select':
          return { type: 'checkbox' };
        case 'Destination':
          const desDir = self.verifyList[row].desDir;
          return {
            type: 'custom',
            value: desDir || 'Default',
            style: { color: desDir ? 'green' : null }
          }
        default:
          return "this default";
      }
    } catch {
      return 'N/A';
    }
  }
  let _verifyTableRowHeaders = [];
  this.getVerifyTableRowHeaders = () => {
    _verifyTableRowHeaders.length = 0;
    Object.assign(_verifyTableRowHeaders, Array(self.verifyList.length).fill()
      .map((_, idx) => idx + 1));
    return _verifyTableRowHeaders;
  }
  this.getListUser = function () {
    self.requesting = true;
    postPromise(`${window.localStorage.getItem("AUTHENTICATION_SERVICE")}/user/list`, { token: window.localStorage.token }, 'WI_AUTHENTICATE')
      .then(data => {
        const username = window.localStorage.username;
        const user = data.find(u => u.username === username)
        if (user) {
          self.user = user;
          self.username = user.username;
          postPromise(`${window.localStorage.getItem("AUTHENTICATION_SERVICE")}/company/info`, { idCompany: user.idCompany }, 'WI_AUTHENTICATE')
            .then(company => {
              $timeout(() => {
                $rootScope.taxonomies = company.taxonomies || {};
                self.storageDatabaseAdmin = {
                  company: company.name,
                  directory: company.storage_location,
                  whereami: "WI_STORAGE_ADMIN",
                }
              })
            })
        }
        $timeout(() => {
          if (self.onlyMe()) {
            self.listUser = [user];
            return;
          }
          self.listUser = data;
        })
      })
      .catch((err) => {
        if (err.status === 401) wiLogin.doLogin({ redirectUrl: window.location.origin });
        console.error(err);
      })
      .finally(() => {
        self.requesting = false;
      })
  }
  this.onlyMe = function () {
    // List this user only
    if (!self.user) return true;
    return self.user.role > 3
  }
  this.isViewOnly = function () {
    // View and download role
    if (!self.user) return true;
    return [3.1, 3.3].includes(self.user.role)
  }

  this.getLabel = function (node) {
    return (node || {}).username || (node || {}).alias || (node || {}).name || 'no name';
  }
  this.getIcon = function (node) {
    if (!node) return;
    if (node.idCurve) {
      return "curve-16x16";
    } else if (node.idDataset) {
      return "curve-data-16x16";
    } else if (node.idWell) {
      return "well-16x16";
    } else if (node.idProject) {
      return "project-normal-16x16";
    } else return 'ti ti-user';
  }
  this.getChildren = function (node) {
    if (!node) return [];
    if (node.idDataset) {
      return node.curves || [];
    } else if (node.idWell) {
      return node.datasets || [];
    } else if (node.idProject) {
      return node.wells || [];
    } else if (node.username) {
      return node.projects;
    }
    return [];
  }
  this.runMatch = function (node, filter) {
    return ((node || {}).username || (node || {}).alias || (node || {}).name).toLowerCase().includes(filter.toLowerCase(0));
  }
  this.getChildrenDataset = function (node) {
    return [];
  }
  this.clickTreeVirtual = function (event, node, selectIds, rootnode) {
    console.log(node);
    if (node.projects || !node.username) return;
    postPromise(`${window.localStorage.getItem("BASE_URL")}/project/list`, { username: node.username }, 'WI_BACKEND')
      .then(data => {
        console.log('list project', data);
        Vue.set(node, 'projects', data);
      })
  }
  self.listProject = [];
  self.listUser = [];
  self.storage_databases = {}
  this.copyOrCut = async function (action) {
    if (!self.currentUser.selectedList) return;
    if (self.isViewOnly() && self.currentUser.storageDatabase !== self.storageDatabaseAdmin) {
      toastr.error('No permission')
      return;
    }
    // const res = await new Promise(resolve => self.currentUser.httpGet(self.currentUser.checkPermissionUrl + 'update', resolve));
    // if (res.data.error) return;
    self.fromUser = self.currentUser;
    self.pasteList = self.currentUser.selectedList.map((l => ({
      ...l,
      path: self.fromUser.storageDatabase.company + "/" + self.fromUser.storageDatabase.directory + l.path,
    })));
    self.pasteList.action = action;
    self.pasteList.user = self.currentUser;
    // console.log(self.pasteList)

  }
  this.changeFontSize = function (size) {
    $("body").find("*").filter(function () {
      return ($(this).css("font-size") == self.currentFontSize);
    }).css("font-size", size);
    self.currentFontSize = size;
  }
  function changeStyle(theme) {
    var element = document.getElementById("app");
    if (theme === 'light') {
      element.classList.remove("dark-theme");
      window.localStorage.setItem('currentTheme', 'light');
    } else if (theme === 'dark') {
      element.classList.add("dark-theme");
      window.localStorage.setItem('currentTheme', 'dark');
    }
  }
  this.changeStyle = changeStyle;
  this.pasting = false;
  this.paste = function () {
    if (self.isViewOnly() && self.currentUser.storageDatabase === self.storageDatabaseAdmin) {
      toastr.error('No permission')
      return;
    }
    // console.log('paste ', self.currentUser.storageDatabase.directory);
    if (self.pasteList && self.currentUser) {
      self.pasting = true;
      switch (self.pasteList.action) {
        case 'copy':
          async.eachSeries(self.pasteList, (file, next) => {
            try {
              const url = new URL(self.currentUser.copyUrl)
              url.searchParams.set('from', file.path)
              url.searchParams.set('dest', self.currentUser.storageDatabase.company + '/' + self.currentUser.storageDatabase.directory + '/' + self.currentUser.currentPath.map(c => c.rootName).join('/'))
              url.searchParams.set('skipCheckingUrl', true)
              if (self.isViewOnly() && self.currentUser.storageDatabase.name.endsWith(self.user.username)) {
                url.searchParams.set('skipPerm', true)
              }
              self.fromUser.httpGet(url.toString(), res => {
                if (!res.data.error && res.data.status === 'IN_PROGRESS') {
                  self.currentUser.addProcessing(res.data);
                }
                next();
              })
            } catch (e) {
              console.log(e);
              self.pasting = false;
            }
          }, err => {
            if (err) {
              console.log(err);
              self.pasting = false;
            } else {
              console.log('===done');
            }
            self.currentUser.goTo(self.currentUser.currentPath.length - 1);
            self.fromUser.goTo(self.fromUser.currentPath.length - 1);
            self.pasting = false;
          });
          break;
        case 'cut':
          async.eachSeries(self.pasteList, (file, next) => {
            try {
              let from = `from=${encodeURIComponent(file.path)}&`;
              let dest = `dest=${encodeURIComponent(self.currentUser.storageDatabase.company + '/' + self.currentUser.storageDatabase.directory + '/' + self.currentUser.currentPath.map(c => c.rootName).join('/'))}`;

              self.fromUser.httpGet(`${self.currentUser.moveUrl + from + dest}&skipCheckingUrl=${encodeURIComponent(true)}`, res => {
                if (!res.data.error && res.data.status === 'IN_PROGRESS') {
                  self.currentUser.addProcessing(res.data);
                }
                next();
              })
            } catch (e) {
              console.log(e);
              self.pasting = false;
            }
          }, err => {
            if (err) {
              console.log(err);
              self.pasting = false;
            } else {
              console.log('===done');
            }
            self.currentUser.goTo(self.currentUser.currentPath.length - 1);
            self.fromUser.goTo(self.fromUser.currentPath.length - 1);
            self.pasting = false;
          });
          break;
      }
    }
  }
  this.setContainerAdmin = function (admin) {
    self.adminProjectStorage = admin;
  }
  this.onClickFileExplorer = function (user) {
    self.currentUser = user;
  }

  function postPromise(url, data, service) {
    return new Promise(function (resolve, reject) {
      const wiid = genWiid(data, window.localStorage.token);
      $http({
        method: 'POST',
        url: url,
        data: data,
        headers: {
          Authorization: window.localStorage.token,
          Service: service
        },
        params: { wiid },
      }).then((response) => {
        if (response.data.code === 200) resolve(response.data.content);
        else {
          toastr.error(err.message);
          if (response.data.code === 401) self.logout();
          reject(new Error(response.data.reason));
        }
      }, (err) => {
        // reject(err);
        toastr.error(err.message || err.data.message)
        if (err.data.code === 401) self.logout();
      })
    });
  }

  this.addProjectStorage = function () {
    if (self.maxTab && self.listProjectStorage.length >= self.maxTab) return;
    self.listProjectStorage.push({
      container: null,
      dropFn: null,
      storageDatabase: null,
      label: 'New Tab',
      isNewTab: true,
      createdBy: 'User'
    });
    self.currentTab = self.listProjectStorage.length - 1;
    setTimeout(() => {
      self.onClickFileExplorer(self.listProjectStorage[self.currentTab].container);
    });
  }
  this.removeProjectStorage = function (index) {
    // $timeout(() => {
    if (self.listProjectStorage.length === 0) return;
    self.listProjectStorage.splice(index, 1);
    self.currentTab = -1;
    self.currentUser = self.adminProjectStorage;
    // self.currentTab = 0;
    // })
  }
  // this.currentTab = 0;
  this.currentTab = -1;
  this.setCurrentTab = function (index) {
    self.currentTab = index;
  }
  this.getDraggable = function (node) {
    if (node.storage_databases) return true;
    return false;
  }
  this.getFnDrop = function (index) {
    if (!self.listProjectStorage[index].fnDrop) {
      self.listProjectStorage[index].fnDrop = function (event, data) {
        if (!data || !data.length) return;
        const project = data[0];
        if (!project.storage_databases) return;
        $timeout(() => {
          let storage_databases = project.storage_databases[0];
          self.listProjectStorage[index].label = project.alias || project.name;
          self.listProjectStorage[index].createdBy = project.createdBy;
          // console.log(project)
          self.listProjectStorage[index].storageDatabase = {
            company: storage_databases.company,
            directory: storage_databases.input_directory,
            name: storage_databases.name,
            whereami: "WI_STORAGE_ADMIN",
          }
          self.listProjectStorage[index].isNewTab = false;
        })
      }
    }
    return self.listProjectStorage[index].fnDrop;
  }
  this.getStorageDatabase = function (index) {
    return self.listProjectStorage[index].storageDatabase;
  }
  this.setContainerProjectStorage = function (index) {
    if (!self.listProjectStorage[index].setContainer) {
      self.listProjectStorage[index].setContainer = function (container) {
        self.listProjectStorage[index].container = container;
      }
    }
    return self.listProjectStorage[index].setContainer;
    // self.listProjectStorage[index].container =
  }
  this.logout = function () {
    wiLogin.logout({ redirectUrl: window.location.origin, whoami: 'i2g-data-administrator', loginPage: window.localStorage.getItem("AUTHENTICATION_HOME") });
    delete localStorage.token;
    delete self.storageDatabaseAdmin;
    delete self.pasteList;
    self.currentTab = -1;
    self.listProjectStorage = [];
    // wiDialog.authenticationDialog(function (userInfo) {
    //   onInit();
    // }, { 'whoami': 'data-administrator-service' })
  }

  this.getFilesInQueue = function (type = 'all') {
    return new Promise((resolve => {
      self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/get-files-in-queue`, { type: type }, function (resp) {
        self.verifyList = resp.data.sort((a, b) => b.time.localeCompare(a.time));
        self.verifyStatus = type;
        self.selectedAllVerify = false;
        resolve();
      })
    }))
  };

  this.verify = async function () {
    await self.getFilesInQueue(self.verifyStatus);
    let dialog = ngDialog.open({
      template: 'templateVerify',
      className: 'ngdialog-theme-default',
      scope: $scope,
      width: '900px',
    });
  };
  this.rejectSelectedVerifies = async function () {
    const promises = [];
    self.verifyList.forEach((file, idx) => {
      if (file.selected) {
        promises.push(new Promise(res => {
          self.rejectVerify(file, res);
        }))
      }
    });
    await Promise.all(promises);
    self.getFilesInQueue(self.verifyStatus);
  }
  this.rejectVerify = function (file, cb) {
    self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/reject-file-in-queue`, { files: [file] }, cb);
  };
  this.deleteSelectedVerifies = async function () {
    const yes = await new Promise(res => wiDialog.confirmDialog("Delete Confirmation", "Are you sure you want to delete the selected item(s)?", res));
    if (!yes) return;
    const promises = [];
    self.verifyList.forEach((file, idx) => {
      if (file.selected) {
        promises.push(new Promise(res => {
          self.deleteVerify(file, res);
        }))
      }
    });
    await Promise.all(promises);
    self.getFilesInQueue(self.verifyStatus);
  }
  this.deleteVerify = function (file, cb) {
    self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/delete-file-in-queue`, { files: [file] }, cb);
  };
  this.syncSelectedVerifies = async function () {
    const selecteds = self.verifyList.filter(f => f.selected);
    if (!selecteds.length) return;
    const noDes = selecteds.filter(f => !f.desDir);
    if (noDes.length) {
      const yes = await new Promise(res => wiDialog.confirmDialog("Confirmation",
        `<b style="font-style:normal">The following items did not match at any rules, sync to default directory?</b><br>${noDes.map(f => f.name).join('<br>')}`,
        res));
      if (!yes) return;
    }
    await new Promise(res => {
      self.syncVerify(selecteds, res);
    });
    self.getFilesInQueue(self.verifyStatus);
  }
  this.syncVerify = function (files, cb) {
    self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/sync-file-in-queue`, { files }, cb);
  };
  this.syncVerifyAll = async function () {
    self.verifyList.forEach(f => {
      f.selectedBak = f.selected
      f.selected = true
    });
    self.syncSelectedVerifies();
    self.verifyList.forEach(f => {
      f.selected = f.selectedBak
      delete f.selectedBak
    });
  };
  this.rejectVerifyAll = function () {
    self.adminProjectStorage.httpPost(`${window.localStorage.getItem("FILE_MANAGER")}/submit/reject-file-in-queue`, { files: self.verifyList }, function (resp) {
      self.getFilesInQueue(self.verifyStatus);
    });
  };
}
toastr.options.preventDuplicates = true;
