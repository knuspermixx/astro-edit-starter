<script lang="ts">
let { collection, items } = $props<{
      collection: string;
      items: Array<{ name?: string; title?: string; description: string }>;
    }>();
  
    let isEditMode = $state(typeof window !== 'undefined' && !!sessionStorage.getItem('github_pat'));
    let status = $state('');
  
    function addItem() {
      status = `Füge neuen ${collection}-Eintrag hinzu...`;
      // Placeholder for add logic
      console.log('Adding new item to', collection);
      status = 'Hinzufügen nicht implementiert (Platzhalter).';
    }
  
    function deleteItem(index: number) {
      status = `Lösche ${collection}-Eintrag ${index}...`;
      // Placeholder for delete logic
      console.log('Deleting item at index', index, 'from', collection);
      status = 'Löschen nicht implementiert (Platzhalter).';
    }
  </script>
  
  <div class="collection-editor">
    {#each items as item, index}
      <div class="item">
        <h3>{item.name || item.title || 'Unbenannt'}</h3>
        <p>{item.description}</p>
        {#if isEditMode}
          <button onclick={() => deleteItem(index)}>Löschen</button>
        {/if}
      </div>
    {/each}
    {#if isEditMode}
      <button onclick={addItem}>Neuen {collection} hinzufügen</button>
    {/if}
    {#if status}
      <p>{status}</p>
    {/if}
  </div>
  
  <style>
    .item {
      border: 1px solid #eee;
      padding: 1em;
      margin-bottom: 1em;
    }
  </style>