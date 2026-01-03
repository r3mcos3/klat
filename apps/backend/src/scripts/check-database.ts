/**
 * Diagnostic Script: Check Database Contents
 * This script shows what's actually in the database
 */

import { supabase } from '../config/supabase';

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  try {
    // Check all notes (with and without userId)
    console.log('1. Checking ALL notes in database:');
    const { data: allNotes, error: notesError } = await supabase
      .from('notes')
      .select('id, date, userId, content')
      .order('date', { ascending: false })
      .limit(10);

    if (notesError) {
      console.error('❌ Error fetching notes:', notesError);
    } else {
      console.log(`   Found ${allNotes?.length || 0} notes (showing first 10):`);
      allNotes?.forEach((note, i) => {
        const preview = note.content.substring(0, 50);
        console.log(`   ${i + 1}. Date: ${note.date.split('T')[0]} | userId: ${note.userId || 'NULL'} | Content: ${preview}...`);
      });
    }

    console.log('\n2. Checking notes WITHOUT userId:');
    const { data: orphanedNotes, error: orphanError } = await supabase
      .from('notes')
      .select('id, date, content')
      .is('userId', null);

    if (orphanError) {
      console.error('❌ Error:', orphanError);
    } else {
      console.log(`   Found ${orphanedNotes?.length || 0} notes without userId`);
    }

    console.log('\n3. Checking ALL tags:');
    const { data: allTags, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, userId')
      .order('name');

    if (tagsError) {
      console.error('❌ Error fetching tags:', tagsError);
    } else {
      console.log(`   Found ${allTags?.length || 0} tags:`);
      allTags?.forEach((tag) => {
        console.log(`   - ${tag.name} | userId: ${tag.userId || 'NULL'}`);
      });
    }

    console.log('\n4. Checking tags WITHOUT userId:');
    const { data: orphanedTags, error: orphanTagsError } = await supabase
      .from('tags')
      .select('id, name')
      .is('userId', null);

    if (orphanTagsError) {
      console.error('❌ Error:', orphanTagsError);
    } else {
      console.log(`   Found ${orphanedTags?.length || 0} tags without userId`);
    }

  } catch (error) {
    console.error('\n❌ Check failed:', error);
  }
}

checkDatabase();
