"use strict";
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const ddbDocClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
});
const PRODUCTS_TABLE_NAME = process.env.PRODUCTS_TABLE_NAME || "ProductsTable";
const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data),
  };
};
module.exports.createProduct = async (event) => {
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Item: {
        productsId: data.id,
        title: data.title,
        body: data.body,
      },
      ConditionExpression: "attribute_not_exists(productsId)",
    };
    await ddbDocClient.send(new PutCommand(params));
    return send(201, data);
  } catch (err) {
    return send(201, err.message);
  }
};

module.exports.updateProduct = async (event) => {
  let productsId = event.pathParameters.id;

  console.log("productId--", productsId);
  let data = JSON.parse(event.body);
  try {
    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { productsId },
      UpdateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        "#title": "title",
        "#body": "body",
      },
      ExpressionAttributeValues: {
        ":title": data.title,
        ":body": data.body,
      },
      ConditionExpression: "attribute_exists(productsId)",
    };
    await ddbDocClient.send(new UpdateCommand(params));
    return send(200, data);
  } catch (err) {
    console.log("err--", err);
    return send(500, err.message);
  }
};

module.exports.deleteProduct = async (event, context, cb) => {
  let productsId = event.pathParameters.id;
  try {
    const params = {
      TableName: PRODUCTS_TABLE_NAME,
      Key: { productsId },
      ConditionExpression: "attribute_exists(productsId)",
    };
    await ddbDocClient.send(new DeleteCommand(params));
    return send(200, productsId);
  } catch (err) {
    return send(500, err.message);
  }
};

module.exports.getAllProducts = async (event, context, cb) => {
  console.log("event--", JSON.stringify(event));
  try {
    const params = {
      TableName: PRODUCTS_TABLE_NAME,
    };
    const products = await ddbDocClient.send(new ScanCommand(params));
    return send(200, products);
  } catch (err) {
    return send(500, err.message);
  }
};
