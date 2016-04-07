angular.module('cui-ng')
.directive('cuiDropdown', ['$compile','$timeout','$filter',function($compile,$timeout,$filter) {
	'use strict';

	return {
		restrict: 'E',
		scope: {
			ngModel:'=',
			options:'&',
			constraints: '&'
		},

		link: function(scope, elem, attrs) {
			var id=scope.$id;
			var self;
			var cuiDropdown = {
				initScope: function() {
					self = this;
					angular.forEach(self.watchers,function(initWatcher){
						initWatcher();
					});
					angular.forEach(self.scope,function(value,key){
						scope[key]=value;
					});
					self.helpers.setInitialInputValue();
				},
				config: {
					inputClass: attrs.class || 'cui-input',
					dropdownWrapperClass: attrs.dropdownClass || 'cui-dropdown',
					dropdownItemClass: attrs.dropdownItemClass || 'cui-dropdown__item', // TODO: CHANGE TO DROPDOWN
					attachment: attrs.attachment || 'top middle',
					targetAttachment: attrs.targetAttachment || 'bottom middle',
					offset: attrs.offset || '-10px 0',
					returnValue: attrs.returnValue || 'option',
					displayValue: attrs.displayValue || 'option'
				},
				selectors: {
					$cuiDropdown: angular.element(elem),
					$body: angular.element(document.body)
				},
				watchers:{
					dropdownClick:function(){
						scope.$on(id.toString(),self.helpers.reassignModel);
					},
					languageChange:function(){
						scope.$on('$translateChangeSuccess',self.helpers.handleLanguageChange)
					}
				},
				scope:{
					renderDropdown:function(){
						self.render.dropdown();
					},
					destroyDropdown:function(){
						self.selectors.$dropdown.detach();
					}
				},
				helpers: {
					getOptions:function(){
						return scope.options();
					},
					getKeyValue:function(keyString,object){
						var keys=keyString.split('.').slice(1);
						if(keys.length===0) return object;
						else {
							var returnValue;
							var i=0;
							do {
								returnValue? returnValue=returnValue[keys[i]] : returnValue=object[keys[i]];
								i++;
							}
							while (i<keys.length);
						}
						return returnValue;
					},
					getOptionDisplayValues:function(){
						var displayValues=[];
						if(self.config.displayValue.indexOf('{{')>-1){
							var string=self.config.displayValue.replace(/( |}|{)/g,'').split('|');
							var filter=string[1];
							self.config.displayValue=string[0];
						}
						scope.options().forEach(function(option){
							if(filter) displayValues.push($filter(filter)(self.helpers.getKeyValue(self.config.displayValue,option)));
							else displayValues.push(self.helpers.getKeyValue(self.config.displayValue,option));
						});
						return displayValues;
					},
					getOptionReturnValues:function(){
						var returnValues=[];
						scope.options().forEach(function(option){
							returnValues.push(self.helpers.getKeyValue(self.config.returnValue,option));
						});
						return returnValues;
					},
					getDropdownItem:function(index,displayValue){
						var ngClick=' ng-click="$root.$broadcast(\''+ id + '\',' + index + ')" ';
						return $compile(
							String.prototype.concat('<div class="', self.config.dropdownItemClass,'"',ngClick,'>',
								displayValue,
							'</div>')
						)(scope);
					},
					setInitialInputValue:function(){
						var displayValues=self.helpers.getOptionDisplayValues();
						var returnValues=self.helpers.getOptionReturnValues();
						if(!scope.ngModel) {
							scope.displayValue=displayValues[0];
							scope.ngModel=returnValues[0];
							return;
						}
						var index=_.findIndex(returnValues, function(value) {
							return angular.equals(value,scope.ngModel)
						});
						if(index>-1){
							scope.displayValue=displayValues[index];
						}
						else {
							scope.displayValue=displayValues[0];
							scope.ngModel=returnValues[0];
						}
					},
					reassignModel:function(e,index){
						var index=parseInt(index);
						var displayValues=self.helpers.getOptionDisplayValues();
						var returnValues=self.helpers.getOptionReturnValues();
						scope.displayValue=displayValues[index];
						scope.ngModel=returnValues[index];
						self.selectors.$dropdown.detach();
					},
					handleLanguageChange:function(){
						self.helpers.reassignModel();
					}
				},
				render: {
					input: function() {
						var element = $compile(
							String.prototype.concat(
								'<div class="', self.config.inputClass, '" ng-click="renderDropdown()" off-click="destroyDropdown()">',
									'{{displayValue}}',
								'</div>'
							)
						)(scope);
						self.selectors.$cuiDropdown.replaceWith(element);
						self.selectors.$cuiInput = element; // Caches selector
					},

					dropdown: function() {
						var dropdown = $compile(
							String.prototype.concat(
								'<div class="', self.config.dropdownWrapperClass, '">',
								'</div>'
							)
						)(scope);

						var displayValues=self.helpers.getOptionDisplayValues();
						displayValues.forEach(function(value,i){
							dropdown.append(self.helpers.getDropdownItem(i,value));
						});

						self.selectors.$body.append(dropdown);
						self.selectors.$dropdown=dropdown;

						new Tether({
							element:self.selectors.$dropdown[0],
							target:self.selectors.$cuiInput[0],
							attachment:self.config.attachment,
							targetAttachment:self.config.targetAttachment,
							constraints:scope.constraints() || []
						});
					}
				}
			};
			cuiDropdown.initScope();
			cuiDropdown.render.input();
		}
	};

}]);
