/**
 * used in input to prevent invalid key, as phone input.
 * to use it. example:
 * <input type="text" onkeypress="return inputTypeNumber(event)"/>
 * @param {event} e 
 */
function inputTypeNumber(e) {
        var charCode = (e.which) ? e.which : e.keyCode
    //  space ' '            '-'            '+'
    if (charCode == 32||charCode == 43||charCode == 45)
        return true;
        if (charCode > 47 && charCode < 58)//numbers [0-9]
        return true;
        return false;
    
}