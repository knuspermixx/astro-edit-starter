<script lang="ts">
    import { onMount } from 'svelte';
    let { src, filePath } = $props<{
      src: string;
      filePath: string;
    }>();
  
    let isEditMode = $state(false);
    let showUpload = $state(false);
    let status = $state('');
  
    // Only access sessionStorage in the browser
    onMount(() => {
      if (typeof window !== 'undefined') {
        isEditMode = !!sessionStorage.getItem('github_pat');
      }
    });
  
    async function handleUpload(event: Event) {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
  
      status = 'Lade hoch...';
      // Placeholder for GitHub upload logic
      console.log('Uploading file:', file, 'to', filePath);
      status = 'Upload nicht implementiert (Platzhalter).';
    }
  </script>
  
  <div
    role="button"
    tabindex="0"
    class="media-wrapper"
    onmouseenter={() => isEditMode && (showUpload = true)}
    onmouseleave={() => (showUpload = false)}
  >
    <img {src} alt="Media" />
    {#if showUpload}
      <input type="file" accept="image/*" onchange={handleUpload} class="upload-btn" />
    {/if}
  </div>
  {#if status}
    <p>{status}</p>
  {/if}
  
  <style>
    .media-wrapper {
      position: relative;
      display: inline-block;
    }
    .upload-btn {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0.8;
    }
  </style>