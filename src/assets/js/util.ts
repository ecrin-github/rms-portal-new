export function resolvePath(object, path) {
    /* Access nested properties from string */
    return path.split('.').reduce((o, p) => o ? o[p] : null, object);
}

export function ngbDateStructToString(date) {
    if (date?.day && date?.month && date?.year) {
        const dateString =  date.year + '-' + date.month.toString().padStart(2, '0') + '-' + date.day.toString().padStart(2, '0');
        return new Date(dateString).toISOString().slice(0, 10);
    } else {
        return null;
    }
}

export function dateToTimeString(date) {
    if (date instanceof Date) {
        return `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} \
        ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
    }
    throw new Error("Date must be an instance of Date class");
}

export function dateToNgbDateStruct(date) {
    if (date) {
        if (date instanceof Date) {
            return date ? {year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate()} : null;
        }
        throw new Error("Date must be an instance of Date class");
    }
    return null;
}

export function stringToNgbDateStruct(dateStr) {
    if (dateStr) {
        const date = new Date(dateStr);
        return dateToNgbDateStruct(date);
    }
    return null;
}

export function sqlDateStringToString(date) {
    const dateArray = new Date(date);
    return date ? dateArray.getFullYear() + '-' 
        + (dateArray.getMonth()+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + '-' 
        + (dateArray.getDate()).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) : '';
}

export function isWholeNumber(value) {
    return /^-?\d+$/.test(value);
}

export function getHeightWithoutPadding(element) {
    const computedStyle = getComputedStyle(element);
    return element.clientHeight - (parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom));
}

export function objectToFormData(obj, rootName, ignoreList) {
    var formData = new FormData();

    function appendFormData(data, root) {
        if (!ignore(root)) {
            root = root || '';
            if (data instanceof File) {
                formData.append(root, data);
            } else if (Array.isArray(data)) {
                for (var i = 0; i < data.length; i++) {
                    appendFormData(data[i], root + '[' + i + ']');
                }
            } else if (typeof data === 'object' && data) {
                for (var key in data) {
                    if (data.hasOwnProperty(key)) {
                        if (root === '') {
                            appendFormData(data[key], key);
                        } else {
                            appendFormData(data[key], root + '.' + key);
                        }
                    }
                }
            } else {
                if (data !== null && typeof data !== 'undefined') {
                    formData.append(root, data);
                }
            }
        }
    }

    function ignore(root){
        return Array.isArray(ignoreList)
            && ignoreList.some(function(x) { return x === root; });
    }

    appendFormData(obj, rootName);

    return formData;
}

export function camelToSnakeCase(s) {
    return s.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

export function keysToSnakeCase(o) {
    let returnObj = {};
    for (const camelKey in o) {
        returnObj[camelToSnakeCase(camelKey)] = o[camelKey];
    }
    return returnObj;
}