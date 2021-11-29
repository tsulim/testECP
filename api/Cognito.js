const {
    CognitoIdentityProvider,
} = require('@aws-sdk/client-cognito-identity-provider');

class InitCognito {
    #_cognito
    #GetUserPoolInformation = async () => {
        return await new Promise((rs, rj) => {
            const params = {
                "MaxResults": 2
            };
            this.#_cognito.listUserPools(params).then((list_res) => {
                if (list_res.UserPools.length > 0) {
                    const pool_exists = process.env.NODE_ENV === "dev"?list_res.UserPools.filter(x => x.Name === process.env.DevResourceName):list_res.UserPools.filter(x => x.Name === "ArTion-UserPool");
                    if (pool_exists.length < 1) {
                        rs({
                            "Exists": false,
                            "UserPoolId": undefined,
                            "UserPoolName": undefined,
                            "Others": undefined
                        });
                    } else {
                        rs({
                            "Exists": true,
                            "UserPoolId": pool_exists[0].Id,
                            "UserPoolName": pool_exists[0].Name,
                            "Others": undefined
                        });
                    };
                } else {
                    rs({
                        "Exists": false,
                        "UserPoolId": undefined,
                        "UserPoolName": undefined,
                        "Others": undefined
                    });
                };
            }).catch((err) => {
                rj({
                    "Exists": false,
                    "UserPoolId": undefined,
                    "UserPoolName": undefined,
                    "Others": err
                });
            });
        });
    };
    #GetUserPoolClientInformation = async () => {
        return await new Promise((rs,rj) => {
            this.#GetUserPoolInformation().then((res) => {
                if (res.Exists) {
                    const params = {
                        "MaxResults": 2,
                        "UserPoolId": res.UserPoolId
                    };
                    this.#_cognito.listUserPoolClients(params).then(list_res => {
                        const client_exists = process.env.NODE_ENV === "dev"?list_res.UserPoolClients.filter(x => x.ClientName === process.env.DevResourceName):list_res.UserPoolClients.filter(x => x.ClientName === "ArTion-UserPoolClient");
                        if (client_exists.length < 1) {
                            rs({
                                "Exists": false,
                                "ClientId": undefined,
                                "UserPoolName": undefined,
                                "Others": undefined
                            });
                        } else {
                            rs({
                                "Exists": true,
                                "ClientId": client_exists[0].ClientId,
                                "ClientName": client_exists[0].ClientName,
                                "Others": undefined
                            });
                        };
                    }).catch((err) => {
                        rj({
                            "Exists": false,
                            "ClientId": undefined,
                            "ClientName": undefined,
                            "Others": err
                        });
                    });
                } else {
                    rs({
                        "Exists": false,
                        "ClientId": undefined,
                        "UserPoolName": undefined,
                        "Others": undefined
                    });
                };
            }).catch((err) => {
                rj({
                    "Exists": false,
                    "ClientId": undefined,
                    "ClientName": undefined,
                    "Others": err
                });
            });
        });
    };

    constructor() {
        this.#_cognito = new CognitoIdentityProvider({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            },
            region: process.env.Region,
        });
    };

    CreateUser = async (body) => {
        return await new Promise ((rs,rj) => {
            this.#GetUserPoolClientInformation().then(res => {
                if (res.Exists) {
                    const params = {
                        "ClientId": res.ClientId,
                        "Username": body.username,
                        "Password": body.password,
                        "UserAttributes": [
                            { 
                                "Name": "nickname",
                                "Value": body.nickname,
                            },
                            {
                                "Name": "picture",
                                "Value": body.picture,
                            },
                            {
                                "Name": "custom:twitter",
                                "Value": body.twitter,
                            },
                            {
                                "Name": "custom:instagram",
                                "Value": body.instagram,
                            },
                            {
                                "Name": "custom:other_proof",
                                "Value": body.other_proof
                            }
                        ]
                    };
                    this.#_cognito.signUp(params).then((res) => {
                        rs(res);
                    }).catch((err) => {
                        rj(err);
                    });
                } else {
                    rj({"$metadata": {"status": 402}});
                };
            }).catch(err => {
                rj(err);
            });
        });
    };

    GetUser = async (body) => {
        return await new Promise((rs,rj) => {
            this.#GetUserPoolInformation().then(res => {
                if (res.Exists) {
                    const params = {
                        "UserPoolId": res.UserPoolId,
                        "Username": body.username,
                    };
                    this.#_cognito.adminGetUser(params).then((res) => {
                        rs(res);
                    }).catch((err) => {
                        rj(err);
                    });
                } else {
                    rj({"$metadata": {"status": 402}});
                };
            }).catch(err => {
                rj(err);
            });
        });
    };

    LoginUser = async (body) => {
        return await new Promise((rs,rj) => {
            this.#GetUserPoolClientInformation().then(res => {
                if (res.Exists) {
                    const params = {
                        "AuthParameters": {
                            "USERNAME": body.username,
                            "PASSWORD": body.password
                        },
                        "AuthFlow": "USER_PASSWORD_AUTH",
                        "ClientId": res.ClientId
                    };
                    this.#_cognito.initiateAuth(params).then((res) => {
                        rs(res);
                    }).catch((err) => {
                        rj(err);
                    });
                } else {
                    rj({"$metadata": {"status": 402}});
                };
            }).catch(err => {
                rj(err);
            });
        });
    };

    VerifyEmail = async (body) => {
        return await new Promise((rs,rj) => {
            this.#GetUserPoolClientInformation().then(res => {
                if (res.Exists) {
                    const params = {
                        "Username": body.username,
                        "ClientId": res.ClientId,
                        "ConfirmationCode": body.otp
                    };
                    this.#_cognito.confirmSignUp(params).then((res) => {
                        rs(res);
                    }).catch((err) => {
                        rj(err);
                    });
                } else {
                    rj({"$metadata": {"status": 402}});
                };
            }).catch(err => {
                rj(err);
            });
        });
    };
};

module.exports = InitCognito;