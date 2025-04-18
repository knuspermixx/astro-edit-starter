<script lang="ts">
  import InlineEditor from "./InlineEditor.svelte";

  interface ServiceItem {
    name: string;
    description: string;
  }

  interface BlogItem {
    id: string;
    data: {
      title: string;
      description: string;
    };
  }

  let { collection, items } = $props<{
    collection: string;
    items: ServiceItem[] | BlogItem[];
  }>();
  let isEditMode = $state(
    typeof window !== "undefined" && !!sessionStorage.getItem("github_pat")
  );
  let status = $state("");
  let history = $state<(ServiceItem[] | BlogItem[])[]>([items]);
  let historyIndex = $state(0);

  async function addItem() {
    if (collection === "services") {
      const newItem: ServiceItem = { name: "Neue Dienstleistung", description: "" };
      items = [...items, newItem];
      await saveCollection();
      history = [...history.slice(0, historyIndex + 1), items];
      historyIndex += 1;
      window.location.reload();
    } else if (collection === "blog") {
      const newSlug = `new-post-${Date.now()}`;
      const filePath = `src/content/blog/${newSlug}.mdx`;
      const defaultContent = `
      ---
      title: 'Neuer Beitrag'
      description: 'Beschreibung'
      pubDate: '${new Date().toISOString().split("T")[0]}'
      heroImage: '/blog-placeholder.jpg'
      ---

      Neuer Inhalt.
      `;
      const pat = sessionStorage.getItem("github_pat");
      if (!pat) {
        status = "Kein PAT vorhanden.";
        return;
      }
      try {
        const response = await fetch(
          `https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`,
          {
            method: "PUT",
            headers: {
              Authorization: `token ${pat}`,
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Create ${filePath} via website`,
              content: btoa(unescape(encodeURIComponent(defaultContent))),
            }),
          }
        );
        if (response.ok) {
          status = "Neuer Beitrag erstellt!";
          window.location.href = `/astro-edit-starter/blog/${newSlug}`;
        } else {
          status = "Fehler beim Erstellen.";
        }
      } catch (error) {
        status = `Fehler: ${(error as Error).message}`;
      }
    }
  }

  async function deleteItem(index: number) {
    if (collection === "services") {
      items = (items as ServiceItem[]).filter((_: ServiceItem, i: number) => i !== index);
      await saveCollection();
      history = [...history.slice(0, historyIndex + 1), items];
      historyIndex += 1;
      window.location.reload();
    } else if (collection === "blog") {
      const item = (items as BlogItem[])[index];
      const slug = item.id;
      const filePath = `src/content/blog/${slug}.mdx`;
      const pat = sessionStorage.getItem("github_pat");
      if (!pat) {
        status = "Kein PAT vorhanden.";
        return;
      }
      try {
        const response = await fetch(
          `https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`,
          {
            method: "GET",
            headers: {
              Authorization: `token ${pat}`,
              Accept: "application/vnd.github.v3+json",
            },
          }
        );
        const data = await response.json();
        if (!response.ok) throw new Error("Failed to fetch file SHA");

        const deleteResponse = await fetch(
          `https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `token ${pat}`,
              Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
              message: `Delete ${filePath} via website`,
              sha: data.sha,
            }),
          }
        );
        if (deleteResponse.ok) {
          status = "Beitrag gelöscht!";
          window.location.reload();
        } else {
          status = "Fehler beim Löschen.";
        }
      } catch (error) {
        status = `Fehler: ${(error as Error).message}`;
      }
    }
  }

  async function saveCollection() {
    if (collection !== "services") return;
    const pat = sessionStorage.getItem("github_pat");
    if (!pat) {
      status = "Kein PAT vorhanden.";
      return;
    }
    const filePath = `src/content/services.json`;
    try {
      const response = await fetch(
        `https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`,
        {
          method: "GET",
          headers: {
            Authorization: `token ${pat}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error("Failed to fetch file SHA");

      const updatedContent = JSON.stringify(items, null, 2);
      const putResponse = await fetch(
        `https://api.github.com/repos/knuspermixx/astro-edit-starter/contents/${filePath}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${pat}`,
            Accept: "application/vnd.github.v3+json",
          },
          body: JSON.stringify({
            message: `Update services via website`,
            content: btoa(unescape(encodeURIComponent(updatedContent))),
            sha: data.sha,
          }),
        }
      );

      if (!putResponse.ok) throw new Error("Failed to save collection");
    } catch (error) {
      status = `Fehler: ${(error as Error).message}`;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex -= 1;
      items = [...history[historyIndex]];
    }
  }

  function redo() {
    if (historyIndex < history.length - 1) {
      historyIndex += 1;
      items = [...history[historyIndex]];
    }
  }
</script>

<div class="collection-editor">
  {#each items as item, index}
    <div class="item">
      {#if collection === "services"}
        <h3>
          <InlineEditor
            content={(item as ServiceItem).name}
            filePath="src/content/services.json"
            dataKey={`${index}.name`}
          />
        </h3>
        <p>
          <InlineEditor
            content={(item as ServiceItem).description}
            filePath="src/content/services.json"
            dataKey={`${index}.description`}
          />
        </p>
      {:else if collection === "blog"}
        <h3>
          <a href={`/astro-edit-starter/blog/${(item as BlogItem).id}`}>{(item as BlogItem).data.title}</a>
        </h3>
        <p>{(item as BlogItem).data.description}</p>
      {/if}
      {#if isEditMode}
        <button onclick={() => deleteItem(index)}>Löschen</button>
      {/if}
    </div>
  {/each}
  {#if isEditMode}
    <button onclick={addItem}>Neuen {collection} hinzufügen</button>
    <button onclick={undo} disabled={historyIndex === 0}>Undo</button>
    <button onclick={redo} disabled={historyIndex === history.length - 1}
      >Redo</button
    >
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