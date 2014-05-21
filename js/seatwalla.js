/**
 * Created with IntelliJ IDEA.
 * User: ujwalakhante
 * Date: 6/15/13
 * Time: 8:52 PM
 * To change this template use File | Settings | File Templates.
 */

(function($) {
    var Seatwalla = function(el, options) {
        options = options instanceof Object ? options : {};
        _.defaults(options, this.defaults);
        this.options = options;
        this.el = el;
        this.$el = $(el);
        this.init();
    };

    Seatwalla.prototype.defaults = {
        studentData: [],
        numCols: 10,
        seatHeight: 100,
        widthUnits: "%"
    };

    Seatwalla.prototype.init = function() {
        var seatwalla = this;

        $(".seatwalla-help").click(function() {
            $(".seatwalla-help-content").show();
        });

        $(".seatwalla-help-hide").click(function() {
            $(".seatwalla-help-content").hide();
        });
    }

    Seatwalla.prototype.readFile = function() {
        var seatwalla = this;
        var options = this.options;

        var files = $("#files").get(0).files;

        if (!files.length) {
            alert('Please select a file!');
            return;
        }

        var file = files[0];

        var fileName = file.name;
        var firstUnderscore = fileName.indexOf("_");
        var fileNameTrim = fileName.substring(firstUnderscore + 1);
        var secondUnderscore = fileNameTrim.indexOf("_");
        options.centerName = fileNameTrim.substring(0, secondUnderscore);

        var reader = new FileReader();

        // If we use onloadend, we need to check the readyState.
        reader.onloadend = function(evt) {
            if (evt.target.readyState == FileReader.DONE) { // DONE == 2
                //String s = evt.target.result;

                var temp = [];

                temp = evt.target.result.split(/\r\n|\r|\n/g);

                var data = [];
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i] && temp[i].length > 0) {
                        var stdData = temp[i].split(",");
                        data[i] = {};
                        seatwalla.chopName(data[i], stdData[0]);
                        data[i].pin = false;

                        if (seatwalla.isBlank(data[i].firstName)) {
                            data[i].space = true;

                        }
                        else {
                            data[i].space = false;
                            data[i]["age"] = stdData[1];

                            data[i]["num"] = stdData[2];

                            if (parseInt(stdData[2]) > 0) {
                                data[i]["old"] = true;
                            }
                            else {
                                data[i]["old"] = false;
                            }
                        }

                        if (stdData.length > 3) {
                            //do more
                        }
                    }
                }

                options.studentData = data;
                options.originalData = _.clone(data);
                options.totalStudent = data.length;
            }
        };

        reader.readAsBinaryString(file);
    };

    Seatwalla.prototype.setDimensions = function(first) {
        var seatwalla = this;
        var options = seatwalla.options;

        //console.log("set dimensions " + first);

        if (first) {
            if (options.addSideBackRows) {
                options.seatInRow = parseInt(options.numCols) + 1;
            }
            else {
                options.seatInRow = parseInt(options.numCols);
            }
            options.totalRows = Math.ceil(options.totalStudent / options.numCols); //this is without left row still

            if (options.addSideBackRows) {
                options.totalRows = options.totalRows + 1;
            }
        }
        else {

            options.totalStudent = seatwalla.getTotalElements();
            options.totalRows = Math.ceil(options.totalStudent / options.seatInRow); //this is without left row still

            var oldRows = options.totalRows;

            options.totalRows = Math.ceil(options.totalStudent / options.seatInRow);

        }

        var hallWidth = $(".seatwalla-hall").outerWidth();

        //if (first) {
        options.seatWidth = hallWidth / options.seatInRow;
        console.log("width is set to " + options.seatWidth);
        if (options.widthUnits == "%") {
            options.seatWidth = ((options.seatWidth + 1) / hallWidth) * 100;
        }
        //}
        var ht = (options.totalRows) * options.seatHeight + "px";

        $(".seatwalla-hall").css({"height": ht});

        var lastIndex = seatwalla.getLastIndex();

        if (!first && lastIndex) {
            var $lastSeat = seatwalla.getElementAt(lastIndex);
            var lastPos = $lastSeat.position();

            //console.log("set dimensions " + lastIndex + " top  " + lastPos.top);

            if (Math.floor(lastPos.top) < 0) {
                seatwalla.moveAllRowsToStart("DOWN");
            }
            else if (Math.floor(lastPos.top) > 0) {
                seatwalla.moveAllRowsToStart("UP");
            }
        }
    };

    Seatwalla.prototype.moveAllRowsToStart = function(direction) {
        var seatwalla = this;
        var options = seatwalla.options;
        var delta = 0;
        if (direction === "UP") {

            delta = -options.seatHeight;

        }
        else if (direction === "DOWN") {
            delta = options.seatHeight;
        }

        var seats = $(".seatwalla-seat");
        console.log("moving " + seats.length + "  " + direction)
        _.each(seats, function(seat) {
            var pos = $(seat).position();
            var newTop = pos.top + delta;
            $(seat).css({"top": newTop + "px"});
        });

    };

    Seatwalla.prototype.isBlank = function(name) {
        if (name === "__BLANK__") {
            return true;
        }
        return false;
    };

    Seatwalla.prototype.chopName = function(data, name) {
        var noQuoteName = name;
        if (name[0] == "\"") {
            noQuoteName = name.substring(1, name.length - 1);
        }
        var names = noQuoteName.split(" ");
        data.firstName = names[0];
        data.secondName = names[1];
    };

    Seatwalla.prototype.getSeatInfoFromIndex = function(index) {
        var options = this.options;
        // var studentData = options.studentData;
        var numCols = options.seatInRow;

        var row = Math.floor(index / numCols);

        //alert(row);
        var col = index % numCols;

        var top = (options.totalRows - (row + 1)) * options.seatHeight;
        var left;
        if (options.gender == "male") {
            left = (col) * options.seatWidth;

        }
        else if (options.gender == "female") {
            var left = (numCols - (col + 1)) * options.seatWidth;
        }

        var seatLabel = this.seatLabel(row, col);

        return {
            row: row,
            col: col,
            top: top,
            left: left,
            label: seatLabel,
            index: index
        };
    };

    Seatwalla.prototype.labelToIndex = function(label) {
        var seatwalla = this;
        var options = seatwalla.options;
        var alphabet = label.substring(0, 1);
        var col = parseInt(label.substring(1)) - 1;
        var row = 0;

        row = alphabet.charCodeAt(0) - 65;
        var index = (row * options.seatInRow) + col;
        return {"index": index, "row": row, "col": col};
    };

    Seatwalla.prototype.seatLabel = function(row, col) {
        var alpha;
        var num;

        alpha = String.fromCharCode(row + 65);
        var colString = col + 1;
        return alpha + colString;
    };

    Seatwalla.prototype.addSeatContainer = function(data) {

        var $seatTemplate = _.template("<div class='seatwalla-seat' draggable='<%=!student.pin%>' data-index='<%=index%>'" +
                                       "data-num='<%=student.num%>' data-age='<%=student.age%>' data-label='<%=seat.label%>'" +
                                       "data-space='<%=space%>' data-pin='<%=student.pin%>' data-room='<%=student.room%>'>" +
                                       "</div>");

        var $seatContainer = $($seatTemplate(data));
        return $seatContainer;
    };

    Seatwalla.prototype.addSpace = function($hall, index, direction, first) {

        var seatwalla = this;
        var options = seatwalla.options;
        var $element = seatwalla.getElementAt(index);
        var lastIndex = seatwalla.getLastIndex();
        var data = {};
        data.student = {};
        data.student.old = false;
        data.student.firstName = null;

        data.space = true;
        data.index = index;
        data.seat = {};
        var seatInfo = seatwalla.getSeatInfoFromIndex(index);
        data.seat.label = seatInfo.label;
        if (options.seatStyle == "Number") {
            data.seat.label = index + 1;
        }
        data.student.pin = true;

        console.log("add space " + direction);
        if (direction === "left" || direction == "right") {
            var from = lastIndex;

            index = index + 1;

            var to = index;
            data.index = index;
            //seatInfo = seatwalla.getSeatInfoFromIndex(index);
            //data.seat.label = seatInfo.label;

            var $elementOnLeft = seatwalla.getElementAt(data.index);
            if (seatwalla.isPin($elementOnLeft)) {
                alert("Cannot add a space due to fixed space besides it, please un-pin it");
                return
            }

            var $seat;
            if (direction == "left") {
                for (var i = from; i >= to; i--) {

                    var $elementToMove = seatwalla.getElementAt(i);
                    var movedLeft = seatwalla.moveLeft(i, index, true);
                    console.log(i + "  " + movedLeft);
                }
                $seat = seatwalla.addStudentToGrid(data.student, data.index, true, null, $element, "after");//seatwalla.addSeat($hall, data, null, $element, "after");
            }
            else if (direction == "right") {
                for (var i = from; i >= to; i--) {

                    var $elementToMove = seatwalla.getElementAt(i);
                    seatwalla.moveRight(i, index, true);
                }
                $seat = seatwalla.addStudentToGrid(data.student, data.index, true, null, $element, "after");//seatwalla.addSeat($hall, data, null, $element, "after");
            }
        }
        else if (direction === "top") {
            var newIndex = parseInt(index) + parseInt(options.seatInRow);
            var $topElement = seatwalla.getElementAt(newIndex);
            if (seatwalla.isPin($topElement)) {
                alert("Cannot add a space due to fixed space besides it, please un-pin it");
                return;
            }
            if (lastIndex < newIndex) {

                while (lastIndex < newIndex) {
                    lastIndex++;
                    data.index = lastIndex;
                    data.space = true;
                    data.seat.label = "SPACE";
                    $element = seatwalla.addStudentToGrid(data.student, data.index, true);
                }
            }
            else {
                if (options.gender == "female") {
                    seatwalla.addSpace($hall, newIndex - 1, "left", first);
                }
                else if (options.gender == "male") {
                    seatwalla.addSpace($hall, newIndex - 1, "right", first);
                }
            }
        }
        seatwalla.options.totalStudent = seatwalla.getTotalElements();
        if (!first) {
            _.delay(function() {
                seatwalla.setDimensions(first)
            }, 1000);

        }
    };

    Seatwalla.prototype.addSeat = function($hall, data, $seatContainer, $srcElement, where) {
        var seatwalla = this;
        var addToHall = false;

        if (!$seatContainer) {
            $seatContainer = seatwalla.addSeatContainer(data);
            addToHall = true;
        }
        else {
            $seatContainer.attr("draggable", !data.pin);
            $seatContainer.attr("data-index", data.index);
            $seatContainer.attr("data-label", data.seat.label);
            $seatContainer.attr("data-space", data.space);
            $seatContainer.attr("data-pin", data.student.pin);
            $seatContainer.attr("data-age", data.student.age);
            $seatContainer.attr("data-num", data.student.num);
            $seatContainer.attr("data-room", data.student.room);
        }

        data.gender = seatwalla.options.gender;
        if (seatwalla.options.seatStyle == "Number") {
            data.seat.label = data.index + 1;
        }

        // data.imgSrc = seatwalla.options.imgSrc;

        var $seatContentTemplate = _.template("<div class='seatwalla-seat-container<%if(student.old){%> seatwalla-seat-old <%}%> <%if(space){%> seatwalla-seat-pin'<%}%>'>" +
                                              "<div class='seatwalla-delete'><i class='icon-kub-remove'></i></div>" +

                                              "<div class='seatwalla-pin'><i class='icon-pin-1 seatwalla-pin-icon'></i></div>" +

                                              "<div class='seatwalla-note'></div>" +

                                              "<div class='seatwalla-edit'><i class='icon-kub-edit seatwalla-edit-icon'></i></div>" +
                                              "<div class='seatwalla-add-space-top'><i class='icon-plus seatwalla-add-space-icon'></i></div>" +
                                              "<% if (gender == 'male') { %>" +
                                              "<div class='seatwalla-add-space-right'><i class='icon-plus seatwalla-add-space-icon'></i></div>" +
                                              "<% } else { %>" +
                                              "<div class='seatwalla-add-space-left'><i class='icon-plus seatwalla-add-space-icon'></i></div>" +
                                              "<% } %>" +
                                              "<div class='seatwalla-content'>" +
                                              "<% if(space && student.firstName == null){%>" +

                                              "<%} else {%>" +
                                              "<div class='seatwalla-first-name'><%=student.firstName%></div>" +
                                              "<div class='seatwalla-second-name'><%=student.secondName%></div>" +
                                              "<div class='seatwalla-age'><%=student.age%></div>" +
                                              "<div class='seatwalla-label' data-label='<%=seat.label%>'><%=seat.label%></div>" +

                                              "<div class='seatwalla-cell' data-label='<%=seat.label%>'></div>" +

                                              "<input class='seatwalla-seat-room-edit' type='text'  placeholder='Room'  maxlength='10' value='<%=student.room%>' editable='true'/>" +

                                              "<div class='seatwalla-seat-text'><%=student.text%></div>" +
                                              "<%}%>" +
                                              "<div>" +
                                              "</div>");

        var $seatContent = $seatContentTemplate(data);

        $seatContent = $seatContainer.append($seatContent);
        var $seatCell = $seatContent.find(".seatwalla-cell");
        if (data.student.cell) {
            $seatCell.text(data.student.cell);
            $seatCell.css("display", "inline-block");
        }
        else {
            $seatCell.hide();
        }

        if (data.pin && data.student.firstName != null) {
            $seatContainer.find(".seatwalla-first-name").css("text-decoration", "underline");
            $seatContainer.find(".seatwalla-second-name").css("text-decoration", "underline");
        }
        if (addToHall) {
            console.log("append to " + data.index);
            if (!where) {
                $hall.append($seatContainer);
            }
            else if ($srcElement) {
                if (where === "after") {
                    $srcElement.after($seatContainer);
                }
                else if (where === "before") {
                    $srcElement.before($seatContainer);
                }
            }
        }

        seatwalla.updateNote($seatContent, data.student);

        return $seatContainer;
    };

    Seatwalla.prototype.updateSeat = function(data, $seatContainer) {
        var seatwalla = this;
        $seatContainer.find(".seatwalla-seat-container").remove();
        seatwalla.addSeat($hall, data, $seatContainer);
        var $hall = $(".seatwalla-hall");
        seatwalla.addEvents($hall, $seatContainer, data);
        seatwalla.placeEditTools($seatContainer);
    };

    Seatwalla.prototype.addEvents = function($hall, $seat, data) {
        var seatwalla = this;
        var options = seatwalla.options;
        var index = parseInt($seat.attr("data-index"));
        $seat.css({
            top: data.seat.top + "px",
            left: data.seat.left + options.widthUnits,
            width: options.seatWidth + options.widthUnits,
            height: options.seatHeight + "px"
        });

        $seat.off();
        $seat.on("dragstart", function(event) {

            console.log("dragstart");
            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            $seat.addClass("seatwalla-seat-dragstart");
            var fromIndex = $seat.attr("data-index");
            event.originalEvent.dataTransfer.setData("index", fromIndex);
        });

        $seat.on("dragover", function(event) {
            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            if (!seatwalla.isPin($seat)) {
                $seat.addClass("seatwalla-seat-dragover");
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            //event.dataTransfer.dropEffect = 'move';
            return false;
        });

        $seat.on("dragleave", function(event) {
            console.log("dragleave");
            $(".seatwalla-seat").removeClass("seatwalla-seat-dragover");
            // $(".seatwalla-seat").removeClass("seatwalla-seat-dragenter");
        });

        $seat.on("dragend", function(event) {
            console.log("dragend");
            $(".seatwalla-seat").removeClass("seatwalla-seat-dragover");
            $(".seatwalla-seat").removeClass("seatwalla-seat-dragstart");
        });

        $seat.on("dragenter", function(event) {

            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            if (!seatwalla.isPin($seat)) {
                $seat.addClass("seatwalla-seat-dragover");
            }
            if (event.preventDefault) {
                event.preventDefault();
            }

            return true;

        });

        $seat.on("drop", function(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            if (event.preventDefault) {
                event.preventDefault();
            }
            var fromIndex = event.originalEvent.dataTransfer.getData("index");

            var target = $(event.target);

            var $seat = target.closest(".seatwalla-seat");
            $seat.removeClass("seatwalla-seat-dragstart");
            $seat.removeClass("seatwalla-seat-dragover");

            var targetName = target.find(".seatwalla-first-name").text();
            console.log("drag " + targetName);
            var label = $seat.attr("data-label");
            var seatInfo = seatwalla.labelToIndex(label);
            var toIndex = seatInfo.index;
            console.log("drop" + fromIndex + " :  " + toIndex);

            var $fromSeat = seatwalla.getMovableSeatAt(fromIndex);
            var $toSeat = seatwalla.getMovableSeatAt(toIndex);
            if ($fromSeat.length > 0 && $toSeat.length > 0) {
                seatwalla.insert(fromIndex, toIndex);

            }
            else {
                if ($toSeat.length == 0) {
                    alert("You are dropping on the fixed seat, find movable seat to drop or un pin the target seat ");
                }
                else if (!$fromSeat.length == 0) {
                    alert("You are dragging a fixed seat, drag movable seat")
                }

            }

        });

        var $delete = $seat.find(".seatwalla-delete");
        var $pin = $seat.find(".seatwalla-pin");
        var $edit = $seat.find(".seatwalla-edit");
        var $topSpace = $seat.find(".seatwalla-add-space-top");
        var $leftSpace = $seat.find(".seatwalla-add-space-left");
        var $rightSpace = $seat.find(".seatwalla-add-space-right");
        var $seatText = $seat.find(".seatwalla-seat-text");
        var $seatSecondName = $seat.find(".seatwalla-second-name");
        var $seatRoomEdit = $seat.find(".seatwalla-seat-room-edit");
        var $seatNote = $seat.find(".seatwalla-note");

        //var $seatRoom = $seat.find(".seatwalla-room");
        var seatWidth = $seat.innerWidth();

        var seatTextOffset = $seatSecondName.offset();
        $seatNote.on({
            mouseenter: function(e) {
                var seatwalla = this;

                if ($seatText.text().length > 0) {
                    var $textDetail = $(".seatwalla-notes-detail");

                    var textDetailWidth = $textDetail.width();
                    var left = $seat.position().left + seatWidth + 10;
                    var diff = $(".seatwalla-hall").width() - left;
                    if (diff < ( textDetailWidth + 10)) {
                        left = $seat.position().left - (textDetailWidth + 10);
                    }

                    $textDetail.css({"top": seatTextOffset.top, "left": left, display: "inline-block"});
                    $textDetail.text($seatText.text());
                }
            },
            mouseleave: function(e) {
                var seatwalla = this;
                var $textDetail = $(".seatwalla-notes-detail");

                $textDetail.css({display: "none"});
            }
        });

        $delete.click(function(event) {
            var r = confirm("Are you sure, you want to delete the student");
            if (r == true) {
                seatwalla.deleteSeat(event);

            }
        });
        $pin.click(function(event) {
            seatwalla.pinSeat(event, data);
        });

        $edit.click(function(event) {

            seatwalla.editStudent($seat, data);
        });

        /*$seatRoomEdit.keypress(function(event){
         if(event.keyCode == "13") {
         $seatRoomEdit.attr("data-label", $seatRoomEdit.val());
         }
         });*/

        $seatRoomEdit.focusout(function(event) {
            // if(event.keyCode == "13") {
            $seat.attr("data-room", $seatRoomEdit.val());
            $seatRoomEdit.attr("data-label", $seatRoomEdit.val());
            //}
        });
        $topSpace.click(function(event) {
            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            var index = $seat.attr("data-index");
            seatwalla.addSpace($hall, parseInt(index), "top", false);
        });

        $leftSpace.click(function(event) {
            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            var index = $seat.attr("data-index");
            seatwalla.addSpace($hall, parseInt(index), "left", false);
        });

        $rightSpace.click(function(event) {
            var target = $(event.target);
            var $seat = target.closest(".seatwalla-seat");
            var index = $seat.attr("data-index");
            seatwalla.addSpace($hall, parseInt(index), "right", false);
        });

    };

    Seatwalla.prototype.drawChart = function(inoptions) {
        var seatwalla = this;
        var options = this.options;
        _.extend(options, inoptions);
        $(".seatwalla-container").hide();
        seatwalla.setDimensions(true);
        if (_.has(pagodaData, options.centerName)) {
            $(".seatwalla-assign-cell").show();
        }
        else {
            $(".seatwalla-assign-cell").hide();
        }

        var students = options.studentData;
        var $hall = $(".seatwalla-hall");
        //var $seatTemplate = _.template("<div class='seatwalla-seat' draggable='true' droppable='true'><div class='seatwalla-content'><div class='seatwalla-first-name'><%=firstname%></div><div class='seatwalla-second-name'><%=secondname%></div><div class='seatwalla-other-info>'<%=age%></div><%= label%><div class='seatwalla-seat-text-container'><input class='seatwalla-seat-text' type='text'/></div></div></div></div>");//_.template(<div class='seatwalla-seat' index='<%=index%>' row='<%=row%>' col='<%=col'><%=label%></div>);

        _.each(students, function(student, index) {
            seatwalla.addStudentToGrid(student, index, false);
        });

        if (options.addSideBackRows == true) {
            seatwalla.addSideBackRows();
        }

        seatwalla.setDimensions(false);
        $("#numCols").text(options.numCols);
        $("#addSideBackRows").text(options.addSideBackRows);
        $("#gender").text(options.gender);
        $("#seatStyle").text(options.seatStyle);
        $("#centerName").text(options.centerName);

    };

    Seatwalla.prototype.addSideBackRows = function() {
        var seatwalla = this;
        var options = seatwalla.options;
        var lastIndex = seatwalla.getLastIndex();
        var $hall = $(".seatwalla-hall");

        var totalSeats = options.totalRows * options.seatInRow;

        if (options.gender == "male") {
            //add spaces on right
            for (var i = options.seatInRow; i < totalSeats; i = i + options.seatInRow) {
                seatwalla.addSpace($hall, i - 2, "right", true);
            }

        }
        else {
            //add spaces on left
            for (var i = options.seatInRow; i < totalSeats; i = i + options.seatInRow) {
                seatwalla.addSpace($hall, i - 2, "left", true);
            }
        }

        //add spaces on top
        lastIndex = seatwalla.getLastIndex();
        var totalRows = (options.totalRows - 1);
        var totalPossibleStudent = (totalRows * options.seatInRow) - 1;
        seatwalla.addSpace($hall, totalPossibleStudent, "top", true);

    };

    Seatwalla.prototype.isLastCol = function(index) {
        var seatwalla = this;
        var options = seatwalla.options;
        return ( index % (options.seatInRow - 1) == 0);
    };

    Seatwalla.prototype.getLastIndex = function() {
        var $lastSeat = $(".seatwalla-seat").last();
        var lastSeatIndex = $lastSeat.attr("data-index");
        return parseInt(lastSeatIndex);
    };

    Seatwalla.prototype.getLastSeatIndex = function() {
        var $lastSeatIndex = $(".seatwalla-seat[data-space='false']").last();
        var lastSeatIndex = $lastSeatIndex.attr("data-index");
        return parseInt(lastSeatIndex);
    };

    /*Seatwalla.prototype.addNewStudent = function(event) {
     var seatwalla = this;
     var student = {};
     student.firstName = "FirstName Here";
     student.lastName = "LastName Here";
     student.age = "Age Here";
     student.num = "Course# Here";
     var lastSeatIndex = seatwalla.getLastIndex();
     var seat = seatwalla.getElementAt(lastSeatIndex + 1);

     var $seat = seatwalla.addStudentToGrid(student, lastSeatIndex + 1, false);

     var data = {};
     data.seat = seat;
     data.student = student;
     seatwalla.editStudent($seat, data);
     }*/

    Seatwalla.prototype.addStudentToGrid = function(student, index, space, $seatContainer, $srcElement, where) {
        var seatwalla = this;
        var data = {};

        data.seat = seatwalla.getSeatInfoFromIndex(index);

        data.student = student;

        //data.student.seatwalla.getStudentFromIndex(index);

        var id = data.seat.label;
        var $seatObj = seatwalla.addSeat($(".seatwalla-hall"), {
            student: data.student,
            seat: data.seat,
            index: index,
            space: space
        }, $seatContainer, $srcElement, where);

        seatwalla.addEvents($(".seatwalla-hall"), $seatObj, data);
        seatwalla.placeEditTools($seatObj);

        var cell = $seatObj.find(".seatwalla-cell").text();
        if (cell && cell.length > 0) {
            seatwalla.updatePagodaSeat(index, id, cell);
        }
        return $seatObj;
    };

    Seatwalla.prototype.placeEditTools = function($seat) {

        //var $topAddStudent = $seat.find(".seatwalla-add-student-top");
        var $topAddSpace = $seat.find(".seatwalla-add-space-top");

        var seatWidth = $seat.outerWidth();
        var seatHeight = $seat.outerHeight();

        var top = 6;
        var left = (seatWidth - 16) / 2;

        $topAddSpace.css({"top": top,
            "left": left + "px"});
        var $leftAddSpace = $seat.find(".seatwalla-add-space-left");

        var left = 4;
        top = (seatHeight - 16) / 2;
        $leftAddSpace.css({
            "top": top + "px",
            "left": left + "px"
        });

        var right = 4;

        var $rightAddSpace = $seat.find(".seatwalla-add-space-right");
        $rightAddSpace.css({
            "top": top + "px",
            "right": right + "px"
        });
    };

    Seatwalla.prototype.deleteSeat = function(event) {
        var seatwalla = this;
        var options = seatwalla.options;
        var target = $(event.target);
        var $seat = target.closest(".seatwalla-seat");
        var deletedIndex = parseInt($seat.attr("data-index"));
        console.log("Deleted  " + deletedIndex);

        var label = $seat.attr("data-label");
        var cell = parseInt($seat.find(".seatwalla-cell").text().split(" ")[0]);

        var $cell = $(".pagoda-shared-cell-content[data-cell='" + cell + "'][data-label='" + label + "']");
        if ($cell.length == 0) {
            $cell = $(".pagoda-cell-content[data-cell='" + cell + "'][data-label='" + label + "']");
        }

        if ($cell.length > 0) {
            options.$pagoda.cancelAssignment($cell);
        }
        $seat.remove();

        var lastIndex = seatwalla.getLastIndex();

        var i = deletedIndex + 1;
        var found = false;
        var lastToFill = deletedIndex;

        //  while (found) {
        if (options.gender == "male") {
            for (var j = i; j <= lastIndex; j++) {
                var $movabledSourceElement = seatwalla.getMovableSeatAt(j);
                if ($movabledSourceElement.length > 0) {
                    found = seatwalla.moveLeft(j, deletedIndex, true);
                    if (found) {
                        lastToFill = j;
                        found = false;
                    }
                }
                else {
                    continue;
                }

            }
        }
        else {
            for (var j = i; j <= lastIndex; j++) {

                var $movabledSourceElement = seatwalla.getMovableSeatAt(j);
                if ($movabledSourceElement.length > 0) {
                    found = seatwalla.moveRight(j, deletedIndex, true);
                    if (found) {
                        lastToFill = j;
                        found = false;
                    }
                }
                else {
                    continue;
                }
            }
        }

        if (!found && lastToFill < lastIndex) {
            seatwalla.addSpaceAt(lastToFill);
        }

        // }

        console.log("Deleting seat " + deletedIndex + ", lastIndex " + lastIndex);
        _.delay(function() {
            seatwalla.setDimensions(false)
        }, 1000);

        /*  if (((lastIndex + 1) % options.seatInRow) == 0) {

         _.delay(function() {
         seatwalla.moveAllRowsToStart("UP"), 100
         });
         }*/
    };

    Seatwalla.prototype.addSpaceAt = function(index) {
        var seatwalla = this;
        var student = {};
        student.pin = false;
        student.space = true;
        var $elementBefore = seatwalla.getElementAt(index - 1);
        seatwalla.addStudentToGrid(student, index, true, null, $elementBefore, "after");
    }

    Seatwalla.prototype.getTotalElements = function() {
        var seatwalla = this;
        return $(".seatwalla-seat").length;

    };

    Seatwalla.prototype.pinSeat = function(event, data) {
        var seatwalla = this;
        var target = $(event.target);
        var $seat = target.closest(".seatwalla-seat");
        var pinIndex = parseInt($seat.attr("data-index"));
        var pin = $seat.attr("data-pin");
        var newState = false;
        if (pin == "true") {
            newState = false;
        }
        else {
            newState = true;
        }

        var space = $seat.attr("data-space");

        var spacebool = (space == "true");

        var seat = seatwalla.getSeatInfoFromIndex(pinIndex);
        data.student = seatwalla.getStudentFromIndex(pinIndex);

        data.seat = seat;

        data.student.pin = newState;

        seatwalla.updateSeat({
            student: data.student,
            seat: data.seat,
            index: pinIndex,
            pin: newState,
            space: spacebool
        }, $seat);
    };

    Seatwalla.prototype.getElementAt = function(index) {
        var selector = ".seatwalla-seat[data-index=" + index + "]";
        return $(selector);
    };

    Seatwalla.prototype.getSeatAt = function(index) {
        var selector = ".seatwalla-seat[data-index=" + index + "][data-space=" + 'false' + "]";
        return $(selector);
    };

    Seatwalla.prototype.getMovableSeatAt = function(index) {
        var selector = ".seatwalla-seat[data-index=" + index + "][data-pin=" + 'false' + "]";
        return $(selector);
    };

    Seatwalla.prototype.getSpaceAt = function(index) {
        var selector = ".seatwalla-seat[data-index=" + index + "][data-space=" + 'true' + "]";
        return $(selector);
    }

    Seatwalla.prototype.moveElementTo = function(element, fromIndex, index) {
        var seatwalla = this;
        var student = seatwalla.getStudentFromElement(element);
        element.remove();

        if (index == 0) {
            var $elementAfter = seatwalla.getElementAt(1);
            console.log("Removed " + element.attr("data-index"));
            seatwalla.addStudentToGrid(student, index, student.space, null, $elementAfter, "before");

        }
        else {
            var $elementBefore = seatwalla.getElementAt(index - 1);
            console.log("Removed " + element.attr("data-index"));
            seatwalla.addStudentToGrid(student, index, student.space, null, $elementBefore, "after");
        }

    };

    Seatwalla.prototype.move = function(fromIndex, toIndex, check) {
        var seatwalla = this;
        var options = seatwalla.options;
        var seatInfo = seatwalla.getSeatInfoFromIndex(toIndex);
        var $element = seatwalla.getElementAt(fromIndex);
        var $seat = $element;

        var lastIndex = seatwalla.getLastIndex();
        if (fromIndex == toIndex) {
            console.log("cannot move to same place");
            return;
        }

        if (check) {
            $seat = seatwalla.getMovableSeatAt(fromIndex);
        }

        if ($seat.length > 0) {
            console.log("move  " + fromIndex + "  :  " + toIndex);

            var left = seatInfo.left + options.widthUnits;
            var top = seatInfo.top + "px";

            if (Math.abs(fromIndex - toIndex) > 1) {
                seatwalla.moveElementTo($seat, fromIndex, toIndex);
            }
            else {
                $seat.css({
                    "left": left,
                    "top": top
                });
                seatwalla.updateInfo($seat, seatInfo);
            }

            return true;
        }

        if ($seat.length == 0) {
            return false;
        }

        return true;
    };

    Seatwalla.prototype.updateInfo = function(element, seatInfo) {
        var seatwalla = this;
        element.attr("data-label", seatInfo.label);
        element.attr("data-index", seatInfo.index);
        var cell = element.find(".seatwalla-cell").text();
        var $seatLabel = element.find(".seatwalla-label");
        if (seatwalla.options.seatStyle == "Number") {
            seatInfo.label = seatInfo.index + 1;
        }
        $seatLabel.html(seatInfo.label);
        $seatLabel.attr("data-label", seatInfo.label);
        var $cell = element.find(".seatwalla-cell");
        if ($cell.length > 0) {
            $cell.attr("data-label", seatInfo.label);
            seatwalla.updatePagodaSeat(seatInfo.index, seatInfo.label, cell);
        }
    };

    Seatwalla.prototype.moveLeft = function(index, sourceIndex, check) {
        var seatwalla = this;
        var options = seatwalla.options;

        if (options.gender == "female") {
            return seatwalla.increaseIndex(index, sourceIndex, check);
        }
        else if (options.gender == "male") {
            return seatwalla.decreaseIndex(index, sourceIndex, check);
            s
        }
    };

    Seatwalla.prototype.moveRight = function(index, sourceIndex, check) {
        var seatwalla = this;
        var options = seatwalla.options;

        if (options.gender == "female") {
            return seatwalla.decreaseIndex(index, sourceIndex, check);
        }
        else if (options.gender == "male") {
            return seatwalla.increaseIndex(index, sourceIndex, check);
        }
    };

    Seatwalla.prototype.increaseIndex = function(index, sourceIndex, check) {
        var seatwalla = this;
        var newIndex = index + 1;
        var canMove = false;
        while (check && !canMove) {
            var $target = seatwalla.getElementAt(newIndex);
            if (seatwalla.isPin($target)) {
                newIndex = newIndex + 1;
            }
            else {
                canMove = true;
            }
        }
        ;

        if (canMove == false) {
            return false; // This means there is nothing to move
        }

        return seatwalla.move(index, newIndex, check);
    };

    Seatwalla.prototype.isSpace = function($seat) {
        var seatwalla = this;
        var space = $seat.attr("data-space");
        return (space === "true");
    };

    Seatwalla.prototype.isPin = function($seat) {
        var seatwalla = this;
        var pin = $seat.attr("data-pin");
        return (pin === "true");
    };

    Seatwalla.prototype.decreaseIndex = function(index, sourceIndex, check) {
        var seatwalla = this;
        var newIndex = index - 1;
        var canMove = false;
        while (check && !canMove) {
            var $target = seatwalla.getElementAt(newIndex);

            if ($target.length > 0 && seatwalla.isPin($target)) {
                newIndex = newIndex - 1;
            }
            else {
                canMove = true;
            }
        }
        ;

        if (canMove == false) {
            return false; // This means there is nothing to move
        }

        return seatwalla.move(index, newIndex, check);

    };

    Seatwalla.prototype.reload = function() {
        var seatwalla = this;

        var dataArr = seatwalla.extractData(true);
        var options = seatwalla.options;
        seatwalla.options = _.defaults(options, this.defaults);
        seatwalla.setDimensions(false);
        $(".seatwalla-hall").empty();

        //function($hall, index, direction, first)

        for (var i = 0; i < options.totalStudent; i++) {
            var student = options.studentData[i];
            seatwalla.addStudentToGrid(student, i, student.space);
        }

        // $(".seatwalla-tools-tray").show();

        //seatwalla.drawChart(seatwalla.options);
    };

    Seatwalla.prototype.assignCells = function($pagoda, init) {

        var seatwalla = this;
        var options = seatwalla.options;
        options.$pagoda = $pagoda;
        var data = seatwalla.extractData(false, true);
        var pOptions = _.extend(options, {studentData: data});

        //_.extend(options, seatwalla.options);
        $(".seatwalla-container").hide();
        $(".pagoda-container").show();
        $(".seatwalla-hall").hide();
        options.pagodaData = pagodaData;

        if (init) {
            $pagoda.initData(pOptions);
        }
        else {
            $pagoda.updateStudentList(pOptions);
        }
    };

    Seatwalla.prototype.updatePagodaSeat = function(index, label, cell) {
        var seatwalla = this;
        var $content = null;
        cell = cell.split(" ")[0];

        var student = seatwalla.getStudentFromIndex(index);
        var $cell = $(".pagoda-shared-cell-content[data-cell='" + cell + "']");

        if ($cell.length == 0) {
            $cell = $(".pagoda-cell-content[data-cell='" + cell + "']");
            $cell.attr("data-label", label);
            $cell.find(".seatwalla-label").text(label);
        }
        else if ($cell.length > 1){

            for (var i = 0; i < $cell.length; i++) {
                var $currentCell = $($cell[i]);

                if (($currentCell.find(".pagodawalla-first-name").text() == student.firstName) &&
                    ($currentCell.find(".pagodawalla-second-name").text() == student.secondName)) {
                    $currentCell.attr("data-label", student.label);
                    $currentCell.attr("data-label", label);
                    $currentCell.find(".seatwalla-label").text(label);
                    return;
                }
            }
        }
    };

    Seatwalla.prototype.check = function() {
        var seatwalla = this;
        var studentData = seatwalla.extractData(false);
        var options = seatwalla.options;
        var originalData = options.originalData;

        var checkList = [];

        if (!originalData) {
            return;
        }
        else {

            var missingStudent = [];

            _.each(originalData, function(origStudent) {

                var found = _.filter(studentData, function(student) {
                    var same = seatwalla.isSame(origStudent, student);
                    if (same) {
                        return true;
                    }
                });

                if (found.length == 0) {
                    origStudent.reason = "missing";
                    checkList.push(origStudent);
                }

            });
        }

        _.each(studentData, function(student) {
            var numCols = options.seatInRow;
            var mode = student.index % numCols;
            if (mode == 0) {
                if (student.age && (student.age <= 25)) {
                    student.reason = "young"
                    checkList.push(student);
                }
            }
        });

        var checkTemplate = _.template("<div class='seatwalla-check-container'>" +
                                       "<div class='seatwalla-delete-check'><i class='icon-kub-remove'></i></div>" +
                                       "<%_.each(checkList, function(student){%>" +
                                       "<% if (student.reason == 'missing') {%>" +
                                       "<div class='seatwalla-check-student-info'>" +
                                       "<%=student.firstName%> <%=student.secondName%> has sat <%=student.num%> course(s) and is <%=student.age%> years old is missing." +
                                       "</div>" +
                                       "<% } else if (student.reason == 'young') {%> " +
                                       "<div class='seatwalla-check-student-info'>" +
                                       "<%=student.firstName%> <%=student.secondName%> has sat <%=student.num%> course(s) and <%=student.age%> years old is young to be in the aisle." +
                                       "</div>" +
                                       "<% }}) %>" +
                                       "</div>"
        );

        var $check = $(checkTemplate({checkList: checkList}));
        $check.find(".seatwalla-delete-check").on("click", function(event) {
            $check.remove();
        });
        $(".hall").append($check);

    };

    Seatwalla.prototype.isSame = function(student1, student2) {
        if (student1.firstName == student2.firstName && student1.secondName == student2.secondName
            && student1.num == student2.num) {
            return true;
        }
        else {
            return false;
        }
    };

    Seatwalla.prototype.extractData = function(overwriteOptions, studentsOnly) {
        var seatwalla = this;
        var lastIndex = seatwalla.getLastIndex();
        var data = "SAVED";
        var dataArr = [];

        for (var i = 0; i <= lastIndex; i++) {
            var student = seatwalla.getStudentFromIndex(i);

            student.index = i;

            if (studentsOnly) {
                if (student.firstName !== null) {
                    dataArr.push(student);
                }
            }
            else {
                dataArr[i] = student;
            }

            var studentStr = student.name + "," + student.age + "," + student.num + "," + student.text + "," +
                             student.space +
                             "," + student.pin + "\r\n";
            data = data + studentStr;
        }

        //get the image path
        var $element = seatwalla.getElementAt(0);
        /*var imagePath = $element.find(".seatwalla-delete-icon").attr("src");
         var lastIndexOfSlash = imagePath.lastIndexOf("/");
         */
        var options = {};
        options.numCols = parseInt($("#numCols").text());
        var addSideBackOption = $("#addSideBackRows").text();

        if (addSideBackOption == "true") {
            options.numCols = options.numCols + 1;
            addSideBackOption = true;
        }
        else {
            addSideBackOption = false;
        }

        options.seatInRow = options.numCols;
        options.addSideBackRows = addSideBackOption; //false; //$("#addSideBackRows").val();
        options.totalStudent = lastIndex + 1;
        options.gender = $("#gender").text();
        options.seatStyle = $("#seatStyle").text();
        options.centerName = $("#centerName").text();
        options.studentData = dataArr;
        //options.imgSrc = imagePath.substr(0, lastIndexOfSlash);

        if (overwriteOptions) {
            seatwalla.options = options;
        }

        return dataArr;
    }
    ;

    Seatwalla.prototype.updateStudentList = function() {
        var seatwalla = this;
        seatwalla.extractData(false, true);

    };

    Seatwalla.prototype.getStudentFromIndex = function(index) {
        var seatwalla = this;
        var $element = seatwalla.getElementAt(index);
        return seatwalla.getStudentFromElement($element);
    };

    Seatwalla.prototype.getStudentFromElement = function($element) {
        var seatwalla = this;
        var student = {};

        if ($element.length == 0) {
            student.firstName = null;
            student.secondName = null;
            student.age = "";
            student.num = "";
        }
        else {

            var space = ($element.attr("data-space") == "true");

            if (!space) {
                student.firstName = $element.find(".seatwalla-first-name").text();
                if (_.isUndefined(student.firstName)) {
                    student.firstName = null;
                }

                student.secondName = $element.find(".seatwalla-second-name").text();

                if (student.secondName) {
                    var temp = student.secondName.split(",");
                    student.secondName = temp[0];
                }

                if (_.isUndefined(student.secondName)) {
                    student.secondName = null;
                }

                student.name = student.firstName + " " + student.secondName;
                student.age = parseInt($element.attr("data-age"));
                student.num = parseInt($element.attr("data-num"));
                if (student.num > 0) {
                    student.old = true;
                }
                else {
                    student.old = false;
                }

                student.text = $element.find(".seatwalla-seat-text").text();
                student.room = $element.attr("data-room"); //$element.find(".seatwalla-seat-room-edit").attr("data-label");
            }
            else {

                student.firstName = null;
                student.secondName = null;
                student.age = "";
                student.num = "";

            }
        }

        student.label = $element.find(".seatwalla-label").text();
        student.cell = $element.find(".seatwalla-cell").text();

        var pinned = ($element.attr("data-pin") == "true");
        student.space = space;
        student.pin = pinned;

        return student;

    };

    Seatwalla.prototype.writeToFile = function() {
        var seatwalla = this;
        var data = seatwalla.extractData();

        function onInitFs(fs) {

            fs.root.getFile('log.txt', {create: true}, function(fileEntry) {

                // Create a FileWriter object for our FileEntry (log.txt).
                fileEntry.createWriter(function(fileWriter) {

                    fileWriter.onwriteend = function(e) {
                        console.log('Write completed.');
                    };

                    fileWriter.onerror = function(e) {
                        console.log('Write failed: ' + e.toString());
                    };

                    // Create a new Blob and write it to log.txt.
                    var blob = new Blob([data], {type: 'text/plain'});

                    fileWriter.write(blob);

                }, function() {
                });

            }, function() {
            });

        }

        function onError() {
            console.log('Error : ', arguments);
        }

        navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 1024, function(grantedBytes) {
            console.log('requestQuota: ', arguments);
            requestFS(grantedBytes);
        }, onError);

        function requestFS(grantedBytes) {
            window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
                console.log('fs: ', arguments); // I see this on Chrome 27 in Ubuntu
            }, onError);
        }
    };

    Seatwalla.prototype.editStudent = function($seat, data) {

        var seatwalla = this;
        var options = seatwalla.options;
        if (!data.student) {
            data.student = {};
            data.student.firstName = "";
            data.student.secondName = "";
            data.student.age = "";
            data.student.numCols = "";
            data.student.text = "";

        }

        var index = parseInt($seat.attr("data-index"));

        var editSeatTemplate = _.template("<div class='seatwalla-edit-container'>" +

                                          "<input class='seatwalla-seat-first-name-edit' type='text' placeholder='First Name' value='<%=student.firstName%>'/>" +
                                          "<input class='seatwalla-seat-second-name-edit' type='text'  placeholder='Second Name' value='<%=student.secondName%>'/>" +
                                          "<input class='seatwalla-seat-age-edit' type='text'  placeholder='Age'  value='<%=student.age%>'/>" +
                                          "<input class='seatwalla-seat-num-edit' type='text'  placeholder='Courses' value='<%=student.num%>'/>" +
                                          "<textarea class='seatwalla-seat-text-edit' type='text'  placeholder='Notes'>" +
                                          "<%=student.text%>" +
                                          "</textarea>" +
                                          "<i class='icon-kub-approve seatwalla-edit-done'></i>" +
                                          "<i class='icon-kub-remove seatwalla-edit-cancel'></i>" +

                                          "</div>");

        var $editSeat = $(editSeatTemplate({student: data.student}));
        $(".seatwalla-edit-container").remove();
        $editSeat = $(".seatwalla-hall").append($editSeat);

        var seatInfo = seatwalla.getSeatInfoFromIndex(index);

        $(".seatwalla-edit-container").css({
            top: seatInfo.top + "px",
            left: seatInfo.left + options.widthUnits,
            width: (options.seatWidth ) + options.widthUnits,
            height: options.seatHeight + 150 + "px",
            zindex: 1000
        });

        $(".seatwalla-edit-done").click(function(event) {
            var student = seatwalla.getStudentFromElement($seat);

            student.firstName = $(".seatwalla-seat-first-name-edit").val();
            student.secondName = $(".seatwalla-seat-second-name-edit").val();
            student.age = $(".seatwalla-seat-age-edit").val();
            student.num = $(".seatwalla-seat-num-edit").val();
            student.text = $(".seatwalla-seat-text-edit").val();

            if (student.num > 0) {
                student.old = true
            }

            $(".seatwalla-edit-container").remove();

            seatwalla.updateSeat({"student": student, "seat": seatInfo, "index": index, "space": false}, $seat);
        });

        $(".seatwalla-edit-cancel").click(function() {
            $(".seatwalla-edit-container").remove();
        });
    };

    Seatwalla.prototype.updateNote = function($seat, student) {
        if (student.text && student.text.length > 0) {
            $seat.find(".seatwalla-note").css("display", "inline-block");
        }
        else {
            $seat.find(".seatwalla-note").css("display", "none");
        }
    };

    Seatwalla.prototype.insert = function(fromIndex, toIndex, $elementNotAdded) {
        var seatwalla = this;
        var options = seatwalla.options;

        var $seatToMove;
        if ($elementNotAdded) {
            $seatToMove = $elementNotAdded;
        }
        else {
            $seatToMove = seatwalla.getElementAt(fromIndex);
            $seatToMove.remove();
            console.log("Remove the seat dragged " + fromIndex);
        }

        var $target = seatwalla.getElementAt(toIndex);
        if (seatwalla.isPin($target)) {
            return;
        }

        var from = parseInt(fromIndex);
        var to = parseInt(toIndex);
        var srcIndex = fromIndex;

        if (from > to) {
            for (var i = from - 1; i >= to; i--) {

                var $elementToMove = seatwalla.getMovableSeatAt(i);
                if ($elementToMove.length > 0) {
                    if (options.gender == "male") {
                        seatwalla.moveRight(i, srcIndex, true);
                    }
                    else if (options.gender == "female") {
                        seatwalla.moveLeft(i, srcIndex, true);
                    }
                }
            }
        }
        else {
            for (var j = from + 1; j <= to; j++) {
                var $elementToMove = seatwalla.getMovableSeatAt(j);
                if ($elementToMove.length > 0) {
                    if (options.gender == "male") {
                        seatwalla.moveLeft(j, srcIndex, true);
                    }
                    else if (options.gender == "female") {
                        seatwalla.moveRight(j, srcIndex, true);
                    }
                }
            }
        }
        seatwalla.moveElementTo($seatToMove, from, to);

    };

    Seatwalla.prototype.pinAll = function(option) {
        $(".seatwalla-seat[data-pin='false']").find(".seatwalla-pin").click();
    };

    Seatwalla.prototype.unpinAll = function(option) {
        $(".seatwalla-seat[data-pin='true']").find(".seatwalla-pin").click();
    };

    var allSeats = $(".seatwalla-seat");

    _.each(allSeats, function($seat) {
        $seat.addEventListener('drop', function(event) {
            if (event.stopPropagation) {
                event.stopPropagation();
            }
            console.log("drop");
        }, false);

    });

    Seatwalla.prototype.execute = function(method, options) {

        var seatwalla = this;
        if (method == "readFile") {
            seatwalla.readFile(options);

        }
        else if (method == "showChart") {
            seatwalla.drawChart(options);
        }
        else if (method == "assignCells") {
            seatwalla.assignCells(options.$pagoda, options.init);
        }
        else if (method == "check") {
            seatwalla.check(options);
        }
        else if (method == "pinAll") {
            seatwalla.pinAll(options);
        }
        else if (method == "unpinAll") {
            seatwalla.unpinAll(options);
        }
    };

    $.fn.seat = function(method, options) {

        var $this = this;

        $this.each(function() {
            var el = this;
            var $el = $(el);
            var widget = $el.data("seatwalla");

            if (widget) {
                widget.execute(method, options);
            }
            else {
                options = method;
                widget = new Seatwalla(el, options);
                $el.data("seatwalla", widget);
            }
        });

        return $this;
    };
})
    (jQuery);
