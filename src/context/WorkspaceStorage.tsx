import {createContext, useContext} from 'react';
import type {memoryWorkspace} from '../utils/secureWorkspace';
export const WorkspaceStorageContext = createContext<ReturnType<typeof memoryWorkspace> | null>(null);
export function useWorkspaceStorage() {
  const value = useContext(WorkspaceStorageContext);
  if (!value) throw Error('Armazenamento protegido indisponível.');
  return value;
}
