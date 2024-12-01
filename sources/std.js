import request from 'request';

async function asyncGetRequest(url, headers) {
    return new Promise(resolve => {
        request({ method: "GET", url, headers }, function (error, response) {
            if (error) throw new Error(error);
            resolve(response.body);
          });
          
    });
}

export default asyncGetRequest;