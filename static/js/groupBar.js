// JavaScript Document
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Must be call 'function init' when window onload
 * See 'function onClick' for some condition 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
function enableChild(field)
{
	for (var i=0; i < field.length; i++) {
		document.form[field[i]].disabled = false;
		if (document.form[field[i]].checked) {
			if (document.form[field[i]].child != undefined) enableChild(document.form[field[i]].child);
		}
	}
}
function disableChild(field)
{
	for (var i=0; i < field.length; i++) {
		document.form[field[i]].disabled = true;
		if (document.form[field[i]].child != undefined) disableChild(document.form[field[i]].child);
	}
}

function onClick(obj,field)
{
	if (obj.checked) {
		if (obj.child == undefined) {
			for (var i=0; i < field.length; i++) {
				obj.child = field;
			}
		}
		enableChild(obj.child);
	} else {
		if (obj.child == undefined) {
			for (var i=0; i < field.length; i++) {
				obj.child = field;
			}
		}
		disableChild(obj.child);
	}
}

function init()
{
	var form = document.form;
	for (var i = 0; i < form.elements.length; i++) {
		if ((form.elements[i].onclick != null) && (form.elements[i].type == 'checkbox')) {
			form.elements[i].onclick();
		}
	}
}

