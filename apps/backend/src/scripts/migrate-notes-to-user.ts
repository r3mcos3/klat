/**
 * Migration Script: Assign Existing Notes to User
 *
 * This script assigns all existing notes and tags to a specific user ID.
 * Run this after creating your first user account.
 *
 * Usage:
 *   npm run ts-node src/scripts/migrate-notes-to-user.ts <user-id>
 *
 * Example:
 *   npm run ts-node src/scripts/migrate-notes-to-user.ts abc123-def456-ghi789
 */

import { supabase } from '../config/supabase';

async function migrateNotesToUser(userId: string) {
  console.log('🔄 Starting migration...');
  console.log(`📝 Assigning all notes and tags to user: ${userId}\n`);

  try {
    // 1. Update all notes
    console.log('1. Updating notes...');
    const { error: notesError, count: notesCount } = await supabase
      .from('notes')
      .update({ userId })
      .is('userId', null);

    if (notesError) {
      console.error('❌ Error updating notes:', notesError);
      throw notesError;
    }

    console.log(`✅ Updated ${notesCount || 0} notes\n`);

    // 2. Update all tags
    console.log('2. Updating tags...');
    const { error: tagsError, count: tagsCount } = await supabase
      .from('tags')
      .update({ userId })
      .is('userId', null);

    if (tagsError) {
      console.error('❌ Error updating tags:', tagsError);
      throw tagsError;
    }

    console.log(`✅ Updated ${tagsCount || 0} tags\n`);

    // 3. Verify migration
    console.log('3. Verifying migration...');

    const { count: orphanedNotes } = await supabase
      .from('notes')
      .select('*', { count: 'exact', head: true })
      .is('userId', null);

    const { count: orphanedTags } = await supabase
      .from('tags')
      .select('*', { count: 'exact', head: true })
      .is('userId', null);

    if (orphanedNotes === 0 && orphanedTags === 0) {
      console.log('✅ All notes and tags have been assigned to the user!\n');
      console.log('🎉 Migration completed successfully!');
    } else {
      console.warn(`⚠️  Warning: Found ${orphanedNotes} orphaned notes and ${orphanedTags} orphaned tags`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Get user ID from command line arguments
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: Please provide a user ID');
  console.log('\nUsage:');
  console.log('  npm run ts-node src/scripts/migrate-notes-to-user.ts <user-id>');
  console.log('\nTo get your user ID:');
  console.log('  1. Register an account at http://localhost:5173/login');
  console.log('  2. Check Supabase Dashboard → Authentication → Users');
  console.log('  3. Copy the UUID from the "UID" column\n');
  process.exit(1);
}

// Run migration
migrateNotesToUser(userId);
