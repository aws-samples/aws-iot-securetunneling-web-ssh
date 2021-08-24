exports.handler = async (event) => {

    const origin = event.headers['origin']
    console.log(origin);
    const response = {
        headers: {
            'Access-Control-Allow-Origin': origin,
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Methods': 'OPTIONS,GET, POST',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
            
        },
        statusCode: 200,
        body: JSON.stringify('Hello from Lambda!'),
    };
    return response;
}