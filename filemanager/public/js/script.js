var current_dir;
var selected = [];
var p;
// Download
$("#download-btn").click(function () {
    var spl = current_dir.split('/');
    var url = spl.slice(2).join('/');
    //  window.location = '/archive/' + url;
    post('/archive', {'selected': selected});

});
$(document).ready(function () {

    $.ajax({
        url: "/files",
        success: function (result) {
            contentAdder(result);
        }
    });

    $('#checkbox-all').change(function () {
        var h = $("#checkbox-all").is(':checked');
        $(".checkbox-class").prop('checked', $(this).prop('checked'));
        console.log(this);
    });

    $(document).on('change', '.checkbox-class', function () {
        var data = $(this).attr("data");
        if ($(this).is(':checked')) {
            console.log("Checked");
            //   console.log(data)
            selected.push(data)
            console.log("array: " + selected)
        } else {
            console.log("unchecked");
            var index = selected.indexOf(data);
            if (index > -1) {
                selected.splice(index, 1);
                console.log("array: " + selected)
            }
        }

    });
    function up() {
        if (current_dir === "/") {
            alert("Currently in Root")
        } else {
            var pre_dir = current_dir.substring(0, current_dir.lastIndexOf('/'));
            ajaxReload(pre_dir)
        }
    }

    $("#up-btn").on("click", up);
    $('html').keyup(function (e) {
        if (e.keyCode === 8) {
            up();
        }
    });

});


function contentAdder(data) {
    console.log("Iam called:::::: dir:"+data.isDir)

    if (data.isDir) {
        console.log("iam dir")
        selected = [];
        current_dir = data.path;
        $("#t-body").html('');
        data.files.forEach(function (file) {
            var file_url = file.name
            var icon;
            if (file.isDir) {
                icon = "fa fa-folder";
            } else {
                icon = "fa " + file.icon;
            }
            var row = "<tr class='sortable'>" +
                "<td><input type='checkbox' class='checkbox-class' data='" + file_url + "'></td>" +
                "<td class='td-small'><i class='" + icon + " '></i></td>" +
                "<td><a href='javascript: ajaxReload(&#39;" + file.path + "&#39;)' >" + file.name + "</a></td>" +
                "<td>" + file.time + "</td>" +
                "<td>" + file.size + "</td>" +
                "</tr>";
            $("#t-body").append(row)
        });
    } else {
        console.log("I am not A dir")
        alert("Its a file")
    }
}
function ajaxReload(url) {
    $.ajax({
        url: url,
        success: function (result) {
            contentAdder(result);
        }
    });
}


function post(path, params, method) {
    console.log("I am called")
    method = method || "post";
    console.log(params);
    p = params
    var form = document.createElement("form");
    form.setAttribute("method", method);
    form.setAttribute("action", path);
    for (var key in params) {
        if (params.hasOwnProperty(key)) {
            var hiddenField = document.createElement("input");
            hiddenField.setAttribute("type", "hidden");
            hiddenField.setAttribute("name", key);
            hiddenField.setAttribute("value", params[key]);

            form.appendChild(hiddenField);
        }
    }

    document.body.appendChild(form);
    form.submit();
}