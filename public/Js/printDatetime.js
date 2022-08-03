function printDatetime(d) {
    d = new Date(d || '');//if d is null then new Date() will return '1970-01-01T00:00:00.000Z'
    if (d == 'Invalid Date')
        return '-';
    let datetime = d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate() + ' ' + d.getHours() % 12 + ':' + (d.getMinutes() < 10 ? '0' + d.getMinutes() : d.getMinutes()) + ' ' + (d.getHours() / 12 > 1 ? 'PM' : 'AM') + ' ' + week(d.getDay());
    if (datetime.includes('0:00 AM'))
        datetime = datetime.replace('0:00 AM', '');
    return datetime;
}


function week(n) {
    switch (n) {
        case 0: return 'الأحد'
        case 1: return 'الاثنين'
        case 2: return 'الثلاثاء'
        case 3: return 'الاربعاء'
        case 4: return 'الخميس'
        case 5: return 'الجمعة'
        case 6: return 'السبت'
        default: return ''
    }
}