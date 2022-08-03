DROP database guide;
CREATE database guide;
use guide;

CREATE TABLE
    persons(
        personId INT auto_increment,
        personName nvarchar(400) default '-',
        personFamilyName nvarchar(50) default '-',
        nickName nvarchar(50) default '-',
        careerOrProduct nvarchar(400) default '-',
        address nvarchar(100) default '-',
        age enum('طفل', 'شاب', 'عجوز'),
        accountNumber VARCHAR(50),
        rate enum('ممتاز','جيد جدا','جيد','مقبول','ضعيف'),
        academy nvarchar(50),
        initializedDate datetime default now(),
        constraint UN_UniqueFullNames unique(personName,personFamilyName),
        CONSTRAINT PK_persons_personId PRIMARY key (personId)
);

CREATE TABLE
    requests(
        id INT auto_increment,
        requestName nvarchar(400) not null,
        applicantId INT,
        executorId INT,
        requestDetails nvarchar(400) default '-',
        requestNotes nvarchar(400) default '-',
        address nvarchar(100) default '-',
        dateOfExecution datetime,
        dateOfRequest datetime default now(),
        alarm datetime,
      
        CONSTRAINT PK_requests_id PRIMARY key (id),
        CONSTRAINT FK_requests_applicantId FOREIGN key (applicantId) REFERENCES persons (personId),
        CONSTRAINT FK_requests_executorId FOREIGN key (executorId) REFERENCES persons (personId),
        CONSTRAINT CK_requests_applicantNotEqualExecutor CHECK(NOT applicantId = executorId)
    );
    
CREATE TABLE operation(
		id int auto_increment,
        requestId int not null,
		opDliveryPrice INT,
        opNotes nvarchar(400),
        opTotalPrice INT not null,
        opProfit INT,
        opTotalPaid INT,
        opDate datetime default now(),
        CONSTRAINT PK_operation_id PRIMARY KEY (id),
        CONSTRAINT FK_operation_requestId FOREIGN KEY (requestId) REFERENCES requests(id)
           /*
         payment state :
         1-paid:if the operationtotalPrice = operationTotalPaid;
         2-rminder: if operationTotalPrice > operationTotalPaid && operationTotalPaid !=0;
         3-dept: if the operationTotalPaid==0;
         */
);

CREATE TABLE
    phones(
        phoneId INT auto_increment,
        phoneNumber VARCHAR(15),
        personId INT,
        constraint UN_UniquePhoneNumber unique(phoneNumber),
        CONSTRAINT PK_phones_phoneId PRIMARY key (phoneId),
        CONSTRAINT FK_phones_personId FOREIGN key (personId) REFERENCES persons (personId)
    );
    