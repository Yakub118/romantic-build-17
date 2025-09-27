import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProposalToCleanup {
  id: string;
  slug: string;
  photos: any[];
  timeline_memories: any[];
  voice_note_url: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting cleanup of expired proposals...');

    // Find expired proposals
    const { data: expiredProposals, error: fetchError } = await supabase
      .from('proposals')
      .select('id, slug, photos, timeline_memories, voice_note_url, expires_at, view_count, view_limit, plan_type')
      .or(
        'expires_at.lt.now(),and(view_count.gte.view_limit,view_limit.not.is.null)'
      );

    if (fetchError) {
      console.error('Error fetching expired proposals:', fetchError);
      throw fetchError;
    }

    if (!expiredProposals || expiredProposals.length === 0) {
      console.log('No expired proposals found.');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired proposals found',
          cleaned: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${expiredProposals.length} expired proposals to clean up`);

    let cleanedCount = 0;
    let errors: any[] = [];

    // Process each expired proposal
    for (const proposal of expiredProposals as ProposalToCleanup[]) {
      try {
        console.log(`Cleaning up proposal: ${proposal.slug}`);

        // Collect all file paths to delete from storage
        const filesToDelete: string[] = [];

        // Add photos to deletion list
        if (proposal.photos && Array.isArray(proposal.photos)) {
          for (const photo of proposal.photos) {
            if (photo.url && typeof photo.url === 'string') {
              const path = extractStoragePath(photo.url);
              if (path) filesToDelete.push(path);
            }
          }
        }

        // Add timeline photos to deletion list
        if (proposal.timeline_memories && Array.isArray(proposal.timeline_memories)) {
          for (const memory of proposal.timeline_memories) {
            if (memory.photoUrl && typeof memory.photoUrl === 'string') {
              const path = extractStoragePath(memory.photoUrl);
              if (path) filesToDelete.push(path);
            }
          }
        }

        // Add voice note to deletion list
        if (proposal.voice_note_url) {
          const path = extractStoragePath(proposal.voice_note_url);
          if (path) filesToDelete.push(path);
        }

        // Delete files from storage
        if (filesToDelete.length > 0) {
          console.log(`Deleting ${filesToDelete.length} files from storage`);
          const { error: storageError } = await supabase.storage
            .from('response-photos')
            .remove(filesToDelete);

          if (storageError) {
            console.error(`Storage deletion error for ${proposal.slug}:`, storageError);
            // Continue with database deletion even if storage fails
          }
        }

        // Delete proposal from database
        const { error: deleteError } = await supabase
          .from('proposals')
          .delete()
          .eq('id', proposal.id);

        if (deleteError) {
          console.error(`Database deletion error for ${proposal.slug}:`, deleteError);
          errors.push({
            slug: proposal.slug,
            error: deleteError.message || 'Database deletion failed'
          });
        } else {
          cleanedCount++;
          console.log(`Successfully cleaned up proposal: ${proposal.slug}`);
        }

      } catch (error) {
        console.error(`Error processing proposal ${proposal.slug}:`, error);
        errors.push({
          slug: proposal.slug,
          error: (error as Error).message || 'Unknown error'
        });
      }
    }

    console.log(`Cleanup completed. Cleaned: ${cleanedCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned: cleanedCount,
        errors: errors.length > 0 ? errors : undefined,
        message: `Cleaned up ${cleanedCount} expired proposals`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Cleanup function error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: (error as Error).message || 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

/**
 * Extracts the storage path from a Supabase public URL
 */
function extractStoragePath(publicUrl: string): string | null {
  try {
    const url = new URL(publicUrl);
    const pathParts = url.pathname.split('/');
    
    // Find the bucket name and extract path after it
    const bucketIndex = pathParts.findIndex(part => part === 'response-photos');
    if (bucketIndex !== -1 && bucketIndex < pathParts.length - 1) {
      return pathParts.slice(bucketIndex + 1).join('/');
    }
    
    return null;
  } catch {
    return null;
  }
}