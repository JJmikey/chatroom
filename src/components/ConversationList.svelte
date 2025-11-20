
<script lang="ts">
    import { onMount } from "svelte";
    import { selectConversation , selectedConversationId} from "../stores/selectedConversation.ts";
    import { ChatStorageSDK } from "../utils/chat-storage-sdk.js";
    const storage = new ChatStorageSDK("https://chat-storage.ktkt0099ktkt.workers.dev");
    import { showList } from "../stores/ui.js";
    import ConversationItem from "./ConversationItem.svelte";
    import { refreshTrigger } from "../stores/ui.js";


    interface Conversation {
      id: string;
      title: string;
      updated: number;
    }
  
    let conversations: Conversation[] = [];
  
    
  
    async function load() {
        try {
            const list = await storage.listConversations();
            
            conversations = list.sort((a: Conversation, b: Conversation) => {
                return b.updated - a.updated;
            });
              
        } catch (err) {
            console.error("Load conversations failed:", err);
            conversations = [];
        }
    }

    function choose(id: string) {
        console.log("Choosing conversation:", id);
        selectConversation(id);
        showList.set(false);
    }

    function createNew() {
      selectConversation(null);
      showList.set(false);
    }

    async function handleDelete(event: CustomEvent<string>) {
      const idToDelete = event.detail;

      if (!confirm("Are you sure you want to delete this chat?")) return;

      try {
        await storage.deleteConversation(idToDelete);

        conversations = conversations.filter(c => c.id !== idToDelete);

        if (selectedConversationId.get() === idToDelete) {
          selectConversation(null);
        }
        
      } catch (err) {
        alert("Failed to delete conversation");
        console.error(err);
      }
    }


    onMount(load);

    $: {
        const _ = $refreshTrigger;
        load();
    }

  </script>

  
  <div class="list">
    <div class="header">
      <button class="new-btn" on:click={createNew}>+</button>
    </div>

      {#each conversations as convo}
        <ConversationItem
        conversation={convo}
        on:click={() => choose(convo.id)}
        on:delete={handleDelete}
      />
      {/each}
    </div>

  <style>
    .list {
      padding: 10px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    .new-btn {
      background: #6d6d6d;
      color: white;
      border: none;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      font-size: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .new-btn:hover {
      background: #a6b4ab;
    }

  </style>
  