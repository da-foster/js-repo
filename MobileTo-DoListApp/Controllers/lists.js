// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var id = $.args.id;
var alloyID = $.args.alloyid;
var listName = $.args.listname;


//Set the title of the to-do list screen
$.win.title = listName;


//Retrieve the list model from the collection
var todoLists = Alloy.Collections.lists;
todoLists.fetch();
var listModel = todoLists.get(alloyID);


//Acquire a collection of items based on the listid
var listItems = Alloy.Collections.items;
listItems.fetch({
	query : {
		statement : 'SELECT * from items where listid = ?',
    	params : [id]
  	}
});


//Function to add a new to-do item into the listItems collection
function addItem(event) {
	if ($.itemInput.value == '') {
    	return;
  	}
  	var item = Alloy.createModel('items', {
    	item : $.itemInput.value,
    	listid : id
  	});
  	listItems.add(item);
  	item.save();
  	$.itemInput.value = '';
}


//Function to mark an item as complete
function markComplete(e){
	if (e.row.hasCheck){
		e.row.hasCheck = false;
	} else {
		e.row.hasCheck = true;
	}
}


//Function to remove a to-do item from the list
function removeRow(event) {
	var item = listItems.get(event.source.alloy_id);
  	listItems.remove(item);
  	item.destroy();
}


//Function to change the title on the screen and in the SQLite database
function changeTitle(e) {
	var newTitle = $.nameChange.value;
	if (newTitle === '') {
		alert('Please enter a value');
	}
	else {
		$.win.title = newTitle;
		alert('List title changed to: ' + newTitle);
		listModel.set('name', newTitle);
		var db = Ti.Database.open('/data/data/edu.du.ict.fulltodolist/databases/_alloy_');
		db.execute('UPDATE lists SET name=? WHERE id=?', newTitle, id);
		db.close();
		$.nameChange.value = '';
	}
}


//Longpress event listener to modify the name of a to-do item
$.tableView.addEventListener('longpress', function(e) {
	var currentState = e.source.text;
	var currentAID = e.source.alloy_id;
	var itemModel = listItems.get(currentAID);

	$.itemUpdate.show(); //dialog
	$.itemName.value = ''; //text field
	$.itemUpdate.addEventListener('click', function(e) {
  		if (e.index == 0) {
    		itemModel.set("item", $.itemName.value);
    		var dbConn = Ti.Database.open('/data/data/edu.du.ict.fulltodolist/databases/_alloy_');
			dbConn.execute('UPDATE items SET item=? WHERE alloy_id=?', $.itemName.value, currentAID);
			dbConn.close();
  		}
  		else {
  			alert('Operation Cancelled');
  		}
	});
});
