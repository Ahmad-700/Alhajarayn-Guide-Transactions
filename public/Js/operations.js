"use strict";

var ops;
$(async () => {
   ops = await getJsonOperations().catch((res) => { console.log(res); Alert(res.msg || 'حدث خطأ ما في جلب بيانات العمليات', 'danger'); });
   setAnalysis(ops);
   for (let o of ops) {
      $('tbody').append(`<tr  class="list-group-item-action" onclick="showDetails(this)">
      <td>${o.id || '-'}</td>//
      <td>${o.name || '-'}</td>//
      <td>${(o.executorName || o.executorFamilyName || o.executorNickname ? o.executorName || '' + ' ' + o.executorFamilyName || '' + (o.executorNickname ? ' (' + o.executorNickname + ')' : '') : '-')}</td>
      <td>${(o.deliveryPrice = Number(o.deliveryPrice)) || '-'}</td>
      <td>${(o.totalPrice = Number(o.totalPrice)) || '-'}</td>
      <td>${(o.totalPaid = Number(o.totalPaid)) || '-'}</td>
      <td>${(o.profit = Number(o.profit)) || '-'}</td>
      <td class="${(o.totalPaid == o.totalPrice ? 'bg-success text-white' : (o.totalPaid == 0 ? 'bg-danger text-white' : 'bg-warning'))}">${(o.totalPaid == o.totalPrice ? 'مدفوع' : (o.totalPaid == 0 ? 'آجل' : ('متبقي:' + Number(o.totalPrice - o.totalPaid))))}</td>
      <td>${o.currency || '-'}</td>
      <td>${o.details || '-'}</td>
      <td>${o.notes || '-'}</td>
      <td>${printDatetime(o.init)}</td>
      </tr>`)
   }
});


function getJsonOperations() {
   return new Promise((resolve, reject) => {
      $.ajax({
         url: '/api/operation',
         method: 'GET',
         dataType: 'json',
         success: (res) => {
            $("#tableWaiter").css("display", "none");
            console.log(res.data);
            if (res.success) {
               resolve(res.data)
            } else {
               reject(res);
            }
         },
         error: (e) => {
            $("#tableWaiter").css("display", "none");
            reject(e)
         }
      })
   })
}

function showDetails(tr) {
   var o;
   for (let anO of ops) {
      if (anO.id == $(tr).find('td:first').text()) {
         o = anO;
         break;
      }
   }

   $('#operationDetailModel').slideDown('fast');
   $('#name').text(o.name || '-');
   $('#details').text(o.details || '-');
   $('#deliveryPrice').text(o.deliveryPrice || '-');
   $('#totalPrice').text(o.totalPrice || '-');
   $('#totalPaid').text(o.totalPaid || '-');
   $('#profit').text(o.profit || '-');
   $('#paidStatus').text((o.totalPaid == o.totalPrice ? 'مدفوع' : (o.totalPaid == 0 ? 'آجل' : ('متبقي:' + Number(o.totalPrice - o.totalPaid)))));
   $('#currency').text(o.currency || '-');
   $('#notes').text(o.notes || '-');
   $('#id').text(o.id || '-');
   $('#init').text(printDatetime(o.init));
   if (o.executorId) {
      $('#executorData').removeClass('d-none')
      $('#executorId').text(o.executorId || '-');
      $('#executorFullName').text(o.executorName || o.executorFamilyName || o.executorNickname ? o.executorName || '' + ' ' + o.executorFamilyName || '' + (o.executorNickname ? ' (' + o.executorNickname + ')' : '') : '-');
      $('#executorPhone').text(Array.isArray(o.executorPhone) ? o.executorPhone.join(' ,') : (o.executorPhone || '-'));
      $('#executorAge').text(o.executorAge || '-');
      $('#executorRate').text(o.executorRate || '-');
      $('#executorAddress').text(o.executorAddress || '-');
      $('#executorAcademy').text(o.executorAcademy || '-');
      $('#executorAccountNumber').text(Array.isArray(o.executorAccountNumber) ? o.executorAccountNumber.join(' ,') : (o.executorAccountNumber || '-'));
      $('#executorCareerOrProduct').text(Array.isArray(o.executorCareerOrProduct) ? o.executorCareerOrProduct.join(' ,') : (o.executorCareerOrProduct || '-'));
   }else $('#executorData').addClass('d-none')
   if (o.requestId) {
      $('#requestData').removeClass('d-none')
      $('#applicantId').text(o.applicantId)
      $('#applicantFullName').text(o.applicantName || o.applicantName || o.applicantNickname ? o.applicantName || '' + ' ' + o.applicantFamilyName || '' + (o.applicantNickname ? ' (' + o.applicantNickname + ')' : '') : '-')
      $('#applicantPhone').text(Array.isArray(o.applicantPhone) ? o.applicantPhone.join(' ,') : (o.applicantPhone || '-'))
      $('#requestAddress').text(o.requestAddress)
      $('#requestDateOfExecution').text(o.requestDateOfExecution)
      $('#requestNotes').text(o.requestNotes)
      $('#requestId').text(o.requestId)
      $('#requestInit').text(o.requestInit)
   } else $('#requestData').addClass('d-none')

   $('#modalDelete').off().on('click', () => $('#confirmModal').slideDown('fast').find('#modalConfirmDelete').off().on('click', () => deleteOperation(o.id)));
   $('#modalEdit').off().on('click', () => location.href = '/editOperation?id=' + o.id);
   // $('#modalToOperation').off().on('click', () => location.href = '/addOperation?id=' + o.id); this is an operation not request
}



function searchOnInput() {
   $("#search").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("table tr:not(:first)").filter(function () {
         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
   });
}


function deleteOperation(id) {
   $("#modalDelete").attr("disabled", "disabled").find("span").css("display", "inline-block");

   $.ajax({
      method: 'delete',
      url: "/api/operation",
      data: { id },
      success: (res) => {
         $("#modalDelete").removeAttr("disabled").find("span").css("display", "none");

         if (res.success) {
            Alert("تم الحذف بنجاح", 'success', null, () => location.reload())
         } else {
            console.log(res);
            Alert((res.msg || "حدث خطأ ما"), 'danger')
         }
      }, error: (res) => {
         $("#modalDelete").removeAttr("disabled").find("span").css("display", "none");
         console.log(res);
         Alert((res.msg || "حدث خطأ ما"), 'danger')
      }
   });
}