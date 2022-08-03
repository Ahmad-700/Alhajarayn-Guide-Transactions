use guide;
/*================================= Add person =====================================*/
-- select * from persons;
/*add person Object = {
	name:'Ahmad Hashim',
    familyName:'Alkaf',
    nickname:'medoo',
    phone:['712345678','734567890']   <- server will inser it one by one after insert person to get personId
    }*/
insert into persons(name,familyName,nickname)
values ('احمد هاشم','الكاف','ميدو'),
	   ('Ahmad','Alkaf','Medoo'),
       ('Mohammed Adnan','Alkaf','Hamoody');
set @personId = last_insert_id();
-- Add phone for person
insert into phones(personId,phoneNumber)
values(@personId,'712345678'), -- for each phone element repeat this statement
	  (@personId,'734567890'),
      (@personId,'5436354645'),
      (2,'6787867877');
        
/*======================================= Add executor =============================================*/
/*add executor object = {			These functions(procedures) will return an id if exists or make a row and get that id
	name:'Ali Hussain',				  <
	familyName:'Bin Sheap',			<-    personId:getPersonIdFrom(name,familyName, nickname)
    nickname:'AloOosh',				  <
    phone:['777777777'],			<- server will insert it one by one after insert executor
	address:'الحوطة',					<- addressId:getAddressIdFrom(address),
    careerOrProduct:['honey','engineer'], <- 		server will inser it one by one after insert executor
    accountNumber:['242342324234','32425565645'], <-  ``	``   ``   `` ``  `` ``   `` 	``  	``
    age:'شاب',
    rate:'ممتاز',
    academy:'high school'
    }
    */


-- add executors
set @addressId = -1; -- declare variable with value of -1
set @personId = -1;  --   ``       ``     ``    ``  `` ``
call setAddressId('الحوطة',@addressId);
call setPersonId('Ali Hussain', 'Bin Sheap', 'AloOosh', @personId);
insert into executors(personId, addressId, age, rate, academy)
values(@personId, @addressId, 'شاب', 'ممتاز', 'high school');
set @addressId = -1;
set @personId = -1;
call setAddressId('الهجرين',@addressId);
call setPersonId('Mohsen Adnan', 'Alkaf', 'Memo', @personId);
insert into executors(personId, addressId, age, rate, academy)
values(@personId, @addressId, 'شاب', 'ممتاز', 'University');

-- add phone to that executors
insert into phones(personId,phoneNumber) 
values((select id from persons where name = 'Ali Hussain' and familyName = 'Bin Sheap'),'777777777'),
	  ((select id from persons where name = 'Ali Hussain' and familyName = 'Bin Sheap'),'733333333');

-- add careerOrProducts
insert into careerOrProducts(executorId,careerOrProduct)
values ((select id from executors where personId = (select id from persons where persons.name = 'Ali Hussain' and persons.familyName = 'Bin Sheap')), 'honey'),
       ((select id from executors where personId = (select id from persons where persons.name = 'Ali Hussain' and persons.familyName = 'Bin Sheap')), 'engineer');

-- add accountNumber
insert into accountNumbers(executorId, accountNumber)
values ((select id from executors where personId = (select id from persons where persons.name = 'Ali Hussain' and persons.familyName = 'Bin Sheap')), '242342324234'),
	   ((select id from executors where personId = (select id from persons where persons.name = 'Ali Hussain' and persons.familyName = 'Bin Sheap')), '32425565645');


/*================================= Add request =================================*/
/* senarios in server:
   senario 1: applicantId, executorNull.
   senario 2: applicantInfo, executoNull.
*/
/*request object in adding = {
	name:'electricity',					<- requestNames will updated before adding a request
    applicantId:1,				
    applicantName:'Haddar Hussain',
    applicantFamilyName:'Bin Sheap',
    applicantNickname:'Hadoor',
    applicantPhone:['771122335','789456123'],
    //executorId:null, when adding we don't care about executor but when retrive all executor info will retrive 
    details:'this is details of a request',
    notes:'nothing in note',
    address:'الحنجور',
    dateOfExecution:'2022/2/13 13:30',
    alarm:'2022/2/12 7:00'}*/



 -- add name of request in requestNames table. if not found will insert it as new
set @requestNameId = -1;
call setRequestNameId('electricity', @requestNameId);

-- add halfOperation
insert into halfOperations(requestNameId, details)					
values (@requestNameId, 'this is details of a request'); -- executorId is null when adding new request
set @halfOperationId = last_insert_id();

-- add applicantId
set @applicantId = -1;
call setPersonId('Khaled Hussain','Bin Sheap','Hadoor',@applicantId);

-- add applicantPhone
insert into phones(personId,phoneNumber)
values(@applicantId,'771122335');
insert into phones(personId,phoneNumber)
values(@applicantId,'789456123');

-- add address
set @addressId = -1;
call setAddressId('الحنجور',@addressId);

-- insert the request
insert into requests(halfOperationId, applicantId, notes, addressId, dateOfExecution, alarm)
values (@halfOperationId, @applicantId, 'nothing in note'
	   , @addressId, '2022/2/13 13:30', '2022/2/12 7:00');




/*================================= Add Operation =================================*/
/*operation object = {
	name:'pumber',
    notes:'this is operation notes',
    executorId:1,
    //executor...info, <- when adding operation we need just id. But when retrive operation then executorInfo will retrive
    deliveryPrice:700,
    totalPrice:3000,
    profit:500,
    totalPaid:2000,
}*/

-- if (operation is without request) add halfOperation:
-- add operation name
set @operationNameId = -1;
call setRequestNameId('pumber', @operationNameId);

-- add halfOperations
insert into halfOperations(requestNameId,executorId)
values (@operationNameId, 2); -- executorId should hardcoded.
set @halfOperationId = last_insert_id();

-- Else if (request convert to operation) then set @halfOperationId with request halfOperationId
-- add Operation
insert into operations(halfOperationId, notes, deliveryPrice, totalPrice, profit, totalPaid, currency)
values (@halfOperationId, 'this is operation notes',700,3000,500,2000,'يمني');

/*================================= CONVERT REQ TO Operation =================================*/
insert into operations(halfOperationId, notes, deliveryPrice, totalPrice, profit, totalPaid, currency)
values (1, 'this is converted req to operation', 300, 5000, 500, 0, 'يمني');


-- --------------- update Request------------------
/*set @addressId = -1;
call setAddressId('الحنجور',@addressId);

set @requestNameId = -1;
call setRequestNameId('electricity', @requestNameId);

UPDATE halfOperations 
SET requestNameId = @requestNameId, executorId = 1
WHERE halfOperations.id = (select halfOperationId from requests where requests.id = 4);

UPDATE requests
SET applicantId = 2, details = 'details',notes = 'notes',addressId = @addressId,dateOfExecution = '2022/3/12',alarm = '2003/3/22'
WHERE requests.id = 4;
*/

/*
use guide;
select * from careerOrProducts;
select * from persons;
select * from personsView;
select * from executors;
select * from executorsView;
select * from accountNumbers;
select * from requestNames;
select * from requests;
select * from requestsView;
select * from operations;
select * from operationsView;
select * from phones;
select * from halfOperations;
*/