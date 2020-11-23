//Initialize a new collection of lists
var todoLists = Alloy.Collections.lists;
todoLists.fetch();


//Function to activate a dialog allowing the user to type in a new list name
function createNewList(e) {
	if (OS_ANDROID) {
    	$.alertDialog.show();
    	$.listName.value = '';
    	$.alertDialog.addEventListener('click', function(e) {
      		if (e.index == 0) {
      			//Ti.API.info($.listName.value);
        		addList($.listName.value);
      		}
    	});
  	}
  	if (OS_IOS) {
    	var dialog = Ti.UI.createAlertDialog({
      		title : 'List Name',
      		style : Ti.UI.iOS.AlertDialogStyle.PLAIN_TEXT_INPUT,
      		buttonNames : ['OK', 'Cancel']
    	});
    	dialog.addEventListener('click', function(e) {
      		if (e.index == 0) {
        		addList(e.text);
      		}
    	});
    	dialog.show();
  	}
}

//Function to create a filter of results based on keyword from user input
function search(e) {
	var searchTerm = $.searchField.value;
	if (searchTerm == '') {
		return;
	}
  	var result = Alloy.createCollection('items');
  	result.fetch({
    	query:
      		"SELECT lists.name as name, items.* "
      		+ "FROM lists JOIN items ON lists.id = items.listid "
      		+ "WHERE items.item like '%" + searchTerm + "%' ORDER BY lists.name ASC"
  	});
	var tableData = [];
  	result.each(function(item) {
    	tableData.push(Alloy.createController('SearchTableView', {
        	name: item.get("name"),
        	item: item.get("item")
      	}).getView());
  	});
  	var win = Ti.UI.createWindow();
  	win.title = "Search results for '"+ $.searchField.value + "'";
  	var table = Ti.UI.createTableView({ objName: 'search-table' });
  	table.setData(tableData);
  	win.add(table);
  	if (OS_IOS) {
  		$.index.openWindow(win);
  	}
  	if (OS_ANDROID) {
    	win.open();
  	}
}

//Function to create a new to-do list
function addList(inputName) {
	if (inputName == '') {
    	return;
  	}
  	//Determine the maximum number of lists in the collection
  	var max = todoLists.max(function(list) {
    	return parseInt(list.get("id"));
  	});
  	if (max == -Infinity || isNaN(parseInt(max.get("id")))) {
    	max = todoLists.length;
  	} 
  	else {
    	max = parseInt(max.get("id"));
  	}
  	//Create a list model
  	var list = Alloy.createModel('lists', {
    	name : inputName,
    	id : 1 + max
  	});
  	todoLists.add(list);
  	list.save();
  	$.listName.value = '';
}


//Function to open up and show a list
function showList(e) {
  	var args = {
    	id : e.source.list_id,
    	alloyid: e.source.alloy_id,
    	listname: e.source.text
  	};
  	var listview = Alloy.createController("list", args).getView();  

  	if (OS_IOS) {
    	$.index.openWindow(listview);
  	}
  	if (OS_ANDROID) {
    	listview.open();
  	}
}


//Function to confirm whether or not the user wants to delete their list
var deleteDialog;
function confirmDelete(event) {
	var isAndroid = Ti.Platform.osname === 'android';
	var opts = {
  		title: 'Are you sure you want to delete this list?'
	};
	if (isAndroid) {
		opts.options = ['Confirm', 'Cancel'];
	  	opts.buttonNames = ['Help'];
	} 
	else {
  		opts.options = ['Confirm', 'Help', 'Cancel'];
	}
	deleteDialog = Ti.UI.createOptionDialog(opts);
	deleteDialog.addEventListener('click', function(e){
		if (isAndroid) {
			if (e.button === false && e.index === 0) {
				removeList(event);
		    	alert('List deleted!');
		    }
	    	if (e.button === false && e.index === 1) {
	      		alert('Operation cancelled');
	    	}
	    	if (e.button === true && e.index === 0) {
	      		alert('If you wish to delete this list, press Confirm');
	    	}
  		}
	});
 	deleteDialog.show();
}


//Function to remove a to-do list
function removeList(event) {
  	var list = todoLists.get(event.source.alloy_id);//grab the model by the alloy_id
  	//var listStr = JSON.stringify(list);
  	var dbID = list.get('id');
  	var db = Ti.Database.open('/data/data/edu.du.ict.fulltodolist/databases/_alloy_');
  	db.execute('DELETE FROM items WHERE listid=?', dbID);
  	db.close();
  	todoLists.remove(list);
  	list.destroy();
}


//Longpress event listener function for each list
$.tableview.addEventListener('longpress', function(event) {
	var opts = {
  		title: 'List Options:',
  		options: ['Delete', 'Edit', 'Cancel']
	};	
	var dialog = Ti.UI.createOptionDialog(opts);
	dialog.addEventListener('click', function(e){
		if (e.index === 0) {
			removeList(event);
	    	alert('List deleted!');
	    }
    	if (e.index === 1) {
      		showList(event);
    	}
    	if (e.index === 2) {
      		alert('Operation cancelled');
    	}
	});
 	dialog.show();
});

$.index.open();
