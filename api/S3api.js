const { S3 } = require('@aws-sdk/client-s3');

// Creating class so can set as initialize global var in each route;
class InitS3 {
    #_s3;
    constructor() {
        // Won't repeat initialization of S3;
        this.#_s3 = new S3({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_KEY
            },
            region: "ap-southeast-1",
        });
    };

    InsertFile = async (key_name_str, content_type_str, binary) => {
        return await new Promise((rs,rj) => {
            var params = {
                Key: key_name_str,
                Body: binary,
                ContentType: content_type_str,
                CacheControl: "max-age=30"
            };
            if (process.env.NODE_ENV === "dev") {
                params["Bucket"] = process.env.DevResourceName;
            } else {
                params["Bucket"] = "at_bucket";
            };
            this.#_s3.putObject(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    }
};

module.exports = InitS3;