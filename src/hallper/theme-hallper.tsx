export function customLengthName(name: string, length: number) {
    // يفضل استخدام المتغير 'length' الممرر للدالة بدلاً من الرقم الثابت 20
    if (name.length > length) {
        return name.substring(0, length) + '...';
    }

    return name;
}