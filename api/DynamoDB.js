const {
    DynamoDB,
} = require('@aws-sdk/client-dynamodb');
const crediential = require('../config/Crediential');

class InitDynamoDB {
    #_dynamoDb;

    constructor() {
        this.#_dynamoDb = new DynamoDB(crediential);
    };

    putItem = async (tableName, data) => {
        return await new Promise((rs,rj) => {
            const params = {
                TableName: process.env.NODE_ENV === "dev" ? `${process.env.DevRN}-dynamodb-${tableName}` : `${process.env.ProdRN}-dynamodb-${tableName}`,
                ...data,
            };
            this.#_dynamoDb.putItem(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

    updateItem = async (tableName, data) => {
        return await new Promise((rs,rj) => {
            const params = {
                TableName: process.env.NODE_ENV === "dev" ? `${process.env.DevRN}-dynamodb-${tableName}` : `${process.env.ProdRN}-dynamodb-${tableName}`,
                ...data,
            };
            this.#_dynamoDb.updateItem(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

    deleteItem = async (tableName, data) => {
        return await new Promise((rs,rj) => {
            const params = {
                TableName: process.env.NODE_ENV === "dev" ? `${process.env.DevRN}-dynamodb-${tableName}` : `${process.env.ProdRN}-dynamodb-${tableName}`,
                ...data,
            };
            this.#_dynamoDb.deleteItem(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

    getItem = async (tableName, data) => {
        return await new Promise((rs,rj) => {
            const params = {
                TableName: process.env.NODE_ENV === "dev" ? `${process.env.DevRN}-dynamodb-${tableName}` : `${process.env.ProdRN}-dynamodb-${tableName}`,
                ...data,
            };
            this.#_dynamoDb.getItem(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

    getAllItem = async (tableName, data) => {
        return await new Promise((rs,rj) => {
            const params = {
                TableName: process.env.NODE_ENV === "dev" ? `${process.env.DevRN}-dynamodb-${tableName}` : `${process.env.ProdRN}-dynamodb-${tableName}`,
                ...data,
            };
            this.#_dynamoDb.putItem(params).then((res) => {
                rs(res);
            }).catch((err) => {
                rj(err);
            });
        });
    };

};

module.exports = InitDynamoDB;