let $ = require('jquery')
let fs = require('fs')

/* ______ Change view ______ */

function instructionCardFound () {
  $('#instr').html('Campuscard erkannt.')
  $('.animatedDot').addClass('hide')
}

function instructionPersonalInfo () {
  $('#instr').html('Bitte geben Sie Ihre Daten an')
  $('.animatedDot').removeClass('hide')
}

function instructionDataAdded () {
  $('#instr').html('Daten hinzugefügt.')
  $('.animatedDot').addClass('hide')
}

function deactivateShadowPulse () {
  $('#campuscard').css('animation', 'none')
}

function promptForPersonalInfo () {
  setTimeout(() => {
    instructionPersonalInfo()
    $('#form').removeClass('hide')
  }, 2000)
}

/* Shows a check sign after a successful read */
function showCheck () {
  setTimeout(function () {
    $('.sa-success').removeClass('hide')
  }, 20)
  setTimeout(function () {
    $('.sa-success').addClass('scale-out')
  }, 1000)
  setTimeout(function () {
    $('.sa-success').addClass('hide')
  }, 1350)
}

/* Shows first and lastname on Campuscard */
function showPersonalData (personalData) {
  let textVorname = '<b>Vorname:</b> ' + personalData[1]
  let textNachname = '<b>Nachname:</b> ' + personalData[2]
  $('#personal-vorname').html(textVorname)
  $('#personal-nachname').html(textNachname)
}

/* ______ Calculations ______ */

/* Returns current date */
function currDate () {
  let d = new Date()

  let day = d.getDate()
  let month = d.getMonth()
  let year = d.getFullYear()
  let date = day + '.' + month + '.' + year

  return date
}

/* ______ Interact with files ______ */

/* Checks if id exists and returns corresponding personal data */
function searchID (readID, filename) {
  let personalData = ''

  if (fs.existsSync(filename)) {
    /* Split file into lines */
    let data = fs.readFileSync(filename, 'utf8').split('\n')

    /* Check if id is already known */
    for (let l in data) {
      let studData = data[l].split(';')
      let curID = studData[0]

      if (readID === curID) {
        personalData = studData
        break
      }
    }
  } else {
    console.log('File Doesn\'t Exist. Creating new file.')
    fs.writeFile(filename, '', (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
  return personalData
}

/* Writes personal info and date to file (id doesn't exist) */
function writePersonalInfo (id, first, last, date, filename) {
  let newRow = id + ';' + first + ';' + last + ';' + date + '\n'
  /* Check if file exists */
  if (fs.existsSync(filename)) {
    fs.appendFile(filename, newRow, (err) => {
      if (err) {
        console.log(err)
      }
    })
  } else {
    console.log('File Doesn\'t Exist. Creating new file.')
  }
}

/* Adds date to already existing id in file */
function writeDate (personalData, date, filename) {
  /* Check if file exists */
  if (fs.existsSync(filename)) {
    /* Split file into lines */
    let data = fs.readFileSync(filename, 'utf8').split('\n')
    let newData = ''

    /* Append new date */
    for (let l in data) {
      let ln = data[l].split(';')
      if ((ln.indexOf(personalData[0]) > -1) && (ln.indexOf(date) < 0)) {
        newData += ln.join(';') + ';' + date + '\n'
      } else if (l === '' || l.length === 0) {
        ;
      } else {
        newData += l.join(';') + '\n'
      }
    }
    fs.writeFile(filename, newData, (err) => {
      if (err) {
        console.log(err)
      }
    })
  } else {
    console.log('File Doesn\'t Exist. Creating new file.')
    fs.writeFile(filename, '', (err) => {
      if (err) {
        console.log(err)
      }
    })
  }
}

/* Check whether input info is correct and write correct info to file */
function processPersonalInfo (date, filename, id) {
  let first = $('#first_name').val()
  let last = $('#last_name').val()

  if (first === undefined || first === '') {
    console.log('Missing firstname.')
    $('#first_name').css('border-bottom', '2px solid #CC0000')
  } else if (last === undefined || last === '') {
    console.log('Missing lastname.')
    $('#last_name').css('border-bottom', '2px solid #CC0000')
  } else {
    /* Valid input found */
    /* Change view for user */
    $('#form').addClass('hide')
    showPersonalData(['', first, last])
    instructionDataAdded()
    $('.sa-success').removeClass('scale-out')
    showCheck()

    writePersonalInfo(id, first, last, date, filename)

    setTimeout(function () {
      window.location.reload()
    }, 3000)
  }
}

/* ______ ID requests ______ */

function requestID (date, filename) {
  $.get('192.168.4.1', function (id) {
    if (id !== '') {
      /* Change user view: Card detected */
      instructionCardFound()
      deactivateShadowPulse()
      showCheck()

      /* Check if id already exists */
      let personalData = searchID(id, filename)

      /* Id unknown */
      if (personalData === '') {
        promptForPersonalInfo()
        /* Process input data */
        $('#send').click(function (e) {
          e.preventDefault()
          processPersonalInfo(date, filename, id)
        })
      } else {
        /* ID is known */
        showPersonalData(personalData)
        writeDate(personalData, date, filename)
        setTimeout(function () {
          window.location.reload()
        }, 3000)
      }
    }
    setTimeout(requestID, 500)
  }).fail(function () {
    setTimeout(requestID, 500)
  })
}

$(document).ready(function () {
  let date = currDate()
  let filename = 'myseminar.csv'
  requestID(date, filename)
})
