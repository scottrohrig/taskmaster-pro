var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  // check due date
  auditTasks(taskLi);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("t-master-tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("t-master-tasks", JSON.stringify(tasks));
};

var auditTasks = function(taskEl) {
  // get date from task ele
  var date = $(taskEl).find("span").text().trim();
  // convert to moment obj at 5:00pm
  var time = moment(date, "L").set("hour", 17);

  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new classes if near/over due
  if (moment().isAfter(time)) {
    console.log("task after time")
    $(taskEl).addClass("list-group-item-danger")
  } else if (Math.abs(moment().diff(time, "days")) <= 2) {
    $(taskEl).addClass("list-group-item-warning");
  }

}

// convert text field into a jquery date picker
$("#modalDueDate").datepicker({
  // force user to select a future date
  // minDate: 1
});

// make tasks sortable across lists
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) {
  },
  deactivate: function(event) {
  },
  over: function(event) {
  },
  out: function(event) {
  },
  update: function(event) {
    var tempArr = [];
    // loop over values of $(this).children() and push to the new array of the list they are in
    $(this).children().each(function() {
      var text = $(this)
        .find('p')
        .text()
        .trim();
      
        var date = $(this)
          .find('span')
          .text()
          .trim();
        
      tempArr.push({
        text: text,
        date: date
      });
    });

    // trim off the 'list-' prefix from the class name of the list element
    var arrName = $(this)
      .attr('id')
      .replace('list-', '');

    // update array on tasks obj with corresponding list and save
    tasks[arrName] = tempArr;
    saveTasks();
  },
  stop: function(event) {
    $(this).removeClass("dropover");
  }
});

// make trash droppable
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event,ui) {
    ui.draggable.remove();
  },
  over: function(event, ui) {

  },
  out: function(event, ui) {

  }
})

// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks["toDo"].push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// task content clicked, enter task edit mode
$('.list-group').on('click', 'p', function() {
  // console.log(this, $(this),"<p> was clicked");
  var text = $(this).text().trim();
  
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  // set textInput to focus for immediate use
  textInput.trigger("focus");
});

// exit task edit mode, save task
$(".list-group").on('blur','textarea', function() {
  // get textarea's val
  var text = $(this).val().trim();
  // get parent's id
  var status = $(this).closest(".list-group").attr("id").replace("list-","");
  // get task's index in list
  var index = $(this).closest(".list-group-item").index();
  // update tasks data obj
  tasks[status][index].text = text;
  
  // recreate p ele
  var taskP = $("<p>").addClass("m-1").text(text);
  $(this).replaceWith(taskP);
  saveTasks();
});


// enter task date-edit mode
$(".list-group").on("click","span", function() {
  // get value
  var date = $(this).text().trim();
  // create new date input
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);
  // swap elements
  $(this).replaceWith(dateInput);

  // enable jquery ui datepicker
  dateInput.datepicker({
    // minDate: 1,
    onClose: function() {
      $(this).trigger("change")
    }
  });
  
  // trigger autofocus on date
  dateInput.trigger("focus");
});

// exit task date-edit mode
$(".list-group").on("change", "input[type='text']", function() {
  // access date text value
  var date = $(this).val();

  // get parent ul's id attr
  var status = $(this).closest(".list-group").attr("id").replace("list-","");
  // get task index loc
  var index = $(this).closest(".list-group-item").index();
  // update tasks data obj
  tasks[status][index].date = date;
  saveTasks();

  // recreate span ele, including bootstrap classes
  var dateSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
    // swap elements
  $(this).replaceWith(dateSpan);
  auditTasks($(dateSpan).closest('.list-group-item'))
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


