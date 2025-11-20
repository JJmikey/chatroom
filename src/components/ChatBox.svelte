
  <script lang="ts">
    import { marked } from "marked";
    import {
      selectedConversationId,
      selectConversation
    } from "../stores/selectedConversation";
    import { ChatStorageSDK } from "../utils/chat-storage-sdk.js";

    // ⭐ 建立 SDK instance
    const storage = new ChatStorageSDK(
      "https://chat-storage.ktkt0099ktkt.workers.dev"
    );

    import { showList } from "../stores/ui.js";

    function md(text: string) {
      return marked(text);
    }

    type MsgRole = "user" | "ai";

    interface ChatMessage {
      role: MsgRole;
      text: string;
      timestamp: number;
    }

    let input = "";
    let messages: ChatMessage[] = [];
    let isTyping = false;
    // --- ↓↓↓ 新增一個旗標 ↓↓↓ ---
    let isCreatingConversation = false;

    // ⭐ 從 DO 載入訊息（用 SDK）
    async function loadMessages(conversationId: string) {
      try {
        messages = await storage.getConversation(conversationId);
      } catch (err) {
        console.error("Load messages failed:", err);
        messages = [];
      }
    }

    // ⭐ reactive：當選中嘅 conversation 改變，就 reload
    $: {
      const cid = $selectedConversationId;
      // 只有喺 ID 存在，而且我哋唔係喺建立緊新對話嘅時候，先去載入
      if (cid && !isCreatingConversation) {
        loadMessages(cid);
      } 
       // 👇 新增這部分：如果 cid 變成 null (即係撳咗 New Chat)，要清空 messages
       else if (!cid) {
        messages = [];
      }
    }

    // 打字效果
    function typeWriterEffect(text: string, callback: (t: string) => void) {
      let index = 0;
      const speed = 20;

      const interval = setInterval(() => {
        callback(text.slice(0, index));
        index++;

        if (index > text.length) clearInterval(interval);
      }, speed);
    }

    // ⭐⭐ SEND：未有 conversation => 自動 create 一個
    async function send() {
      if (!input.trim()) return;

      let convoId: string | null = $selectedConversationId;
      const userText = input;
      input = "";

      // STEP 1：如果仲未有 conversation，就先 create 一個
      if (!convoId) {
        // --- ↓↓↓ 控制旗標 ↓↓↓ ---
        isCreatingConversation = true; // 話俾 reactive 區塊知：「咪郁！」
        // --- ↑↑↑ 控制旗標 ↑↑↑ ---


        const newConvo = await storage.createConversation();
        const newId: string = newConvo.id;   // 這個肯定是 string

        convoId = newId;

        // 先顯示用戶訊息，確保 UI 更新
        messages = [{ role: "user", text: userText, timestamp: Date.now() }];

        selectConversation(newId);          // ✅ 傳的是 string，TS 不會再投訴
         
      } else {
        // 如果係現有對話，直接顯示用戶訊息
        messages = [
          ...messages,
          { role: "user", text: userText, timestamp: Date.now() }
        ];
      }

      // 去到呢度，convoId 一定係 string
      const cid: string = convoId;

      // 同步寫入 DO
      await storage.addMessage(cid, "user", userText);

      // --- ↓↓↓ 喺所有嘢搞掂之後，重置旗標 ↓↓↓ ---
      // 用 setTimeout 確保 Svelte 有足夠時間處理完 store 嘅更新
      setTimeout(() => {
        isCreatingConversation = false;
      }, 0);
      // --- ↑↑↑ 重置旗標 ↑↑↑ ---

      // STEP 3：call Gemini worker
      isTyping = true;

      try {
        const res = await fetch(
          "https://gemini-rust-worker.ktkt0099ktkt.workers.dev/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userText })
          }
        );

        const data = await res.json();
        console.log("Gemini response:", data);

        // 🔍 多幾個 fallback，避免「No response text found」
        const reply: string | undefined =
          data.reply ?? data.text ?? data.message ?? data.choices?.[0]?.text;

        if (!reply) {
          isTyping = false;
          messages = [
            ...messages,
            {
              role: "ai",
              text: "⚠️ No response text found",
              timestamp: Date.now()
            }
          ];
          return;
        }

        isTyping = false;

        // STEP 4：typing 動畫顯示 AI 回覆
        messages = [
          ...messages,
          { role: "ai", text: "", timestamp: Date.now() }
        ];
        const aiIndex = messages.length - 1;

        typeWriterEffect(reply, (partial) => {
          messages[aiIndex].text = partial;
          messages = [...messages];
        });

        // STEP 5：將 AI 回覆存返去 DO
        await storage.addMessage(cid, "ai", reply);
      } catch (err) {
        console.error("Gemini error:", err);
        isTyping = false;
        messages = [
          ...messages,
          {
            role: "ai",
            text: "⚠️ Network error.",
            timestamp: Date.now()
          }
        ];
      }
    }
  </script>
  <!-- 👇 新增最外層 div -->
  <div class="chat-root">
    <div class="mobile-header">
      <button class="back-btn" on:click={() => showList.set(true)}>← Back</button>
    </div>

    <div class="chat-wrapper">
      <div class="messages">
        {#each messages as msg}
          <div class={`bubble ${msg.role}`}>
            {@html md(msg.text)}
          </div>
        {/each}
    
        {#if isTyping}
          <div class="bubble ai typing">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        {/if}
      </div>
    
      <div class="input-bar">
        <input class="text-input"
          bind:value={input}
          placeholder="Type a message..."
          on:keydown={(e) => e.key === "Enter" && send()}
        />
        <button class="send-btn" on:click={send}>Send</button>
      </div>
    </div>
  </div>

  
  <style>
     /* 👇 新增這個 class */
    .chat-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden; /* 防止撐爆 */
    }


    .mobile-header {
      display: none;
      /* 防止 header 被壓縮 */
      flex-shrink: 0; 
    }

    @media (max-width: 600px) {
      .mobile-header {
        display: flex;
        align-items: center;
        padding: 10px 15px;     /* 加點 padding */
        background: #fafafa;
        border-bottom: 1px solid #ddd;
        height: 50px;        
        min-height: 50px; /* 俾個高度佢 */
        flex-shrink: 0; 

        /* 👇 確保它在最上層 */
        position: relative;
        z-index: 10;
      }

      .back-btn {
        font-size: 18px;
        background: none;
        border: none;
        cursor: pointer;
        font-weight: 600;
        
      }
    }

    .chat-box {
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      height: 100%;
    }
  
  
    
    .chat-wrapper {
      display: flex;
      flex-direction: column;
      flex: 1;       /* <-- ✅ 改用這行，自動佔據剩餘空間 */
      min-height: 0; /* <-- ✅ 重要！防止 flex child 內容過多時無法 scroll */
    }
  
    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
  
    .bubble {
      max-width: 70%;
      padding: 10px 14px;
      border-radius: 18px;
      margin-bottom: 12px;
      font-size: 15px;
      line-height: 1.4;
    }
  
    .you {
      background: #d2f8d2;
      align-self: flex-end;
      border-bottom-right-radius: 4px;
    }
  
    .ai {
      background: #f1f1f1;
      align-self: flex-start;
      border-bottom-left-radius: 4px;
    }
  
    .input-bar {
      display: flex;
      gap: 8px;
      padding: 8px;
      border-top: 1px solid #ddd;
    }
  
    .text-input {
      flex: 1;
      border: 1px solid #ccc;
      border-radius: 20px;
      padding: 10px 14px;
      font-size: 15px;
      outline: none;
    }
  
    .send-btn {
      background: #25d366;
      color: white;
      border: none;
      padding: 0 18px;
      border-radius: 18px;
      font-weight: 600;
      cursor: pointer;
    }

    .typing {
        display: flex;
        gap: 4px;
        opacity: 0.7;
    }

    .dot {
        width: 6px;
        height: 6px;
        background: #555;
        border-radius: 50%;
        animation: blink 1.4s infinite both;
    }

    .dot:nth-child(2) {
        animation-delay: 0.2s;
        }
        .dot:nth-child(3) {
        animation-delay: 0.4s;
    }

    @keyframes blink {
        0% { opacity: .2; }
        20% { opacity: 1; }
        100% { opacity: .2; }
    }


  </style>
  