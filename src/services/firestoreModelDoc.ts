export interface FirestoreArchitectureDoc {
  title: string;
  collections: {
    path: string;
    description: string;
    reasoning: string;
    documentExample: Record<string, unknown>;
  }[];
  seniorArchitectAnalysis: string[];
  securityRulesCode: string;
  integrationSnippet: string;
}

export const FIRESTORE_ARCHITECTURE: FirestoreArchitectureDoc = {
  title: 'Modelagem NoSQL Firestore: Treinos Fixos vs. Histórico de Cargas',
  collections: [
    {
      path: 'users/{userId}/routines/{routineId}',
      description: 'Armazena as fichas de treino fixas prescritas (Treino A, Treino B, Treino C, etc.)',
      reasoning:
        'Representa a definição estrutural do treino (o plano). Fica isolado para que alterações de exercícios ou troca periódica de ficha pelo personal NÃO alterem retroativamente as cargas passadas.',
      documentExample: {
        id: 'treino-a',
        code: 'A',
        name: 'Treino A',
        targetMuscles: 'Dorsal, Abdômen',
        dayOrder: 1,
        restIntervalSeconds: 90,
        aerobics: {
          postWorkoutMin: 10,
          restDayMin: 30,
        },
        exercises: [
          {
            id: 'ex-1',
            name: 'Puxada Vertical Com Triângulo',
            sets: 4,
            reps: '8',
            order: 1,
            defaultRestSeconds: 90,
          },
          {
            id: 'ex-2',
            name: 'Puxada Vertical Peg Pronada',
            sets: 7,
            reps: '8',
            advancedTechniqueId: 'fst-7',
            advancedTechniqueNotes: 'FST-7 (30-45s descanso)',
            order: 2,
            defaultRestSeconds: 40,
          },
        ],
        createdAt: '2026-09-14T10:00:00.000Z',
        updatedAt: '2026-09-14T10:00:00.000Z',
      },
    },
    {
      path: 'users/{userId}/workout_logs/{logId}',
      description: 'Registro cronológico e imutável de cada sessão executada pelo aluno na academia',
      reasoning:
        'Cada sessão realizada gera um novo documento independente (Append-Only Log). Guarda snapshot dos pesos exatos (kg), repetições reais concluídas, duração e data/hora.',
      documentExample: {
        id: 'log_2026_09_14_0830',
        userId: 'uid_12345',
        routineId: 'treino-a',
        routineCode: 'A',
        routineName: 'Treino A: Dorsal, Abdômen',
        startedAt: '2026-09-14T08:30:00.000Z',
        completedAt: '2026-09-14T09:22:00.000Z',
        durationMinutes: 52,
        totalTonnageKg: 4680,
        entries: [
          {
            exerciseId: 'ex-1',
            exerciseName: 'Puxada Vertical Com Triângulo',
            sets: [
              { setNumber: 1, weightKg: 50, repsCompleted: 8, completed: true },
              { setNumber: 2, weightKg: 55, repsCompleted: 8, completed: true },
              { setNumber: 3, weightKg: 60, repsCompleted: 8, completed: true },
              { setNumber: 4, weightKg: 65, repsCompleted: 8, completed: true },
            ],
          },
        ],
      },
    },
  ],
  seniorArchitectAnalysis: [
    '1. Desacoplamento & Imutabilidade Histórica: Em musculação, a ficha fixa muda a cada 4 a 12 semanas. Se as cargas fossem embutidas dentro do documento da rotina fixa, qualquer edição ou exclusão de exercício destruiria a linha do tempo de evolução de força.',
    '2. Evitar o Limite de 1MB do Firestore: Um praticante dedicado realiza ~250 treinos por ano. Adicionar arrays infinitos de histórico dentro do mesmo documento atinge o limite de 1MB e degrada o tempo de leitura da tela inicial.',
    '3. Eficiência de Queries e Custo de Leituras: Para abrir o treino de hoje, lê-se apenas 1 documento (a rotina A). Para gerar o gráfico de evolução do "Leg Press", faz-se uma query indexada por exercício em workout_logs, sem trafegar dados desnecessários.',
    '4. Segurança Multi-tenant Nativa: Utilizando subcoleções sob "users/{userId}", as regras de segurança do Firestore garantem que nenhum usuário acesse o treino ou cargas de outro.',
  ],
  securityRulesCode: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Isolamento multi-tenant: o usuário só acessa seus próprios treinos e logs
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /routines/{routineId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }

      match /workout_logs/{logId} {
        allow read, create, update: if request.auth != null && request.auth.uid == userId;
        allow delete: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}`,
  integrationSnippet: `// Exemplo de integração nativa no Firestore:
import { collection, doc, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db, auth } from './firebase';

// 1. Gravar sessão de treino concluída
export async function saveSessionToFirestore(workoutLog: WorkoutLog) {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado');
  
  const logsRef = collection(db, 'users', user.uid, 'workout_logs');
  const docRef = await addDoc(logsRef, {
    ...workoutLog,
    userId: user.uid,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
}

// 2. Buscar histórico recente de um exercício
export async function getExerciseHistory(exerciseId: string) {
  const user = auth.currentUser;
  if (!user) return [];
  
  const q = query(
    collection(db, 'users', user.uid, 'workout_logs'),
    orderBy('startedAt', 'desc'),
    limit(20)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
}`,
};
