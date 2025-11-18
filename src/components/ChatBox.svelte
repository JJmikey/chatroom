<script lang="ts">
    // 之後如果你想再玩嚴謹啲，可以改返型別
    let input = "";
    let messages: any[] = [];

  
    async function send() {
      if (!input.trim()) return;
  
      // 加用戶訊息
      messages = [...messages, { from: "you", text: input }];
  
      try {
        const res = await fetch("https://gemini-rust-worker.ktkt0099ktkt.workers.dev/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ prompt: input })
        });
  
        if (!res.ok) {
          console.error("API error:", res.status);
          messages = [...messages, { from: "ai", text: `⚠️ API error: ${res.status}` }];
          input = "";
          return;
        }
  
        const data = await res.json();
  
        messages = [...messages, { from: "ai", text: data.reply }];
      } catch (err) {
        console.error("Fetch error:", err);
        messages = [...messages, { from: "ai", text: "⚠️ Network error." }];
      }
  
      input = "";
    }
  </script>
  
  <div class="chat-container">
    <div class="messages">
        <!-- @ts-ignore -->

        {#each messages as msg}
        <div class={`bubble ${(msg as any).from}`}>
          {(msg as any).text}
        </div>
      {/each}
      
    </div>
  
    <div class="input-bar">
      <input
        class="text-input"
        type="text"
        bind:value={input}
        placeholder="Type a message..."
        on:keydown={(e) => e.key === "Enter" && send()}
      />
      <button class="send-btn" on:click={send}>Send</button>
    </div>
  </div>
  
  <style>
    .chat-container {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        width: 100%;
        max-width: 420px;
        margin: 0 auto;   /* 重要！置中（只在 desktop） */
        background: #ffffff;
        border-radius: 0;
        box-shadow: none;
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
  </style>
  