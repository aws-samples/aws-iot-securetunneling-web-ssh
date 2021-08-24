exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    const token = body.token
    const origin = event.headers['origin'] ? event.headers['origin'] : 'localhost';
    let d = new Date()
    d.setTime(d.getTime() + (2*60*60*1000))
    let cookie = `awsiot-tunnel-token=${token}; path=/tunnel; expires=${d}; domain=.amazonaws.com; SameSite=None; Secure; HttpOnly`
    const response = {
        headers: {
            'Set-Cookie': cookie,
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': true
        },
        statusCode: 200,
        body: JSON.stringify({token: token, origin: origin})
    };
    return response;
}