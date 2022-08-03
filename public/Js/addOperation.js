"use strict";
//Some functions are written in typescript and compiled into javascript. So, if you see code that have wired syntax it's made by TS.


/*
Operation object contains:
id
name
notes
deliveryPrice
totalPrice
profit
totalPaid
currency
halfOperationId
details 
init DATE
executorId
executorName
executorFamilyName
executorPhone[]
executorAge
executorRate
executorAddress
executorAcademy
executorCareerOrProduct[]
executorAccountNumber[]
executorInit
requestId
requestAddress
requestNotes
requestDateOfExecution DATE
requestInit DATE
applicantId
applicantName
applicantFamilyName
applicantNickname
applicantPhone[]
applicantInit DATE
*/
var executors = [];// المستفيد
var newOperation = {};//object that will added into database
$(async () => {//ready()
   executors = await getJsonExecutor0SearchModal().catch((e) => { console.log(e); Alert("حدث خطأ ما في تحميل المستفيدين", 'danger'); });//before '0' fun name, after is why?
   $("#searchExecutorModal form").on('submit', e => searchExecutorToReqObj(e, executors));
   $("#addNewExecutor form").on('submit', e => addNewExecutorToReqObj(e));
   getJsonOperationNames0DropDownOperationNames();
   if (location.href.toString().includes('add'))
      $('form#addOperation').on('submit', e => submitAddOperation(e));
   else if (location.href.toString().includes('edit')) {
      await setOperationInfoToBeEdit();
      $('form#addOperation').off().on('submit', e => submitEditOperation(e));
   }

   $("#reminder").on('focus', () => {
      $("#totalPaid").parent().parent().removeClass("d-none");
   });
   $("#doubt").on('focus', () => $("#totalPaid").parent().parent().addClass("d-none"));
   $("#paid").on('focus', () => $("#totalPaid").parent().parent().addClass("d-none"));
   $("span.paid").text(
      (Number($("#totalPrice").val())) - (Number($("#totalPaid").val()))
   );
   $("#totalPaid").on('input', () => {
      $("span.paid").text(Number($("#totalPrice").val()) - Number($("#totalPaid").val()));
   });
});



function getJsonExecutor0SearchModal() {
   return new Promise((resolve, reject) => {
      $.getJSON("/api/executor", function (res) {
         console.log(res);
         if (res.success) {
            executors = res.data;
            for (var _i = 0, executors_1 = executors; _i < executors_1.length; _i++) {
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
            searchExecutorBaseOn("", executors);
            resolve(executors);
         }
         else {
            Alert((res.msg || "حدث خطأ في جلب بيانات الأشخاص"), 'danger')
            reject(res);
         }
      });
   })

}

function searchExecutorBaseOn(s, executors) {
   console.assert(executors, "Can't search for executors when they are undefined!", executors)
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



function getJsonOperationNames0DropDownOperationNames() {
   $.getJSON("/api/arr/requestsNames", function (res) {
      if (res.success)
         for (var _i = 0, _a = res.data; _i < _a.length; _i++) {
            var n = _a[_i];
            $("#operationName").prepend("<a class=\"dropdown-item btn btn-success\"\n                        onclick=\"let is = $(this).hasClass('active');$('#operationName').slideUp('fast').children().removeClass('active');if(is)$('#operationName').prev().text('حدد العملية'); else $(this).addClass('active').parent().prev().text($(this).text());\">".concat(n, "</a>"));
         }
      else
         console.log(res);
   });
}



function getJsonRequestById(id) {//todo if there is an id in url then this function will call with that id. So, get operation and set its data in the form.
   return new Promise((resolve, reject) => {
      $.ajax({
         method: 'put',
         url: "/api/request",
         data: { id },
         success: (res) => {   
            if (res.success) {
               resolve(res.data);
            } else {
               console.log(res);
               Alert(res.msg || "حدث خطأ ما في جلب معلومات الطلب لتحويله",'danger');
               reject(res);
            }
         }, error: (res) => {
            console.log(res);
               Alert(res.msg || "حدث خطأ ما في جلب معلومات الطلب لتحويله",'danger');
               reject(res);
         }
      });
   })
} //end of if(typeof id !== 'number'){..}else{..}

function submitAddOperation(e) {
   e.preventDefault();
   $("#btnAddOperation").attr("disabled", "disabled").find("span").css("display", "inline-block");

   //get data from form----------------
   if (newOperation.halfOperationId) {
      //request became operation
   } else {//new operation
      newOperation.name = $("#operationName").prev().text().trim();
      newOperation.details = $('#details').val().trim();
      if (newOperation.name == 'حدد العملية')
         newOperation.name = null;
   }
   newOperation.notes = $('#notes').val().trim() || null;
   let { deliveryPrice, totalPrice, profit, totalPaid, currency } = getAllPricesAtt();
   if (typeof deliveryPrice !== 'number') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('سعر التوصيل غير صالح', 'danger')
   }if (typeof totalPrice !== 'number') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('سعر اجمالي العملية غير صالح', 'danger')
   }if (typeof profit !== 'number') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('الربح غير صالح', 'danger')
   }if (typeof totalPaid !== 'number') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('مدفوع من العملية غير صالح', 'danger')
   }
   if (totalPaid > totalPrice) {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('لا يمكن ان يكون الدفع اكثر من اجمالي سعر العملية', 'danger')
   }
   if (currency == 'حدد العملة') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('يجب تحديد العملة', 'danger')
   }
   
   newOperation.deliveryPrice = deliveryPrice;
   newOperation.totalPrice = totalPrice;
   newOperation.profit = profit;
   newOperation.totalPaid = totalPaid;
   newOperation.currency = currency.trim() == 'حدد العملة' ? null : currency.trim();
   //----------------------------
   console.log({ newOperation })
   //validation------------------
   if (!newOperation.name) {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('يجب تحديد اسم العملية!', 'danger');
   }
   if (!newOperation.executorId) {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('يجب تحديد مستفيد!', 'danger');
   }
   if (newOperation.currency == 'حدد العملة') {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      return Alert('يجب تحديد العملة!', 'danger');
   }
   //-------------------------

   $.post("/api/operation", newOperation, (res) => {
      $("#btnAddOperation").removeAttr("disabled").find("span").css("display", "none");
      console.log('post:/api/operation: res=', res);
      if (res.success) {
         Alert("تم الإضافة بنجاح", 'success', null, () => location.href = '/operations');
      } else {
         console.log(res);
         Alert((res.msg || "حدث خطأ ما"), 'danger')
      }
   });

}


function addNewOperationName() {
   $('#operationName').children().removeClass('active');
   $('#operationName').prepend("\n    <a class=\"dropdown-item active btn btn-success\" \n    onclick=\"let is = $(this).hasClass('active');$('#operationName').slideUp('fast').children().removeClass('active');if(is)$('#operationName').prev().text('حدد العملية'); else $(this).addClass('active').parent().prev().text($(this).text());\">\n    ".concat($('input#newName').val(), "</a>")).prev().text($('input#newName').val().toString());
   $('input#newName').val('');
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
         Alert("تم الإضافة بنجاح", 'success')
         $("#addNewExecutor").slideUp("fast");
         setExecutor({ id: res.data, name, familyName, nickname, phone, address, age, rate, careerOrProduct, academy, accountNumber })
      }
      else {
         console.log(res);
         Alert((res.msg || "حدث خطأ ما"), 'danger')
      }
   });
}

function setExecutor(ex) {
   console.log(ex);
   if (!ex.phone) {
      ex.phone = [];
   }
   if (ex.id) {
      newOperation.executorId = ex.id || null;
      let li = $('#searchExecutorModal ul li');
      for (let i = 0; i < li.length; i++) {
         if (Number(li.eq(i).find('.contactId').text()) == ex.id) {
            li.eq(i).addClass('active');
            break;
         }
      }
   }
   $('#executorSearch').val('تعديل');
   $('#executorInfo').removeClass('d-none');
   $('#inputExecutorName').val(ex.name || '-');
   $('#inputExecutorFamilyName').val(ex.familyName || '-');
   $('#inputExecutorNickname').val(ex.nickname || '-');
   $('.inputExecutorPhone').parent().remove();
   var i = 0;
   do {
      $('#addOperationExecutorPhoneContainer').append(`${i < 3 ? '' : '<div class="col-sm-2"><div class="inputExecutorPhone"></div></div>'}
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
   $.getJSON("/api/arr/addresses", function (res) {
      if (res.success) {
         autoComplete($("#executorAddress")[0], res.data);
      }
      else {
         console.log(res);
      }
   });
   $('#addNewExecutor').slideDown('fast', function () {
      setCareerOrProductListener();
      setAccountNumberListener();
      setExecutorPhoneListener();
   });
}

function setCareerOrProductListener() {
   $(".executorCareerOrProduct").off();
   $(".executorCareerOrProduct:last").on("input", function () {
      $("#careerOrProductContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setCareerOrProductListener()});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\"\n                    >&times;</span>\n            </div>\n            <input\n                dir=\"rtl\"\n                type=\"text\"\n                class=\"form-control executorCareerOrProduct form-control\"\n                placeholder=\"\u0645\u0647\u0646\u0629 \u0623\u0648 \u0645\u0646\u062A\u062C \u0627\u062E\u0631\"\n                maxlength=\"100\"/>\n        </div>");
      $(".executorCareerOrProduct:last").parent().slideDown("fast");
      setCareerOrProductListener();
   });
}
function setAccountNumberListener() {
   $(".executorAccountNumber").off();
   $(".executorAccountNumber:last").on("input", function () {
      $("#accountNumberContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setAccountNumberListener()});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\"\n                    >&times;</span>\n            </div>\n            <input\n                dir=\"rtl\"\n                type=\"text\"\n                class=\"form-control executorAccountNumber form-control\"\n                placeholder=\"\u062D\u0633\u0627\u0628 \u0645\u0635\u0631\u0641\u064A \u0627\u062E\u0631\"\n                maxlength=\"100\"/>\n        </div>");
      $(".executorAccountNumber:last").parent().slideDown("fast");
      setAccountNumberListener();
   });
}

function setExecutorPhoneListener() {
   $(".executorPhone").off();
   $(".executorPhone:last").on("input", function () {
      $("#executorPhoneContainer").append("\n        <div style='display:none;' class=\"input-group my-1\" dir=\"ltr\">\n            <div>\n                <span\n                    onclick=\"$(this).parent().parent().slideUp('fast',()=>{$(this).parent().parent().remove();setExecutorPhoneListener();});\"\n                    style=\"border-end-end-radius: 0; border-top-right-radius: 0\"\n                    class=\"close btn bg-danger text-white\">&times;</span>\n            </div>\n            <input dir=\"rtl\" type=\"text\"\n                class=\"form-control executorPhone form-control\" placeholder=\"\u0631\u0642\u0645 \u0627\u062E\u0631\"\n                onkeypress=\"return inputTypeNumber(event)\"\n                maxlength=\"15\" minlength=\"9\"/>\n        </div>");
      $(".executorPhone:last").parent().slideDown("fast");
      setExecutorPhoneListener();
   });
}

/**
 * return {deliveryPrice, totalPrice, profit, totalPaid, currency}
 */
function getAllPricesAtt() {
   var isPaid = $('#paid:checked').val() ? true : false;
   var isDoubt = $('#doubt:checked').val() ? true : false;
   var isReminder = $('#reminder:checked').val() ? true : false;

   if (isPaid)
      console.assert(!isDoubt && !isReminder)
   if (isDoubt)
      console.assert(!isPaid && !isReminder)
   if (isReminder)
      console.assert(!isPaid && !isDoubt);

   var deliveryPrice = Number($('#deliveryPrice').val());
   var currency = $('#currency').prev().text().trim();


   var profit = Number($('#profit').val());
   var totalPrice = Number($('#totalPrice').val());

   var totalPaid = Number($('#totalPaid').val());


   if (isPaid) {
      totalPaid = totalPrice;
   } else if (isDoubt) {
      totalPaid = 0;
   }//if isReminder then totalPaid will equal to $('#totalPaid').val()

   // deliveryPrice
   // totalPrice
   // profit
   // totalPaid
   // currency
   return { deliveryPrice, currency, profit, totalPrice, totalPaid };
}