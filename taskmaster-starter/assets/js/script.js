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

  // checks due date
  auditTask(taskLi);

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

    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function(){
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl){
  // gets date element
  var date = $(taskEl).find("span").text().trim();

  // sets to local time at 5pm instead of 12am
  var time = moment(date, "L").set("hour", 17);

  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  if (moment().isAfter(time)){
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days")) <= 2){
    $(taskEl).addClass("list-group-item-warning");
  }
};

// -------EVENT LISTENERS START-------

// use jquery to select the p element. var text grabs the element's text and trims off excess white space`
$(".list-group").on("click", "p", function(){
  var text = $(this)
    .text()
    .trim();  

  // var textInput selects the textarea element and adds form control with the value of var text
  var textInput = $("<textarea>")
    .addClass("form-control")
    .val(text);

  // replaces the p element with textarea element that keeps the same text then brings it to focus
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// blur will activate when clicked away from element
$(".list-group").on("blur", "textarea", function(){
  // get textarea's current value and trims whitespace
  var text = $(this)
    .val()
    .trim();

  // get parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the tasks position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  //given the edited text variable, will update and save based off index. example: tasks[todo][2].text = text
  tasks[status][index].text = text;
  saveTasks();

  // converts back to a p element
  var taskP = $("<p>")
    .addClass("m-1")
    .text(text);
  
  $(this).replaceWith(taskP);
});

// use jquery to select span and modify due date

$(".list-group").on("click", "span", function(){

  var date = $(this)
    .text()
    .trim();
  
  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  dateInput.datepicker({
    minDate: 1
  });

  // focus on new element
  dateInput.trigger("focus");
})

// returns element back to a badge
$(".list-group").on("change", "input[type='text']", function(){
  var date = $(this)
    .val()
    .trim();

  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  var index = $(this)change
    .closest(".list-group-item")
    .index();

  tasks[status][index].date = date;
  saveTasks();

  var taskSpan = $("<span>")
    .addClass = $("badge badge-primary badge-pill")
    .text(date);

  $(this).replaceWith(taskSpan);

  // pass task's <li> element into auditTask() to check new due date
  auditTask($(taskSpan).closest(".list-group-item"));
});

// turns every element with list-group to link with other items in same class
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event){
    console.log("activate", this);
  },
  deactivate: function(event){
    console.log("deactivate", this);
  },
  over: function(event){
    console.log("over", this);
  },
  out: function(event){
    console.log("out", this);
  },

  // jQuery to get all children in an array
  update: function(){
    var tempArr = [];

    // loop over current set of children in sortable list
    $(this).children().each(function(){
        // save values in temp array
        tempArr.push({
          text: $(this)
            .find("p")
            .text()
            .trim(),
          date: $(this)
            .find("span")
            .text()
            .trim()
        });
      });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");

    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();
  }
});


// creates droppable trash section

$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    ui.draggable.remove();
  },
  over: function(event, ui){
    console.log("over");
  },
  out: function(event, ui){
    console.log("out");
  }
});

//-------MODAL START-------

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

// adds date picker to modal and when area is closed element updates
$("#modalDueDate").datepicker({
  minDate: 1,
  onClose: function(){
    $(this).trigger("change");
  }
});

// load tasks for the first time
loadTasks();