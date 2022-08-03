var requests;
$(function () {
   getJsonRequests();
   searchOnInput();
});

function showDetails(tr) {//was tr
   var req;
   for (let r of requests) {
      if (r.id == $(tr).find('td:first').text()) {
         req = r;
         break;
      }
   }
   $('#requestDetailModel').slideDown('fast');
   $('#name').text(req.name || '-');
   $('#id').text(req.id || '-');
   $('#details').text(req.details || '-');
   $('#notes').text(req.notes || '-');
   $('#address').text(req.address || '-');
   $('#dateOfExecution').text(printDatetime(req.dateOfExecution));
   if (req.applicantId) {
      $('#applicantData').removeClass('d-none')
      $('#applicantId').text(req.applicantId || '-');
      $('#applicantFullName').text(req.applicantName || req.applicantFamilyName || req.applicantNickname ? req.applicantName || '' + ' ' + req.applicantFamilyName || '' + (req.applicantNickname ? ' (' + req.applicantNickname + ')' : '') : '-');
      $('#applicantPhone').text(Array.isArray(req.applicantPhone) ? req.applicantPhone.join(' ,') : (req.applicantPhone || '-'));
   } else $('#applicantData').addClass('d-none');
   if (req.executorId) {
      $('#executorData').removeClass('d-none');
      $('#executorId').text(req.executorId || '-');
      $('#executorFullName').text(req.executorName || req.executorFamilyName || req.executorNickname ? req.executorName || '' + ' ' + req.executorFamilyName || '' + (req.executorNickname ? ' (' + req.executorNickname + ')' : '') : '-');
      $('#executorPhone').text(Array.isArray(req.executorPhone) ? req.executorPhone.join(' ,') : (req.executorPhone || '-'));
      $('#executorAge').text(req.executorAge || '-');
      $('#executorRate').text(req.executorRate || '-');
      $('#executorAddress').text(req.executorAddress || '-');
      $('#executorAcademy').text(req.executorAcademy || '-');
      $('#executorAccountNumber').text(Array.isArray(req.executorAccountNumber) ? req.executorAccountNumber.join(' ,') : (req.executorAccountNumber || '-'));
      $('#executorCareerOrProduct').text(Array.isArray(req.executorCareerOrProduct) ? req.executorCareerOrProduct.join(' ,') : (req.executorCareerOrProduct || '-'));
   } else $('#executorData').addClass('d-none');

   $('#alarm').text(printDatetime(req.alarm));
   $('#init').text(printDatetime(req.init));
   $('#modalDelete').off().on('click', () => $('#confirmModal').slideDown('fast').find('#modalConfirmDelete').off().on('click', () => deleteRequest(req.id)));
   $('#modalEdit').off().on('click', () => location.href = '/editRequest?id=' + req.id);
   $('#modalToOperation').off().on('click', () => location.href = '/addOperation?id=' + req.id);

}

function deleteRequest(id) {
   $("#modalDelete").attr("disabled", "disabled").find("span").css("display", "inline-block");

   $.ajax({
      method: 'delete',
      url: "/api/request",
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


function searchOnInput() {
   $("#search").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("table tr:not(:first)").filter(function () {
         $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      });
   });
}


function getJsonRequests() {
   $.getJSON("/api/request", (res) => {
      $("span#tableWaiter").hide();
      if (res.success) {
         requests = res.data;
         setAnalysis(requests);
         var requestTable = $("tbody");
         for (const req of res.data) {
            requestTable.append(
               `<tr class="list-group-item-action" onclick="showDetails(this)">
       <td>${req.id || "-"}</td>
       <td>${req.name || "-"}</td>
       <td>${req.details || "-"}</td>
       <td>${req.address || "-"}</td>
       <td>${req.notes || "-"}</td>
       <td>${req.applicantName || "-"}</td>
       <td>${req.applicantFamilyName || "-"}</td>
       <td>${req.applicantNickname || "-"}</td>
       <td>${printDatetime(req.dateOfExecution) || "-"}</td>
       <td>${req.executorName || "-"}</td>
       <td>${req.executorFamilyName || "-"}</td>
       <td>${req.executorNickname || "-"}</td>
       <td>${printDatetime(req.alarm) || "-"}</td>
       <td>${printDatetime(req.init) || "-"}</td>
     </tr>
`
            );
         }
      } else {
         console.log(res);
         $("#alert").fadeIn("fast").find("#text")
            .text(res.msg || "حدث خطأ ما").parent().prev().css("background-color", "var(--bs-danger");
      }
   });
}