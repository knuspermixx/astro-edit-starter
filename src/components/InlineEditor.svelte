<script lang="ts">
  import { onMount } from 'svelte';

  let { content, filePath, dataKey } = $props<{
    content: string;
    filePath: string;
    dataKey: string;
  }>();

  let isEditMode = $state(false);
  let editedContent = $state(content);
  let status = $state('');
  let history = $state<string[]>([content]);
  let historyIndex = $state(0);

  $effect(() => {
    if (content !== editedContent) {
      editedContent = content;
      history = [content];
      historyIndex = 0;
    }
  });

  onMount(() => {
    isEditMode = !!sessionStorage.getItem('github_pat');
  });

  async function saveChanges() {
    if (!isEditMode) return;
    const pat = sessionStorage.getItem('github_pat');
    if (!pat) {
      status = 'Kein PAT vorhanden.';
      return;
    }

    status = 'Speichere...';
    try {
      const response = await fetch(`https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`, {
        method: 'GET',
        headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
      });
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to fetch file SHA');

      const existingContent = JSON.parse(atob(data.content));
      const keys = dataKey.split('.');
      let current = existingContent;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = editedContent;

      const updatedContent = JSON.stringify(existingContent, null, 2);

      const putResponse = await fetch(`https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`, {
        method: 'PUT',
        headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' },
        body: JSON.stringify({
          message: `Update ${filePath} via website`,
          content: btoa(unescape(encodeURIComponent(updatedContent))),
          sha: data.sha,
        }),
      });

      if (putResponse.ok) {
        status = 'Erfolgreich gespeichert!';
        if (history[historyIndex] !== editedContent) {
          history = [...history.slice(0, historyIndex + 1), editedContent];
          historyIndex += 1;
        }
        window.location.reload();
      } else {
        status = 'Fehler beim Speichern.';
      }
    } catch (error) {
      status = `Fehler: ${(error as Error).message}`;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex -= 1;
      editedContent = history[historyIndex];
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex += 1;
      editedContent = history[historyIndex];
    }
  }
</script>

<div
  contenteditable={isEditMode}
  onblur={saveChanges}
  oninput={(e) => (editedContent = e.currentTarget.textContent || '')}
  data-editable={filePath}
  data-key={dataKey}
>{editedContent}</div>
{#if isEditMode}
  <button onclick={undo} disabled={historyIndex === 0}>Undo</button>
  <button onclick={redo} disabled={historyIndex === history.length - 1}>Redo</button>
{/if}
{#if status}
  <p>{status}</p>
{/if}