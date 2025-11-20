<script lang="ts">
    import { createEventDispatcher } from "svelte";
    
    export let conversation: { id: string; title: string; updated: number };
  
    const dispatch = createEventDispatcher();
  
    let startX = 0;
    let currentX = 0;
    let isSwiping = false;
    let itemElement: HTMLElement;

    const ACTION_WIDTH = 80;

    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      isSwiping = false;
      if (itemElement) itemElement.style.transition = "none";
    }
  
    function handleTouchMove(e: TouchEvent) {
      const touchX = e.touches[0].clientX;
      const diff = touchX - startX;
  
      if (diff < 0 && diff > -ACTION_WIDTH * 1.5) {
        currentX = diff;
        isSwiping = true;
      }
    }
  
    function handleTouchEnd() {
      if (itemElement) itemElement.style.transition = "transform 0.2s ease-out";

      if (currentX < -ACTION_WIDTH / 2) {
        currentX = -ACTION_WIDTH;
      } else {
        currentX = 0;
      }
    }

    function onDelete() {
      dispatch("delete", conversation.id);
      currentX = 0;
    }

    function onContentClick() {
      if (currentX !== 0) {
        currentX = 0;
        return;
      }
      dispatch("click", conversation.id);
    }
  </script>
  
  <div class="swipe-container">
    <div class="actions">
      <button class="delete-btn" on:click|stopPropagation={onDelete}>
        Delete
      </button>
    </div>

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
      height: 65px;
      overflow: hidden;
      border-radius: 6px;
      background-color: #4d4b4b;
      cursor: pointer;
    }

    .actions {
      position: absolute;
      top: 0;
      right: 0;
      width: 80px;
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
      z-index: 2;
      transition: background 0.2s, transform 0.2s ease-out;
      cursor: pointer;
    }

    .content:hover {
      background: #e4e2e2;
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