/**
 * migrate-legacy-courses.mjs
 *
 * Migrates all legacy topic-based courses (Schema A) to the block-based
 * Chapter document architecture (Schema B).
 *
 * What it does:
 *   - Reads each seeded course's courseOutput.chapters[n].topics[]
 *   - Converts each topic's HTML content to clean Markdown
 *   - Produces typed blocks (text, concept-card, mermaid, pro-tip, youtube)
 *   - Creates / upserts Chapter documents in the chapters collection
 *   - Updates Course.chapters[] with ObjectId refs
 *   - Replaces courseOutput.chapters[n].topics with .blocks (same chapterName)
 *   - Sets Course.status = "published"
 *
 * Run from server/:
 *   node --env-file=.env scripts/migrate-legacy-courses.mjs
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

// ── Minimal Mongoose models (standalone — no circular imports) ────────────

const blockSchema = new mongoose.Schema(
  {
    id:          String,
    type:        String,
    content:     String,
    language:    String,
    code:        String,
    url:         String,
    videoTitle:  String,
    instruction: String,
    starterCode: String,
    testCases:   mongoose.Schema.Types.Mixed,
    title:       String,
    subtitle:    String,
  },
  { _id: false }
);

const chapterDocSchema = new mongoose.Schema(
  {
    courseId:      { type: String, required: true },
    chapterNumber: { type: Number, required: true },
    title:         { type: String, required: true },
    blocks:        { type: [blockSchema], default: [] },
  },
  { timestamps: true }
);

const courseSchema = new mongoose.Schema(
  {
    courseId:     String,
    name:         String,
    language:     String,
    status:       String,
    isPublished:  Boolean,
    chapters:     [{ type: mongoose.Schema.Types.ObjectId }],
    courseOutput: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true, strict: false }
);

const ChapterDoc = mongoose.models.Chapter || mongoose.model('Chapter', chapterDocSchema);
const Course     = mongoose.models.Course  || mongoose.model('Course',  courseSchema);

// ── HTML → Markdown ───────────────────────────────────────────────────────

function htmlToMarkdown(html) {
  if (!html || typeof html !== 'string') return '';
  let md = html;

  // Fenced code blocks BEFORE inline code processing
  md = md.replace(
    /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/gi,
    (_, inner) => `\n\`\`\`\n${inner.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/\n\s*$/,'')}\n\`\`\`\n`
  );

  // Headings
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, '\n#### $1\n');
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, '\n### $1\n');
  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, '\n## $1\n');
  md = md.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, '\n# $1\n');

  // Inline formatting
  md = md.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi,           '**$1**');
  md = md.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi,         '*$1*');
  md = md.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi,           '*$1*');
  md = md.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi,     '`$1`');

  // List items before list container tags
  md = md.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, inner) => `- ${inner.trim()}\n`);
  md = md.replace(/<\/?[ou]l[^>]*>/gi, '\n');

  // Paragraphs
  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, inner) => `${inner.trim()}\n\n`);
  md = md.replace(/<br\s*\/?>/gi, '\n');

  // Strip remaining tags
  md = md.replace(/<[^>]+>/g, '');

  // HTML entities
  md = md
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&amp;/g,  '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#39;/g,  "'")
    .replace(/&quot;/g, '"');

  // Normalise whitespace
  return md.replace(/\n{3,}/g, '\n\n').trim();
}

// ── Fix broken mermaid arrow syntax from older seeder ────────────────────
// Some seeded problems use -->|label|> which is invalid — strip the trailing >

function fixMermaid(diagram) {
  if (!diagram || typeof diagram !== 'string') return '';
  return diagram.replace(/(\|[^|]*)\|>/g, '$1|').trim();
}

// ── Core conversion: topics[] → blocks[] ─────────────────────────────────

function topicsToBlocks(topics) {
  const blocks = [];
  if (!Array.isArray(topics)) return blocks;

  for (const topic of topics) {
    // Plain string = content was never generated for this topic
    if (typeof topic === 'string') {
      blocks.push({
        id:      nanoid(8),
        type:    'text',
        content: `## ${topic}\n\nContent for this topic is pending generation.`,
      });
      continue;
    }

    const { topic: title, content, proTip, keyConcepts, diagram, videoId } = topic;
    if (!title) continue;

    // 1. Text block — heading + HTML-converted-to-Markdown body
    const body = htmlToMarkdown(content || '');
    blocks.push({
      id:      nanoid(8),
      type:    'text',
      content: body ? `## ${title}\n\n${body}` : `## ${title}`,
    });

    // 2. Concept cards — up to 4
    if (Array.isArray(keyConcepts)) {
      for (const c of keyConcepts.slice(0, 4)) {
        if (c?.title) {
          blocks.push({
            id:       nanoid(8),
            type:     'concept-card',
            title:    c.title,
            subtitle: c.description || '',
          });
        }
      }
    }

    // 3. Mermaid diagram (skip if empty)
    const mermaid = fixMermaid(diagram);
    if (mermaid) {
      blocks.push({ id: nanoid(8), type: 'mermaid', content: mermaid });
    }

    // 4. Pro tip (skip if empty)
    if (proTip?.trim()) {
      blocks.push({ id: nanoid(8), type: 'pro-tip', content: proTip.trim() });
    }

    // 5. YouTube (skip if null/empty)
    if (videoId?.trim()) {
      blocks.push({
        id:         nanoid(8),
        type:       'youtube',
        url:        `https://www.youtube.com/watch?v=${videoId.trim()}`,
        videoTitle: title,
      });
    }
  }

  return blocks;
}

// ── Migration entry point ─────────────────────────────────────────────────

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Target: courses that still have legacy topics array in their courseOutput
  const courses = await Course.find({
    'courseOutput.chapters.0.topics': { $exists: true },
  });

  if (courses.length === 0) {
    console.log('No courses need migration. Already up to date.');
    await mongoose.disconnect();
    return;
  }

  console.log(`Migrating ${courses.length} course(s)...\n`);

  let totalChapters = 0;
  let totalBlocks   = 0;

  for (const course of courses) {
    console.log(`Course: ${course.name} (${course.courseId})`);

    const outputChapters  = course.courseOutput?.chapters || [];
    const chapterIds      = [];
    const newOutputChapters = [];

    for (let i = 0; i < outputChapters.length; i++) {
      const ch     = outputChapters[i];
      const topics = ch.topics || [];
      const blocks = topicsToBlocks(topics);

      // Upsert Chapter document in chapters collection
      const chapterDoc = await ChapterDoc.findOneAndUpdate(
        { courseId: course.courseId, chapterNumber: i + 1 },
        {
          courseId:      course.courseId,
          chapterNumber: i + 1,
          title:         ch.chapterName,
          blocks,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      chapterIds.push(chapterDoc._id);

      // Replace topics with blocks in courseOutput (keeps chapterName + duration)
      newOutputChapters.push({
        chapterName: ch.chapterName,
        duration:    ch.duration || '',
        blocks,
      });

      console.log(`  [${i + 1}/${outputChapters.length}] "${ch.chapterName}" — ${topics.length} topics → ${blocks.length} blocks`);
      totalChapters++;
      totalBlocks += blocks.length;
    }

    // Persist Course changes
    course.chapters     = chapterIds;
    course.status       = 'published';
    course.courseOutput = { ...course.courseOutput, chapters: newOutputChapters };
    course.markModified('courseOutput');
    course.markModified('chapters');
    await course.save();

    console.log(`  Done\n`);
  }

  // ── Phase 1 DB fixes (executionMode + seeded course status) ─────────────
  console.log('Applying Phase 1 DB fixes...');

  await mongoose.connection.db.collection('curriculums').updateOne(
    { language: 'html' },   { $set: { executionMode: 'livepreview' } }
  );
  await mongoose.connection.db.collection('curriculums').updateOne(
    { language: 'css' },    { $set: { executionMode: 'livepreview' } }
  );
  await mongoose.connection.db.collection('curriculums').updateOne(
    { language: 'react' },  { $set: { executionMode: 'react' } }
  );
  await mongoose.connection.db.collection('curriculums').updateOne(
    { language: 'dsa' },    { $set: { executionMode: 'dsa' } }
  );
  await mongoose.connection.db.collection('curriculums').updateOne(
    { language: 'python' }, { $set: { executionMode: 'piston', pistonLanguage: 'python3' } }
  );

  // Fix status on any remaining courses that still have no status field
  const statusFix = await mongoose.connection.db.collection('courses').updateMany(
    { status: { $exists: false } },
    { $set: { status: 'published' } }
  );
  console.log(`  executionMode fixed on 5 curricula`);
  console.log(`  status fixed on ${statusFix.modifiedCount} course(s)`);

  // ── Drop orphan collections ───────────────────────────────────────────────
  const collections = await mongoose.connection.db.listCollections({ name: 'courseplaygrounds' }).toArray();
  if (collections.length > 0) {
    await mongoose.connection.db.collection('courseplaygrounds').drop();
    console.log(`  Dropped orphan collection: courseplaygrounds`);
  }

  console.log('\nMigration summary');
  console.log(`  Courses migrated:  ${courses.length}`);
  console.log(`  Chapters created:  ${totalChapters}`);
  console.log(`  Blocks created:    ${totalBlocks}`);

  await mongoose.disconnect();
  console.log('\nDone.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
