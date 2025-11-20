
  <script lang="ts">
    import { tick } from "svelte"; 
    import { marked } from "marked";
    import {
      selectedConversationId,
      selectConversation
    } from "../stores/selectedConversation";
    import { ChatStorageSDK } from "../utils/chat-storage-sdk.js";
    const storage = new ChatStorageSDK(
      "https://chat-storage.ktkt0099ktkt.workers.dev"
    );
    let messagesDiv: HTMLDivElement;
    async function scrollToBottom() {
      await tick();

      if (messagesDiv) {
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
      }
    }



    import { showList } from "../stores/ui.js";

    function md(text: string) {
      return marked(text);
    }

    import { refreshTrigger } from "../stores/ui.js";


    type MsgRole = "user" | "ai";

    interface ChatMessage {
      role: MsgRole;
      text: string;
      timestamp: number;
    }

    let input = "";
    let messages: ChatMessage[] = [];
    let isTyping = false;
    let isCreatingConversation = false;

    async function loadMessages(conversationId: string) {
      try {
        messages = await storage.getConversation(conversationId);
        scrollToBottom();
      } catch (err) {
        console.error("Load messages failed:", err);
        messages = [];
      }
    }

    $: {
      const cid = $selectedConversationId;
      if (cid && !isCreatingConversation) {
        loadMessages(cid);
      } else if (!cid) {
        messages = [];
      }
    }

    function typeWriterEffect(text: string, callback: (t: string) => void) {
      let index = 0;
      const speed = 20;

      const interval = setInterval(() => {
        callback(text.slice(0, index));
        index++;

        scrollToBottom();

        if (index > text.length) clearInterval(interval);
      }, speed);
    }

    async function send() {
      if (!input.trim()) return;

      let convoId: string | null = $selectedConversationId;
      const userText = input;
      input = "";

      if (!convoId) {
        isCreatingConversation = true;

        const newConvo = await storage.createConversation();
        const newId: string = newConvo.id;

        convoId = newId;

        messages = [{ role: "user", text: userText, timestamp: Date.now() }];

        selectConversation(newId);

      } else {
        messages = [
          ...messages,
          { role: "user", text: userText, timestamp: Date.now() }
        ];
      }

      scrollToBottom();

      const cid: string = convoId;

      await storage.addMessage(cid, "user", userText);

      refreshTrigger.set(Date.now());

      setTimeout(() => {
        isCreatingConversation = false;
      }, 0);

      isTyping = true;

      const historyPayload = messages.map((msg) => ({
        role: msg.role === "ai" ? "model" : "user",
        parts: [{ text: msg.text }]
      }));


      try {
        const res = await fetch(
          "https://gemini-rust-worker.ktkt0099ktkt.workers.dev/chat",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: historyPayload
            })
          }
        );

        const data = await res.json();
        console.log("Gemini response:", data);

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

        messages = [
          ...messages,
          { role: "ai", text: "", timestamp: Date.now() }
        ];
        const aiIndex = messages.length - 1;

        typeWriterEffect(reply, (partial) => {
          messages[aiIndex].text = partial;
          messages = [...messages];
        });

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
  <div class="chat-root">
    <div class="mobile-header">
      <button class="back-btn" on:click={() => showList.set(true)}>&lt;</button>
    </div>

    <div class="chat-wrapper">
      <div class="messages" bind:this={messagesDiv}>
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
    .chat-root {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      overflow: hidden;
    }

    .mobile-header {
      display: none;
      flex-shrink: 0;
    }

    @media (max-width: 600px) {
      .mobile-header {
        display: flex;
        align-items: center;
        padding: 10px 15px;
        background: #fafafa;
        border-bottom: 1px solid #ddd;
        height: 50px;
        min-height: 50px;
        flex-shrink: 0;
        position: relative;
        z-index: 10;
      }

      .back-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: black;
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        font-family: monospace;
        cursor: pointer;
        padding-bottom: 2px;
      }
    }

    .back-btn:active {
      opacity: 0.7;
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
      flex: 1;
      min-height: 0;
    }

    .messages {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior: contain;
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
      font-size: 16px;
      outline: none;
    }

    .send-btn {
      background: #6d6d6d;
      color: white;
      border: none;
      padding: 0 18px;
      border-radius: 18px;
      font-weight: 600;
      cursor: pointer;
    }

    .send-btn:hover {
      background: #b1afaf;
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
  