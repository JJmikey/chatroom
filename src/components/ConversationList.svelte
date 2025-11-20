
<script lang="ts">
    import { onMount } from "svelte";
    // 1. 引入我哋建立嘅 action
    import { selectConversation , selectedConversationId} from "../stores/selectedConversation.ts";
    import { ChatStorageSDK } from "../utils/chat-storage-sdk.js";
  
     // 建立 SDK instance
    const storage = new ChatStorageSDK("https://chat-storage.ktkt0099ktkt.workers.dev");

   // 👇 確保引入 showList 用嚟切換手機視圖
    import { showList } from "../stores/ui.js";

    // 👇 引入新造的組件
    import ConversationItem from "./ConversationItem.svelte";

    interface Conversation {
      id: string;
      title: string;
      updated: number;
    }
  
    let conversations: Conversation[] = [];
  
    
  
    async function load() {
        try {
            conversations = await storage.listConversations();
        } catch (err) {
            console.error("Load conversations failed:", err);
            conversations = [];
        }
    }

    function choose(id: string) {
        console.log("Choosing conversation:", id);
        selectConversation(id);
        showList.set(false);  // mobile → enter chat mode
    }

    // 👇 新增：建立新對話的函數
    function createNew() {
      // 1. 設定 ID 為 null，代表這是一個「未保存」的新對話
      selectConversation(null);
      // 2. 如果係手機版，要強制跳去 ChatBox 畫面
      showList.set(false);
    }


     // 👇 新增：處理刪除邏輯
    async function handleDelete(event: CustomEvent<string>) {
      const idToDelete = event.detail;
      
      // 1. 簡單的確認 (Optional)
      if (!confirm("Are you sure you want to delete this chat?")) return;

      try {
        // 2. 呼叫 SDK 刪除 API
        await storage.deleteConversation(idToDelete);

        // 3. 前端即時更新 UI (移除該項目)
        conversations = conversations.filter(c => c.id !== idToDelete);

        // 4. 如果剛好正在看這個被刪除的對話，要清空右邊
        if ($selectedConversationId === idToDelete) {
          selectConversation(null);
        }
        
      } catch (err) {
        alert("Failed to delete conversation");
        console.error(err);
      }
    }

  
    onMount(load);
  </script>

  
  <div class="list">
     <!-- 👇 改用 header div 包住標題同按鈕 -->
    <div class="header">
      <h3>Conversations</h3>
      <button class="new-btn" on:click={createNew}>+</button>
    </div>

      {#each conversations as convo}
       <!-- 👇 改用新組件，並監聽自定義事件 -->
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
     /* 👇 新增 Header 樣式 */
    .header {
      display: flex;
      justify-content: space-between; /* 左右撐開 */
      align-items: center;
      margin-bottom: 15px;
    }
    h3 {
      margin: 0; /* 去除預設 margin */
    }
     /* 👇 新增按鈕樣式 */
    .new-btn {
      background: #25d366;
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
      background: #1ebc57;
    }
    .item {
      padding: 10px;
      border-radius: 6px;
      margin-bottom: 10px;
      background: white;
      border: 1px solid #ddd;
      cursor: pointer;
    }
    .item:hover {
      background: #eaf6ff;
    }
    .title {
      font-weight: 600;
    }
    .time {
      font-size: 12px;
      color: #888;
    }
  </style>
  