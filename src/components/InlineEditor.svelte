<script lang="ts">
let { content, filePath, dataKey } = $props<{
      content: string;
      filePath: string;
      dataKey: string;
    }>();
  
    let isEditMode = $state(typeof window !== 'undefined' && !!sessionStorage.getItem('github_pat'));
    let editedContent = $state(content);
    let status = $state('');
  
    $effect(() => {
      // Update editedContent when prop changes
      editedContent = content;
    });
  
    async function saveChanges() {
      if (!isEditMode) return;
      const pat = typeof window !== 'undefined' ? sessionStorage.getItem('github_pat') : null;
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
  
        status = putResponse.ok ? 'Erfolgreich gespeichert!' : 'Fehler beim Speichern.';
      } catch (error) {
        if (error instanceof Error) {
          status = `Fehler: ${error.message}`;
        } else {
          status = 'Ein unbekannter Fehler ist aufgetreten.';
        }
      }
    }
  </script>
  
  <div
    contenteditable={isEditMode}
    onblur={saveChanges}
    oninput={(e) => (editedContent = e.currentTarget.textContent || '')}
    data-editable={filePath}
    data-key={dataKey}
  >
    {editedContent}
  </div>
  {#if status}
    <p>{status}</p>
  {/if}