const moduleName = 'i2g-codb';
const componentName = "i2gCodb";
module.exports = {
    name: moduleName
};
var config = require('../config/config').development;
if (process.env.NODE_ENV === 'development') {
    config = require('../config/config').development
} else if (process.env.NODE_ENV === 'production') {
    config = require('../config/config').production
}
window.localStorage.setItem('AUTHENTICATION_SERVICE', config.authentication);
var app = angular.module(moduleName, ['file-explorer', 'wiApi', 'wiTreeViewVirtual', 'angularModalService', 'wiDroppable', 'wiDialog', 'angularResizable', 'ngDialog']);
console.log("set url")
app.run(['wiApi', function (wiApi) {
    wiApi.setBaseUrl(config.baseUrl);
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
i2gCodbController.$inject = ['$scope', 'wiApi', '$timeout', '$http', 'wiDialog', '$interval', 'ngDialog'];

function i2gCodbController($scope, wiApi, $timeout, $http, wiDialog, $interval, ngDialog) {
    let self = this;
    this.fileManager = config.fileManager;
    this.previewUrl = config.previewUrl;
    this.admin;
    this.user;
    this.currentUser = this.admin;
    this.fromUser = null;
    this.listProjectStorage = [];
    self.verifyStatus = 'all'
    self.currentFontSize = '12px';
    self.selectedFontSize = 12;
    self.autoChangeTheme = true;
    self.autoChangeThemeCheck = true;
    if (!window.localStorage.getItem('rememberAuth')) {
        wiDialog.authenticationDialog(function (userInfo) {
            onInit();
        }, {'whoami': 'data-administrator-service'})
    } else {
        onInit();
        TimeCtrl();
    }

    function TimeCtrl() {
        var tick = function () {
            self.clock = new Date();
            hours = new Date();
            if (self.autoChangeTheme) {
                if ((hours.getHours() > 5) && (hours.getHours() < 19)) {
                    $timeout(() => {
                        self.changeStyle('light');
                        self.activeTheme = 'light';
                    })
                } else {
                    $timeout(() => {
                        self.changeStyle('dark');
                        self.activeTheme = 'dark';
                    })
                }
            }
        }
        tick();
        $interval(tick, 1000);
    }


    function onInit() {
        postPromise(`${config.authentication}/user/list`, {token: window.localStorage.token}, 'WI_AUTHENTICATE')
            .then(data => {
                console.log(data);
                let admin = data.find(i => {
                    return window.localStorage.username === i.username;
                })
                if (admin) {
                    // postPromise(`${config.baseUrl}/project/list`, {username: admin.username}, 'WI_BACKEND')
                    //     .then(proj => {
                    //         $timeout(() => {
                    //             let project = proj[0];
                    //             let storage_databases = project.storage_databases[0];
                    //             self.storageDatabaseAdmin = {
                    //                 company: storage_databases.company,
                    //                 directory: storage_databases.input_directory,
                    //                 name: storage_databases.name,
                    //             }
                    //         })
                    //     })
                    self.username = admin.username;
                    postPromise(`${config.authentication}/company/info`, {idCompany: admin.idCompany}, 'WI_AUTHENTICATE')
                        .then(company => {
                            $timeout(() => {
                                console.log("====", company)
                                self.storageDatabaseAdmin = {
                                    company: company.name,
                                    directory: company.storage_location,
                                    whereami: "WI_STORAGE_ADMIN",
                                }
                            })
                        })
                }
                $timeout(() => {
                    self.listUser = data;
                })
            })
            .catch((err) => {
                if (err.status === 401) {
                    delete window.localStorage.rememberAuth;
                    wiDialog.authenticationDialog(function (userInfo) {
                        onInit();
                    }, {'whoami': 'data-administrator-service'})
                }
            });

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
    }

    this.getLabel = function (node) {
        return (node || {}).username || (node || {}).name || 'no name';
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
        return ((node || {}).username || (node || {}).name).includes(filter);
    }
    this.getChildrenDataset = function (node) {
        return [];
    }
    this.clickTreeVirtual = function (event, node, selectIds, rootnode) {
        console.log(node);
        if (node.projects) return;
        postPromise(`${config.baseUrl}/project/list`, {username: node.username}, 'WI_BACKEND')
            .then(data => {
                console.log('list project', data);
                $timeout(() => {
                    node.projects = data;
                })
            })
    }
    self.listProject = [];
    self.listUser = [];
    self.storage_databases = {}
    this.copyOrCut = function (action) {

        if (!self.currentUser.selectedList) return;
        self.fromUser = self.currentUser;
        console.log("=== copy ", self.fromUser.storageDatabase.directory);
        self.pasteList = self.currentUser.selectedList.map((l => {
            l.path = self.fromUser.storageDatabase.company + "/" + self.fromUser.storageDatabase.directory + l.path;
            return l;
        }));
        self.pasteList.action = action;
        // console.log(self.pasteList)

    }
    this.changeFontSize = function (size) {
        $("body").find("*").filter(function () {
            return ($(this).css("font-size") == self.currentFontSize);
        }).css("font-size", size);
        self.currentFontSize = size;
    }
    this.changeStyle = function (theme) {
        var element = document.getElementById("app");
        if (theme === 'light') {
            element.classList.remove("dark-theme");
            window.localStorage.setItem('currentTheme', 'light');
        } else if (theme === 'dark') {
            element.classList.add("dark-theme");
            window.localStorage.setItem('currentTheme', 'dark');
        }


    }
    this.pasting = false;
    this.paste = function () {
        // console.log('paste ', self.currentUser.storageDatabase.directory);
        if (self.pasteList && self.currentUser) {
            self.pasting = true;
            switch (self.pasteList.action) {
                case 'copy':
                    async.eachSeries(self.pasteList, (file, next) => {
                        try {
                            let from = `from=${encodeURIComponent(file.path)}&`;
                            let dest = `dest=${encodeURIComponent(self.currentUser.storageDatabase.company + '/' + self.currentUser.storageDatabase.directory + '/' + self.currentUser.currentPath.map(c => c.rootName).join('/'))}`;

                            self.fromUser.httpGet(`${self.currentUser.copyUrl + from + dest}&skipCheckingUrl=${encodeURIComponent(true)}`, res => {
                                console.log(res);
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
                                console.log(res);
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
        console.log(user);
        self.currentUser = user;
    }

    function postPromise(url, data, service) {
        return new Promise(function (resolve, reject) {
            $http({
                method: 'POST',
                url: url,
                data: data,
                headers: {
                    Authorization: window.localStorage.token,
                    Service: service
                }
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }

    this.addProjectStorage = function () {
        if (self.maxTab && self.listProjectStorage.length >= self.maxTab) return;
        self.listProjectStorage.push({
            container: null,
            dropFn: null,
            storageDatabase: null,
            label: 'New Tab'
        });
        self.currentTab = self.listProjectStorage.length - 1;
    }
    this.removeProjectStorage = function (index) {
        // $timeout(() => {
        if (self.listProjectStorage.length === 0) return;
        self.listProjectStorage.splice(index, 1);
        self.currentTab = -1;
        // self.currentTab = 0;
        // })
    }
    // this.currentTab = 0;
    this.currentTab = -1;
    this.setCurrentTab = function (index) {
        self.currentTab = index;
    }
    this.getFnDrop = function (index) {
        if (!self.listProjectStorage[index].fnDrop) {
            self.listProjectStorage[index].fnDrop = function (event, helper, data) {
                if (!data || !data.length) return;
                $timeout(() => {
                    let project = data[0];
                    let storage_databases = project.storage_databases[0];
                    self.listProjectStorage[index].label = project.name;
                    self.listProjectStorage[index].storageDatabase = {
                        company: storage_databases.company,
                        directory: storage_databases.input_directory,
                        name: storage_databases.name,
                    }
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
        delete localStorage.token;
        wiDialog.authenticationDialog(function (userInfo) {
            onInit();
        }, {'whoami': 'data-administrator-service'})
    }

    function getFilesInQueue() {
        return new Promise((resolve => {
            self.adminProjectStorage.httpPost(`${config.fileManager}/submit/get-files-in-queue`, {}, function (resp) {
                self.verifyList = resp.data;
                resolve();
            })
        }))
    }

    this.verify = async function () {
        await getFilesInQueue();
        let dialog = ngDialog.open({
            template: 'templateVerify',
            className: 'ngdialog-theme-default',
            scope: $scope,
        });
    };
    this.deleteVerify = function (file, index) {
        self.adminProjectStorage.httpPost(`${config.fileManager}/submit/delete-file-in-queue`, {files: [file]}, function (resp) {
            getFilesInQueue();
            // self.verifyList.splice(index, 1);
        });
    };
    this.syncVerify = function (file, index) {
        self.adminProjectStorage.httpPost(`${config.fileManager}/submit/sync-file-in-queue`, {files: [file]}, function (resp) {
            getFilesInQueue();
            // self.verifyList.splice(index, 1);
        });
    }
}