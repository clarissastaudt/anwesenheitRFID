let $ = require('jquery')
let fs = require('fs')


/*______ Change view ______*/

function instructionCardFound() {
	$("#instr").html("Campuscard erkannt.")
	$(".animatedDot").addClass("hide")
}

function instructionPersonalInfo() {
	$("#instr").html("Bitte geben Sie Ihre Daten an")
	$(".animatedDot").removeClass("hide")
}

function instructionDataAdded() {
	$("#instr").html("Daten hinzugefügt.")
	$(".animatedDot").addClass("hide")
}

function deactivateShadowPulse() {
	$("#campuscard").css("animation", "none");
}

function promptForPersonalInfo() {
	setTimeout(function() {
		instructionPersonalInfo()
		$("#form").removeClass("hide");
	}, 2000);
}

/* Shows a check sign after a successful read */
function showCheck() {
	setTimeout(function() {
		$(".sa-success").removeClass("hide");
	}, 20);
	setTimeout(function() {
		$(".sa-success").addClass('scale-out');
	}, 1000);
	setTimeout(function() {
		$(".sa-success").addClass('hide');
	}, 1350);
}

/* Shows first and lastname on Campuscard */
function showPersonalData(personalData) {
	text_vorname = "<b>Vorname:</b> " + personalData[1]
	text_nachname = "<b>Nachname:</b> " + personalData[2]
	$("#personal-vorname").html(text_vorname)
	$("#personal-nachname").html(text_nachname)
}


/*______ Calculations ______*/

/* Returns current date */
function currDate() {
	d = new Date()

	day = d.getDate()
	month = d.getMonth()
	year = d.getFullYear()
	date = day + "." + month + "." + year

	return date
}

/*______ Interact with files ______*/

/* Checks if id exists and returns corresponding personal data */
function searchID(read_id, filename) {

	personalData = ""

	if (fs.existsSync(filename)) {

		/* Split file into lines*/
		let data = fs.readFileSync(filename, 'utf8').split('\n')

		/* Check if id is already known*/
		for (l in data) {
			stud_data = data[l].split(";")
			cur_id = stud_data[0]

			if (read_id == cur_id) {
				personalData = stud_data
				break
			}
		}
	} 
	else {
		console.log("File Doesn\'t Exist. Creating new file.")
		fs.writeFile(filename, '', (err) => {
			if (err) {
				console.log(err)
			}
		})
	}

	return personalData
}

/* Writes personal info and date to file (id doesn't exist) */
function writePersonalInfo(id, first, last, date, filename) {
	new_row = id + ";" + first + ";" + last + ";" + date + "\n"
	/* Check if file exists */
	if (fs.existsSync(filename)) {
		fs.appendFile(filename, new_row, (err) => {
			if (err) {
				console.log(err)
			}
		})
	} 
	else {
		console.log("File Doesn\'t Exist. Creating new file.")
	}
}

/* Adds date to already existing id in file */
function writeDate(personalData, date, filename) {
	/* Check if file exists */
	if (fs.existsSync(filename)) {

		/* Split file into lines*/
		let data = fs.readFileSync(filename, 'utf8').split('\n')
		new_data = ""

		/* Append new date */
		for (l in data) {
			l = data[l].split(";")
			if ((l.indexOf(personalData[0]) > -1) && (l.indexOf(date) < 0)) {
				new_data += l.join(";") + ";" + date + "\n"
			} 
			else if (l == "" || l.length == 0) {
				new_data = new_data
			} 
			else {
				new_data += l.join(";") + "\n"
			}
		}
		fs.writeFile(filename, new_data, (err) => {
			if (err) {
				console.log(err)
			}
		})
	} 
	else {
		console.log("File Doesn\'t Exist. Creating new file.")
		fs.writeFile(filename, '', (err) => {
			if (err) {
				console.log(err)
			}
		})
	}
}

/* Check whether input info is correct and write correct info to file*/
function processPersonalInfo(date, filename, id) {
	first = $("#first_name").val()
	last = $("#last_name").val()

	if (first == undefined || first == "") {
		console.log("Missing firstname.")
		$("#first_name").css("border-bottom", "2px solid #CC0000")
	} 
	else if (last == undefined || last == "") {
		console.log("Missing lastname.")
		$("#last_name").css("border-bottom", "2px solid #CC0000")
	}
	/* Valid input found */
	else {
		/* Change view for user*/
		$("#form").addClass("hide");
		showPersonalData(["", first, last])
		instructionDataAdded()
		$(".sa-success").removeClass('scale-out');
		showCheck()

		writePersonalInfo(id, first, last, date, filename)

		setTimeout(function() {
			location.reload();
		}, 3000);
	}
}

/*______ ÍD requests ______*/

function requestID(date, filename) {
	$.get("192.168.4.1", function(id) {
		if (id != "") {
			/* Change user view: Card detected */
			instructionCardFound()
			deactivateShadowPulse()
			showCheck()

			/* Check if id already exists */
			personalData = searchID(id, filename)

			/* Id unknown */
			if (personalData == "") {
				promptForPersonalInfo()
				/* Process input data */
				$("#send").click(function(e){
					e.preventDefault()
					processPersonalInfo(date, filename, id)
				})

			}
			/* Id is known*/
			else {
				showPersonalData(personalData)
				writeDate(personalData, date, filename)
				setTimeout(function() {
					location.reload();
				}, 3000);
			}
		}
    	setTimeout(requestID, 500);
	}).fail(function() {
    	setTimeout(requestID, 500)
	});
}
	

$(document).ready(function() {

	date = currDate()
	filename = "myseminar.csv"

	requestID(date, filename)


});