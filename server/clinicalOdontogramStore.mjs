import { openOdontogramStore, OdontogramStoreError } from './odontogramStore.mjs';
import { ClinicalReviewError } from './clinicalReviewStore.mjs';

// Server sessions and the existing patient grant are checked on every operation.
export function openClinicalOdontogramStore(filename, authStore, clinicalReview) {
  if (typeof authStore?.session !== 'function' || typeof clinicalReview?.authorizeOdontogram !== 'function') {
    throw Error('Verificadores clínicos obrigatórios.');
  }
  return openOdontogramStore(filename, {
    allowExisting: true,
    resolveSession: token => authStore.session(token),
    authorizePatient: (_actor, patientId, permission, token) => {
      try { return clinicalReview.authorizeOdontogram(token, patientId, permission) === true; }
      catch (error) {
        if (error instanceof ClinicalReviewError) throw new OdontogramStoreError(error.status, error.message);
        throw error;
      }
    },
  });
}
