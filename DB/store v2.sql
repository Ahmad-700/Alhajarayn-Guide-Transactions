DROP database guide;
CREATE database guide;
use guide;
CREATE TABLE
    persons(
        id INT auto_increment,
        name varchar(300), CONSTRAINT PK_persons_id PRIMARY key (id),
        familyName varchar(50) default(''),-- not null for executor but allow null for applicant
        nickname varchar(50) default(''),
        init datetime default now(),
        CONSTRAINT UN_persons_UniqueFullNames unique(name,familyName) 
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE phones(
        id INT auto_increment, CONSTRAINT PK_phones_id PRIMARY key (id),
		personId INT not null, CONSTRAINT FK_phones_personId FOREIGN key (personId) REFERENCES persons (id) ON Delete cascade,
        phoneNumber VARCHAR(15) not null,
        constraint UN_phones_PersonHaveDupSameNumber unique(personId,phoneNumber)
    )ENGINE=InnoDB;

CREATE TABLE addresses(
		id int auto_increment, CONSTRAINT PK_addresses_id PRIMARY KEY (id),
		address varchar(100) not null, CONSTRAINT UN_addresses_address unique(address)
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE
    executors(
		id INT auto_increment,CONSTRAINT PK_executors_id PRIMARY key (id),
        personId INT not null, CONSTRAINT FK_executors_personId foreign key (personId) REFERENCES persons(id),constraint UN_executors_personId unique(personId), -- one-to-one
        addressId INT, CONSTRAINT FK_executors_addressId foreign key (addressId) REFERENCES addresses(id),-- 	  one-to-one
        age enum('طفل', 'شاب', 'عجوز'),
--         accountNumber VARCHAR(50), another table one-to-many
-- 		   careerOrProduct nvarchar(100), another table one-to-many
        rate enum('ممتاز','جيد جدا','جيد','مقبول','ضعيف'),
        academy varchar(50)
		)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE accountNumbers(
		id int auto_increment, CONSTRAINT PK_accountNumbers_id Primary key (id),
        executorId int not null, constraint FK_accountNumbers_executorId foreign key (executorId) references executors(id) on delete cascade,
        accountNumber varchar(100) not null
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE careerOrProducts(
		id int auto_increment, constraint PK_careersOrProducts_id primary key(id),
		executorId int not null, constraint FK_careersOrProducts_executorId foreign key (executorId) references executors(id) on delete cascade,
        careerOrProduct varchar(100) not null, constraint UN_careerOrProducts_executorHaveDupCareerOrProduct unique(executorId,careerOrProduct)
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

create table requestNames(
		id int auto_increment, constraint PK_requestNames_id primary key (id),
        requestName varchar(50) not null
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

create table halfOperations(
		id int auto_increment,constraint PK_halfOperation_id primary key (id),
        requestNameId int not null, constraint FK_halfOperation_requestNameId foreign key (requestNameId) references requestNames(id),
        executorId int, constraint FK_halfOperation_executorId foreign key (executorId) references executors(id),
        details varchar(400)
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE
    requests(
        id INT auto_increment, CONSTRAINT PK_requests_id PRIMARY key (id),
        halfOperationId int not null, constraint UN_requests_halfOperationId unique(halfOperationId),CONSTRAINT FK_requests_halfOperationId FOREIGN key (halfOperationId) REFERENCES halfOperations (id), -- contains requestNameId, executorId
--         requestName nvarchar(400), in halfOperation table
--         executorId INT, in halfOperation table
        applicantId INT, CONSTRAINT FK_requests_applicantId FOREIGN key (applicantId) REFERENCES persons (id), -- reference to the persons table
        notes varchar(400),
        addressId int, CONSTRAINT FK_requests_addressId FOREIGN key (addressId) REFERENCES addresses (id), -- reference to addresses table
        dateOfExecution datetime,
		alarm datetime,
        init datetime default now()
    )ENGINE=InnoDB  DEFAULT CHARSET=utf8;
    
    
CREATE TABLE operations(
		id int auto_increment, CONSTRAINT PK_operation_id PRIMARY KEY (id),
        halfOperationId int not null, CONSTRAINT FK_operation_halfOperationId FOREIGN KEY (halfOperationId) REFERENCES halfOperations(id), constraint UN_operations_halfOperationId unique(halfOperationId), -- contains operationNameId executorId
--         requestId INT, we know the request by (select * from requests where requests.halfOperationId = operation.halfOperationId)
		notes varchar(400),
        deliveryPrice dec(10,2), -- datatype is number with 10 digits and two of them is after point. max number: 99999999.99
        totalPrice dec(10,2) not null,
        profit dec(10,2) not null, 	
        totalPaid dec(10,2) not null, constraint CH_operation_totalPaidLessThanTotalPrice check(totalPaid <= totalPrice),
		currency enum('يمني','سعودي','دولار') not null,
        init datetime default now()
           /*
         payment state :
         1-paid:if the operationtotalPrice = operationTotalPaid;
         2-rminder: if operationTotalPrice > operationTotalPaid && operationTotalPaid !=0;
         3-dept: if the operationTotalPaid==0;
         */
)ENGINE=InnoDB  DEFAULT CHARSET=utf8;

/*======================================== Views ========================================*/
-- Note: when server get persons as array it needs to check the id if there are repeat id then server needs to filter the result,
-- 		 because that means phone att is multi-value and it will convert it as array; because of join in database.
-- 		 	that happens whenever there is one-to-many i.e object have an attribute as array.
create view personsView AS 
select persons.id as id,name,familyName,nickname,phoneNumber AS phone, exists(select * from executors where personId = persons.id) AS isExecutor,init
from persons left join phones on persons.id = phones.personId order by persons.init desc;

create view executorsView AS
select executors.id, name,familyName,nickname,phoneNumber AS phone,age,rate,address,academy,careerOrProduct,accountNumber,init 
from executors 
left join persons on executors.personId = persons.id
left join addresses on executors.addressid = addresses.id
left join phones on executors.personId = phones.personId
left join careerOrProducts on executors.id = careerOrProducts.executorId
left join accountNumbers on executors.id = accountNumbers.executorId order by persons.init desc;

create view requestsView AS
select requests.id, requestNames.requestName AS name,halfOperations.details, addresses.address,requests.notes,dateOfExecution, alarm, halfOperations.id as halfOperationId,requests.init, requests.applicantId, app.name AS applicantName, app.familyName AS applicantFamilyName, app.nickname AS applicantNickname, app.phone AS applicantPhone, app.init AS applicantInit, exe.id AS executorId,exe.name AS executorName, exe.familyName AS executorFamilyName,exe.nickname AS executorNickname, exe.phone AS executorPhone,exe.age AS executorAge, exe.rate as executorRate,exe.address AS executorAddress, exe.academy AS executorAcademy,exe.careerOrProduct AS executorCareerOrProduct, exe.accountNumber AS executorAccountNumber, exe.init AS executorInit
from requests
left join halfOperations on requests.halfOperationId = halfOperations.id 
left join personsView as app on requests.applicantId = app.id
left join addresses on requests.addressId = addresses.id
left join requestNames on halfOperations.requestNameId = requestNames.id
left join executorsView as exe on halfOperations.executorId = exe.id
where halfOperations.id not in (select id from operations)
order by requests.init desc;


create view operationsView AS
select operations.id, requestNames.requestName AS name, operations.notes, ho.details, deliveryPrice, totalPrice, profit, totalPaid,
currency, operations.halfOperationId, operations.init,ex.id as executorId, ex.name AS executorName, ex.familyName AS executorFamilyName,
ex.nickname AS executorNickname, ex.phone AS executorPhone, ex.age AS executorAge,
ex.rate AS executorRate, ex.address AS executorAddress, ex.academy AS executorAcademy,
ex.careerOrProduct AS executorCareerOrProduct, ex.accountNumber AS executorAccountNumber,
ex.init AS executorInit, r.id as requestId, r.address as requestAddress, r.notes as requestNotes, r.dateOfExecution as requestDateOfExecution, r.init as requestInit, r.applicantId, r.applicantName, r.applicantFamilyName, r.applicantNickname, r.applicantPhone, r.applicantInit
from operations
left join halfOperations as ho on operations.halfOperationId = ho.id
left join requestNames on ho.requestNameId = requestNames.id
left join executorsView as ex on ho.executorId = ex.id
left join requestsView as r on operations.halfOperationId = r.halfOperationId order by operations.init desc;
/*
use guide;
select * from phones;
select * from personsView;
select * from executorsView;
select * from requestsView;
select * from operationsView;
*/