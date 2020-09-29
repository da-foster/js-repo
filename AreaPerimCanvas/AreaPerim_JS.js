/* 
 * Author: Darren Foster
 * AreaPerim_JS.js
 */

//Call to init() immediately after the page has been loaded
document.body.onload = init;

//Function that actives once the document is loaded
function init() {
    "use strict";
    canvas.addEventListener("mousedown", mousedown);
    canvas.addEventListener("mouseup", mouseup);
    canvas.addEventListener("mousemove", mousemove);
    canvas.addEventListener("mouseout", mouseup);
    document.getElementById("button").onclick = getDrawArea;
    document.getElementById("clear").onclick = clear;
}

//Declare variables
var canvas = document.getElementById("myCanvas"),
    context = canvas.getContext("2d"),
    drag = false,
    rect = {};
    
//Function for when the mouse is pressed down. X and Y coords are stored in this function
function mousedown(e) {
    "use strict";
    document.getElementById("message").innerHTML = "";
    rect.startX = e.pageX - this.offsetLeft;
    rect.startY = e.pageY - this.offsetTop;
    drag = true;
}

//Function for drawing the rectangle and calling the updateForm() function to
//update the top of the form
function draw() {
    "use strict";
    context.fillRect(rect.startX, rect.startY, rect.w, rect.h);
    context.strokeStyle = 'white';
    context.lineWidth = 1.5;
    context.strokeRect(rect.startX, rect.startY, rect.w, rect.h);
    updateForm(rect.w, rect.h);
}

//Function for when the mouse is moved after pressed down
function mousemove(e) {
    "use strict";
    if (drag) {
        rect.w = (e.pageX - this.offsetLeft) - rect.startX;
        rect.h = (e.pageY - this.offsetTop) - rect.startY;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#0d0c0c';
        draw();
    }
}

//Function for when the mouse button is released
function mouseup(e) {
    "use strict";
    drag = false;
    updateForm(rect.w, rect.h);
}

//Function to update the form
function updateForm(w, h) {
    "use strict";
    if (w < 0) {
        w = -w;
    }
    if (h < 0) {
        h = -h;
    }
    document.getElementById('wid').value = w;
    document.getElementById('hgt').value = h;
    getArea();
}

//Function for calculating the area and updating the form. The function returns the width and the height
function getArea() {
    "use strict";
    //Retrieve the values from the input form
    var widthInput = document.getElementById('wid').value;
    var heightInput = document.getElementById('hgt').value;
    if (widthInput > 750 || heightInput > 530) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        document.getElementById('message').innerHTML = "Ensure that the width is not greater than 750 and the height is not greater than 530";
        document.getElementById('area').innerHTML = "";
        document.getElementById('perim').innerHTML = "";
        setTimeout( function() { 
                document.getElementById('message').innerHTML = "";
            }, 5000);
    }
    else {
        //Set the area and the perimeter
        var area = widthInput * heightInput;
        var perimeter = 2 * widthInput + 2 * heightInput;
        //Insert the values into the output sections
        document.getElementById('area').innerHTML = String(area);
        document.getElementById('perim').innerHTML = String(perimeter);
        return { wid: widthInput, hgt: heightInput };
    }
}

//Function for drawing the rectangle when integers are typed in the Width / Height fields
function drawArea(wid, hgt) {
    "use strict";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#ab0c0c';
    context.fillRect(0, 0, wid, hgt);
}

//Function is called when the used clicks the Get Area and Perimeter button after values have been placed
function getDrawArea(event) {
    var rdim;
    rdim = getArea();
    drawArea(rdim.wid,rdim.hgt);
}

//Function that is called when the clear button is pressed
function clear() {
    "use strict";
    context.clearRect(0, 0, canvas.width, canvas.height);
    document.getElementById('area').innerHTML = "";
    document.getElementById('perim').innerHTML = "";
    document.getElementById('wid').value = "";
    document.getElementById('hgt').value = "";
    document.getElementById('message').innerHTML = "";
}
