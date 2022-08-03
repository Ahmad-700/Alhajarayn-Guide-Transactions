-- this procedure let you make a statements base on condition. 
-- when need a procedure in the database to get rid of overhead. 
-- ex: if a row in database exists then get its id, or create it then get its id.
-- below a procedure will take an address as parameter and when it calls it will set a variable value in out parameter as shown:
use guide;
delimiter $$
create procedure setAddressId(ad nvarchar(100),OUT adId int)
no sql begin
	if(exists(select id from addresses where addresses.address = ad)) then
        set adId = (select id from addresses where addresses.address = ad);
	else
		insert into addresses(address) values (ad);
        set adId = (select id from addresses where addresses.address = ad);
	end if;
end$$
delimiter $$;
delimiter $$
create procedure setPersonId(n nvarchar(300), f nvarchar(50), nick nvarchar(50), out pId int)
no sql begin
	if(exists(select id from persons where persons.name = n and persons.familyName = f)) then
        set pId = (select id from persons where persons.name = n and persons.familyName = f);
	else 
		insert into persons(name, familyName,nickname) values (n,f,nick);
        set pId = last_insert_id();
	end if;
end$$
delimiter $$;

delimiter $$
create procedure setRequestNameId(rn nvarchar(50),OUT rnId int)
no sql begin
	if(exists(select id from requestNames where requestNames.requestName = rn)) then
        set rnId = (select id from requestNames where requestNames.requestName = rn);
	else
		insert into requestNames(requestName) values (rn);
        set rnId = last_insert_id();
	end if;
end$$
delimiter $$;