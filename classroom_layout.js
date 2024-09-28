// Global variable to store selected layout configuration
let selectedLayout = [];
let numberOfStudents = 0;

// Store the selected layout from the dropdown in a global variable
function storeLayout() {
  const layoutSelect = document.getElementById("layoutSelect").value;

  // Map the selected option to the corresponding desk layout
  if (layoutSelect === "2-2-2") {
    selectedLayout = [2, 2, 2]; // 2+2+2 layout
  } else if (layoutSelect === "3-3") {
    selectedLayout = [3, 3]; // 3+3 layout
  } else if (layoutSelect === "1-1") {
    selectedLayout = [1,  1, 1, 1]; // 4+2 layout
  } else {
    selectedLayout = [6, 6]; // Default layout (6 desks per row)
  }
}



// Drag function to pick up desk or student
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}


// Handle dragging the empty icon
function dragEmpty(event) {
  event.dataTransfer.setData("text", "empty"); // Identify it as the empty icon
}

// Allow the desk area to accept the drop
function allowDrop(event) {
  if (!event.target.classList.contains('empty-desk')) {
    event.preventDefault(); // Allow the drop operation
  }
}

// Drop the student or desk into the target area (desk or empty space in row)
function drop(event) {
  event.preventDefault();
  event.stopPropagation();
  var data = event.dataTransfer.getData("text");
  var draggableElement = document.getElementById(data);
  var targetElement = event.target;

  if (data === "empty" && targetElement.classList.contains("desk")) {
   // Create a new cross button inside the desk
   const crossButton = document.createElement('button');
   crossButton.classList.add('empty-icon-btn');
   crossButton.innerHTML = '❌ ';
   crossButton.onclick = function() {
       // When the cross is clicked, make the desk available again
       targetElement.innerHTML = '';
       targetElement.classList.remove('empty-desk');
   }; 
    
    // Mark the desk as empty
    targetElement.classList.add('empty-desk');
  targetElement.appendChild(crossButton);  
  return;
  } 

  var parentElement = draggableElement.parentElement;
  //console.log("draggable:", draggableElement);
  //console.log("parent:", parentElement);
  //console.log("target:" ,targetElement);

  // Handle desks being grouped together side by side
  if (draggableElement.classList.contains("desk") || draggableElement.classList.contains("space")) {
    console.log("draggable:", draggableElement);
    console.log("parent:", parentElement);
    console.log("target:" ,targetElement);
    // Allow drop directly into another desk or row
    if (targetElement.classList.contains("row")) {
      console.log("Estoy en el if del row")
      const parentRow = targetElement;
      parentRow.appendChild(draggableElement);
    }
    // Allow drop directly into another space or row
    else if (targetElement.classList.contains("desk") || targetElement.classList.contains("space")) {
      console.log("Estoy en el if del desk|space")
      targetElement.parentNode.insertBefore(draggableElement, targetElement);
    }
    console.log("-------------------------");
  }
  // Handle students being dropped into desks
  else if (draggableElement.classList.contains("student") && targetElement.classList.contains("desk")) {
    // Check if the desk is already occupied by a student
    if (targetElement.children.length > 0) { // Check if the desk has any children
      alert("The desk already has a student!"); // Show warning only if occupied
    } else {
      targetElement.textContent = ''; // Clear desk text
      targetElement.appendChild(draggableElement); // Assign the student
    }
  }
  else if (draggableElement.classList.contains("student") && parentElement.classList.contains("desk") 
    && targetElement.classList.contains("students")) {
    // Check if the desk is already occupied by a student
    parentElement.textContent = ''; // Clear desk text
    targetElement.appendChild(draggableElement); // Assign the student
  }


}

// Add event listeners for desks to enable dropping both desks and students
function enableDeskListeners() {
  var desks = document.querySelectorAll(".desk");
  desks.forEach(function(desk) {
    desk.addEventListener('dragover', allowDrop);
    desk.addEventListener('drop', drop);
  });

  var rows = document.querySelectorAll(".row");
  rows.forEach(function(row) {
    row.addEventListener('dragover', allowDrop);
    row.addEventListener('drop', drop);
  });

  var students = document.getElementById("students");
  students.addEventListener('dragover', allowDrop);
  students.addEventListener('drop', drop);
}


// Load student names from a plain text file
function loadStudents() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];

  let n_students = 0;
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const contents = e.target.result;
      const lines = contents.split('\n');

      const studentsDiv = document.getElementById('students');
      studentsDiv.innerHTML = ''; // Clear existing students

      lines.forEach((line, index) => {
	const nameParts = line.trim().split(' ');
	if (nameParts.length >= 3) {
	  const firstName = nameParts[0];
	  const middleName = nameParts[1];
	  const lastName = nameParts[2];

	  const studentDiv = document.createElement("div");
	  studentDiv.className = "student";
	  studentDiv.id = `student${index + 1}`;
	  studentDiv.draggable = true;
	  studentDiv.ondragstart = drag;
	  studentDiv.textContent = `${firstName}\n${middleName}\n${lastName}`;
	  studentsDiv.appendChild(studentDiv);
	}
	n_students = n_students+1;
      });
      numberOfStudents = n_students;
      // Now generate desks using the selected layout
      generateDesksFromLayout(n_students);

    };
    reader.readAsText(file);
  }
}


// Generate desks based on the stored selected layout
function generateDesksFromLayout(n_students) {
  const classroom = document.getElementById("classroom");
  classroom.innerHTML = ''; // Clear existing rows
  storeLayout();

  const totalDesks = n_students;  // Total number of desks
  const desksInRow = selectedLayout.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const totalRows = Math.ceil(totalDesks / desksInRow);    // Number of rows
  console.log(desksInRow, n_students, totalRows, selectedLayout);

  let deskCount = 1;
  let spaceCount = 1;

  for (let i = 0; i < totalRows; i++) {
    const row = document.createElement("div");
    row.className = "row";
    selectedLayout.forEach(deskstogether => {
      console.log(deskstogether)
      for (let a = 0; a < deskstogether; a++) { 
	const desk = document.createElement("div");
	desk.className = "desk";
	desk.id = `desk${deskCount}`;
	desk.draggable = true;
	desk.ondragstart = drag;
	row.appendChild(desk);
	deskCount++;
      }
      const space = document.createElement("div");
      space.className = "space";
      space.id = `space${spaceCount}`;
      space.draggable = true;
      space.ondragstart = drag;
      row.appendChild(space);
      spaceCount++;
    }
    ); 
    classroom.appendChild(row);
  }

  enableDeskListeners(); // Re-attach event listeners to new desks
}

// Function to export the classroom layout to PDF
function exportToPDF() {
  const classroom = document.getElementById('whole-classroom');

  // Use html2canvas to capture the classroom layout as an image
  html2canvas(classroom).then(function (canvas) {
    const imgData = canvas.toDataURL('image/png');

    // Load jsPDF from the global window
    const { jsPDF } = window.jspdf;

    // Create a new jsPDF instance
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: 'a4'
    });

    // Get page dimensions
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Get the dimensions of the canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate scale ratio to fit the image to the PDF size
    const ratio = Math.min(pageWidth / canvasWidth, pageHeight / canvasHeight);

    // Set the width and height based on the ratio
    const width = canvasWidth * ratio;
    const height = canvasHeight * ratio;

    // Add the image to the PDF, centered on the page
    pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, 20, width, height);

    // Save the PDF with a filename
    pdf.save('classroom-layout.pdf');
  }).catch(function (error) {
    console.error('Error exporting to PDF:', error);
  });
}




// Function triggered when a new layout is selected from the dropdown
function changeLayout() {
  const layoutSelect = document.getElementById("layoutSelect").value;

  if (layoutSelect === "2-2-2") {
    console.log(layoutSelect);
  } else if (layoutSelect === "3-3") {
    console.log(layoutSelect);
  } else if (layoutSelect === "4-2") {
    console.log(layoutSelect);
  } else {
    console.log(layoutSelect);
  }
}


// Function to shuffle array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to shuffle and assign remaining students to empty desks
function shuffleRemainingStudents() {
  const desks = document.querySelectorAll('.desk');
  const remainingStudents = [];

  // Find students who have not been assigned a desk
  const studentElements = document.querySelectorAll('.student');
  studentElements.forEach(student => {
    const studentId = student.id;
    const assigned = Array.from(desks).some(desk => desk.contains(student));

    if (!assigned) {
      remainingStudents.push(student);
    }
  });

  // Find available desks (those without students)
  const availableDesks = Array.from(desks).filter(desk => !desk.hasChildNodes());

  // Shuffle remaining students
  shuffleArray(remainingStudents);

  // Assign shuffled students to available desks
  for (let i = 0; i < Math.min(remainingStudents.length, availableDesks.length); i++) {
    const student = remainingStudents[i];
    const targetDesk = availableDesks[i];

    targetDesk.innerHTML = ''; // Clear the desk
    targetDesk.appendChild(student); // Move the student div to the desk
  }
}


