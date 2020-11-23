//Reference to the Collection of 'images'
var images = Alloy.Collections.images;

//Window
var win = Ti.UI.createWindow({
        layout: 'vertical',
        backgroundColor: 'gray',
        title: 'Photo Booth'
});

//Button to activate the camera   
var photoBtn = Ti.UI.createButton({
        title: 'Take a Photo'
});

//Button to open the photo gallery   
var galleryBtn = Ti.UI.createButton({
	title: 'Open Photo Gallery',
    id: 'photogallery',
});

//Textfield for photo title entry
var textField;


//Event listener function for the photo gallery button
galleryBtn.addEventListener('click', function(e){
	//Check to see if there is already a picture in the view
	var existingContainer = win.getViewById('photocontainer');
	if (existingContainer !== null){
		win.remove(textField);
		win.remove(toolbar);
		win.remove(existingContainer);
	}
	Ti.Media.openPhotoGallery({
		saveToPhotoGallery: true,
        mediaTypes: [ Titanium.Media.MEDIA_TYPE_PHOTO ],
        success: function (e) {
        	//Text field for entering in a photo name
            textField = Ti.UI.createTextField({
            	id: 'textfield',
            	hintText: 'Enter a title for the image'
            });
            win.add(textField);
        	
            var imageView = Ti.UI.createImageView({
                image: e.media,
                rotation: 0,
                id: 'imageCapture'
            });
            //Overall container for the image view
            var photoContainer = Ti.UI.createView({
            	id: "photocontainer"
            });
            photoContainer.add(imageView);
            win.add(toolbar);
            win.add(photoContainer);
            toolbar.zIndex = 1;
        },
        cancel: function(e){
        	alert('Returning to main screen' + e);
        },
        error: function (e) {
            alert('error opening image: ' + e);
        }
    });
});

//Create the buttons/toolbar
var save = Ti.UI.createButton({
	title: 'Save'
});
var lRotate = Ti.UI.createButton({
	title: 'Rotate Left'
});
var	rRotate = Ti.UI.createButton({
	title: 'Rotate Right'
});
var	toolbar = Ti.UI.createToolbar({
	items: [save, lRotate, rRotate],
	left: 40
});
          
save.addEventListener('click', function(e){
	console.log('save triggered');
	saveImage();
});
lRotate.addEventListener('click', function(e){
	rotateLeft();
});
rRotate.addEventListener('click', function(e){
	rotateRight();
});


//Function to display the camera
function showCamera (type, callback) {
	//Function to take the photo
    var camera = function () {
        //Call Titanium.Media.showCamera and respond callbacks
        Ti.Media.showCamera({
            success: function (e) {
                callback(null, e);
            },
            cancel: function (e) {
                callback(e, null);
            },
            error: function (e) {
                callback(e, null);
            },
            saveToPhotoGallery: true, //Save the photo to the gallery
            mediaTypes: [ type ]
        });
    };
    //Verify permissions to capture media
    if (!Ti.Media.hasCameraPermissions()) {
        //Request permissions to capture photo
        Ti.Media.requestCameraPermissions(function (e) {
            //Success: display the camera
            if (e.success) {
                camera();           
            } 
            else {
            	//Cannot obtain the camera permissions
                callback(new Error("Couldn't obtain camera permissions!"), null);
            }
        });
    } 
    else {
        camera();
    }
}


//Photo Button event listener for the photo capture
photoBtn.addEventListener('click', function () {
	//Check to see if there is already a picture in the view
	var existingContainer = win.getViewById('photocontainer');
	if (existingContainer !== null){
		win.remove(textField);
		win.remove(toolbar);
		win.remove(existingContainer);
	}
	//Attempt to take a photo with the camera
    showCamera(Ti.Media.MEDIA_TYPE_PHOTO, function (error, result) {
        if (error) {
            alert('Could not take photo');
            return;
        }
        //Validate a photo was taken. If so, create the ImageView/Edit button/Save button
        if (result.mediaType == Ti.Media.MEDIA_TYPE_PHOTO) {
        	//Text field for entering in a photo name
            textField = Ti.UI.createTextField({
            	id: 'textfield',
            	hintText: 'Enter a title for the image'
            });
            win.add(textField);
            
            var imageView = Ti.UI.createImageView({
                image: result.media,
                rotation: 0,
                id: 'imageCapture'
            });
            //Overall container for the image
            var photoContainer = Ti.UI.createView({
            	id: "photocontainer"
            });
            photoContainer.add(imageView);
            win.add(toolbar);
            win.add(photoContainer);
            toolbar.zIndex = 1;
        }
    });
});


//Function to save the image to the file system
function saveImage() {
	if (textField.value === ''){
		alert('Please enter a name for the photo');
		return;
	}
	var filename = new Date().toISOString();
	var name = textField.value + '.jpg';
  	var dir = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'images');
  	if (!dir.exists()) {
    	dir.createDirectory();
  	}
  	var item = Alloy.createModel('images', {
  		name : name,
    	filename : filename
  	});
  	images.add(item);
  	item.save();
  	//Ti.API.info("3) ImageFile path is: " + dir.resolve());
  	var file = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'images', name);
  	var blob = win.getViewById('imageCapture').toBlob();
  	file.write(blob);
  	//Verify that the image has been saved
  	var verify = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory, 'images', name);
	if(verify){
		alert('Photo saved to the filesystem.');
	} else{
		alert('There was an issue saving to the filesystem. Try again.');
	}
}


//Function to rotate the image left
function rotateLeft() {
	
	var imageView = win.getViewById("imageCapture");
  	imageView.rotation = imageView.rotation - 90;
  	var container = win.getViewById('photocontainer');
  	var image = container.toImage();
  	container.remove(imageView);
  	var view = Ti.UI.createImageView({
    	id: "imageCapture",
    	rotation: 0,
    	image: image
  	});
  	container.add(view);
}


//Function to rotate the image to the right
function rotateRight() {
	
	var imageView = win.getViewById("imageCapture");
  	imageView.rotation = imageView.rotation + 90;
  	var container = win.getViewById('photocontainer');
  	var image = container.toImage();
  	container.remove(imageView);
  	var view = Ti.UI.createImageView({
    	id: "imageCapture",
    	rotation: 0,
    	image: image
  	});
  	container.add(view);
}


win.add([galleryBtn, photoBtn]);
win.open();
