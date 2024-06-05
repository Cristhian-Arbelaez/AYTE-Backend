'use strict';

const DynamoDB = require('aws-sdk/clients/dynamodb');
const documentClient = new DynamoDB.DocumentClient({
  region: 'us-east-1',
  maxRetries: 3,
  httpOptions: {
    timeout: 5000,
  },
});
const USUARIOS_TABLE_NAME = process.env.USUARIOS_TABLE_NAME;
const send = (statusCode, message) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message),
  };
}
module.exports.crearUsuario = async (event,context,cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const data = JSON.parse(event.body);
    const params = {
      TableName: USUARIOS_TABLE_NAME,
      Item: {
        cedula: data.id,
        nombre: data.nombre,
        direccion: data.direccion,
        celular: data.celular,
        correo: data.correo,
        contrasena: data.contrasena
      },
      ConditionExpression: 'attribute_not_exists(cedula)',
    };
    await documentClient.put(params).promise();
    cb(null,send(200, params.Item));
  } catch (error) {
    cb(null,send(500, error.message));
  }


};
module.exports.actualizarUsuario = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    const params = {
      TableName: USUARIOS_TABLE_NAME,
      Key: {
        cedula: id,
      },
      UpdateExpression: 'set #nombre = :nombre, #direccion = :direccion, #celular = :celular, #correo = :correo, #contrasena = :contrasena',
      ExpressionAttributeNames: {
        '#nombre': 'nombre',
        '#direccion': 'direccion',
        '#celular':  'celular', 
        '#correo': 'correo', 
        '#contrasena': 'contrasena',
      },
      ExpressionAttributeValues: {
        ':nombre': data.nombre,
        ':direccion': data.direccion,
        ':celular': data.celular,
        ':correo': data.correo,
        ':contrasena': data.contrasena,
      },
      ConditionExpression: 'attribute_exists(cedula)',
    };
    await documentClient.update(params).promise();
    cb(null,send(200, "Usuario Actualizado", data));
  } catch (error) {
    cb(null,send(500, error.message));
  }
};

module.exports.eliminarUsuario = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const id = event.pathParameters.id;
    const params = {
      TableName: USUARIOS_TABLE_NAME,
      Key: {
        cedula: id,
      },
      ConditionExpression: 'attribute_exists(cedula)',
    };
    await documentClient.delete(params).promise();
    cb(null,send(200, "Usuario Eliminado"));
  } catch (error) {
    cb(null,send(500, error.message));
  }

}

module.exports.mostrarUsuarios = async (event,context,cb) => {

  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: USUARIOS_TABLE_NAME,
    };
    const data = await documentClient.scan(params).promise();
    cb(null,send(200, data.Items));
  } catch (error) {
    cb(null,send(500, error.message));
  }
}
