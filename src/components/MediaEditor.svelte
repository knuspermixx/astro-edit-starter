<script lang="ts">
  import { onMount } from 'svelte';

  let { src, filePath } = $props<{
    src: string;
    filePath: string;
  }>();

  let isEditMode = $state(false);
  let showUpload = $state(false);
  let status = $state('');

  interface PutBody {
    message: string;
    content: string;
    sha?: string;
  }

  async function handleUpload(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    status = 'Lade hoch...';
    const pat = sessionStorage.getItem('github_pat');
    if (!pat) {
      status = 'Kein PAT vorhanden.';
      return;
    }

    let sha: string | undefined;
    try {
      const response = await fetch(`https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`, {
        method: 'GET',
        headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
      });
      if (response.ok) {
        const data = await response.json();
        sha = data.sha as string;
      }
    } catch {
      // File doesn't exist, proceed without SHA
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (!reader.result) {
        status = 'Fehler: Datei konnte nicht gelesen werden.';
        return;
      }
      const content = (reader.result as string).split(',')[1];
      try {
        const putBody: PutBody = {
          message: `Upload ${filePath} via website`,
          content: content,
        };
        if (sha) putBody.sha = sha;
        const putResponse = await fetch(`https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`, {
          method: 'PUT',
          headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
          body: JSON.stringify(putBody),
        });
        if (putResponse.ok) {
          status = 'Erfolgreich hochgeladen!';
          window.location.reload();
        } else {
          status = 'Fehler beim Hochladen.';
        }
      } catch (error) {
        status = `Fehler: ${(error as Error).message}`;
      }
    };
    reader.readAsDataURL(file);
  }

  onMount(() => {
    isEditMode = typeof window !== 'undefined' && !!sessionStorage.getItem('github_pat');
  });
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