export const url = (u: string) => {
    if(
        u.slice(0, 6) == "http://"
        || u.slice(0, 7) == "https://"
    )
        return u;
    
    if(!process.browser)
        return `http://127.0.0.1:8085${u[0]!="/"?"/":""}${u}`
    const host = location.host.split(':')[0];
    return `${location.protocol}//${host}:8085${u[0]!="/"?"/":""}${u}`
}