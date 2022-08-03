var requests;
$(function () {
   getJsonRequests();
   searchOnInput();
});

function showDetails(req) {
   for (let r of requests)
      if (r.id == req) {
         req = r;
         break;
      }

   if (!req)
      return Alert('حدث خطأ ما', 'danger');

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
   } else $('#applicantData').addClass('d-none'); if (req.executorId) {
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
      console.log(value)
      $("#requestDiv").children().not('#tableWaiter').each((i, v) => {
         
         console.log(`$ : ($(v).text().includes(value))`, ($(v).text().includes(value)))
         if ($(v).text().includes(value))
            $(v).removeClass('d-none');
         else $(v).addClass('d-none');
      })
   });
}


function getJsonRequests() {
   $.getJSON("/api/request", (res) => {
      $("span#tableWaiter").hide();
      console.log(res);
      if (res.success) {
         requests = res.data;

         for (let r of res.data) {

            let card = $(`<div id='card${r.id}' class="card d-inline overflow-auto p-1 shadow rounded-2 col-sm-2 border m-2 ${r.executorId == null ? 'divNull' : 'divReg'}" style="white-space:nowrap;min-width:250px;max-width:500px;" onclick="showDetails(${r.id});"></div>`)
            let content = `<span class="${r.executorId == null ? 'spanNull' : 'spanReg'}">الطلب:</span>${r.name || '-'}<br>
           <span class="${r.executorId == null ? 'spanNull' : 'spanReg'}">مقدمه:</span> 
         ${r.applicantName.substring(0, r.applicantName.indexOf(' ')) || '' + ' ' + r.applicantFamilyName || '-'}
            ${r.applicantPhone ? '<br>' : ''}${(Array.isArray(r.applicantPhone) ? r.applicantPhone.join(' ,') : (r.applicantPhone || ''))} 
            
          <br> 
          <span class="${r.executorId == null ? 'spanNull' : 'spanReg'}">منفذه:</span>
          ${((r.executorName ? r.executorName.substring(0, r.executorName.indexOf(' ')) + ' ' : '') + (r.executorFamilyName || '')) || '-'} 
          ${r.executorPhone ? '<br>' : ''}
          ${(Array.isArray(r.executorPhone) ? r.executorPhone.join(' ,') : (r.executorPhone || ''))} 
          <br>
          <span class="${r.executorId == null ? 'spanNull' : 'spanReg'}">الموقع:</span>
          ${r.address || '-'}
          <br>
          <span class="${r.executorId == null ? 'spanNull' : 'spanReg'}">وقت التنفيذ:</span>
          ${printDatetime(r.dateOfExecution)}
          `;
            card.append(content);
            $("#requestDiv").append(card);
            changeColor(r);
         }
      } else {
         console.log(res)
         Alert(res.msg || 'حدث خطأ ما', 'danger')
      }
   });
}

/**
 * change card background color base on alarm date and today date
 * @param {Date} alarm 
 */
function changeColor(r) {
   if (!r.executorId || !r.alarm)
      return;
   let diff = Date.parse(r.alarm)- Date.now();
   // console.log({ diff });
   if (!diff)
      return;
   if (diff < 0) {
      // console.log('-diff',r.alarm)
      $('div#card' + r.id).css('background-color', 'rgb(255, 193, 7)')
   } else {
      let minDays = 3; //todo options for when to start yellowish(yellow) the background of a card.
      let max = minDays * 24 * 60 * 60 * 1000;
      let yellowish = (255 / (max /diff ));// yellowish is number between 0 to 255 base on (minDays, alarm, now date)
      // yellowish = 255 - yellowish;
      // console.log({ yellowish })
      // console.log({ max })
      // console.log({alarm:r.alarm,'diff<max':diff<max})
      if (diff < max) {
         
         // console.log(r.alarm,`rgb(255, ${Math.round(191 + (64 / (max / diff)))}, ${Math.round(yellowish)})`)
         
         $('div#card' + r.id).css('background-color', `rgb(255, ${Math.round(191 + (64 / (max / diff)))}, ${Math.round(yellowish)})`)
      }
   }
   // console.log({now:Date.now()})
   // console.log({alarm:Date.parse(alarm)})
   // console.log({diff})
}