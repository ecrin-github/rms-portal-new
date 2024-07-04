export function resolvePath(object, path) {
    /* Access nested properties from string */
    return path.split('.').reduce((o, p) => o ? o[p] : null, object);
}