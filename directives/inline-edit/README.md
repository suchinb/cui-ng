# Inline-Edit

Create an inline edit component for any variable.

## Usage

```html
<inline-edit label="cui-org" model="app.organization.name"></inline-edit>
```

This will compile to

{% raw %}
```html
    <p class="cui-expandable__review-item">
        {{"cui-org"| translate}}: <span ng-if="!edit">{{app.organization.name}}</span>
        <input type="text" ng-model="$parent.editInput" class="cui-expandable__review-input" ng-init="matchModels()" ng-if="edit"/>
        <span class="cui-expandable__review-button" ng-click="toggleEdit()" ng-if="!edit"> Edit</span>
        <span class="cui-expandable__review-button" ng-if="edit" ng-click="saveInput();toggleEdit();"> Save</span>
        <span class="cui-expandable__review-button" ng-if="edit" ng-click="toggleEdit()"> Cancel</span>
    </p>
```
{% endraw %}

Note that whatever is put into the `label` attribute will compile using the cui-i18n filter `translate`. If instead you just want to use a static text label, change the attribute to `name` instead of `label`.

You can use the attribute `type` to set the input to any type that's compatible with the `input` tag (text is default, password, email, etc.). You can also use `type="dropdown"`.
If you do set it to dropdown you'll have to add 2 more attributes: `options` and `options-expression`.
`options` needs to be the array that contains the options and `options-expression` is the condition to track the value of the item.

The `display` attribute will be what's displayed before the user clicks the 'edit' button. This is for situations where you want to display something different than what is in the `model`.

If you have an array of strings, for example `app.options=['value 1','value 2','value 3'];` you can do
```html
     <inline-edit type="dropdown" name="options" model="app.selectedOption" options-expression="x as x for x in options" options="app.options" display="selectedOption.textToBeDisplayed"></inline-edit>
```

IMPORTANT: in `options-expression` - x as x for x in options - that last bit `options` is MANDATORY. This is the name of the scope variable that will point to the `options` variable. For more complex filters see [this](https://docs.angularjs.org/api/ng/directive/ngOptions).

## Change Log 1/18/2016

* Now auto focuses the input when the edit button is clicked, with the help of focus-if.

## Change Log 1/20/2016

* Adds display attribute so the developer can choose what shows before you hit edit - this is useful for cases where the field to edit is a dropdown that has a model that contains the ID of the selected option rather than its text.
* Adds another possible `type`, 'auto-complete'. Needs to be used like this
```html
    <inline-edit type="auto-complete" model="newTLO.user.addresses[0].country" display="newTLO.user.addresses[0].country.title || newTLO.user.addresses[0].country" label="cui-country" selected-object="newTLO.user.addresses[0].country" model="newTLO.user.addresses[0].country" local-data="base.countries" search-fields="name" title-field="name"></inline-edit>
```

## Change Log 1/28/2016

* Inline-edit fields with type password will now display a hidden password using `'•'`.

## Change Log 2/24/2016

* Inline-edit now takes an option attribute, `on-save`, to which you can attach a callback function for when the save button gets pressed.

## Change Log 3/4/2016

* Now has 4 extra optional attributes. `value-class` , `input-class`, `label-class` and `wrapper-class`, which all have default values, see below.
```javascript
    var valueClass=attrs.valueClass || "cui-field-val__val";
    var inputClass=attrs.inputClass || "cui-field-val__val";
    var labelClass=attrs.labelClass || "cui-field-val__field";
    var wrapperClass=attrs.wrapperClass || "cui-field-val";
```

## Change Log 3/10/2016

* Now takes an optional `on-edit` callback function, inline-edit will call that function and passe the current temporary edit value every time it changes.
Markup:
```html
    <inline-edit name="Random word" model="app.random2" on-edit="app.changed"></inline-edit>
```
Controller:
```
    app.changed=function(value){
        // do stuff with the value, this will probably only be useful for error checking.
    };
```

## Change Log 3/14/2016

* Now takes an optional `hide-save-if` attribute, which will hide the save button if evaluated to true.
