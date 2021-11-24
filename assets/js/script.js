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


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

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
    console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// task content clicked, enter task edit mode
$('.list-group').on('click', 'p', function() {
  // console.log(this, $(this),"<p> was clicked");
  var text = $(this).text().trim();
  console.log(text);
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
  var index = $(this).closest(".list-group").index();
  // update tasks data obj
  tasks[status][index].text = text;
  saveTasks();

  // recreate p ele
  var taskP = $("<p>").addClass("m-1").text(text);
  $(this).replaceWith(taskP);
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
  // trigger autofocus on date
  dateInput.trigger("focus");
});

// exit task date-edit mode
$(".list-group").on("blur", "input[type='text']", function() {
  // access date text value
  var date = $(this)
    .val()
    .trim();

  // get parent ul's id attr
  var status = $(this).closest(".list-group").attr("id").replace("list-","");
  // get task index loc
  var index = $(this).closest(".list-group").index();
  // update tasks data obj
  tasks[status][index].date = date;
  // recreate span ele, including bootstrap classes
  var dateSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);
    // swap elements
  $(this).replaceWith(dateSpan);
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
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
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


