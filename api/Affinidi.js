const axios = require('axios').default;

const restrictedAccess = (req, res, next) => {
    if (req.session.user) {
        next()
    } else {
        res.status(401).render("error/errorPage", {
            status: 401,
            subject: "Unauthorized Access",
            message: "Suspicious activity detected"
        });
    };
};

class InitAffinidi {
    #_secretAxios;
    constructor() {
        this.#_secretAxios = axios.create({
            baseURL: "https://cloud-wallet-api.prod.affinity-project.org/api/v1",
            headers: {
                "Api-Key": process.env.API_KEY_HASH,
            }
        });
    };
    
    StartAuth = async (data) => {
        return await new Promise((rs,rj) => {
            this.#_secretAxios.post("/users/login", data).then((res) => {
                rs(res.data);
            }).catch((err) => {
                rj(err.response.data);
            });
        });
    };

    SignUp = async (data) => {
        return await new Promise((rs,rj) => {
            data = {
                ...data,
                "options": {
                    "didMethod": "elem",
                    "keyTypes": ["rsa"]
                },
                "messageParameters": {
                    "message": "Welcome to ArTion. Your OTP is {{code}}",
                    "subject": "ArTion Verifcation"
                },
            };
            this.#_secretAxios.post("/users/signup", data).then((res) => {
                rs({
                    token: res.data
                });
            }).catch((err) => {
                rj(err.response.data);
            });
        });
    };

    ConfirmSignUp = async (data) => {
        return await new Promise((rs,rj) => {
            data = {
                ...data,
                "options": {
                    "didMethod": "elem",
                    "keyTypes": ["rsa"]
                }
            }
            this.#_secretAxios.post("/users/signup/confirm", data).then((res) => {
                rs(res.data);
            }).catch((err) => {
                rj(err.response.data);
            });
        });
    };

    Logout = async (body) => {
        return await new Promise((rs,rj) => {
            this.#_secretAxios.post("/users/logout", {}, {
                headers: {
                    "Authorization": body.accessToken
                },
            }).then((res) => {
                rs(res.data);
            }).catch((err) => {
                rj(err.response.data);
            });
        });
    };
};

module.exports = {
    AffinidiAPI: InitAffinidi,
    restrictedAccess: restrictedAccess
};