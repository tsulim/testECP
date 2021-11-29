const axios = require('axios').default;

const DefaultAxios = axios.create({
    baseURL: "https://cloud-wallet-api.prod.affinity-project.org/api/v1",
    headers: {
        "Api-Key": process.env.API_KEY_HASH,
    }
})

const LoginAPI = async (body) => {
    return await new Promise((rs,rj) => {
        DefaultAxios.post("/users/login", {
            "username": body.username,
            "password": body.password
        }).then((res) => {
            rs(res.data);
        }).catch((err) => {
            rj(err.response.data);
        });
    });
};

const RegisterAPI = async (body) => {
    return await new Promise((rs,rj) => {
        DefaultAxios.post("/users/signup", {
            "username": body.username,
            "password": body.password,
            "options": {
                "didMethod": "elem",
                "keyTypes": ["rsa"]
            },
            "messageParameters": {
                "message": "Welcome to ArTion identity provision. Your OTP is {{code}}",
                "subject": "Identity provision"
            }
        }).then((res) => {
            rs({
                token: res.data
            });
        }).catch((err) => {
            rj(err.response.data);
        });
    });
};

const RegisterConfirmAPI = async (body) => {
    return await new Promise((rs,rj) => {
        DefaultAxios.post("/users/signup/confirm", {
            "token": body.token,
            "confirmationCode": body.otp,
            "options": {
                "didMethod": "elem",
                "keyTypes": ["rsa"]
            }
        }).then((res) => {
            rs(res.data);
        }).catch((err) => {
            rj(err.response.data);
        });
    });
};

const LogoutAPI = async () => {
    const accesstoken = "eyJraWQiOiIrN2NjazN5cGRCVzNVY29Ma2ZLQndlak16Y2ZUaTNaSXdvQTIrVEhGK2NRPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI2YmRhZjE1Zi0xMzVmLTRjOTAtODBjOS01Y2UzOGE3N2U4ZGMiLCJldmVudF9pZCI6Ijk1YTBkYzBlLWRiMTUtNDY0Zi05MTA0LTFlOGUzNmZiNzc4ZiIsInRva2VuX3VzZSI6ImFjY2VzcyIsInNjb3BlIjoiYXdzLmNvZ25pdG8uc2lnbmluLnVzZXIuYWRtaW4iLCJhdXRoX3RpbWUiOjE2MzgxNzAwNzAsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC5hcC1zb3V0aGVhc3QtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aGVhc3QtMV9PZzB3ZXVsU2ciLCJleHAiOjE2MzgxNzM2NzAsImlhdCI6MTYzODE3MDA3MCwianRpIjoiZDQwNTk0M2UtZjYwMy00MzRiLTg1NDAtZmViMDYzNjZlYzNkIiwiY2xpZW50X2lkIjoiNGRzNzU2aTlqaTU0dGFnYWo4YXM5MDQxcWMiLCJ1c2VybmFtZSI6ImF1c2x1c2hlcmVfZ21haWwuY29tIn0.iO_336MNuQJyiJ9S4hV-m98k9PmSxXhpHEzKgklFnu2Q6IcmjRCGPjQEbUNKAJvDOTZPyM32GlIST0N2uDBNi3qFbwUHDJCcnMOGSY2MgvwYyfc6IvFGaBt1GHUVsKsbZWHhzsWoBbxgBQpNKt1GHCLVlms8-F986JicPSZ5hke0yspayRXDHVThz0RsHu45xNX-EcecbOf1RhKEjgiIN0sP-l0IYpBXOQm6k9qzhj9weW1fuWi2mcLRwVGvWtftilgVBpoAwJYcKx8Kj_dWz3cb3qnX3YUeN0ChHCZ9t5icWZ9RNnTNcN-km0_kNAraOgRdtayZDTEJ8KSZoCtqvw";
    return await new Promise((rs,rj) => {
        DefaultAxios.post("/users/logout", {}, {
            headers: {
                "Authorization": accesstoken
            },
        }).then((res) => {
            rs(res.data);
        }).catch((err) => {
            rj(err.response.data);
        });
    });
};

module.exports = {
    LoginAPI,
    RegisterAPI,
    RegisterConfirmAPI,
    LogoutAPI
};