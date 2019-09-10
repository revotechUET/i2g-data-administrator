var moduleName = 'i2gDataApp';
var app = angular.module(moduleName, ['angularModalService', 'file-explorer']);

app.controller('mainCtrl', function($scope) {
	console.log('main ctrl');
	// $scope.storageDatabase = {
	// 	company: "I2G",
	// 	directory: "65554a26e839dfb6fc5bc9f392f15d90764cabe4",
	// 	name: "I2G-namnt",
	// }
	$scope.storageDatabase = {
		company: "I2G",
		directory: "3dbd0737b06bce192340608ff19b68109c23e22a",
		name: "I2G-thangnguyen",
	}
	
});