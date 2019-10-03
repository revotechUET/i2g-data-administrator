var moduleName = 'i2gDataApp';
var app = angular.module(moduleName, ['file-explorer', 'wiApi', 'wiTreeViewVirtual', 'angularModalService', 'wiDroppable', 'wiDialog']);

app.controller('mainCtrl', function($scope, wiApi, $timeout, $http, wiDialog) {
    // console.log('main ctrl');
    let self = this;
    this.admin;
    this.user;
    this.currentUser = this.admin;
    this.fromUser = null;
    this.listProjectStorage = [{user: null}];
    this.$onInit = function() {
        wiDialog.authenticationDialog(function(userInfo) {
            console.log(userInfo);
            postPromise('http://admin.dev.i2g.cloud/user/list', { token: window.localStorage.token })
                .then(data => {
                    console.log(data);
                    let admin = data.find(i => {
                        return userInfo.username === i.username;
                    })
                    if (admin) {
                        postPromise('http://dev.i2g.cloud/project/list', { username: admin.username })
                            .then(proj => {
                                $timeout(() => {
                                    let project = proj[0];
                                    let storage_databases = project.storage_databases[0];
                                    self.storageDatabaseAdmin = {
                                        company: storage_databases.company,
                                        directory: storage_databases.input_directory,
                                        name: storage_databases.name,
                                    }
                                })
                            })
                    }
                    $timeout(() => {
                        self.listUser = data;
                    })
                })
        })
    }
    this.getLabel = function(node) {
        return (node || {}).username || (node || {}).name || 'no name';
    }
    this.getIcon = function(node) {
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
    this.getChildren = function(node) {
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
    this.runMatch = function(node, filter) {
        return node.username.includes(filter);
    }
    this.getChildrenDataset = function(node) {
        return [];
    }
    this.clickFn = function(event, node, selectIds, rootnode) {
        console.log(node);
        if (node.projects) return;
        postPromise('http://dev.i2g.cloud/project/list', { username: node.username })
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
    this.onDrop = function(event, helper, data) {
        $timeout(() => {
            let project = data[0];
            let storage_databases = project.storage_databases[0];
            self.storageDatabaseWiDrop = {
                company: storage_databases.company,
                directory: storage_databases.input_directory,
                name: storage_databases.name,
            }
        })
    }
    this.copyOrCut = function(action) {

        if (!self.currentUser.selectedList) return;
        self.fromUser = self.currentUser;
        self.pasteList = self.currentUser.selectedList;
        self.pasteList.action = action;

    }
    this.paste = function() {
        // console.log('paste');
        if (self.pasteList) {
            switch (self.pasteList.action) {
                case 'copy':
                    async.eachSeries(self.pasteList, (file, next) => {
                        let from = `from=${encodeURIComponent(file.path)}&`;
                        let dest = `dest=${encodeURIComponent('/' + self.currentUser.storageDatabase.company + '/' + self.currentUser.storageDatabase.directory + '/' + self.currentUser.currentPath.map(c => c.rootName).join('/'))}`;

                        self.fromUser.httpGet(`${self.currentUser.copyUrl + from + dest}&skipCheckingUrl=${encodeURIComponent(true)}`, res => {
                            console.log(res);
                            next();
                        })
                    }, err => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('===done');
                        }
                        self.currentUser.goTo(self.currentUser.currentPath.length - 1);    
                        self.fromUser.goTo(self.fromUser.currentPath.length - 1);    
                    });
                    break;
                case 'cut':
                    async.eachSeries(self.pasteList, (file, next) => {
                        let from = `from=${encodeURIComponent(file.path)}&`;
                        let dest = `dest=${encodeURIComponent('/' + self.currentUser.storageDatabase.company + '/' + self.currentUser.storageDatabase.directory + '/' + self.currentUser.currentPath.map(c => c.rootName).join('/'))}`;

                        self.fromUser.httpGet(`${self.currentUser.moveUrl + from + dest}&skipCheckingUrl=${encodeURIComponent(true)}`, res => {
                            console.log(res);
                            next();
                        })
                    }, err => {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log('===done');
                        }
                        self.currentUser.goTo(self.currentUser.currentPath.length - 1);    
                        self.fromUser.goTo(self.fromUser.currentPath.length - 1);    
                    });
                    break;
            }
        }
    }
    this.setContainerAdmin = function(admin) {
        self.admin = admin;
    }
    this.setContainerUser = function(user) {
        self.user = user;
    }
    this.onClickFileExplorer = function(user) {
        console.log(user);
        self.currentUser = user;
    }
    this.getContainerAdmin = function() {
        return self.admin;
    }
    this.getContainerUser = function(index = 0) {
        return self.user;
    }
    function postPromise(url, data) {
        return new Promise(function(resolve, reject) {
            $http({
                method: 'POST',
                url: url,
                data: data,
                headers: {
                    Authorization: window.localStorage.token
                }
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }
    this.addProjectStorage = function() {
        self.listProjectStorage.push({user: null});
    }
    this.removeProjectStorage = function() {
        self.listProjectStorage.push({user: null});
    }
});