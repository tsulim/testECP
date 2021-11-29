const {SSM} = require("@aws-sdk/client-ssm");

const InitSSM = new SSM({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY
    },
    region: process.env.REGION
});

const information = {};
    
(()=>{
    const params = {
        "Path": "/env",
        "Recursive": true
    }
    InitSSM.getParametersByPath(params).then(res => {
        console.log(res);
    }).catch(err => {
        console.log(err);
    });
})();

module.exports = information;