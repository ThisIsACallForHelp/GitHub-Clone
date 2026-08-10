export async function parse_Unit8Arr_to_hexString(arr: Uint8Array) {
    let hex = '\\x';
    for (let i = 0; i < arr.length; i++) {
        hex += arr[i].toString(16).padStart(2, '0');
    }
    return hex;
}

export async function parse_string_to_Unit8Arr(arr: string){
    
    if (!arr.startsWith('\\x')) {
        return new TextEncoder().encode(arr);
    }

    const hex = arr.slice(2);
    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}