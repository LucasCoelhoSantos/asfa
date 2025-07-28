/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onRequest} from "firebase-functions/https";
import * as logger from "firebase-functions/logger";
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

export const deleteUserAndDoc = functions.https.onCall(async (data: any, context: any) => {
  // Verifica autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuário não autenticado.');
  }
  // Verifica se é admin (ajuste conforme seu modelo de claims ou role)
  const userRecord = await admin.auth().getUser(context.auth.uid);
  const isAdmin = userRecord.customClaims && userRecord.customClaims.role === 'admin';
  if (!isAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Apenas administradores podem excluir usuários.');
  }
  const uid = data.uid;
  if (!uid) {
    throw new functions.https.HttpsError('invalid-argument', 'UID é obrigatório.');
  }
  try {
    // Remove do Auth
    await admin.auth().deleteUser(uid);
    // Remove do Firestore
    await admin.firestore().collection('usuarios').doc(uid).delete();
    return { success: true };
  } catch (error) {
    throw new functions.https.HttpsError('internal', 'Erro ao excluir usuário.', error);
  }
});
