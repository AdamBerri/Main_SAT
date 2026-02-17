import type { Blueprint, TopicPath } from '../core/types';

/**
 * Lightweight blueprint library to diversify question shapes.
 * Each blueprint specifies surface form + reasoning focus so the generator
 * doesn't collapse to one archetype.
 */
const READING_BLUEPRINTS: Blueprint[] = [
  {
    id: 'rw_lit_central_short_passage',
    description:
      'Short literary passage (90–120 words) with a clear central idea; ask for main idea/claim.',
    surface: 'single prose passage',
    reasoning: 'central idea identification',
    representation: 'text_only',
  },
  {
    id: 'rw_argument_science_inference',
    description:
      'Science/argumentative passage with implicit conclusion; ask for most supported inference.',
    surface: 'informational passage',
    reasoning: 'inference',
    representation: 'text_only',
  },
  {
    id: 'rw_command_evidence_chart',
    description:
      'Very short passage plus data chart; ask which chart value best supports or weakens claim.',
    surface: 'passage + data_display',
    reasoning: 'evidence_selection',
    representation: 'chart_or_table',
  },
  {
    id: 'rw_paired_perspectives',
    description:
      'Two 80–100 word passages with different stances; ask how authors relate (agree/disagree/qualify).',
    surface: 'paired_passages',
    reasoning: 'relationship_analysis',
    representation: 'text_only',
  },
  {
    id: 'rw_words_in_context',
    description:
      'Single sentence with underlined word; ask meaning in context with close distractors.',
    surface: 'sentence_focus',
    reasoning: 'vocabulary_in_context',
    representation: 'text_only',
  },
  {
    id: 'rw_rhetorical_synthesis_notes',
    description:
      'Bullet-point notes that must be combined into one sentence; ask for best synthesis.',
    surface: 'notes_to_sentence',
    reasoning: 'synthesis',
    representation: 'text_only',
  },
];

const MATH_BLUEPRINTS: Blueprint[] = [
  {
    id: 'math_linear_model_word',
    description:
      'Real-world linear relationship; ask to form or interpret equation/inequality.',
    surface: 'word_problem',
    reasoning: 'modeling',
    representation: 'text_only',
  },
  {
    id: 'math_quadratic_graph_shift',
    description:
      'Parabola transformation described; ask about vertex/intercepts or equation.',
    surface: 'graph_description',
    reasoning: 'function_transformation',
    representation: 'graph_or_sketch',
  },
  {
    id: 'math_systems_two_variables',
    description:
      'Two linear equations from context; ask solution or consistency.',
    surface: 'word_problem',
    reasoning: 'systems',
    representation: 'text_only',
  },
  {
    id: 'math_probability_table',
    description:
      'Two-way table or chart; ask probability/conditional probability.',
    surface: 'data_display',
    reasoning: 'probability',
    representation: 'table_or_chart',
  },
  {
    id: 'math_geometry_diagram',
    description:
      'Labeled triangle/circle with measures; ask for missing angle/length.',
    surface: 'diagram',
    reasoning: 'geometry',
    representation: 'diagram',
  },
  {
    id: 'math_statistics_fit',
    description:
      'Scatterplot/regression context; ask about correlation or best-fit line.',
    surface: 'data_display',
    reasoning: 'statistics',
    representation: 'graph_or_sketch',
  },
];

export function sampleBlueprint(topic: TopicPath): Blueprint {
  const pool = topic.section === 'READING' ? READING_BLUEPRINTS : MATH_BLUEPRINTS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function summarizeBlueprints(questions: { blueprintId?: string }[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const q of questions) {
    if (!q.blueprintId) continue;
    counts[q.blueprintId] = (counts[q.blueprintId] || 0) + 1;
  }
  return counts;
}
