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
        pagodaEmptyCellTemplate: _.template("<div class='pagoda-cell' data-cellNo='<%=cellNo%>' data-label='<%=student.label%>'>" +
                                            "<div class='pagoda-cell-content'>" +
                                            "<div class='seatwalla-delete'><i class='icon-kub-remove'></i></div>" +
                                            "<%if(cellNo != -1) {%>" +
                                            "<span class='pagodawalla-cellNo'><%=cellNo%></span>" +
                                            "<%}%>" +
                                            "<div class='pagoda-cell-content-data'>" +
                                            "<span class='pagodawalla-first-name'><%=student.firstName%></span>" +
                                            "<div class='pagodawalla-second-name'><%=student.secondName%></div>" +
                                            "<div class='seatwalla-label'><%=student.label%></div>" +
                                            "<div class='seatwalla-seat-text' type='text'><%=student.text%></div>" +
                                            "</div>" +
                                            "</div>" +
                                            "</div>"),
        pagodaCellContentTemplate: _.template(""),
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

        pagodaSharedCellTemplate: _.template("<div class='pagoda-shared-cell-content'>" +
                                             "<div class='seatwalla-delete'><i class='icon-kub-remove'></i></div>" +
                                             "<%if(cellNo != -1) {%>" +
                                             "<span class='pagodawalla-cellNo'><%=cellNo%></span>" +
                                             "<%}%>" +
                                             "<div class='pagoda-cell-content-data'>" +
                                             "<span class='pagodawalla-first-name'><%=student.firstName%></span>" +
                                             "<div class='pagodawalla-second-name'><%=student.secondName%></div>" +
                                             "<div class='seatwalla-label'><%=student.label%></div>" +
                                             "<div class='seatwalla-seat-text' type='text'><%=student.text%></div>" +
                                             "</div>" +
                                             "</div>"),

        sharedCellQueryTemplate: _.template("<div class='pagoda-shared-cell-questionaire'>" +
                                            "<div class='pagoda-shared-cell-question'>" +
                                            "Do you want to share the cell?" +
                                            "</div>" +

                                            "<div class='pagoda-shared-cell-options'>" +
                                            "<input type='radio' name='pagoda-shared-cell-radio-am'  value='AM' checked />" +
                                            "<div class='pagoda-shared-cell-radio-am-label'>AM</div>" +
                                            "<input type='radio' name='pagoda-shared-cell-radio-pm'  value='PM' checked />" +
                                            "<div class='pagoda-shared-cell-radio-pm-label'>PM</div>" +
                                            "</div>" +


                                            "<div class='pagoda-shared-cell-options'>" +
                                            "<input type='checkbox' name='pagoda-shared-cell-days' type='checkbox' VALUE='5'/>" +
                                            "<input type='checkbox' name='pagoda-shared-cell-days' type='checkbox' VALUE='6'/>" +
                                            "<input type='checkbox' name='pagoda-shared-cell-days' type='checkbox' VALUE='7'/>" +
                                            "<input type='checkbox' name='pagoda-shared-cell-days' type='checkbox' VALUE='8'/>" +
                                            "<input type='checkbox' name='pagoda-shared-cell-days' type='checkbox' VALUE='9'/>" +
                                            "</div>" +
                                            "</div>"
        )
    };

    Pagodawalla.prototype.init = function() {
        var pagodawalla = this;

        pagodawalla.initCenterList();

        $(".pagoda-help").click(function() {
            $(".pagoda-help-content").show();
        });

        $(".pagoda-help-hide").click(function() {
            $(".pagoda-help-content").hide();
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

    Pagodawalla.prototype.initData = function(inoptions) {
        var pagodawalla = this;
        var options = pagodawalla.options;

        _.extend(options, inoptions);

        $(".pagoda-chart").empty();

        $(".pagoda-student-list").empty();
        var $studentContainer = $(options.pagodaStudentListTemplate({students: options.studentData}));
        $(".pagoda-student-list").append($studentContainer);

        var students = $(".pagoda-student-list-item");

        pagodawalla.drawFloors();
        pagodawalla.updatePagoda();

        pagodawalla.showFloor("3");

        var selectedStudents = [];
        var studentName = $(".pagoda-student-search-text").val();

        $(".pagoda-student-search-text").keyup(function(event) {
            var studentName = $(".pagoda-student-search-text").val();
            if (studentName) {
                selectedStudents = _.filter(options.studentData, function(student) {

                    if ((student.cell.length == 0) && student.firstName &&
                        student.firstName.toLowerCase().indexOf(studentName.toLowerCase()) >= 0) {
                        return true;
                    }
                    else {
                        return false;
                    }
                });
            }
            else {
                selectedStudents = options.studentData;
            }
            $(".pagoda-student-list").empty();
            var $studentContainer = $(options.pagodaStudentListTemplate({students: selectedStudents}));
            $(".pagoda-student-list").append($studentContainer);
            students = $(".pagoda-student-list-item");
            _.each(students, function(student, index) {
                var $student = $(student);
                pagodawalla.bindStudentEvent($student);

            });
        });

        _.each(students, function(student, index) {
            var $student = $(student);
            pagodawalla.bindStudentEvent($student);

        });
    }
    ;

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
        var student = {};
        student.firstName = "";
        student.secondName = "";
        student.age = "";
        student.text = "";
        student.cell = "";
        //var imgSrc = options.imgSrc;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < columns; c++) {
                var cellNo = parseInt(cells[r][c]);

                var $cell = $(options.pagodaEmptyCellTemplate({cellNo: cellNo, student: student}));
                $cell.css({ width: cellWidth + "%", height: options.cellHeight + "px"});

                $pagodaFloor.append($cell);
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
                    var cellNo = parseInt($pagodaCell.attr("data-cellNo"));
                    var cellLabel = $pagodaCell.attr("data-label");
                    //if (cellNo != -1 && cellLabel.length == 0) {
                        student.cell = cellNo;
                        pagodawalla.updateCell(student);
                        var $student = $(".pagoda-student-list-item[data-label='" + student.label + "']");
                        $student.remove();
                        console.log("removed  " + student.firstName + "  from student list");
                    //}
                });

                $cell.find(".seatwalla-delete").click(function(event) {
                    pagodawalla.removeStudent(event);
                });
            }
        }
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

        var $target = $(event.target);
        var $cell = $target.closest(".pagoda-cell");
        var options = pagodawalla.options;

        var label = $cell.attr("data-label")
        if (label.length > 0) {
            var student = pagodawalla.getStudentWithLabel(label);
            student.cell = "";

            $cell.find(".pagodawalla-first-name").text("");
            $cell.find(".pagodawalla-second-name").text("");
            $cell.find(".seatwalla-label").text("");
            $cell.find(".seatwalla-seat-text").text("");
            $cell.attr("data-label", "");

            var $seatCell = $(".seatwalla-cell[data-label='" + student.label + "']");
            $seatCell.text("");

            var $studentItem = $(options.pagodaStudentListItemTemplate({student: student}));
            $(".pagoda-student-list").prepend($studentItem);
            console.log("added  " + student.firstName + "  to student list");
            pagodawalla.bindStudentEvent($studentItem);
        }

    };

    Pagodawalla.prototype.updateCell = function(student) {
        var pagodawalla = this;

        if (pagodawalla.isCellOccupied(student.cell)) {
            //var $sharedQuertionaire = $(options.sharedCellQueryTemplate());
           // $("body").append($sharedQuestionaire);

           // var student.ampm = "AM";
           // $(".pagoda-shared-cell-radio-am").bind("click", function() {student.ampm = "AM"});
            //$(".pagoda-shared-cell-radio-pm").bind("click", function() {student.ampm = "PM"});


            var r = confirm("Do you want to share the cell?");
            if (r == true) {
                pagodawalla.shareCell(student.cell, student);
            }
        }


        var $pagodaCell = $(".pagoda-cell[data-cellNo='" + student.cell + "']");
        $pagodaCell.attr("data-label", student.label);
        $pagodaCell.find(".pagodawalla-first-name").text(student.firstName);
        $pagodaCell.find(".pagodawalla-second-name").text(student.secondName);
        $pagodaCell.find(".seatwalla-label").text(student.label);
        var $cell = $(".seatwalla-cell[data-label='" + student.label + "']");
        $cell.text(student.cell);
        $cell.css("display", "inline-block");
    };

    Pagodawalla.prototype.isCellOccupied = function(cellNo) {
        var pagodawalla = this;
        var $pagodaCell = $(".pagoda-cell[data-cellNo='" + student.cell + "']");
        var label = $pagodaCell.attr("data-label");
        if (label && label.length > 0) {
            return true;
        }
        else {
            return false;
        }
    },

        Pagodawlla.prototype.shareCell = function(cellNo, student) {
            var $pagodaCell = $(".pagoda-cell[data-cellNo='" + student.cell + "']");
            existingStudentLabel = $pagodaCell.attr("data-label", student.label);
            existingStudent = getStudentWithLabel(existingStudentLabel);
            $pagodaCell.$(".pagoda-cell-content").addClass("pagoda-shared-cell-content");
            var $cell = $(options.pagodaSharedCellTemplate({cellNo: cellNo, student: student}));
            $cell.css({ width: options.cellWidth + "%", height: options.cellHeight + "px"});
            $pagodaCell.append($cell);
        },

        Pagodawalla.prototype.showPagoda = function() {
            var pagodawalla = this;
            pagodawalla.showFloor("ALL");
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
    };

    $.fn.pagoda = function(method, options) {
        var $this = this;

        $this.each(function() {
            var el = this;
            var $el = $(el);
            var widget = $el.data("pagoda");

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
