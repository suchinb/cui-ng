const goToState = ($state,$rootScope,stateName,toState,toParams,fromState,fromParams,$timeout,notify) => {
  $timeout(()=>{
    $state.go(stateName,toParams,{ notify }).then(()=>{
      $rootScope.$broadcast('$stateChangeSuccess',toState,toParams,fromState,fromParams);
    });
  });
};


angular.module('cui.authorization',[])
.factory('cui.authorization.routing', ['cui.authorization.authorize', '$timeout','$rootScope','$state',(authorize,$timeout,$rootScope,$state) => {
  const routing = (toState, toParams, fromState, fromParams, userEntitlements,loginRequiredState='loginRequired',nonAuthState='notAuthorized') => {
    let authorized;
    if (toState.access !== undefined) {
      authorized = authorize.authorize(toState.access.loginRequired, toState.access.requiredEntitlements, toState.access.entitlementType, userEntitlements);

      let stateName,notify;

      switch (authorized){
        case 'login required':
          stateName = loginRequiredState;
        case 'not authorized':
          stateName = nonAuthState;
        default :
          notify = true;
        case 'authorized':
          stateName = toState.name;
          notify = false;
          break;
      };

      goToState($state,$rootScope,stateName,toState,toParams,fromState,fromParams,$timeout,notify);
    }
    else {
      goToState($state,$rootScope,toState.name,toState,toParams,fromState,fromParams,$timeout,false);
    }
  };

  return routing;
}])
.factory('cui.authorization.authorize', [() => {
  const authorize = (loginRequired, requiredEntitlements, entitlementType='atLeastOne', userEntitlements) => {
    let loweredPermissions = [],
        hasPermission = true,
        result='not authorized';

    if (loginRequired === true && userEntitlements === undefined) {
        result = 'login required';
    }
    else if ((loginRequired === true && userEntitlements !== undefined) && (requiredEntitlements === undefined || requiredEntitlements.length === 0)) {
    // Login is required but no specific permissions are specified.
        result = 'authorized';
    }
    else if (requiredEntitlements) {
        angular.forEach(userEntitlements, (permission) => {
            loweredPermissions.push(permission.toLowerCase());
        });
        for (let i = 0; i < requiredEntitlements.length; i++) {
            const permission = requiredEntitlements[i].toLowerCase();

            if (entitlementType === 'all') {
                hasPermission = hasPermission && loweredPermissions.indexOf(permission) > -1;
                // i1f all the permissions are required and hasPermission is false there is no point carrying on
                if (hasPermission === false) break;
            }
            else if (entitlementType === 'atLeastOne') {
                hasPermission = loweredPermissions.indexOf(permission) > -1;
                // if we only need one of the permissions and we have it there is no point carrying on
                if (hasPermission) break;
            }
        }
        result = hasPermission ? 'authorized' : 'not authorized';
    }
    return result;
  };

    return { authorize }
}])
.directive('cuiAccess',['cui.authorization.authorize',(authorize)=>{
    return{
        restrict:'A',
        scope: {
            userEntitlements:'=',
            cuiAccess:'='
        },
        link: (scope,elem,attrs) => {
            const requiredEntitlements = scope.cuiAccess.requiredEntitlements || [];
            const entitlementType = scope.cuiAccess.entitlementType || 'atLeastOne';

            const initalDisplay = elem.css('display');

            scope.$watch('userEntitlements',() => {
                const authorized=authorize.authorize(true, requiredEntitlements, entitlementType, scope.userEntitlements);
                if(authorized!=='authorized') elem.css('display','none');
                else elem.css('display',initalDisplay);
            });
        }
    };
}]);