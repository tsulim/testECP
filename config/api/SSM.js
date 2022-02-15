const { SSM } = require("@aws-sdk/client-ssm");
const crediential = require('../config/Crediential');

const InitSSM = new SSM(crediential);

const getParameter = async (Name, WithDecryption) => {
    return await new Promise((rs,rj) => {
        var params = {
            Name: Name,
            WithDecryption: WithDecryption
        };
        InitSSM.getParameter(params).then((res) => {
            rs(res);
        }).catch((err) => {
            rj(err);
        });
    });
};

module.exports = {
    InitSSM: InitSSM,
    getParameter: getParameter
};