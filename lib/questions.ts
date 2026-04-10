import { PoolClient } from 'pg';
import { GameSnapshot, GameState, Question, QuestionStatus, SubmissionSettings } from '@/lib/types';
import { query, withTransaction } from '@/lib/db';

type QuestionRow = {
  id: string;
  text: string;
  answer: string;
  author: string | null;
  city: string | null;
  status: QuestionStatus;
  used: boolean;
  created_at: string;
  updated_at: string;
};

type SettingsRow = {
  submissions_enabled: boolean;
  submissions_start_at: string | null;
  submissions_end_at: string | null;
};

type GameStateRow = {
  current_question_id: string | null;
  game_state: GameState;
  selected_index: number | null;
};

type TotalsRow = {
  submitted: string;
};

function mapQuestion(row: QuestionRow): Question {
  return {
    id: row.id,
    text: row.text,
    answer: row.answer,
    author: row.author ?? '',
    city: row.city ?? '',
    status: row.status,
    used: row.used,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function computeAcceptingQuestions(settings: Omit<SubmissionSettings, 'acceptingQuestions'>) {
  if (!settings.submissionsEnabled) {
    return false;
  }

  const now = Date.now();
  const startsAt = settings.submissionsStartAt ? new Date(settings.submissionsStartAt).getTime() : null;
  const endsAt = settings.submissionsEndAt ? new Date(settings.submissionsEndAt).getTime() : null;

  if (startsAt && now < startsAt) {
    return false;
  }

  if (endsAt && now > endsAt) {
    return false;
  }

  return true;
}

async function getSettingsRow() {
  const result = await query<SettingsRow>(`
    SELECT submissions_enabled, submissions_start_at, submissions_end_at
    FROM app_settings
    WHERE id = 1
  `);

  const row = result.rows[0];
  if (!row) {
    return {
      submissionsEnabled: true,
      submissionsStartAt: null,
      submissionsEndAt: null,
    };
  }

  return {
    submissionsEnabled: row.submissions_enabled,
    submissionsStartAt: row.submissions_start_at,
    submissionsEndAt: row.submissions_end_at,
  };
}

async function getGameStateRow(client?: PoolClient) {
  const result = client
    ? await client.query<GameStateRow>(`
      SELECT current_question_id, game_state, selected_index
      FROM game_state
      WHERE id = 1
    `)
    : await query<GameStateRow>(`
      SELECT current_question_id, game_state, selected_index
      FROM game_state
      WHERE id = 1
    `);

  return result.rows[0];
}

async function listApprovedQuestions(client?: PoolClient) {
  const result = client
    ? await client.query<QuestionRow>(`
      SELECT id, text, answer, author, city, status, used, created_at, updated_at
      FROM questions
      WHERE status = 'approved'
      ORDER BY created_at ASC
    `)
    : await query<QuestionRow>(`
      SELECT id, text, answer, author, city, status, used, created_at, updated_at
      FROM questions
      WHERE status = 'approved'
      ORDER BY created_at ASC
    `);

  return result.rows.map(mapQuestion);
}

async function getQuestionTotals(client?: PoolClient) {
  const result = client
    ? await client.query<TotalsRow>(`
      SELECT
        COUNT(*)::text AS submitted
      FROM questions
    `)
    : await query<TotalsRow>(`
      SELECT
        COUNT(*)::text AS submitted
      FROM questions
    `);

  const row = result.rows[0];

  return {
    submitted: Number(row?.submitted ?? 0),
  };
}

async function getGameSnapshotWithClient(client?: PoolClient): Promise<GameSnapshot> {
  const [questions, gameState, totals] = await Promise.all([
    listApprovedQuestions(client),
    getGameStateRow(client),
    getQuestionTotals(client),
  ]);

  const currentQuestion = questions.find((question) => question.id === gameState.current_question_id) ?? null;
  const hasAvailableQuestions = questions.some((question) => !question.used);
  const computedState = (() => {
    if (questions.length === 0) {
      return 'waiting';
    }

    if (currentQuestion) {
      return gameState.game_state;
    }

    if (!hasAvailableQuestions) {
      return 'finished';
    }

    // No current question but available questions exist - reset to waiting
    return 'waiting';
  })();

  return {
    questions,
    currentQuestion,
    currentQuestionId: currentQuestion?.id ?? null,
    gameState: computedState,
    selectedIndex: gameState.selected_index,
    totals,
  };
}

export async function getSubmissionSettings(): Promise<SubmissionSettings> {
  const settings = await getSettingsRow();

  return {
    ...settings,
    acceptingQuestions: computeAcceptingQuestions(settings),
  };
}

export async function updateSubmissionSettings(input: {
  submissionsEnabled: boolean;
  submissionsStartAt: string | null;
  submissionsEndAt: string | null;
}) {
  await query(
    `
      UPDATE app_settings
      SET
        submissions_enabled = $1,
        submissions_start_at = $2,
        submissions_end_at = $3,
        updated_at = NOW()
      WHERE id = 1
    `,
    [
      input.submissionsEnabled,
      input.submissionsStartAt ? new Date(input.submissionsStartAt).toISOString() : null,
      input.submissionsEndAt ? new Date(input.submissionsEndAt).toISOString() : null,
    ]
  );

  return getSubmissionSettings();
}

export async function listQuestions() {
  const result = await query<QuestionRow>(`
    SELECT id, text, answer, author, city, status, used, created_at, updated_at
    FROM questions
    ORDER BY created_at DESC
  `);

  return result.rows.map(mapQuestion);
}

export async function createQuestion(input: {
  text: string;
  answer: string;
  author: string;
  city: string;
  status?: QuestionStatus;
}) {
  const result = await query<QuestionRow>(
    `
      INSERT INTO questions (id, text, answer, author, city, status, used)
      VALUES ($1, $2, $3, $4, $5, $6, FALSE)
      RETURNING id, text, answer, author, city, status, used, created_at, updated_at
    `,
    [
      crypto.randomUUID(),
      input.text.trim(),
      input.answer.trim(),
      input.author.trim(),
      input.city.trim(),
      input.status ?? 'pending',
    ]
  );

  return mapQuestion(result.rows[0]);
}

export async function updateQuestion(id: string, input: {
  text?: string;
  answer?: string;
  author?: string | null;
  city?: string | null;
  status?: QuestionStatus;
  used?: boolean;
}) {
  const current = await query<QuestionRow>(
    `
      SELECT id, text, answer, author, city, status, used, created_at, updated_at
      FROM questions
      WHERE id = $1
    `,
    [id]
  );

  const row = current.rows[0];
  if (!row) {
    return null;
  }

  const result = await query<QuestionRow>(
    `
      UPDATE questions
      SET
        text = $2,
        answer = $3,
        author = $4,
        city = $5,
        status = $6,
        used = $7,
        updated_at = NOW()
      WHERE id = $1
      RETURNING id, text, answer, author, city, status, used, created_at, updated_at
    `,
    [
      id,
      input.text?.trim() ?? row.text,
      input.answer?.trim() ?? row.answer,
      input.author !== undefined ? input.author?.trim() || null : row.author,
      input.city !== undefined ? input.city?.trim() || null : row.city,
      input.status ?? row.status,
      input.used ?? row.used,
    ]
  );

  if (input.status && input.status !== 'approved') {
    await query(
      `
        UPDATE game_state
        SET
          current_question_id = CASE WHEN current_question_id = $1 THEN NULL ELSE current_question_id END,
          game_state = CASE WHEN current_question_id = $1 THEN 'waiting' ELSE game_state END,
          selected_index = CASE WHEN current_question_id = $1 THEN NULL ELSE selected_index END,
          updated_at = NOW()
        WHERE id = 1
      `,
      [id]
    );
  }

  return mapQuestion(result.rows[0]);
}

export async function deleteQuestion(id: string) {
  await withTransaction(async (client) => {
    await client.query(`DELETE FROM questions WHERE id = $1`, [id]);
    await client.query(
      `
        UPDATE game_state
        SET
          current_question_id = CASE WHEN current_question_id = $1 THEN NULL ELSE current_question_id END,
          game_state = CASE WHEN current_question_id = $1 THEN 'waiting' ELSE game_state END,
          selected_index = CASE WHEN current_question_id = $1 THEN NULL ELSE selected_index END,
          updated_at = NOW()
        WHERE id = 1
      `,
      [id]
    );
  });
}

export async function getGameSnapshot(): Promise<GameSnapshot> {
  return getGameSnapshotWithClient();
}

export async function runGameAction(action: 'pick' | 'reveal' | 'answer' | 'next') {
  return withTransaction(async (client) => {
    const questions = await listApprovedQuestions(client);
    const state = await getGameStateRow(client);

    if (action === 'pick') {
      const availableQuestions = questions.filter((question) => !question.used);

      if (availableQuestions.length === 0) {
        await client.query(
          `UPDATE game_state SET current_question_id = NULL, game_state = 'finished', selected_index = NULL, updated_at = NOW() WHERE id = 1`
        );
        return getGameSnapshotWithClient(client);
      }

      const selected = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
      const selectedIndex = questions.findIndex((question) => question.id === selected.id);

      await client.query(
        `
          UPDATE game_state
          SET current_question_id = $1, game_state = 'selecting', selected_index = $2, updated_at = NOW()
          WHERE id = 1
        `,
        [selected.id, selectedIndex]
      );

      return getGameSnapshotWithClient(client);
    }

    if (action === 'reveal') {
      if (!state.current_question_id) {
        return getGameSnapshotWithClient(client);
      }

      await client.query(
        `UPDATE game_state SET game_state = 'question', updated_at = NOW() WHERE id = 1`
      );

      return getGameSnapshotWithClient(client);
    }

    if (action === 'answer') {
      if (!state.current_question_id) {
        return getGameSnapshotWithClient(client);
      }

      await client.query(
        `UPDATE questions SET used = TRUE, updated_at = NOW() WHERE id = $1`,
        [state.current_question_id]
      );
      await client.query(
        `UPDATE game_state SET game_state = 'answer', updated_at = NOW() WHERE id = 1`
      );

      return getGameSnapshotWithClient(client);
    }

    const remainingQuestions = questions.filter(
      (question) => !question.used && question.id !== state.current_question_id
    );

    await client.query(
      `
        UPDATE game_state
        SET
          current_question_id = NULL,
          game_state = $1,
          selected_index = NULL,
          updated_at = NOW()
        WHERE id = 1
      `,
      [remainingQuestions.length > 0 ? 'waiting' : 'finished']
    );

    return getGameSnapshotWithClient(client);
  });
}
