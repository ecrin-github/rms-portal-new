export function resolvePath(object, path) {
    /* Access nested properties from string */
    return path.split('.').reduce((o, p) => o ? o[p] : null, object);
}

export function dateToString(date) {
    if (date?.day && date?.month && date?.year) {
        const dateString =  date.year + '-' + date.month.toString().padStart(2, '0') + '-' + date.day.toString().padStart(2, '0');
        return new Date(dateString).toISOString().slice(0, 10);
    } else {
        return null;
    }
}

export function stringToDate(date) {
    const dateArray = new Date(date);
    return date ? {year: dateArray.getFullYear(), month: dateArray.getMonth() + 1, day: dateArray.getDate()} : null;
}