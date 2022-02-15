const { SSM } = require("@aws-sdk/client-ssm");

const InitSSM = new SSM({
    credentials: {
        accessKeyId: getParameter('TMPaws_access_key_id'),
        secretAccessKey: getParameter('TMPprocess.env.aws_secret_access_key')
    },
    region: "us-east-1"
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