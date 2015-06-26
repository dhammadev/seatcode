/*
 * Copyright (c) 2013. Zscaler, Inc. All rights reserved.
 */

/**
 * Created with IntelliJ IDEA.
 * User: ujwalakhante
 * Date: 8/30/13
 * Time: 4:13 PM
 * To change this template use File | Settings | File Templates.
 */

(function($) {
    var NUM_TABLE_ROWS = 24;
    var masterList = [];
    var printList = [];
    var assignedStudentList = [];
    var timeMappings = {
        "AM": "AM",
        "PM": "PM",
        "67": "6, 7",
        "89": "8, 9"
    };
    var language = localStorage.getItem["seatwalla_language"] || "ENGLISH";
    var Pagodawalla = function(el, options) {

        options = options instanceof Object ? options : {};
        _.defaults(options, this.defaults);
        this.options = options;
        this.el = el;
        this.$el = $(el);
        this.init();
    };

    Pagodawalla.prototype.defaults = {
        gender: "male",
        //imgSrc: "img",
        studentData: [],
        cellHeight: 120,
        pagodaSeatWidth: 150,
        widthUnits: "px",
        pagodaEmptyCellTemplate: _.template("<div class='pagoda-cell' data-cell='<%=cell%>' data-label='<%=student.label%>'>" +
                                            "<div class='pagoda-cell-content'  data-cell='<%=cell%>' data-label='<%=student.label%>'>" +
                                            "<div class='seatwalla-delete'><i class='icon-kub-remove'></i></div>" +
                                            "<%if(cell != -1) {%>" +
                                            "<span class='pagodawalla-cell'><%=cell%></span>" +
                                            "<%}%>" +
                                            "<div class='pagoda-cell-content-data'>" +
                                            "<div class='pagodawalla-first-name'><%=student.firstName%></div>" +
                                            "<span class='pagodawalla-second-name'><%=student.secondName%></span>" +

                                            "<div class='seatwalla-label'><%=student.label%></div>" +
                                            "<div class='seatwalla-seat-text' type='text'><%=student.text%></div>" +
                                            "</div>" +
                                            "</div>" +
                                            "</div>"),
        //pagodaCellContentTemplate: _.template(""),
        pagodaStudentListTemplate: _.template("<%_.each(students, function(student, index) {%>" +
                                              "<% if (student.label != ''){ %>" +
                                              "<div class='pagoda-student-list-item' draggable='true' data-label='<%=student.label%>'><%=student.firstName%></div>" +
                                              "<%}})%>"
        ),

        pagodaCenterListTemplate: _.template(
            "<%_.each(centerList, function(center, index){%>" +
            "<option value=<%=center%>>" +
            "<%=center%>" +
            "</option>" +
            "<%})%>"
        ),
        pagodaStudentListItemTemplate: _.template("<div class='pagoda-student-list-item' draggable='true' data-label='<%=student.label%>'><%=student.firstName%></div>"
        ),

        pagodaSharedCellTemplate: _.template("<div class='pagoda-shared-cell-content' data-cell='<%=cell%>' data-label='<%=student.label%>'>" +
                                             "<div class='seatwalla-delete'><i class='icon-kub-remove'></i></div>" +
                                             "<%if(cell != -1) {%>" +
                                             "<span class='pagodawalla-cell'><%=cell%></span>" +
                                             "<span class='pagodawalla-time'><%=student.time%></span>" +
                                             "<%}%>" +
                                             "<div class='pagoda-cell-content-data'>" +
                                             "<div class='pagodawalla-second-name'><%=student.secondName%></div>" +
                                             "<span class='pagodawalla-first-name'><%=student.firstName%></span>" +
                                             "<div class='seatwalla-label'><%=student.label%></div>" +
                                             "<div class='seatwalla-seat-text' type='text'><%=student.text%></div>" +
                                             "</div>" +
                                             "</div>"),

        sharedCellQueryTemplate: _.template("<div class='pagoda-shared-cell-questionaire'>" +
                                            "<span class='pagoda-shared-cell-question'>" +
                                            translation[language].PAGODA_SHARE_CELL +
                                            //"Do you want to share the cell?" +
                                            "</span>" +

                                            "<div class='pagoda-shared-cell-options'>" +

                                            "<input type='radio' name='pagoda-shared-cell-radio'  value='AM'/>" +
                                            "<span class='pagoda-shared-cell-radio-am-label'>AM</span>" +
                                            "</div>" +

                                            "<div class='pagoda-shared-cell-options'>" +

                                            "<input type='radio' name='pagoda-shared-cell-radio'  value='PM' checked/>" +
                                            "<span class='pagoda-shared-cell-radio-pm-label'>PM</span>" +
                                            "</div>" +

                                            "<div class='pagoda-shared-cell-options'>" +

                                            "<input type='radio' name='pagoda-shared-cell-radio'  value='67'/>" +
                                            "<span class='pagoda-shared-cell-radio-67-label'>6&nbsp;and&nbsp;7</span>" +
                                            "</div>" +

                                            "<div class='pagoda-shared-cell-options'>" +

                                            "<input type='radio' name='pagoda-shared-cell-radio'  value='89'/>" +
                                            "<span class='pagoda-shared-cell-radio-89-label'>8&nbsp;and&nbsp;9</span>" +
                                            "</div>" +

                                            "<input class='pagoda-share-ok' type='button' value='OK' /> " +
                                            "<input class='pagoda-share-cancel' type='button' value='Cancel'/>" +
                                            "</div>"
        ),

        chitTemplate: _.template("<div class='pagoda-chit new'>" +
                                 "<div class='pagoda-chit-student-name'><%=student.firstName%>&nbsp;<%=student.secondName%>,&nbsp;&nbsp;<%=student.label%></div>" +
                                 "<%if(student.share == 'AM') {%>" +
                                 "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b> on all days in the morning from<br><b>4:30-6:30 AM</b>  & <b>10-11 AM</b></div>" +
                                 " <% } else if (student.share == 'PM'){%>" +
                                 "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b> on all days in the afternoon from <br><b>1:00 - 2:20 PM</b> & <b>4 - 5 PM</b></div>" +
                                 "<% } else if (student.share == '67'){%>" +
                                 "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b> on days 6 and 7 from <br><b>4:30 - 6:30 AM</b>, <b>10-11 AM</b>, <b>1:00-2:20 PM</b> & <b>4-5 PM</b></div>" +
                                 "<% } else if (student.share == '89'){%>" +
                                 "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b> on day 8 & 9 from<br><b>4:30 - 6:30 AM</b>,  <b>10 - 11 AM</b>,  <b>1:00 - 2:20 PM</b> & <b>4 - 5 PM</b></div>" +
                                 "<% } else {%>" +
                                 "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b> on all days from<br><b><b>4:30 - 6:30 AM</b>, <b>10 - 11 AM</b>,  <b>1:00 - 2:20 PM</b> & <b>4 - 5 PM</b></div>" +
                                 "<% }%>" +
                                 "<ul>" +
                                 "<li class='pagoda-chit-instr'><b>If you do not wish to use your cell, please inform the manager</b></li>" +
                                 "<li class='pagoda-chit-instr'><b>Please contact manager if you can't find the cell</b></li>" +
                                 "<li class='pagoda-chit-instr'><b>Be sure to read the Pagoda Guidelines</b></li>" +
                                 "<li class='pagoda-chit-instr'><b>Please be in the meditation hall for all the group sittings, instructions and discourses</b></li>" +
                                 "</ul>" +
                                 "</div>"
        ),

        chitTemplateOld: _.template("<div class='pagoda-chit old'>" +
                                    "<div class='pagoda-chit-student-name'><%=student.firstName%>&nbsp;<%=student.secondName%>,&nbsp;&nbsp;<%=student.label%></div>" +
                                    "<div class='pagoda-chit-usage-text'>You may use cell# <b><%=student.cell%></b></div>" +
                                    "<ul>" +
                                    "<li class='pagoda-chit-instr'><b>If you do not wish to use your cell, please inform the manager</b></li>" +
                                    "<li class='pagoda-chit-instr'><b>Please contact manager if you can't find the cell</b></li>" +
                                    "<li class='pagoda-chit-instr'><b>Be sure to read the Pagoda Guidelines posted at the entrance to the cell area</b></li>" +
                                    "<li class='pagoda-chit-instr'><b>Please be in the meditation hall for all the group sittings, instructions, old student checkings, and from <b>6-9 PM</b></li>" +
                                    "</ul>" +
                                    "</div>"
        ),

        tableTemplate: _.template("<div class='pagoda-table'>" +
                                  "<div class='pagoda-row-header'>" +

                                  "<div class='pagoda-col-header name'>" +
                                  "Name" +
                                  "</div>" +

                                  "<div class='pagoda-col-header cell'>" +
                                  "Cell No" +
                                  "</div>" +

                                  "<div class='pagoda-col-header'>" +
                                  "Time to use" +
                                  "</div>" +
                                  "</div>" +

                                  "<% _.each(masterList, function(student, index) { %>" +

                                  "<div class='pagoda-row'>" +

                                  "<div class='pagoda-col name'>" +
                                  "<%=student.student.firstName%>  " +
                                  "<%=student.student.secondName%>" +
                                  "</div>" +

                                  "<div class='pagoda-col cell'>" +
                                  "<%=student.student.cell%>" +
                                  "</div>" +

                                  "<div class='pagoda-col'>" +
                                  "<%if(student.student.share == 'AM') {%>" +
                                  "AM" +
                                  "<%} else if (student.student.share == 'PM') {%>" +
                                  "PM" +
                                  "<%} else if (student.student.share == '67') {%>" +
                                  "6, 7" +
                                  "<%} else if (student.student.share == '89') {%>" +
                                  "8, 9" +
                                  "<%} else {%>" +
                                  "AM, PM" +
                                  "<% } %>" +
                                  "</div>" +
                                  "</div>" +
                                  "<%});%>" +
                                  "</div>"
        )
    };

    Pagodawalla.prototype.init = function() {
        var pagodawalla = this;
        language = localStorage.getItem["seatwalla_language"] || "ENGLISH";

        pagodawalla.initCenterList();

        $(".pagoda-help").click(function() {
            $(".pagoda-help-content").show();
        });

        $(".pagoda-help-hide").click(function() {
            $(".pagoda-help-content").hide();
        });
        $(".pagoda-flip").click(function() {
            $(".pagoda-flip").hide();
            $(".pagoda-unflip").show();
            $(".pagoda-cell").addClass("seatwalla-seat-container-flip");
        });

        $(".pagoda-unflip").click(function() {
            $(".pagoda-flip").show();
            $(".pagoda-unflip").hide();
            $(".pagoda-cell").removeClass("seatwalla-seat-container-flip");
        });

        //pagodawalla.showStudentList();

    };

    Pagodawalla.prototype.initCenterList = function() {
        var pagodawalla = this;
        var options = pagodawalla.options;

        var centerList = _.keys(pagodaData);
        var $pagodaCenterList = $(options.pagodaCenterListTemplate({centerList: centerList}));
        $(".pagoda-center-select").empty();
        $(".pagoda-center-select").append($pagodaCenterList);
    };

    Pagodawalla.prototype.unassignedStudents = function() {
        var pagodawalla = this;
        var options = pagodawalla.options;

        var studentsNotAssigned = _.filter(options.studentData, function(student) {
            if (student.cell == "") {
                return true;
            }
            else {
                return false;
            }
        });

        return studentsNotAssigned;
    };

    Pagodawalla.prototype.findCellForStudent = function(firstName) {
        var pagodawalla = this;
        var cell = $(".pagodawalla-first-name:contains('" + firstName + "')");
        return cell;
    };

    Pagodawalla.prototype.updateSeat = function(student) {
        var pagodawalla = this;
        var cell = $(".pagodawalla-first-name:contains('" + firstName + "')");
        return cell;
    };

    Pagodawalla.prototype.initData = function(inoptions) {
        var pagodawalla = this;
        var options = pagodawalla.options;

        _.extend(options, inoptions);

        $(".pagoda-chart").empty();

        $(".pagoda-student-list").empty();

        pagodawalla.updateStudentList();

        var students = $(".pagoda-student-list-item");

        pagodawalla.drawFloors();
        pagodawalla.updatePagoda();

        pagodawalla.showFloor("3");

        var selectedStudents = [];

        pagodawalla.updateStudentList(inoptions);
        var studentName = $(".pagoda-student-search-text").val();

        $(".pagoda-student-search-text").keyup(function(event) {
            var studentName = $(".pagoda-student-search-text").val();
            options = pagodawalla.options;
            var studentsNotAssigned = pagodawalla.unassignedStudents();
            if (studentName) {
                selectedStudents = _.filter(studentsNotAssigned, function(student) {

                    console.log(studentName + " -- student in list  ----" + student.firstName + " , cell, " +
                                student.cell);
                    var cellForStudent = pagodawalla.findCellForStudent(student.firstName);

                    if ((cellForStudent.length == 0) &&
                        (student.firstName) &&
                        (student.firstName.toLowerCase().indexOf(studentName.toLowerCase()) != -1)) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });


            }
            else {
                selectedStudents = studentsNotAssigned;
            }

            pagodawalla.updateStudentList(inoptions, selectedStudents);

        });

        _.each(students, function(student, index) {
            var $student = $(student);
            pagodawalla.bindStudentEvent($student);

        });
    };

    Pagodawalla.prototype.bindStudentEvent = function($student) {
        $student.bind("dragstart", function(event) {
            var target = $(event.target);

            var label = target.attr("data-label");
            event.originalEvent.dataTransfer.setData("label", label);
        });

        $student.bind("dragover", function(event) {
            console.log("dragover");
            event.preventDefault();
        });
    }

    Pagodawalla.prototype.updatePagoda = function() {
        var pagodawalla = this;

        var options = pagodawalla.options;
        var students = options.studentData;
        pagodawalla.assignedStudent = [];
        _.each(students, function(student, index) {
            if (student.cell) {
                pagodawalla.assignedStudent.push(student);
                var $student = $(".pagoda-student-list-item[data-label='" + student.label + "']");
                $student.remove();
                pagodawalla.updateCell(student);
            }
        });
    };

    Pagodawalla.prototype.drawFloors = function() {
        var pagodawalla = this;
        var options = pagodawalla.options;

        var center = options.centerName
        var floor = $(".pagoda-levels-select").val();
        var gender = options.gender;

        var pagodaObject = options.pagodaData;
        var pagodaD = pagodaObject[center][gender][floor];

        var pagodaD = pagodaObject[center][gender];

        //update the floors in the selection list
        var numFloors = pagodaObject[center][gender];
        if (_.size(numFloors) == 2) {
            $(".pagoda-levels-select option[value='2']").remove();
        }
        _.each(pagodaD, function(floor, key) {
            pagodawalla.drawFloor(key, floor);
        });

    };

    Pagodawalla.prototype.showFloor = function(floorNo) {
        var pagodawalla = this;

        if (floorNo == "3") {
            $(".pagoda-floor").show();
            $(".pagoda-floor-title").show();
        }
        else {
            $(".pagoda-floor").hide();
            $(".pagoda-floor-title").hide();
            $(".pagoda-floor[data-floor='" + floorNo + "']").css("display", "block");
            $(".pagoda-floor-title[data-floor='" + floorNo + "']").css("display", "block");
        }
    };

    Pagodawalla.prototype.drawFloor = function(floorNo, floorData) {
        var pagodawalla = this;
        var options = pagodawalla.options;
        var rows = parseInt(floorData.rows);
        var columns = parseInt(floorData.columns);
        var cells = floorData.cells;
        var floorTitle;
        if (floorNo == "2") {
            floorTitle = "Basement";
        }
        else if (floorNo == "1") {
            floorTitle = "Ground";
        }
        else if (floorNo == "0") {
            floorTitle = "Top";
        }
        else if (floorNo == "3") {
            floorTitle = "All Floors"
        }

        var $pagodaFloorTitle = "<div class='pagoda-floor-title' data-floor='" + floorNo + "'>" +
                                floorTitle + "</div>";
        $(".pagoda-chart").append($pagodaFloorTitle);

        var $pagodaFloor = "<div class='pagoda-floor' data-floor='" + floorNo + "'></div>";
        $(".pagoda-chart").append($pagodaFloor);

        $pagodaFloor = $(".pagoda-floor[data-floor='" + floorNo + "']");

        var cellWidth = 100 / columns; //$(".pagoda-chart").width() / columns;
        options.cellWidth = cellWidth;
        var student = {};
        student.firstName = "";
        student.secondName = "";
        student.age = "";
        student.text = "";
        student.cell = "";
        //var imgSrc = options.imgSrc;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < columns; c++) {
                var cell = (cells[r][c]);

                var $cell = $(options.pagodaEmptyCellTemplate({cell: cell, student: student}));
                $cell.css({ width: cellWidth + "%", height: options.cellHeight + "px"});

                $pagodaFloor.append($cell);
                pagodawalla.bindCellEvents($cell);
            }
        }
    };

    Pagodawalla.prototype.bindCellEvents = function($cell) {
        var pagodawalla = this;
        $cell.bind('dragover', function(event) {
            event.preventDefault();
        });

        // to get IE to work
        $cell.bind('dragenter   r', function(event) {
            return false;
        });

        $cell.bind('dragleave', function() {

        });
        $cell.bind("drop", function(event) {

            var label = event.originalEvent.dataTransfer.getData("label");
            var student = pagodawalla.getStudentWithLabel(label);

            var target = $(event.target);
            var $pagodaCell = target.closest(".pagoda-cell");
            var isShared = $pagodaCell.hasClass("pagoda-shared-cell");
            if (!isShared) {
                var cell = $pagodaCell.attr("data-cell");//parseInt($pagodaCell.attr("data-cell"));
                var cellLabel = $pagodaCell.attr("data-label");
                //if (cell != -1 && cellLabel.length == 0) {
                student.cell = cell;
                pagodawalla.updateCell(student);
                var $student = $(".pagoda-student-list-item[data-label='" + student.label + "']");
                $student.remove();
                console.log("removed  " + student.firstName + "  from student list");
            }
            //}
        });

        $cell.find(".seatwalla-delete").click(function(event) {
            pagodawalla.removeStudent(event);
        });
    };

    Pagodawalla.prototype.getStudentWithLabel = function(label) {
        var pagodawalla = this;
        var studentData = pagodawalla.options.studentData;
        var studentWithLabel = {};
        _.each(studentData, function(student, index) {
            if (student.label == label) {
                studentWithLabel = student;
                return;
            }
        });

        return studentWithLabel;
    };

    Pagodawalla.prototype.removeStudent = function(event) {
        var pagodawalla = this;

        var r = confirm(translation[language].CONFIRM_PAGODA_CELL_DELETE);
        if (r == true) {

            var $target = $(event.target);
            var $cell = $target.closest(".pagoda-shared-cell-content");
            if ($cell.length == 0) {
                $cell = $target.closest(".pagoda-cell-content");
            }

            pagodawalla.cancelAssignment($cell);
        }
    };

    Pagodawalla.prototype.cancelAssignment = function($cell) {
        var pagodawalla = this;
        var options = pagodawalla.options;
        var student = null;
        var $pagodaCell = $cell.closest(".pagoda-cell");

        var label = $cell.attr("data-label");
        var isShared = $pagodaCell.hasClass("pagoda-shared-cell");
        var cell = $pagodaCell.attr("data-cell");
        var width = $pagodaCell.outerWidth();

        if (label.length > 0) {
            var student;
            if (isShared) {
                $cellToDelete = $cell; //$target.closest(".pagoda-shared-cell");
                var deleteLabel = $cellToDelete.attr("data-label");

                var deletedStudent = pagodawalla.getStudentWithLabel(deleteLabel);
                console.log("delete " + deletedStudent.firstName);


                var sharedCells = $pagodaCell.find(".pagoda-shared-cell-content");
                if (sharedCells.length == 2) {
                    var label0 = $(sharedCells[0]).attr("data-label");
                    var label1 = $(sharedCells[1]).attr("data-label");
                    var label = label1;
                    if (label1 == deleteLabel) {
                        label = label0;
                    }

                    student = pagodawalla.getStudentWithLabel(label);

                    var $pagodaCell = $cell.closest(".pagoda-cell");
                    $cell = $pagodaCell.replaceWith($(options.pagodaEmptyCellTemplate({cell: cell, student: student})));
                    $cell = $(".pagoda-cell[data-label='" + label + "']");
                    $cell.css({ width: options.cellWidth + "%", height: options.cellHeight + "px"});
                    pagodawalla.bindCellEvents($cell);
                    console.log("keep " + student.firstName);

                    var $studentItem = $(options.pagodaStudentListItemTemplate({student: deletedStudent}));
                    pagodawalla.bindStudentEvent($studentItem);
                    $(".pagoda-student-list").prepend($studentItem);
                }
            }
            else {
                student = pagodawalla.getStudentWithLabel(label);
                student.cell = "";

                $cell.find(".pagodawalla-first-name").text("");
                $cell.find(".pagodawalla-second-name").text("");
                $cell.find(".seatwalla-label").text("");
                $cell.find(".seatwalla-seat-text").text("");
                $cell.attr("data-label", "");

                var $pagodaCell = $cell.closest(".pagoda-cell");
                $pagodaCell.attr("data-label", "");

                var $seatCell = $(".seatwalla-cell[data-label='" + student.label + "']");
                $seatCell.text("");

                var $studentItem = $(options.pagodaStudentListItemTemplate({student: student}));
                $(".pagoda-student-list").prepend($studentItem);
                console.log("added  " + student.firstName + "  to student list");
                pagodawalla.bindStudentEvent($studentItem);
            }

            pagodawalla.removeFromPrintList(student);
            pagodawalla.removeFromMasterList(student);
        }
    }
    ;

    Pagodawalla.prototype.updateCell = function(student) {
        var pagodawalla = this;
        var options = pagodawalla.options;
        var $pagodaCell = $(".pagoda-cell[data-cell='" + student.cell + "']");
        var label = $pagodaCell.attr("data-label");
        var existingStudent;
        if (label.length > 0) {
            existingStudent = pagodawalla.getStudentWithLabel(label);
        }

        if (pagodawalla.isCellOccupied(student)) {
            var $sharedQuestionaire = $(options.sharedCellQueryTemplate());
            var offset = $pagodaCell.offset();
            $("body").find(".pagoda-shared-cell-questionaire").remove();
            $("body").append($sharedQuestionaire);
            $("body").find(".pagoda-shared-cell-questionaire").css({top: offset.top + 20, left: offset.left + 20});
            student.share = "AM";
            existingStudent.share = "PM";

            if (existingStudent.share) {
                if (existingStudent.share == "AM") {
                    $(".pagoda-shared-cell-radio-pm").prop("checked", true);
                }
                else if (existingStudent.share == "PM") {
                    $(".pagoda-shared-cell-radio-am").prop("checked", true);
                }
                else if (existingStudent.share == "67") {
                    $(".pagoda-shared-cell-radio-89").prop("checked", true);
                }
                else if (existingStudent.share == "89") {
                    $(".pagoda-shared-cell-radio-67").prop("checked", true);
                }
            }
            else {
                $(".pagoda-shared-cell-radio-pm").prop("checked", true);
            }

            $(".pagoda-share-ok").bind("click", function() {
                pagodawalla.shareCell(student.cell, existingStudent, student);
                printList.push(student);
                pagodawalla.addToMasterList(student);
                $("body").find(".pagoda-shared-cell-questionaire").remove();
            });
            $(".pagoda-share-cancel").bind("click", function() {
                $("body").find(".pagoda-shared-cell-questionaire").remove();

            });

            $("input[name='pagoda-shared-cell-radio']").bind("click", function(event) {
                var val = $(event.target).val();
                if (val == "AM") {
                    student.share = "AM";
                    existingStudent.share = "PM";
                }
                else if (val == "PM") {
                    student.share = "PM";
                    existingStudent.share = "AM";
                }
                else if (val == "67") {
                    student.share = "67";
                    existingStudent.share = "89";
                }
                else if (val == "89") {
                    student.share = "89";
                    existingStudent.share = "67";
                }
            });
        }
        else {

            $pagodaCell.attr("data-label", student.label);
            $pagodaCell.find(".pagoda-cell-content").attr("data-label", student.label);
            $pagodaCell.find(".pagodawalla-first-name").text(student.firstName);
            $pagodaCell.find(".pagodawalla-second-name").text(student.secondName);
            $pagodaCell.find(".seatwalla-label").text(student.label);
            var $cell = $(".seatwalla-cell[data-label='" + student.label + "']");
            $cell.text(student.cell);
            $cell.css("display", "inline-block");
            student.share = "None";
            printList.push(student);
            pagodawalla.addToMasterList(student);
        }

    };

    Pagodawalla.prototype.addToMasterList = function(student) {
        var pagodawalla = this;
        var data = {};
        data["name"] = student.firstName + student.secondName + student.label;
        data["student"] = student;
        pagodawalla.removeFromMasterList(student);
        masterList.push(data);
    };

    Pagodawalla.prototype.removeFromMasterList = function(student) {
        var data = {};
        data["name"] = student.firstName + student.secondName + student.label;
        data["student"] = student;

        masterList = _.reject(masterList, function(studentData) {
            if (studentData.name == data.name) {
                return true;
            }
        });
    };

    Pagodawalla.prototype.removeFromPrintList = function(student) {
        printList = _.reject(printList, function(s) {
            if (s.firstName == student.firstName && s.secondName == student.secondName &&
                s.label == student.label) {
                return true;
            }
        });
    };

    Pagodawalla.prototype.showChits = function(opt) {
        var pagodawalla = this;
        var options = pagodawalla.options;
        var $chitView = $(".pagoda-chit-print");
        $chitView.empty();
        if (printList.length == 0) {
            $chitView.append($("<span>There are no students assigned to print</span>"));
        }
        else {
            if (printList.length % 2 != 0) {
                printList.push({});
            }
            var table = "<table width=100%>";
            _.each(printList, function(student, index) {
                if (index % 2 == 0) {
                    table += "<tr>";
                }
                table += "<td>";
                if (_.isEmpty(student)) {
                    table += "";
                }
                else {
                    if (student.share  == "None") {
                        table += options.chitTemplateOld({student: student});
                    }
                    else {
                        table += options.chitTemplate({student: student});
                    }
                }

                table += "</td>";
                if (index % 2 == 1) {
                    table += "</tr>"
                }
            });
            table += "</table>";

            $chitView.append($(table));
        }
    };

    Pagodawalla.prototype.showTable = function(options) {
        var pagodawall = this;
        var pagodawalla = this;
        var options = pagodawalla.options;
        var $tableView = $(".pagoda-table-print");
        $tableView.empty();
        if (masterList.length == 0) {
            $tableView.append($("<span>There are no students assigned to print</span>"));
        }
        else {
            masterList = _.sortBy(masterList, function(student) {
                return student.student.firstName;
            });

            for (var i = 0; i < masterList.length; i += NUM_TABLE_ROWS) {
                var list = masterList.slice(i, i + NUM_TABLE_ROWS);
                var $table = $(options.tableTemplate({masterList: list}));
                $tableView.append($table);
            }
        }
    };

    Pagodawalla.prototype.isCellOccupied = function(student) {
        var pagodawalla = this;
        var $pagodaCell = $(".pagoda-cell[data-cell='" + student.cell + "']");
        var label = $pagodaCell.attr("data-label");
        if (label && label.length > 0) {
            return true;
        }
        else {
            return false;
        }
    };

    Pagodawalla.prototype.shareCell = function(cell, existingStudent, student) {
        var pagodawalla = this;
        var options = pagodawalla.options;
        var $pagodaCell = $(".pagoda-cell[data-cell='" + student.cell + "']");
        $pagodaCell.empty();
        $pagodaCell.addClass("pagoda-shared-cell");

        existingStudent.time = timeMappings[existingStudent.share];
        var $sharedCell = $(options.pagodaSharedCellTemplate({cell: cell, student: existingStudent}));
       // $sharedCell.css({ width: options.cellWidth + "%"});
        $pagodaCell.append($sharedCell);

        var $seat = $(".seatwalla-cell[data-label='" + existingStudent.label + "']");
        $seat.text(existingStudent.cell + " " + existingStudent.time);

        $sharedCell.find(".seatwalla-delete").click(function(event) {
            pagodawalla.removeStudent(event);
        });

        student.time = timeMappings[student.share];
        var $cell = $(options.pagodaSharedCellTemplate({cell: cell, student: student}));
       // $cell.css({ width: options.cellWidth + "%"});

        if (student.share == "AM" || student.share == "67") {
            $pagodaCell.prepend($cell);
        }
        else {
            $pagodaCell.append($cell);
        }

        var $seat = $(".seatwalla-cell[data-label='" + student.label + "']");
        $seat.text(student.cell + " " + student.time);
        $seat.css("display", "inline-block");

        $cell.find(".seatwalla-delete").click(function(event) {
            pagodawalla.removeStudent(event);
        });
    };

    Pagodawalla.prototype.showPagoda = function() {
        var pagodawalla = this;
        pagodawalla.showFloor("ALL");
    };

    Pagodawalla.prototype.clearPrintList = function() {
        var pagodawalla = this;
        var $chitView = $(".pagoda-chit-print");
        $chitView.empty();

     /*   printList = [];
        var $chitView = $(".pagoda-chit-print");
        var $tableChitView = $(".pagoda-chit-print table");
        $tableChitView.css("display", "none");
        var chitHtml = $chitView.html();
        $chitView.empty();
        $(".pagoda").append("<div class='pagoda-chit-previous'>Previous</div>");
        $(".pagoda-chit-previous").append($(chitHtml));
        $(".pagoda-chit-previous").bind("click", function(){
            pagodawalla.showPreviousList();
        });*/
    };

    Pagodawalla.prototype.showPreviousList = function() {
        var $chitView = $(".pagoda-chit-print");
        var $tableChitView = $(".pagoda-chit-previous table");
        $tableChitView.css("display", "table");
        //$chitView.prepend();
    };

    Pagodawalla.prototype.updateStudentList = function(inoptions, selectedStudents) {
        var pagodawalla = this;
        var studentsNotAssigned = selectedStudents;
        var options = pagodawalla.options;
        if (!studentsNotAssigned) {
            if (inoptions) {
                pagodawalla.options.studentData = inoptions.studentData;
            }
            studentsNotAssigned = pagodawalla.unassignedStudents();
        }

        var $studentContainer = $(options.pagodaStudentListTemplate({students: studentsNotAssigned}));
        $(".pagoda-student-list").empty().append($studentContainer);
        students = $(".pagoda-student-list-item");
        _.each(students, function(student, index) {
            var $student = $(student);
            pagodawalla.bindStudentEvent($student);
        });
    };

    Pagodawalla.prototype.execute = function(method, options) {

        var pagodawalla = this;
        if (method == "init") {
            pagodawalla.init(options);
        }
        else if (method == "initData") {
            pagodawalla.initData(options);
        }
        else if (method == "showPagoda") {
            pagodawalla.showPagoda(options);
        }
        else if (method == "showFloor") {
            pagodawalla.showFloor(options);
        }
        else if (method == "showChits") {
            pagodawalla.showChits(options);
        }
        else if (method == "showTable") {
            pagodawalla.showTable(options);
        }
        else if (method == "clearPrintList") {
            pagodawalla.clearPrintList();
        }
        else if (method == "updateStudentList") {
            pagodawalla.updateStudentList(options);
        }
        else if (method == "cancelAssignment") {
            pagodawalla.cancelAssignment(options.$cell);
        }
    };

    $.fn.pagoda = function(method, options) {
        var $this = this;

        $this.each(function() {
            var el = this;
            var $el = $(el);
            var widget = $el.data("pagoda");
            console.log("init pagoda");

            if (widget) {
                widget.execute(method, options);
            }
            else {
                options = method;
                widget = new Pagodawalla(el, options);
                $el.data("pagoda", widget);
            }
        });

        return $this;
    };

})
    (jQuery);
