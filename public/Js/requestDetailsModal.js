function showOrderDetails(request) {
	if ($("div#myModal").length == 0)
		$("body").append(`
<div dir='rtl' class="modal"style="background:rgb(0,0,0,0.4)" id="myModal">
<div class="modal-dialog modal-dialog-scrollable">
<div class="modal-content">
<div dir='rtl' class="modal-header bg-success text-white">
<button type="button" class="btn-close bg-white" onclick="$('#myModal').fadeOut('fast')"></button>
<h4 class="modal-title">تفاصيل الطلب</h4>
</div>
<div class="modal-body">
<ul class="list-group-flush">
<li class="list-group-item text-success">الطلب: <span class="text-black">${
			request.name || "-"
		}</span></li>
<li class="list-group-item text-success">التفاصيل: <span class="text-black">${
			request.details || "-"
		}</span></li>
<li class="list-group-item text-success">مقدم الطلب: <span class="text-black">${
			request.applicant3Names || "" + " " + request.applicantLastName || ""
		}</span></li>
<li class="list-group-item text-success">رقم مقدم الطلب: <span class="text-black">${request.applicantPhone.join(
			" , "
		)}</span></li>
<li class="list-group-item text-success">منفذ الطلب: <span class="text-black">
		  ${request.executor3Names || "" + " " + request.executorLastName || ""}
		  </span></li>

	 <li class="list-group-item text-success">رقم منفذ الطلب: <span class="text-black">
		  ${request.executorPhone.join(" , ")}
		  </span></li>

<li class="list-group-item text-success">الموقع: <span class="text-black">
		  ${request.address || "-"} 
		  </span></li>


<li class="list-group-item text-success">تاريخ التنفيذ: <span class="text-black">
		  ${printDatetime(request.dateOfExecution)}
		  </span></li>

<li class="list-group-item text-success">ملاحظات: <span class="text-black">
		  ${request.notes || "-"} 
		  </span></li>

<li class="list-group-item text-success">منبه: <span class="text-black">
		  ${printDatetime(request.alarm)}
		  </span></li>

<li class="list-group-item text-success">رقم الطلب: <span class="text-black">${
			request.id
		}</span></li>
<li class="list-group-item text-success">تاريخ إنشاء الطلب: <span class="text-black">${printDatetime(
			request.dateOfRequest
		)}</span></li>

</ul>
</div>
<div dir="ltr" class="btn-group btn-group-lg">
<button id='modalDelete' type="button" class="btn btn-danger">حذف</button>
<button id='modalToOperation' type="button" class="btn btn-primary">انهاء الطلب</button>
<!--<button id='modalEdit' type="button" class="btn btn-warning">نعديل</button>-->
</div> 
</div>
</div>
</div>`);
	$("#modalDelete").click(() => {
		if ($("div#confirmModal").length == 0) {
			$("body")
				.append(`<div dir='rtl' class="modal"style="background:rgb(0,0,0,0.4)" id="confirmModal">
    <div class="modal-content modal-dialog modal-sm">
    
    <div dir='rtl' class="modal-header bg-success text-white">
    <button type="button" class="btn-close bg-white" onclick="$('#confirmModal').fadeOut('fast')"></button>
    </div>
    
    <div class="modal-body">
    <h4 class="modal-title">هل أنت متأكد؟</h4>
    </div> 
    <div dir="ltr" class="btn-group btn-group-lg">
    <button id='modalConfirmDelete' type="button" class="btn btn-danger">نعم</button>
    <button onclick='$("#confirmModal").fadeOut()' type="button" class="btn btn-success">إلغاء</button>
    </div>
    </div>
    </div>`);
			$("#confirmModal").fadeIn();
			$("#modalConfirmDelete").click(() => {
				$.get("/api/deleteRequest", { id: targetRequest.id }, (res) => {
					if (res.success) {
						alert("تم الحذف بنجاح");
					} else {
						console.log(res);
						alert(res.msg || "حدث خطأ ما");
					}
					location.reload()
				});
			});
		} else $("#confirmModal").fadeIn();
	});
	// $("#modalEdit").click(() => {
	// 	//todo make an edit html page with url ' /edit ', and when page load, take the id of the request from the url, and get its all data to edit it.
	// 	location.href = "/edit?id=" + targetRequest.id;
	// });
	$("#modalToOperation").click(() => {
		//todo make an operation html page with url ' /operation ', and when page load, take the id of the request from the url, and get its all data to operate it.
		location.href = "/operation?id=" + targetRequest.id;
	});
	targetRequest = request;
	$("#myModal").fadeIn();
}
var targetRequest;
