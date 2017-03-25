angular.module('superApp', [])
  .controller('SuperListController', function($http, $timeout) {
    var superList = this;

    // remote list update
    superList.create = function() {
      superList.saveDisabled = true;
      $http.post('http://localhost:8000/list',
                 {
                   "title": superList.title,
                   "brief": superList.brief,
                 }
      ).then(function(response) {
        superList.magic = response.data.magic;
        superList.id = response.data.id;
        superList.showMagicLinks = true;
        superList.showSuccess = true; 
      }, function() {
        superList.showError = true;
        superList.saveDisabled = false;
        $timeout(() => superList.showError = false, 3000);
      });
    }

 });  // end controller

