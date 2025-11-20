<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    // 接收外部傳入的資料
    export let conversation: { id: string; title: string; updated: number };
  
    const dispatch = createEventDispatcher();
  
    // 狀態變數
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let itemElement: HTMLElement;
  
    // 設定按鈕寬度 (例如 80px)
    const ACTION_WIDTH = 80;
  
    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      isSwiping = false;
      // 暫時移除過渡效果，讓手指拖動時即時反應
      if (itemElement) itemElement.style.transition = "none";
    }
  
    function handleTouchMove(e: TouchEvent) {
      const touchX = e.touches[0].clientX;
      const diff = touchX - startX;
  
      // 只允許向左滑 (diff < 0)，且最多滑出按鈕寬度
      if (diff < 0 && diff > -ACTION_WIDTH * 1.5) {
        currentX = diff;
        isSwiping = true; 
      }
    }
  
    function handleTouchEnd() {
      // 恢復過渡效果，讓它彈回去或彈開
      if (itemElement) itemElement.style.transition = "transform 0.2s ease-out";
  
      // 如果滑動距離超過按鈕的一半，就固定打開
      if (currentX < -ACTION_WIDTH / 2) {
        currentX = -ACTION_WIDTH;
      } else {
        // 否則彈回去關閉
        currentX = 0;
      }
    }
  
    // 點擊刪除按鈕
    function onDelete() {
      dispatch("delete", conversation.id);
      // 關閉滑動
      currentX = 0;
    }
  
    // 點擊內容本身 (進入聊天室)
    function onContentClick() {
      // 如果目前是打開狀態，點擊則只會關閉滑動
      if (currentX !== 0) {
        currentX = 0;
        return;
      }
      dispatch("click", conversation.id);
    }
  </script>
  
  <div class="swipe-container">
    <!-- 底層：紅色刪除按鈕 -->
    <div class="actions">
      <button class="delete-btn" on:click|stopPropagation={onDelete}>
        Delete
      </button>
    </div>
  
    <!-- 上層：白色內容 (可滑動) -->
    <div
      class="content"
      bind:this={itemElement}
      style="transform: translateX({currentX}px);"
      on:touchstart={handleTouchStart}
      on:touchmove={handleTouchMove}
      on:touchend={handleTouchEnd}
      on:click={onContentClick}
    >
      <div class="title">{conversation.title || "(no title)"}</div>
      <div class="time">{new Date(conversation.updated).toLocaleString()}</div>
    </div>
  </div>
  
  <style>
    .swipe-container {
      position: relative;
      margin-bottom: 10px;
      height: 65px; /* 固定高度確保佈局穩定 */
      overflow: hidden;
      border-radius: 6px;
      background-color: #4d4b4b; /* 底色紅色 */
      cursor: pointer;
    }
  
    /* 底層按鈕區 */
    .actions {
      position: absolute;
      top: 0;
      right: 0;
      width: 80px; /* 對應 ACTION_WIDTH */
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  
    .delete-btn {
      background: none;
      border: none;
      color: white;
      font-weight: bold;
      font-size: 14px;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
  
    /* 上層內容區 */
    .content {
      position: relative;
      background: white;
      width: 100%;
      height: 100%;
      padding: 10px;
      box-sizing: border-box;
      border: 1px solid #ddd;
      border-radius: 6px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      /* 這是關鍵：確保滑動層蓋住底層 */
      z-index: 2; 
      /* 👇 加入這行讓顏色變化有過渡動畫，感覺順滑啲 */
      transition: background 0.2s, transform 0.2s ease-out; 
      
      /* 👇 確保滑鼠指上去會變手指 */
      cursor: pointer; 
    }

    /* 👇👇👇 新增這裡：Hover 效果 👇👇👇 */
    .content:hover {
      background: #e4e2e2; /* 這是你原本的淺藍色，或者用你剛才的 #5c96c2 */
    }
    
  
    .title {
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .time {
      font-size: 12px;
      color: #888;
      margin-top: 4px;
    }
  </style>