var moduleName = 'i2gDataApp';
var app = angular.module(moduleName, ['file-explorer', 'wiApi', 'wiTreeViewVirtual']);

app.controller('mainCtrl', function($scope, wiApi, $timeout, $http) {
	console.log('main ctrl');
	// $scope.storageDatabase = {
	// 	company: "I2G",
	// 	directory: "65554a26e839dfb6fc5bc9f392f15d90764cabe4",
	// 	name: "I2G-namnt",
	// }
	function postPromise(url, data, token = null) {
        return new Promise(function(resolve, reject) {
            $http({
                method: 'POST',
                url: url,
                data: data,
                headers: {
                    Authorization: token || window.localStorage.token 
                }
            }).then((response) => {
                if (response.data.code === 200) resolve(response.data.content);
                else reject(new Error(response.data.reason));
            }, (err) => {
                reject(err);
            })
        });
    }
	let self = this;
	$scope.storageDatabase = {
		company: "I2G",
		directory: "3dbd0737b06bce192340608ff19b68109c23e22a",
		name: "I2G-thangnguyen",
	}
	this.getLabel = function(node) {
		return (node || {}).username || (node || {}).name || 'no name';
	}
	this.getIcon = function (node) {
    	if(!node) return;
        if(node.idCurve) {
    		return "curve-16x16";
    	} else if(node.idDataset){
    		return "curve-data-16x16";
    	} else if(node.idWell) {
	        return "well-16x16";
 		} else if(node.idProject) {
            return "project-normal-16x16";
        } else return 'ti ti-user';
    }
    this.getChildren = function (node) {
    	if (!node) return [];
        if(node.idDataset){
            return node.curves || [];           
        }else if (node.idWell) {
            return node.datasets || [];
        }else if(node.idProject) {
            return node.wells || [];
        }else if(node.username) {
        	return node.projects;
        }
        return [];
    }
    this.runMatch = function(node, filter) {
        return node.name.includes(filter);
    }
    this.getChildrenDataset = function(node) {
        return [];
    }
    this.clickFn = function(event,node,selectIds,rootnode) {
    	console.log(node);
    	if(node.projects) return;

    	postPromise('http://dev.i2g.cloud/project/list-of-all-user', {users: [node.username]}, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhvYW5nIiwicm9sZSI6MCwiY29tcGFueSI6IkkyRyIsImlhdCI6MTU2ODEwNzczNSwiZXhwIjoxNTY4MjgwNTM1fQ._61hsPqDL7U3xE2H_TTVWgR1_IE1YhVKnCyMVja4S-s')
    	.then(data => {
    		console.log('list project', data);
    		$timeout(() => {
    			node.projects = data;
    		})
    	})
    }
    self.listProject = [];
    self.listUser = [];
    this.$onInit = function() {
        postPromise('http://admin.dev.i2g.cloud/user/list', {}, 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImhvYW5nIiwicm9sZSI6MCwiY29tcGFueSI6IkkyRyIsImlhdCI6MTU2ODEwNzczNSwiZXhwIjoxNTY4MjgwNTM1fQ._61hsPqDL7U3xE2H_TTVWgR1_IE1YhVKnCyMVja4S-s')
        .then(data => {
        	console.log(data);
        	$timeout(() => {
        		self.listUser = data;
        	})
        })
    }
});