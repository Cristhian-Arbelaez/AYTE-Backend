'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({
  region: 'us-east-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const PROVEEDORES_TABLE_NAME = process.env.PROVEEDORES_TABLE_NAME;
const send = (statusCode, message) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message),
  };
}
module.exports.crearProveedor = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const data = JSON.parse(event.body);
    const params = {
      TableName: PROVEEDORES_TABLE_NAME,
      Item: {
        proveedoresId: data.id,
        timestamp: Date.now(),
        nombre: data.nombre,
        direccion: data.direccion,
      },
      ConditionExpression: 'attribute_not_exists(proveedoresId)',
    };
    await documentClient.put(params).promise();
    cb(null,send(200, params.Item));
  } catch (error) {
    cb(null,send(500, error.message));
  }


};
module.exports.actualizarProveedor = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    const params = {
      TableName: PROVEEDORES_TABLE_NAME,
      Key: {
        proveedoresId: id,
      },
      UpdateExpression: 'set #nombre = :nombre, #direccion = :direccion',
      ExpressionAttributeNames: {
        '#nombre': 'nombre',
        '#direccion': 'direccion',
      },
      ExpressionAttributeValues: {
        ':nombre': data.nombre,
        ':direccion': data.direccion,
      },
      ConditionExpression: 'attribute_exists(proveedoresId)',
    };
    await documentClient.update(params).promise();
    cb(null,send(200, "Proveedor Actualizado", data));
  } catch (error) {
    cb(null,send(500, error.message));
  }
};

module.exports.eliminarProveedor = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const id = event.pathParameters.id;
    const params = {
      TableName: PROVEEDORES_TABLE_NAME,
      Key: {
        proveedoresId: id,
      },
      ConditionExpression: 'attribute_exists(proveedoresId)',
    };
    await documentClient.delete(params).promise();
    cb(null,send(200, "Proveedor Eliminado"));
  } catch (error) {
    cb(null,send(500, error.message));
  }

}

module.exports.mostrarProveedores = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: PROVEEDORES_TABLE_NAME,
    };
    const data = await documentClient.scan(params).promise();
    cb(null,send(200, data.Items));
  } catch (error) {
    cb(null,send(500, error.message));
  }
}
