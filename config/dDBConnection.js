const AWS = require('aws-sdk');
const credentials = require('../config/credential');

const dynamoDB = new AWS.DynamoDB({ credentials });

// const setUpDB = (drop) => {
//     dynamoDB
//     .describeTable({ TableName: "NFT" })
//     .promise()
//     .then(data => {
//       if (data.Table.TableStatus !== "ACTIVE") {
//         console.log(
//           `Table status: ${data.Table.TableStatus}, retrying in ${backoffInterval}ms...`
//         )
//         return new Promise(resolve => {
//           setTimeout(() => waitForTable().then(resolve), backoffInterval)
//         })
//       } else {
//         return
//       }
//     })
//     .catch(error => {
//       console.warn(
//         `Table not found! Error below. Retrying in ${backoffInterval} ms...`,
//         error
//     )

//       return new Promise(resolve => {
//         setTimeout(() => waitForTable().then(resolve), backoffInterval)
//       })
//     })   
// }