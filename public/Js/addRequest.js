"use strict";
//====================================================================================================
//searchApplicantModal
function getJsonPerson0ApplicantsSearchModal() {
    return new Promise((resolve, reject) => {
        $.getJSON("/api/person", function (res) {
            console.log(res);
            if (res.success) {
                var personArr = res.data;
                for (var _i = 0, persons_1 = personArr; _i < persons_1.length; _i++) {
                    var p = persons_1[_i];
                    if (!p.phone)
                        p.phone = [];
                    if (Array.isArray(p.phone) && p.phone[0] == null)
                        p.phone = [];
                    if (!Array.isArray(p.phone) && p.phone)
                        p.phone = [p.phone];
                }
                searchApplicantBaseOn("", personArr);
                resolve(personArr);
            }
            else {
                $("#alert")
                    .fadeIn("fast")
                    .find("#text")
                    .text(res.msg || "حدث خطأ في جلب بيانات الاشخاص")
                    .parent()
                    .prev()
                    .css("background-color", "var(--bs-danger");
                reject(res);
            }
        });
    })

}
//searchApplicantModal
function searchApplicantBaseOn(s, persons) {
    var included = [];
    s = s.trim();
    for (var _i = 0, persons_2 = persons; _i < persons_2.length; _i++) {
        var p = persons_2[_i];
        if (s == "" ||
            (typeof p.name == 'string' && p.name.toLowerCase().includes(s.toLowerCase())) ||
            (typeof p.familyName == 'string' && p.familyName.toLowerCase().includes(s.toLowerCase())) ||
            (typeof p.nickname == 'string' && p.nickname.toLowerCase().includes(s.toLowerCase())) ||
            (Array.isArray(p.phone) && p.phone.join(" ").toLowerCase().includes(s.toLowerCase())) ||
            (typeof p.id == 'number' && p.id == Number(s)))
            included.push(p);
    }
    var ul = $("#searchApplicantModal").find("ul");
    ul.html("");
    for (var _a = 0, included_1 = included; _a < included_1.length; _a++) {
        var p = included_1[_a];
        ul.append("<li class=\"list-group-item list-group-item-action btn btn-secondary d-flex\" onclick=\"let is = $(this).hasClass('active');$(this).parent().children().removeClass('active');if(!is) $(this).addClass('active');\">\n                       <div >\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0631\u0642\u0645: </span><span class=\"contactId\">".concat(p.id || "-", "</span></div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0627\u0633\u0645: </span>").concat(p.name || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0644\u0642\u0628: </span>").concat(p.familyName || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0643\u0646\u064A\u0629: </span>").concat(p.nickname || "-", "</div>\n                           <div class=\"\"><span style=\"color:#91c9af\">\u062C\u0648\u0627\u0644/\u0647\u0627\u062A\u0641: </span>").concat(p.phone.length == 0 ? '-' : p.phone.join(" ,"), "\n                            </div>\n                       </div>\n                    </li>"));
    }
}
function setPhoneListener() {
    $(".applicantPhone").off();
    $(".applicantPhone:last").on("input", function () {
        $("#phoneContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setPhoneListener();});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\" >&times;</span>\n            </div>\n            <input dir=\"rtl\" type=\"text\"\n                class=\"form-control applicantPhone form-control\" placeholder=\"\u0631\u0642\u0645 \u0627\u062E\u0631\"\n                onkeypress=\"return inputTypeNumber(event)\"  maxlength=\"15\" minlength=\"9\"/>\n        </div>");
        $(".applicantPhone:last").parent().slideDown("fast");
        setPhoneListener();
    });
} //END setPhoneListener()
function showAddPersonModal() {
    setInputRequire();
    $("#applicantName").val("");
    $("#applicantFamilyName").val("");
    $("#applicantNickname").val("");
    $(".applicantPhone").val("").not(':first').parent().remove();
    $('#addNewPerson').slideDown('fast', function () { return setPhoneListener(); });
}
//addNewPerson submit
function addNewPersonToReqObj(e) {
    e.preventDefault();
    $("#addNewPerson #btnAdd").attr("disabled", "disabled").find("span").css("display", "inline-block");
    var applicantInfo = getApplicantInfo();
    $.post("/api/person", applicantInfo, function (res) {
        $("#addNewPerson #btnAdd").removeAttr("disabled").find("span").css("display", "none");
        console.log(res);
        if (res.success) {
            $("#alert").fadeIn("fast").find("#text")
                .text("تم الإضافة بنجاح").parent().prev().css("background-color", "var(--bs-success");
            $("#addNewPerson").slideUp("fast");
            applicantInfo.id = res.data;
            setApplicant(applicantInfo);
        }
        else {
            console.log(res);
            $("#alert")
                .fadeIn("fast")
                .find("#text")
                .text(res.msg || "حدث خطأ ما")
                .parent()
                .prev()
                .css("background-color", "var(--bs-danger");
        }
    });
    //write
    console.log();
}
//searchApplicant submit
function searchApplicantToReqObj(e, personArr) {
    e.preventDefault();
    var id;
    var lis = $("#searchApplicantModal ul li");
    for (var i = 0; i < lis.length; i++) {
        if (lis.eq(i).hasClass("active")) {
            for (var j = 0; j < personArr.length; j++)
                if (lis.eq(i).find("span.contactId").text() == personArr[j].id) {
                    id = personArr[j].id;
                    break;
                }
            break;
        }
    }
    if (!id)
        $("#alert")
            .fadeIn("fast")
            .find("#text")
            .text("لم تختار احد!")
            .parent()
            .prev()
            .css("background-color", "var(--bs-danger");
    else {
        $('#searchApplicantModal').slideUp('fast');
        for (let p of persons) {
            if (p.id == id) {
                setApplicant(p);
                break;
            }
        }

    }
}
function setInputRequire() {
    setAllInput();
    $('#applicantName').off().on('input', function () { setAllInput(); });
    $('#applicantFamilyName').off().on('input', function () { setAllInput(); });
    $('#applicantNickname').off().on('input', function () { setAllInput(); });
}
function setAllInput() {
    var isAll = isAllInputEmpty();
    isAll ? $('#applicantName').attr('required', 'required') : $('#applicantName').removeAttr('required');
    isAll ? $('#applicantFamilyName').attr('required', 'required') : $('#applicantFamilyName').removeAttr('required');
    isAll ? $('#applicantNickname').attr('required', 'required') : $('#applicantNickname').removeAttr('required');
}
function isAllInputEmpty() {
    if (!($('#applicantName').val() == '' &&
        $('#applicantFamilyName').val() == '' &&
        $('#applicantNickname').val() == ''))
        return false;
    return true;
}

function getApplicantInfo() {
    var at = {};
    at.name = $("#applicantName").val() || null;
    at.familyName = $("#applicantFamilyName").val() || null;
    at.nickname = $("#applicantNickname").val() || null;
    at.phone = [];
    var phones = $(".applicantPhone");
    for (var i = 0; i < phones.length; i++)
        phones.eq(i).val() == "" ? "" : at.phone.push(phones.eq(i).val()); //push numbers that's not empty
    return at;
}
function setApplicant(at) {
    console.log(at);
    if (!at.phone) {
        at.phone = [];
    }
    newRequest.applicantId = at.id;
    $('#applicantSearch').val('تعديل');
    $('#applicantInfo').removeClass('d-none');
    $('#inputApplicantName').val(at.name || '-');
    $('#inputApplicantFamilyName').val(at.familyName || '-');
    $('#inputApplicantNickname').val(at.nickname || '-');
    $('.inputApplicantPhone').parent().remove();
    var i = 0;
    do {
        $('#applicantPhoneContainer').append(`${i < 3 ? '' : '<div class="col-sm-2"><div class="inputApplicantPhone"></div></div>'}
        <div class="col-sm-4">
        <input type="button" disabled class="form-control inputApplicantPhone"
            placeholder="رقم جوال/هاتف" value="${at.phone[i] || '-'}" />
    </div>
    <div class="col-sm-3">
        <input type="button" disabled class="form-control inputApplicantPhone"
            placeholder="رقم جوال/هاتف" value="${at.phone[i + 1] || '-'}" />
    </div>
    <div class="col-sm-3">
        <input type="button" disabled class="form-control inputApplicantPhone"
            placeholder="رقم جوال/هاتف" value="${at.phone[i + 2] || '-'}" />
    </div>`);
        i = i + 3;
    } while (i < at.phone.length);
}







//======================================================================









function getJsonExecutor0SearchModal() {
    return new Promise((resolve, reject) => {
        $.getJSON("/api/executor", function (res) {
            console.log(res);
            if (res.success) {
                var executorArr = res.data;
                for (var _i = 0, executors_1 = executorArr; _i < executors_1.length; _i++) {
                    var p = executors_1[_i];
                    if (!p.phone)
                        p.phone = [];
                    if (Array.isArray(p.phone) && p.phone[0] == null)
                        p.phone = [];
                    if (!Array.isArray(p.phone) && p.phone)
                        p.phone = [p.phone];
                    if (!p.accountNumber)
                        p.accountNumber = [];
                    if (Array.isArray(p.accountNumber) && p.accountNumber[0] == null)
                        p.accountNumber = [];
                    if (!Array.isArray(p.accountNumber) && p.accountNumber)
                        p.accountNumber = [p.accountNumber];
                    if (!p.careerOrProduct)
                        p.careerOrProduct = [];
                    if (!Array.isArray(p.careerOrProduct) && p.careerOrProduct)
                        p.careerOrProduct = [p.careerOrProduct];
                    if (Array.isArray(p.careerOrProduct) && p.careerOrProduct[0] == null)
                        p.careerOrProduct = [];
                }
                searchExecutorBaseOn("", executorArr);
                resolve(executorArr);
            }
            else {
                $("#alert")
                    .fadeIn("fast")
                    .find("#text")
                    .text(res.msg || "حدث خطأ في جلب بيانات الأشخاص")
                    .parent()
                    .prev()
                    .css("background-color", "var(--bs-danger");
                reject(res);
            }
        });
    })

}
//searchExecutorModal
function searchExecutorBaseOn(s, executors) {
    var included = [];
    s = s.trim();
    for (var _i = 0, executors_2 = executors; _i < executors_2.length; _i++) {
        var e = executors_2[_i];
        if (s == "" ||
            (typeof e.name == 'string' && e.name.toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.familyName == 'string' && e.familyName.toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.nickname == 'string' && e.nickname.toLowerCase().includes(s.toLowerCase())) ||
            (Array.isArray(e.phone) && e.phone.join(" ").toLowerCase().includes(s.toLowerCase())) ||
            (Array.isArray(e.careerOrProduct) && e.careerOrProduct.join(" ").toLowerCase().includes(s.toLowerCase())) ||
            (Array.isArray(e.accountNumber) && e.accountNumber.join(" ").toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.id == 'number' && e.id == Number(s)) ||
            (typeof e.age == 'string' && e.age.toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.rate == 'string' && e.rate.toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.address == 'string' && e.address.toLowerCase().includes(s.toLowerCase())) ||
            (typeof e.academy == 'string' && e.academy.toLowerCase().includes(s.toLowerCase())))
            included.push(e);
    }
    var ul = $("#searchExecutorModal").find("ul");
    ul.html("");
    for (var _a = 0, included_2 = included; _a < included_2.length; _a++) {
        var p = included_2[_a];
        ul.append("<li class=\"list-group-item list-group-item-action btn btn-secondary d-flex\" onclick=\"let is = $(this).hasClass('active');$(this).parent().children().removeClass('active');if(!is) $(this).addClass('active');\">\n                       <div >\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0631\u0642\u0645: </span><span class=\"contactId\">".concat(p.id || "-", "</span></div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0627\u0633\u0645: </span>").concat(p.name || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0644\u0642\u0628: </span>").concat(p.familyName || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0643\u0646\u064A\u0629: </span>").concat(p.nickname || "-", "</div>\n                           <div class=\"\"><span style=\"color:#91c9af\">\u0645\u0647\u0646\u0629/\u0645\u0646\u062A\u062C: </span>").concat(p.careerOrProduct.length == 0 ? '-' : p.careerOrProduct.join(" ,"), "</div>\n                           <div class=\"\"><span style=\"color:#91c9af\">\u062C\u0648\u0627\u0644: </span>").concat(p.phone.length == 0 ? '-' : p.phone.join(" ,"), "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0639\u0646\u0648\u0627\u0646: </span>").concat(p.address || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u0639\u0645\u0631: </span>").concat(p.age || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u0627\u0644\u062A\u0642\u064A\u064A\u0645: </span>").concat(p.rate || "-", "</div>\n                           <div class=\"d-inline\"><span style=\"color:#91c9af\">\u062F\u0631\u0627\u0633\u0629: </span>").concat(p.academy || "-", "</div>\n                           <div class=\"\"><span style=\"color:#91c9af\">\u062D\u0633\u0627\u0628: </span>").concat(p.accountNumber.length == 0 ? '-' : p.accountNumber.join(" ,"), "</div>\n                       </div>\n                    </li>"));
    }
}


function searchExecutorToReqObj(e, executors) {
    e.preventDefault();
    var id;
    var lis = $("#searchExecutorModal ul li");
    for (var i = 0; i < lis.length; i++) {
        if (lis.eq(i).hasClass("active")) {
            for (var j = 0; j < executors.length; j++)
                if (lis.eq(i).find("span.contactId").text() == executors[j].id.toString()) {
                    id = executors[j].id;
                    break;
                }
            break;
        }
    }
    $('#searchExecutorModal').slideUp('fast');
    if (!id)
        setExecutor(-1);//remove the executor selected.
    else {
        for (let ex of executors)
            if (ex.id == id) {
                setExecutor(ex);
                break;
            }
    }
}
function showAddExecutorModal() {
    $("#executorName").val("");
    $("#executorFamilyName").val("");
    $("#executorNickname").val("");
    $(".executorCareerOrProduct").val("").not(':first').parent().remove();
    $(".executorPhone").val("").not(':first').parent().remove();
    $("#executorAddress").val("");
    $("#executorAge").text("العمر");
    $("#executorRate").text("التقييم");
    $("#executorAcademy").val("");
    $(".executorAccountNumber").val("").not(':first').parent().remove();
    // $.getJSON("/api/arr/addresses", function (res) {
    //     if (res.success) {
    //         autoComplete($("#executorAddress")[0], res.data);
    //     }
    //     else {
    //         console.log(res);
    //     }
    // });
    $('#addNewExecutor').slideDown('fast', function () {
        setCareerOrProductListener();
        setAccountNumberListener();
        setExecutorPhoneListener();
    });
}
function setExecutorPhoneListener() {
    $(".executorPhone").off();
    $(".executorPhone:last").on("input", function () {
        $("#executorPhoneContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setExecutorPhoneListener();});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\">&times;</span>\n            </div>\n            <input dir=\"rtl\" type=\"text\"\n                class=\"form-control executorPhone form-control\" placeholder=\"\u0631\u0642\u0645 \u0627\u062E\u0631\"\n                onkeypress=\"return inputTypeNumber(event)\"\n                maxlength=\"15\" minlength=\"9\"/>\n        </div>");
        $(".executorPhone:last").parent().slideDown("fast");
        setExecutorPhoneListener();
    });
} //END setExecutorPhoneListener(...)
function setCareerOrProductListener() {
    $(".executorCareerOrProduct").off();
    $(".executorCareerOrProduct:last").on("input", function () {
        $("#careerOrProductContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setCareerOrProductListener()});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\"\n                    >&times;</span>\n            </div>\n            <input\n                dir=\"rtl\"\n                type=\"text\"\n                class=\"form-control executorCareerOrProduct form-control\"\n                placeholder=\"\u0645\u0647\u0646\u0629 \u0623\u0648 \u0645\u0646\u062A\u062C \u0627\u062E\u0631\"\n                maxlength=\"100\"/>\n        </div>");
        $(".executorCareerOrProduct:last").parent().slideDown("fast");
        setCareerOrProductListener();
    });
} //END setCareerOrProductListener(...)
function setAccountNumberListener() {
    $(".executorAccountNumber").off();
    $(".executorAccountNumber:last").on("input", function () {
        $("#accountNumberContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setAccountNumberListener()});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\"\n                    >&times;</span>\n            </div>\n            <input\n                dir=\"rtl\"\n                type=\"text\"\n                class=\"form-control executorAccountNumber form-control\"\n                placeholder=\"\u062D\u0633\u0627\u0628 \u0645\u0635\u0631\u0641\u064A \u0627\u062E\u0631\"\n                maxlength=\"100\"/>\n        </div>");
        $(".executorAccountNumber:last").parent().slideDown("fast");
        setAccountNumberListener();
    });
} //END setAccountNumberListener(...)
function addNewExecutorToReqObj(e) {
    e.preventDefault();
    $("#addNewExecutor #btnAdd").attr("disabled", "disabled").find("span").css("display", "inline-block");
    var name = $("#executorName").val();
    var familyName = $("#executorFamilyName").val();
    var nickname = $("#executorNickname").val() || null;
    var phone = [];
    var phones = $(".executorPhone");
    for (var i = 0; i < phones.length; i++)
        phones.eq(i).val() == "" ? "" : phone.push(phones.eq(i).val()); //push numbers that's not empty
    var address = $("#executorAddress").val() || null;
    var age = $("#executorAge").text().trim() == "العمر" ? null : $("#executorAge").text().trim();
    var rate = $("#executorRate").text().trim() == "التقييم" ? null : $("#executorRate").text().trim();
    var careerOrProduct = [];
    var cop = $(".executorCareerOrProduct");
    for (var i = 0; i < cop.length; i++)
        cop.eq(i).val() == "" ? "" : careerOrProduct.push(cop.eq(i).val()); //push numbers that's not empty
    var academy = $("#executorAcademy").val() || null;
    var accountNumber = [];
    var an = $(".executorAccountNumber");
    for (var i = 0; i < an.length; i++)
        an.eq(i).val() == "" ? "" : accountNumber.push(an.eq(i).val()); //push numbers that's not empty
    $.post("/api/executor", { name, familyName, nickname, phone, address, age, rate, careerOrProduct, academy, accountNumber }, function (res) {
        $("#addNewExecutor #btnAdd").removeAttr("disabled").find("span").css("display", "none");
        console.log(res);
        if (res.success) {
            $("#alert").fadeIn("fast");
            $('#alert').find("#text").text("تم الإضافة بنجاح").parent().prev().css("background-color", "var(--bs-success");
            $("#addNewExecutor").slideUp("fast");
            setExecutor({ id: res.data, name, familyName, nickname, phone, address, age, rate, careerOrProduct, academy, accountNumber })
        }
        else {
            console.log(res);
            $("#alert")
                .fadeIn("fast")
                .find("#text")
                .text(res.msg || "حدث خطأ ما")
                .parent()
                .prev()
                .css("background-color", "var(--bs-danger");
        }
    });
}


function setExecutor(ex) {
    console.log(ex);
    if (!ex.phone) {
        // ex = {};
        ex.phone = [];
    }
    $('#executorSearch').val('تعديل');
    newRequest.executorId = ex.id||null;

    $('#executorInfo').removeClass('d-none');
    $('#inputExecutorName').val(ex.name || '-');
    $('#inputExecutorFamilyName').val(ex.familyName || '-');
    $('#inputExecutorNickname').val(ex.nickname || '-');
    $('.inputExecutorPhone').parent().remove();
    var i = 0;
    do {
        $('#addRequestExecutorPhoneContainer').append(`${i < 3 ? '' : '<div class="col-sm-2"><div class="inputExecutorPhone"></div></div>'}
        <div class="col-sm-4">
        <input type="button" disabled class="form-control inputExecutorPhone"
            placeholder="رقم جوال/هاتف" value="${ex.phone[i] || '-'}" />
    </div>
    <div class="col-sm-3">
        <input type="button" disabled class="form-control inputExecutorPhone"
            placeholder="رقم جوال/هاتف" value="${ex.phone[i + 1] || '-'}" />
    </div>
    <div class="col-sm-3">
        <input type="button" disabled class="form-control inputExecutorPhone"
            placeholder="رقم جوال/هاتف" value="${ex.phone[i + 2] || '-'}" />
    </div>`);
        i = i + 3;
    } while (i < ex.phone.length);
}







//VVVVVVVVVVVVVVVVVV Add Request Functions VVVVVVVVVVVVVVV







function setInputDateDialog() {
    $("#requestExecuteDate")
        // .val(new Date().getFullYear() +
        //     "/" +
        //     (new Date().getMonth() + 1) +
        //     "/" +
        //     new Date().getDate())
        .on('change',function () { return $("#alarm").val($("#requestExecuteDate").val() + " 12:00 am"); })
        .datepicker(arabicDatePickerConfig);
    $("#alarm").datetimepicker(arabicDatePickerConfig);
}
function addNewRequestName(n) {
    $('#requestName').children().removeClass('active');
    $('#requestName').prepend("\n    <a class=\"dropdown-item active btn btn-success\" \n    onclick=\"let is = $(this).hasClass('active');$('#requestName').slideUp('fast').children().removeClass('active');if(is)$('#requestName').prev().text('\u062D\u062F\u062F \u0637\u0644\u0628'); else $(this).addClass('active').parent().prev().text($(this).text());\">\n    ".concat($('input#newName').val(), "</a>")).prev().text($('input#newName').val().toString());
    $('input#newName').val('');
}


function getJsonArrAddresses0AutoComplete() {
    $.getJSON("/api/arr/addresses", (res) => {
        if (res.success) {
          autoComplete($("#requestAddress")[0], res.data);
          autoComplete($("#executorAddress")[0], res.data);
        } else {
          console.log(res);
        }
    });
}
      
function getJsonOperationNames0DropDownRequestNames() {
    $.getJSON("/api/arr/requestsNames", function (res) {
       if (res.success)
          for (var _i = 0, _a = res.data; _i < _a.length; _i++) {
             var n = _a[_i];
             $("#requestName").prepend("<a class=\"dropdown-item btn btn-success\"\n                        onclick=\"let is = $(this).hasClass('active');$('#requestName').slideUp('fast').children().removeClass('active');if(is)$('#requestName').prev().text('حدد طلب'); else $(this).addClass('active').parent().prev().text($(this).text());\">".concat(n, "</a>"));
          }
       else
          console.log(res);
    });
 }