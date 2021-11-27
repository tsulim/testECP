const {
    CognitoIdentityProvider,
    RecoveryOptionNameType,
    AliasAttributeType,
    UserPoolMfaType,
    AttributeDataType,
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
                    const pool_exists = list_res.UserPools.filter(x => x.Name === process.env.DevResourceName);
                    if (pool_exists.length < 1) {
                        rs({
                            "Exists": false,
                            "UserPoolId": undefined,
                            "UserPoolName": undefined,
                        });
                    } else {
                        rs({
                            "Exists": true,
                            "UserPoolId": pool_exists[0].Id,
                            "UserPoolName": pool_exists[0].Name,
                        });
                    };
                } else {
                    rs({
                        "Exists": false,
                        "UserPoolId": undefined,
                        "UserPoolName": undefined,
                    });
                };
            }).catch((err) => {
                rj(err);
            });
        });
    };

    #CreateUserPool = async () => {
        return await new Promise((rs, rj) => {
            const list_params = {
                "MaxResults": 2
            };
            const params = {
                "AccountRecoverySetting": {
                    "RecoveryMechanisms": [
                        {
                            "Name": RecoveryOptionNameType.VERIFIED_EMAIL,
                            "Priority": 1
                        }
                    ]
                },
                "DeviceConfiguration": {
                    "ChallengeRequiredOnNewDevice": true,
                    "DeviceOnlyRememberedOnUserPrompt": true,
                },
                "Policies": {
                    "PasswordPolicy": {
                        "MinimumLength": 8,
                        "RequireLowercase": true,
                        "RequireNumbers": true,
                        "RequireSymbols": true,
                        "RequireUppercase": true,
                        "TemporaryPasswordValidityDays": 31
                    }
                },
                "Schema": [
                    {
                        "Name": "email",
                        "Required": true,
                    },
                    {
                        "Name": "preferred_username",
                        "Required": true,
                    },
                    {
                        "Name": "picture",
                        "Required": true,
                    },
                    {
                        "AttributeDataType": AttributeDataType.STRING,
                        "Mutable": true,
                        "Name": "twitter",
                    },
                    {
                        "AttributeDataType": AttributeDataType.STRING,
                        "Mutable": true,
                        "Name": "instagram",
                    }
                ],
                "AliasAttributes": [ AliasAttributeType.EMAIL, AliasAttributeType.PREFERRED_USERNAME ],
                "UsernameConfiguration": { 
                    "CaseSensitive": false
                },
            };
            if (process.env.NODE_ENV === "dev") {
                params["PoolName"] = process.env.DevResourceName;
            } else {
                params["PoolName"] = "at_userpool";
            };
            this.#GetUserPoolInformation().then(e_res => {
                if (!e_res.Exists) {
                    this.#_cognito.createUserPool(params).then((res) => {
                        rs({
                            "Exists": true,
                            "UserPoolId": res.UserPool.Id,
                            "UserPoolName": res.UserPool.Name,
                        });
                    }).catch((err) => {
                        rj(err);
                    });
                } else {
                    rs(e_res);
                };
            }).catch(err => {
                rj(err);
            });
        });
    };
    constructor() {
        this.#_cognito = new CognitoIdentityProvider({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            },
            region: "ap-southeast-1",
        });
        this.#CreateUserPool().then(cup_res => {
            if (cup_res.Exists === false) {
                throw new Error(cb_res);
            };
        }).catch(err => {
            console.log("Error at Create User Pool", err);
        });
    };

    CreateUser = async (body) => {
        return await new Promise ((rs,rj) => {
            this.#GetUserPoolInformation().then((res) => {
                if (res.Exists) {
                    const params = {
                        "Username": body.preferred_username,
                        "UserAttributes": [
                            { 
                                "Name": "email",
                                "Value": body.email,
                            },
                            { 
                                "Name": "preferred_username",
                                "Value": body.preferred_username,
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
                            }

                        ],
                        "UserPoolId": res.UserPoolId,
                        "DesiredDeliveryMediums": ["EMAIL"],
                        "ForceAliasCreation": false,
                    };
                    this.#_cognito.adminCreateUser(params).then(res => {
                        rs(res);
                    }).catch(err => {
                        rj(err);
                    });
                } else {
                    rs(res);
                };
            }).catch(err => {
                rj(err);
            });
        });
    };
};

module.exports = InitCognito;