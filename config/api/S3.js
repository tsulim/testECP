require("dotenv").config();
const { S3 } = require('@aws-sdk/client-s3');
const {getParameter} = require('./SSM');
const crediential = require('../config/Crediential');

// Creating class so can set as initialize global var in each route;
class InitS3 {
    #_s3;
    constructor() {
        // Won't repeat initialization of S3;
        this.#_s3 = new S3(crediential);
    };

    putItem = async (bucketName, data) => {
        return await new Promise((rs,rj) => {
            var params = {
                CacheControl: "max-age=30",
                Bucket: `${bucketName}`,
                ...data,
            };
            this.#_s3.putObject(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

    deleteItem = async (bucketName, data) => {
        return await new Promise((rs,rj) => {
            var params = {
                Bucket: `${bucketName}`,
                ...data,
            };
            this.#_s3.deleteObject(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };
};

module.exports = InitS3;