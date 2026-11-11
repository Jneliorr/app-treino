import { ExerciseVideoItem } from '../types';

export type { ExerciseVideoItem };

export const MASTER_TECHNIQUE_INTRO_VIDEO = {
  title: 'ASSISTA ANTES ESSE VÍDEO (Técnicas Avançadas)',
  videoUrl: 'https://youtu.be/_CgKfsVe2iM',
  youtubeId: '_CgKfsVe2iM',
  author: 'Leandro Twin',
  cref: '128544-G/SP',
  description: 'Instruções primordiais do Leandro Twin sobre aplicação de técnicas avançadas de treino.',
};

export const LEANDRO_TWIN_CONTACT = {
  name: 'Leandro Twin',
  cref: '128544-G/SP',
  whatsapp: '(11) 94442-1988',
  website: 'https://www.leandrotwin.com.br',
  channelNotice: 'Alguns exercícios podem ter nomes diferentes de acordo com a região, portanto para não haver divergências sempre siga conforme aqui!',
};

export const EXERCISE_VIDEOS_CATALOG: ExerciseVideoItem[] = [
  // ================= PEITORAL =================
  { id: 'peit-1', name: 'Supino Reto Barra', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/EZMYCLKuGow', youtubeId: 'EZMYCLKuGow' },
  { id: 'peit-2', name: 'Supino Reto Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/EZMYCLKuGow', youtubeId: 'EZMYCLKuGow' },
  { id: 'peit-3', name: 'Supino Reto Smith', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/EZMYCLKuGow', youtubeId: 'EZMYCLKuGow' },
  { id: 'peit-4', name: 'Supino Inclinado Barra', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/WP1VLAt8hbM', youtubeId: 'WP1VLAt8hbM' },
  { id: 'peit-5', name: 'Supino Inclinado Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/WP1VLAt8hbM', youtubeId: 'WP1VLAt8hbM' },
  { id: 'peit-6', name: 'Supino Inclinado Smith', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/WP1VLAt8hbM', youtubeId: 'WP1VLAt8hbM' },
  { id: 'peit-7', name: 'Supino Declinado Barra', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/J2g6qPBJfqo', youtubeId: 'J2g6qPBJfqo' },
  { id: 'peit-8', name: 'Supino Declinado Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/J2g6qPBJfqo', youtubeId: 'J2g6qPBJfqo' },
  { id: 'peit-9', name: 'Supino Declinado Smith', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/J2g6qPBJfqo', youtubeId: 'J2g6qPBJfqo' },
  { id: 'peit-10', name: 'Crucifixo Reto Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/uDMmccuPVPQ', youtubeId: 'uDMmccuPVPQ' },
  { id: 'peit-11', name: 'Crucifixo Reto Cross', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/uDMmccuPVPQ', youtubeId: 'uDMmccuPVPQ' },
  { id: 'peit-12', name: 'Crucifixo Inclinado Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/uy9Xk3SVrms', youtubeId: 'uy9Xk3SVrms' },
  { id: 'peit-13', name: 'Crucifixo Inclinado Cross', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/uy9Xk3SVrms', youtubeId: 'uy9Xk3SVrms' },
  { id: 'peit-14', name: 'Crucifixo Declinado Halteres', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/zdkX5_Gcdq8', youtubeId: 'zdkX5_Gcdq8' },
  { id: 'peit-15', name: 'Crucifixo Declinado Cross', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/zdkX5_Gcdq8', youtubeId: 'zdkX5_Gcdq8' },
  { id: 'peit-16', name: 'Cross-Over Polia Alta', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/jqTlJt3JXzQ', youtubeId: 'jqTlJt3JXzQ' },
  { id: 'peit-17', name: 'Cross-Over Polia Média', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/jqTlJt3JXzQ', youtubeId: 'jqTlJt3JXzQ' },
  { id: 'peit-18', name: 'Cross-Over Polia Baixa', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/jqTlJt3JXzQ', youtubeId: 'jqTlJt3JXzQ' },
  { id: 'peit-19', name: 'Flexão De Braço', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/dHgoYiCraCw', youtubeId: 'dHgoYiCraCw' },
  { id: 'peit-20', name: 'Peck Deck / Crucifixo Na Máquina', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/FzCnfD0gOXo', youtubeId: 'FzCnfD0gOXo' },
  { id: 'peit-21', name: 'Pull-Over', muscleGroup: 'Peitoral', videoUrl: 'https://youtu.be/-KaMXMMIVrU', youtubeId: '-KaMXMMIVrU' },

  // ================= DORSAIS =================
  { id: 'dors-1', name: 'Barra Fixa Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/thg6cGXSlvY', youtubeId: 'thg6cGXSlvY' },
  { id: 'dors-2', name: 'Barra Fixa Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/thg6cGXSlvY', youtubeId: 'thg6cGXSlvY' },
  { id: 'dors-3', name: 'Barra Fixa Com Triângulo', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/thg6cGXSlvY', youtubeId: 'thg6cGXSlvY' },
  { id: 'dors-4', name: 'Levantamento Terra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/50AkPBZwACQ', youtubeId: '50AkPBZwACQ' },
  { id: 'dors-5', name: 'Puxada Vertical Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/pJM_rHhluK8', youtubeId: 'pJM_rHhluK8' },
  { id: 'dors-6', name: 'Puxada Vertical Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/pJM_rHhluK8', youtubeId: 'pJM_rHhluK8' },
  { id: 'dors-7', name: 'Puxada Vertical Com Triângulo', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/pJM_rHhluK8', youtubeId: 'pJM_rHhluK8' },
  { id: 'dors-8', name: 'Remada Curvada Barra Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/TfxJMertfsw', youtubeId: 'TfxJMertfsw' },
  { id: 'dors-9', name: 'Remada Curvada Barra Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/TfxJMertfsw', youtubeId: 'TfxJMertfsw' },
  { id: 'dors-10', name: 'Remada Curvada Cavalinho', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/TfxJMertfsw', youtubeId: 'TfxJMertfsw' },
  { id: 'dors-11', name: 'Remada Curvada Halteres Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/Vk6c7CjtM14', youtubeId: 'Vk6c7CjtM14' },
  { id: 'dors-12', name: 'Remada Curvada Halteres Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/Vk6c7CjtM14', youtubeId: 'Vk6c7CjtM14' },
  { id: 'dors-13', name: 'Remada Curvada Halteres Peg Neutra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/Vk6c7CjtM14', youtubeId: 'Vk6c7CjtM14' },
  { id: 'dors-14', name: 'Remada Máquina Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/QyvIEdEHzHc', youtubeId: 'QyvIEdEHzHc' },
  { id: 'dors-15', name: 'Remada Máquina Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/QyvIEdEHzHc', youtubeId: 'QyvIEdEHzHc' },
  { id: 'dors-16', name: 'Remada Máquina Peg Neutra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/QyvIEdEHzHc', youtubeId: 'QyvIEdEHzHc' },
  { id: 'dors-17', name: 'Remada Cross Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-18', name: 'Remada Cross Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-19', name: 'Remada Cross Peg Neutra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-20', name: 'Remada Cross Unilateral Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-21', name: 'Remada Cross Unilateral Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-22', name: 'Remada Cross Unilateral Peg Neutra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/HpWWreyaBN0', youtubeId: 'HpWWreyaBN0' },
  { id: 'dors-23', name: 'Remada Halter Unilateral Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/m4h4jT9patY', youtubeId: 'm4h4jT9patY' },
  { id: 'dors-24', name: 'Remada Halter Unilateral Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/m4h4jT9patY', youtubeId: 'm4h4jT9patY' },
  { id: 'dors-25', name: 'Remada Halter Unilateral Peg Neutra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/m4h4jT9patY', youtubeId: 'm4h4jT9patY' },
  { id: 'dors-26', name: 'Pull-Down Barra', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/v6-QIOY0nW0', youtubeId: 'v6-QIOY0nW0' },
  { id: 'dors-27', name: 'Pull-Down Cross Peg Pronada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/v6-QIOY0nW0', youtubeId: 'v6-QIOY0nW0' },
  { id: 'dors-28', name: 'Pull-Down Cross Peg Supinada', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/v6-QIOY0nW0', youtubeId: 'v6-QIOY0nW0' },
  { id: 'dors-29', name: 'Pull-Down Cross Corda', muscleGroup: 'Dorsais', videoUrl: 'https://youtu.be/v6-QIOY0nW0', youtubeId: 'v6-QIOY0nW0' },

  // ================= DELTÓIDES =================
  { id: 'delt-1', name: 'Elevação Lateral Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/IwWvZ0rlNXs', youtubeId: 'IwWvZ0rlNXs' },
  { id: 'delt-2', name: 'Elevação Lateral Sentado Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/IwWvZ0rlNXs', youtubeId: 'IwWvZ0rlNXs' },
  { id: 'delt-3', name: 'Elevação Lateral Unilateral Banco Inclinado', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/IwWvZ0rlNXs', youtubeId: 'IwWvZ0rlNXs' },
  { id: 'delt-4', name: 'Elevação Lateral Cross Anterior', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/sKPJdvVvHuI', youtubeId: 'sKPJdvVvHuI' },
  { id: 'delt-5', name: 'Elevação Lateral Cross Posterior', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/sKPJdvVvHuI', youtubeId: 'sKPJdvVvHuI' },
  { id: 'delt-6', name: 'Elevação Frontal Barra Peg Pronada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/_ZQhDiONpZA', youtubeId: '_ZQhDiONpZA' },
  { id: 'delt-7', name: 'Elevação Frontal Barra Peg Supinada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/_ZQhDiONpZA', youtubeId: '_ZQhDiONpZA' },
  { id: 'delt-8', name: 'Elevação Frontal Anilha', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/_ZQhDiONpZA', youtubeId: '_ZQhDiONpZA' },
  { id: 'delt-9', name: 'Elevação Frontal Halteres Peg Pronada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/NxSuojHZa8k', youtubeId: 'NxSuojHZa8k' },
  { id: 'delt-10', name: 'Elevação Frontal Halteres Peg Supinada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/NxSuojHZa8k', youtubeId: 'NxSuojHZa8k' },
  { id: 'delt-11', name: 'Elevação Frontal Halteres Peg Neutra', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/NxSuojHZa8k', youtubeId: 'NxSuojHZa8k' },
  { id: 'delt-12', name: 'Elevação Frontal Cruzada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/NxSuojHZa8k', youtubeId: 'NxSuojHZa8k' },
  { id: 'delt-13', name: 'Elevação Frontal Cross Peg Pronada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/S7B5LwWrLA0', youtubeId: 'S7B5LwWrLA0' },
  { id: 'delt-14', name: 'Elevação Frontal Cross Peg Supinada', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/S7B5LwWrLA0', youtubeId: 'S7B5LwWrLA0' },
  { id: 'delt-15', name: 'Elevação Frontal Cross Corda', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/S7B5LwWrLA0', youtubeId: 'S7B5LwWrLA0' },
  { id: 'delt-16', name: 'Crucifixo Inverso Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/5HDkxzxe400', youtubeId: '5HDkxzxe400' },
  { id: 'delt-17', name: 'Crucifixo Inverso Cross', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/5HDkxzxe400', youtubeId: '5HDkxzxe400' },
  { id: 'delt-18', name: 'Desenvolvimento Anterior', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/EuQAfhXBEvs', youtubeId: 'EuQAfhXBEvs' },
  { id: 'delt-19', name: 'Desenvolvimento Militar', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/EuQAfhXBEvs', youtubeId: 'EuQAfhXBEvs' },
  { id: 'delt-20', name: 'Desenvolvimento Smith', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/EuQAfhXBEvs', youtubeId: 'EuQAfhXBEvs' },
  { id: 'delt-21', name: 'Desenvolvimento Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/EuQAfhXBEvs', youtubeId: 'EuQAfhXBEvs' },
  { id: 'delt-22', name: 'Desenvolvimento Máquina', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/EuQAfhXBEvs', youtubeId: 'EuQAfhXBEvs' },
  { id: 'delt-23', name: 'Manguito Rotador Externo Barra', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/AevNFIX7lV4', youtubeId: 'AevNFIX7lV4' },
  { id: 'delt-24', name: 'Manguito Rotador Externo Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/AevNFIX7lV4', youtubeId: 'AevNFIX7lV4' },
  { id: 'delt-25', name: 'Manguito Rotador Externo Cross', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/AevNFIX7lV4', youtubeId: 'AevNFIX7lV4' },
  { id: 'delt-26', name: 'Manguito Rotador Interno Barra', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/vN9_Bw_yZGA', youtubeId: 'vN9_Bw_yZGA' },
  { id: 'delt-27', name: 'Manguito Rotador Interno Halteres', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/vN9_Bw_yZGA', youtubeId: 'vN9_Bw_yZGA' },
  { id: 'delt-28', name: 'Manguito Rotador Interno Cross', muscleGroup: 'Deltóides', videoUrl: 'https://youtu.be/vN9_Bw_yZGA', youtubeId: 'vN9_Bw_yZGA' },

  // ================= TRAPÉZIO =================
  { id: 'trap-1', name: 'Encolhimento Barra Anterior', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/RhGjwIUe16E', youtubeId: 'RhGjwIUe16E' },
  { id: 'trap-2', name: 'Encolhimento Barra Posterior', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/RhGjwIUe16E', youtubeId: 'RhGjwIUe16E' },
  { id: 'trap-3', name: 'Encolhimento Halteres', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/RhGjwIUe16E', youtubeId: 'RhGjwIUe16E' },
  { id: 'trap-4', name: 'Encolhimento Smith Anterior', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/RhGjwIUe16E', youtubeId: 'RhGjwIUe16E' },
  { id: 'trap-5', name: 'Encolhimento Smith Posterior', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/RhGjwIUe16E', youtubeId: 'RhGjwIUe16E' },
  { id: 'trap-6', name: 'Remada Alta Barra', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/tm0IywBhIYM', youtubeId: 'tm0IywBhIYM' },
  { id: 'trap-7', name: 'Remada Alta Halteres', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/tm0IywBhIYM', youtubeId: 'tm0IywBhIYM' },
  { id: 'trap-8', name: 'Remada Alta Cross', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/tm0IywBhIYM', youtubeId: 'tm0IywBhIYM' },
  { id: 'trap-9', name: 'Remada Alta Smith', muscleGroup: 'Trapézio', videoUrl: 'https://youtu.be/tm0IywBhIYM', youtubeId: 'tm0IywBhIYM' },

  // ================= TRÍCEPS =================
  { id: 'tric-1', name: 'Paralelas', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/LJz40nTE_sI', youtubeId: 'LJz40nTE_sI' },
  { id: 'tric-2', name: 'Mergulho', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/TCVj8cliLNo', youtubeId: 'TCVj8cliLNo' },
  { id: 'tric-3', name: 'Supino Fechado Barra', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/ZiemT4r4DcU', youtubeId: 'ZiemT4r4DcU' },
  { id: 'tric-4', name: 'Supino Fechado Smith', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/ZiemT4r4DcU', youtubeId: 'ZiemT4r4DcU' },
  { id: 'tric-5', name: 'Rosca Testa Barra Peg Pronada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/zznCYBVZOVA', youtubeId: 'zznCYBVZOVA' },
  { id: 'tric-6', name: 'Rosca Testa Barra Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/zznCYBVZOVA', youtubeId: 'zznCYBVZOVA' },
  { id: 'tric-7', name: 'Rosca Testa Anilha', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/zznCYBVZOVA', youtubeId: 'zznCYBVZOVA' },
  { id: 'tric-8', name: 'Rosca Testa Halteres Peg Pronada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/SbAykzCE-xk', youtubeId: 'SbAykzCE-xk' },
  { id: 'tric-9', name: 'Rosca Testa Halteres Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/SbAykzCE-xk', youtubeId: 'SbAykzCE-xk' },
  { id: 'tric-10', name: 'Rosca Testa Halteres Peg Neutra', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/SbAykzCE-xk', youtubeId: 'SbAykzCE-xk' },
  { id: 'tric-11', name: 'Tríceps Pulley Peg Pronada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/dTqDKC0D6P4', youtubeId: 'dTqDKC0D6P4' },
  { id: 'tric-12', name: 'Tríceps Pulley Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/dTqDKC0D6P4', youtubeId: 'dTqDKC0D6P4' },
  { id: 'tric-13', name: 'Tríceps Pulley Corda', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/dTqDKC0D6P4', youtubeId: 'dTqDKC0D6P4' },
  { id: 'tric-14', name: 'Tríceps Pulley Unilateral Peg Pronada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/nTTTjbA0TSU', youtubeId: 'nTTTjbA0TSU' },
  { id: 'tric-15', name: 'Tríceps Pulley Unilateral Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/nTTTjbA0TSU', youtubeId: 'nTTTjbA0TSU' },
  { id: 'tric-16', name: 'Rosca Francesa Anilha', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/YJ4kGE3eemY', youtubeId: 'YJ4kGE3eemY' },
  { id: 'tric-17', name: 'Rosca Francesa Barra Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/YJ4kGE3eemY', youtubeId: 'YJ4kGE3eemY' },
  { id: 'tric-18', name: 'Rosca Francesa Halteres Peg Neutra', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/YJ4kGE3eemY', youtubeId: 'YJ4kGE3eemY' },
  { id: 'tric-19', name: 'Rosca Francesa Halteres Peg Supinada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/YJ4kGE3eemY', youtubeId: 'YJ4kGE3eemY' },
  { id: 'tric-20', name: 'Rosca Francesa Cross Corda', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/YJ4kGE3eemY', youtubeId: 'YJ4kGE3eemY' },
  { id: 'tric-21', name: 'Tríceps Coice Bilateral Halteres', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/PyKv23F-fVM', youtubeId: 'PyKv23F-fVM' },
  { id: 'tric-22', name: 'Tríceps Coice Unilateral Halteres', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/PyKv23F-fVM', youtubeId: 'PyKv23F-fVM' },
  { id: 'tric-23', name: 'Tríceps Coice Unilateral Cross', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/PyKv23F-fVM', youtubeId: 'PyKv23F-fVM' },
  { id: 'tric-24', name: 'Flexão De Braço Fechada', muscleGroup: 'Tríceps', videoUrl: 'https://youtu.be/HM9DUyI4d-g', youtubeId: 'HM9DUyI4d-g' },

  // ================= BÍCEPS =================
  { id: 'bic-1', name: 'Rosca Direta Barra Reta ou Barra W', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/Q8TqfD8E7BU', youtubeId: 'Q8TqfD8E7BU' },
  { id: 'bic-2', name: 'Rosca Direta Halteres', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/Q8TqfD8E7BU', youtubeId: 'Q8TqfD8E7BU' },
  { id: 'bic-3', name: 'Rosca Direta Cross', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/Q8TqfD8E7BU', youtubeId: 'Q8TqfD8E7BU' },
  { id: 'bic-4', name: 'Rosca Direta Máquina', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/Q8TqfD8E7BU', youtubeId: 'Q8TqfD8E7BU' },
  { id: 'bic-5', name: 'Rosca Martelo Barra H', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/0qkQy8V2FC0', youtubeId: '0qkQy8V2FC0' },
  { id: 'bic-6', name: 'Rosca Martelo Halteres', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/0qkQy8V2FC0', youtubeId: '0qkQy8V2FC0' },
  { id: 'bic-7', name: 'Rosca Martelo Corda Cross', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/0qkQy8V2FC0', youtubeId: '0qkQy8V2FC0' },
  { id: 'bic-8', name: 'Rosca Alternada Halteres', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/S1HAcTVQVYE', youtubeId: 'S1HAcTVQVYE' },
  { id: 'bic-9', name: 'Rosca Alternada Cross-Over', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/S1HAcTVQVYE', youtubeId: 'S1HAcTVQVYE' },
  { id: 'bic-10', name: 'Rosca Simultânea Halteres', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/S1HAcTVQVYE', youtubeId: 'S1HAcTVQVYE' },
  { id: 'bic-11', name: 'Rosca Scott Halteres', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/zpTK6eihdSA', youtubeId: 'zpTK6eihdSA' },
  { id: 'bic-12', name: 'Rosca Scott Barra ou Barra W', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/zpTK6eihdSA', youtubeId: 'zpTK6eihdSA' },
  { id: 'bic-13', name: 'Rosca Scott Máquina', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/zpTK6eihdSA', youtubeId: 'zpTK6eihdSA' },
  { id: 'bic-14', name: 'Rosca Concentrada', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/EEpvOQAAtRo', youtubeId: 'EEpvOQAAtRo' },
  { id: 'bic-15', name: 'Rosca Concentrada Bilateral', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/EEpvOQAAtRo', youtubeId: 'EEpvOQAAtRo' },
  { id: 'bic-16', name: 'Rosca Concentrada Martelo', muscleGroup: 'Bíceps', videoUrl: 'https://youtu.be/EEpvOQAAtRo', youtubeId: 'EEpvOQAAtRo' },

  // ================= ANTEBRAÇO =================
  { id: 'ant-1', name: 'Flexão de Punho Barra Sentado', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/3PDPiCoWF-Y', youtubeId: '3PDPiCoWF-Y' },
  { id: 'ant-2', name: 'Flexão de Punho Barra Em Pé', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/3PDPiCoWF-Y', youtubeId: '3PDPiCoWF-Y' },
  { id: 'ant-3', name: 'Flexão de Punho Cross', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/3PDPiCoWF-Y', youtubeId: '3PDPiCoWF-Y' },
  { id: 'ant-4', name: 'Extensão de Punho Barra Sentado', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/Kx8rg0MJX_c', youtubeId: 'Kx8rg0MJX_c' },
  { id: 'ant-5', name: 'Extensão de Punho Barra Em Pé', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/Kx8rg0MJX_c', youtubeId: 'Kx8rg0MJX_c' },
  { id: 'ant-6', name: 'Extensão de Punho Cross', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/Kx8rg0MJX_c', youtubeId: 'Kx8rg0MJX_c' },
  { id: 'ant-7', name: 'Rotacional de Punho', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/Kx8rg0MJX_c', youtubeId: 'Kx8rg0MJX_c' },
  { id: 'ant-8', name: 'Rosca Inversa Barra', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/jbSr9CzJPmA', youtubeId: 'jbSr9CzJPmA' },
  { id: 'ant-9', name: 'Rosca Inversa Cross', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/jbSr9CzJPmA', youtubeId: 'jbSr9CzJPmA' },
  { id: 'ant-10', name: 'Rosca Inversa Unilateral', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/jbSr9CzJPmA', youtubeId: 'jbSr9CzJPmA' },
  { id: 'ant-11', name: 'Hand Grip', muscleGroup: 'Antebraço', videoUrl: 'https://youtu.be/XVlGHmeISEQ', youtubeId: 'XVlGHmeISEQ' },

  // ================= COXAS (QUADRÍCEPS & POSTERIORES) =================
  { id: 'cox-1', name: 'Agachamento Livre', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/zgk71dUUt0Y', youtubeId: 'zgk71dUUt0Y' },
  { id: 'cox-2', name: 'Agachamento Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/zgk71dUUt0Y', youtubeId: 'zgk71dUUt0Y' },
  { id: 'cox-3', name: 'Agachamento Hack', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/zgk71dUUt0Y', youtubeId: 'zgk71dUUt0Y' },
  { id: 'cox-4', name: 'Agachamento Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/zgk71dUUt0Y', youtubeId: 'zgk71dUUt0Y' },
  { id: 'cox-5', name: 'Agachamento Livre Frontal', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/syfDrU220FU', youtubeId: 'syfDrU220FU' },
  { id: 'cox-6', name: 'Agachamento Smith Frontal', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/syfDrU220FU', youtubeId: 'syfDrU220FU' },
  { id: 'cox-7', name: 'Agachamento Sumo Livre', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/O6Cmxez6D0k', youtubeId: 'O6Cmxez6D0k' },
  { id: 'cox-8', name: 'Agachamento Sumo Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/O6Cmxez6D0k', youtubeId: 'O6Cmxez6D0k' },
  { id: 'cox-9', name: 'Agachamento Sumo Hack', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/O6Cmxez6D0k', youtubeId: 'O6Cmxez6D0k' },
  { id: 'cox-10', name: 'Agachamento Búlgaro Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/IGf9fR4Y7Iw', youtubeId: 'IGf9fR4Y7Iw' },
  { id: 'cox-11', name: 'Agachamento Búlgaro Barra', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/IGf9fR4Y7Iw', youtubeId: 'IGf9fR4Y7Iw' },
  { id: 'cox-12', name: 'Agachamento Búlgaro Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/IGf9fR4Y7Iw', youtubeId: 'IGf9fR4Y7Iw' },
  { id: 'cox-13', name: 'Passada Barra', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/sQ5RjbpPirY', youtubeId: 'sQ5RjbpPirY' },
  { id: 'cox-14', name: 'Passada Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/sQ5RjbpPirY', youtubeId: 'sQ5RjbpPirY' },
  { id: 'cox-15', name: 'Afundos Barra', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/Umzor-_g-tQ', youtubeId: 'Umzor-_g-tQ' },
  { id: 'cox-16', name: 'Afundos Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/Umzor-_g-tQ', youtubeId: 'Umzor-_g-tQ' },
  { id: 'cox-17', name: 'Afundos Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/Umzor-_g-tQ', youtubeId: 'Umzor-_g-tQ' },
  { id: 'cox-18', name: 'Avanço Barra', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/XBJtM2phDDM', youtubeId: 'XBJtM2phDDM' },
  { id: 'cox-19', name: 'Avanço Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/XBJtM2phDDM', youtubeId: 'XBJtM2phDDM' },
  { id: 'cox-20', name: 'Avanço Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/XBJtM2phDDM', youtubeId: 'XBJtM2phDDM' },
  { id: 'cox-21', name: 'Leg Press', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/nY8UsiAqwds', youtubeId: 'nY8UsiAqwds' },
  { id: 'cox-22', name: 'Leg Press Adutores', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/nY8UsiAqwds', youtubeId: 'nY8UsiAqwds' },
  { id: 'cox-23', name: 'Stiff Barra', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/u1E3_u2gJYE', youtubeId: 'u1E3_u2gJYE' },
  { id: 'cox-24', name: 'Stiff Halteres', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/u1E3_u2gJYE', youtubeId: 'u1E3_u2gJYE' },
  { id: 'cox-25', name: 'Stiff Smith', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/u1E3_u2gJYE', youtubeId: 'u1E3_u2gJYE' },
  { id: 'cox-26', name: 'Cadeira Extensora', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/el3oHblB5DM', youtubeId: 'el3oHblB5DM' },
  { id: 'cox-27', name: 'Mesa Flexora', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/2-ULaRrQa7c', youtubeId: '2-ULaRrQa7c' },
  { id: 'cox-28', name: 'Cadeira Flexora', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/Zss6E3VU6X0', youtubeId: 'Zss6E3VU6X0' },
  { id: 'cox-29', name: 'Flexor Vertical', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/KomsEmm5oxA', youtubeId: 'KomsEmm5oxA' },
  { id: 'cox-30', name: 'Cadeira Adutora', muscleGroup: 'Coxas', videoUrl: 'https://youtu.be/Wf602gn_9zU', youtubeId: 'Wf602gn_9zU' },

  // ================= GLÚTEOS =================
  { id: 'glut-1', name: '4 Apoios Joelho Estendido', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/e4RuZ1NVYqA', youtubeId: 'e4RuZ1NVYqA' },
  { id: 'glut-2', name: '4 Apoios Joelho Flexionado', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/e4RuZ1NVYqA', youtubeId: 'e4RuZ1NVYqA' },
  { id: 'glut-3', name: '4 Apoios Smith', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/e4RuZ1NVYqA', youtubeId: 'e4RuZ1NVYqA' },
  { id: 'glut-4', name: 'Glúteos Máquina', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/JhodVO0l1vw', youtubeId: 'JhodVO0l1vw' },
  { id: 'glut-5', name: 'Glúteos Cross Joelho Estendido', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/JdHbXlggr6Q', youtubeId: 'JdHbXlggr6Q' },
  { id: 'glut-6', name: 'Glúteos Cross Joelho Flexionado', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/JdHbXlggr6Q', youtubeId: 'JdHbXlggr6Q' },
  { id: 'glut-7', name: 'Elevação Pélvica Barra', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/ptK0azwOXwM', youtubeId: 'ptK0azwOXwM' },
  { id: 'glut-8', name: 'Elevação Pélvica Halter', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/ptK0azwOXwM', youtubeId: 'ptK0azwOXwM' },
  { id: 'glut-9', name: 'Elevação Pélvica Anilha', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/ptK0azwOXwM', youtubeId: 'ptK0azwOXwM' },
  { id: 'glut-10', name: 'Elevação Pélvica Máquina', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/ptK0azwOXwM', youtubeId: 'ptK0azwOXwM' },
  { id: 'glut-11', name: 'Cadeira Abdutora', muscleGroup: 'Glúteos', videoUrl: 'https://youtu.be/e2gmqTG1OgQ', youtubeId: 'e2gmqTG1OgQ' },

  // ================= PANTURRILHAS =================
  { id: 'pant-1', name: 'Gêmeos Em Pé Máquina', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/824pMjvGXgc', youtubeId: '824pMjvGXgc' },
  { id: 'pant-2', name: 'Gêmeos Em Pé Hack', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/824pMjvGXgc', youtubeId: '824pMjvGXgc' },
  { id: 'pant-3', name: 'Gêmeos Em Pé Smith', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/824pMjvGXgc', youtubeId: '824pMjvGXgc' },
  { id: 'pant-4', name: 'Gêmeos Em Pé Livre', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/824pMjvGXgc', youtubeId: '824pMjvGXgc' },
  { id: 'pant-5', name: 'Gêmeos Sentado Máquina', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/jMWs_p-W9gY', youtubeId: 'jMWs_p-W9gY' },
  { id: 'pant-6', name: 'Gêmeos Sentado Smith', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/jMWs_p-W9gY', youtubeId: 'jMWs_p-W9gY' },
  { id: 'pant-7', name: 'Gêmeos Sentado Livre', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/jMWs_p-W9gY', youtubeId: 'jMWs_p-W9gY' },
  { id: 'pant-8', name: 'Gêmeos Leg Press', muscleGroup: 'Panturrilhas', videoUrl: 'https://youtu.be/wCXvfH_-BLg', youtubeId: 'wCXvfH_-BLg' },

  // ================= ABDÔMEN \ CORE \ LOMBAR \ PESCOÇO =================
  { id: 'core-1', name: 'Supra', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/7YxVRiATugo', youtubeId: '7YxVRiATugo' },
  { id: 'core-2', name: 'Infra', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/ixJcUH8AlL8', youtubeId: 'ixJcUH8AlL8' },
  { id: 'core-3', name: 'Oblíquos', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/Smr8ipkN5A0', youtubeId: 'Smr8ipkN5A0' },
  { id: 'core-4', name: 'Prancha', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/qNRqGqESAWU', youtubeId: 'qNRqGqESAWU' },
  { id: 'core-5', name: 'Extensão Lombar', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/z0rx9swRDR0', youtubeId: 'z0rx9swRDR0' },
  { id: 'core-6', name: 'Vácuo de Estômago', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/qvdiga5sQvQ', youtubeId: 'qvdiga5sQvQ' },
  { id: 'core-7', name: 'Extensão de Pescoço', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/FTkrC44gNIU', youtubeId: 'FTkrC44gNIU' },
  { id: 'core-8', name: 'Flexão de Pescoço', muscleGroup: 'Abdômen / Core', videoUrl: 'https://youtu.be/FTkrC44gNIU', youtubeId: 'FTkrC44gNIU' },

  // ================= ALONGAMENTOS =================
  { id: 'along-1', name: 'Alongamento Abdômen', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/-4kn_0w47KA', youtubeId: '-4kn_0w47KA' },
  { id: 'along-2', name: 'Alongamento Adutor de Coxa', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/lmdPqK7QmIE', youtubeId: 'lmdPqK7QmIE' },
  { id: 'along-3', name: 'Alongamento Antebraço', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/Dr-9K8qYzAU', youtubeId: 'Dr-9K8qYzAU' },
  { id: 'along-4', name: 'Alongamento Bíceps', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/CIJGj_PqmXo', youtubeId: 'CIJGj_PqmXo' },
  { id: 'along-5', name: 'Alongamento Dorsal', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/PiKByqgZJ1I', youtubeId: 'PiKByqgZJ1I' },
  { id: 'along-6', name: 'Alongamento Glúteo', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/aT77gh4eoZo', youtubeId: 'aT77gh4eoZo' },
  { id: 'along-7', name: 'Alongamento Deltóide', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/XNsaSkLoYKY', youtubeId: 'XNsaSkLoYKY' },
  { id: 'along-8', name: 'Alongamento Panturrilha', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/QWxpUV-7Sx8', youtubeId: 'QWxpUV-7Sx8' },
  { id: 'along-9', name: 'Alongamento Peitoral', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/oe7C99EHJYM', youtubeId: 'oe7C99EHJYM' },
  { id: 'along-10', name: 'Alongamento Pescoço', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/KSgZCgQiF-Q', youtubeId: 'KSgZCgQiF-Q' },
  { id: 'along-11', name: 'Alongamento Posterior de Coxa', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/KUt5agoqlRA', youtubeId: 'KUt5agoqlRA' },
  { id: 'along-12', name: 'Alongamento Quadríceps', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/xugYzuSgsrs', youtubeId: 'xugYzuSgsrs' },
  { id: 'along-13', name: 'Alongamento Trapézio', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/wrNfkcmrxMs', youtubeId: 'wrNfkcmrxMs' },
  { id: 'along-14', name: 'Alongamento Tríceps', muscleGroup: 'Alongamentos', videoUrl: 'https://youtu.be/hJGKq0-CDbU', youtubeId: 'hJGKq0-CDbU' },
];

/**
 * Normalizes text removing accents, punctuation and excess whitespace for comparison
 */
function normalizeString(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts YouTube Video ID from standard or shortened URLs
 */
export function getYoutubeVideoId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

/**
 * Returns the embeddable YouTube URL
 */
export function getYoutubeEmbedUrl(urlOrId: string): string {
  const id = urlOrId.includes('/') ? getYoutubeVideoId(urlOrId) : urlOrId;
  if (!id) return '';
  return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * Finds the closest matching exercise video for a given routine exercise name.
 * Uses exact match, fuzzy token containment, and common synonyms.
 */
export function findExerciseVideo(exerciseName: string): ExerciseVideoItem | undefined {
  if (!exerciseName) return undefined;

  const rawNormalized = normalizeString(exerciseName);

  // 1. Direct match
  const exact = EXERCISE_VIDEOS_CATALOG.find(
    (item) => normalizeString(item.name) === rawNormalized
  );
  if (exact) return exact;

  // 2. Exact match on clean name without prefixes/suffixes (e.g., removing "(FST-7)", "4x8", etc.)
  const cleanName = rawNormalized
    .replace(/\b\d+x\d+\b/g, '')
    .replace(/\b(fst\s*7|gironda|sst|drop\s*set|strip\s*set|rest\s*pause)\b/g, '')
    .trim();

  const matchClean = EXERCISE_VIDEOS_CATALOG.find(
    (item) => normalizeString(item.name) === cleanName
  );
  if (matchClean) return matchClean;

  // 3. Substring containment: check if video catalog name is contained in the exercise name or vice versa
  const candidate = EXERCISE_VIDEOS_CATALOG.find((item) => {
    const itemNorm = normalizeString(item.name);
    return cleanName.includes(itemNorm) || itemNorm.includes(cleanName);
  });
  if (candidate) return candidate;

  // 4. Token match: count matching keywords
  const tokens = cleanName.split(' ').filter((t) => t.length > 2);
  let bestItem: ExerciseVideoItem | undefined;
  let bestScore = 0;

  for (const item of EXERCISE_VIDEOS_CATALOG) {
    const itemNorm = normalizeString(item.name);
    const itemTokens = itemNorm.split(' ').filter((t) => t.length > 2);
    
    let score = 0;
    for (const token of tokens) {
      if (itemTokens.includes(token)) score += 2;
      else if (itemNorm.includes(token)) score += 1;
    }

    if (score > bestScore && score >= 3) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestItem;
}
